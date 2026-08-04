import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { familyApi } from "@/services/api.service";
import { Family } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileDown,
} from "lucide-react";

interface ImportFamiliesModalProps {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
}

const CLASSIFICATIONS = ["orphan", "disabled_disease", "old_age", "single_mother"] as const;
type Classification = (typeof CLASSIFICATIONS)[number];

const CLASSIFICATION_LABELS: Record<string, string> = {
  orphan: "Orphan",
  disabled_disease: "Disabled / Disease",
  old_age: "Old Age",
  single_mother: "Single Mother",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  orphan: "bg-blue-100 text-blue-700 border-blue-200",
  disabled_disease: "bg-pink-100 text-pink-700 border-pink-200",
  old_age: "bg-purple-100 text-purple-700 border-purple-200",
  single_mother: "bg-amber-100 text-amber-700 border-amber-200",
};

const REG_TYPES = ["quick", "complete", "verified"] as const;
type RegType = (typeof REG_TYPES)[number];

const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const;
const GENDERS = ["male", "female", "other"] as const;
const AGE_GROUPS = ["child", "teen", "adult"] as const;
const ORPHAN_TYPES = ["mother", "father", "both", "none"] as const;

const PHONE_RE = /^(?:\+251|0)(?:9|7)\d{8}$/;

const FAMILY_HEADERS = [
  "Family Key",
  "Family Name",
  "Phone Number",
  "Family Head",
  "Urgency Level",
  "Registration Type",
  "Description",
  "Notes",
  "Family Classification",
  "Address",
];

const MEMBER_HEADERS = [
  "Family Key",
  "Full Name",
  "Gender",
  "Age Group",
  "Is Orphan",
  "Orphan Type",
  "Is Family Head",
  "Member Classification",
  "Relationship to Head",
  "Education",
  "Health Status",
  "Occupation",
  "Monthly Income (ETB)",
  "Photo URL",
  "Notes",
];

const norm = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v).trim();
const yn = (v: unknown): boolean => {
  const s = norm(v).toLowerCase();
  return ["yes", "y", "true", "1", "✓"].includes(s);
};

function pick(row: Record<string, unknown>, ...names: string[]): unknown {
  const map: Record<string, unknown> = {};
  for (const k of Object.keys(row)) map[norm(k).toLowerCase()] = row[k];
  for (const n of names) {
    const val = map[norm(n).toLowerCase()];
    if (val !== undefined && val !== "") return val;
  }
  return "";
}

function isValidPhone(p?: string): boolean {
  if (!p) return false;
  return PHONE_RE.test(p.replace(/\s+/g, ""));
}

function splitList(v: unknown): string[] {
  return norm(v)
    .split(/[,;|]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "response" in e) {
    const resp = (e as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  return "Unexpected error";
}

/* ----------------------------- Template ----------------------------- */

function buildTemplateWorkbook(): XLSX.WorkBook {
  const guide: (string | number)[][] = [
    ["AMĀNA — Bulk Family Import Template", ""],
    ["", ""],
    ["HOW TO USE", ""],
    ["1.", "Fill the 'Families' sheet — one row per family."],
    ["2.", "Fill the 'Members' sheet — one row per family member."],
    ["3.", "Link each member to its family using the SAME 'Family Key'."],
    ["4.", "Keep the sheet names ('Families', 'Members') unchanged."],
    ["5.", "Save and import the file. Review validation, then confirm."],
    ["", ""],
    ["FAMILIES SHEET — columns", ""],
    ["Family Key *", "Unique short code you invent (e.g. FAM001). Required & must be unique."],
    ["Family Name *", "Name of the family. Required."],
    ["Phone Number", "Required for 'complete' / 'verified'. Format: +2519XXXXXXXX or 09XXXXXXXX."],
    ["Family Head", "Full name of the head — must match a member's Full Name (or mark a member as head)."],
    ["Urgency Level", "One of: low, medium, high, critical. Default: medium."],
    ["Registration Type *", "One of: quick, complete, verified."],
    ["Description", "Optional short description."],
    ["Notes", "Optional internal notes."],
    ["Family Classification", "Comma-separated from: orphan, disabled_disease, old_age, single_mother."],
    ["Address", "Optional address / kebele."],
    ["", ""],
    ["MEMBERS SHEET — columns", ""],
    ["Family Key *", "Must match a Family Key in the Families sheet."],
    ["Full Name *", "Member's full name. Required."],
    ["Gender", "One of: male, female, other."],
    ["Age Group", "One of: child, teen, adult."],
    ["Is Orphan", "yes / no. Only relevant for child / teen."],
    ["Orphan Type", "One of: mother, father, both, none."],
    ["Is Family Head", "yes / no. Mark exactly one member per family as head."],
    ["Member Classification", "One of: orphan, disabled_disease, old_age, single_mother. Leave blank if none."],
    ["Relationship to Head", "e.g. father, mother, son, daughter."],
    ["Education", "Optional (e.g. grade 5, college)."],
    ["Health Status", "Optional."],
    ["Occupation", "Optional."],
    ["Monthly Income (ETB)", "Optional number."],
    ["Photo URL", "Optional image URL."],
    ["Notes", "Optional."],
    ["", ""],
    ["RULES", ""],
    ["•", "Every family needs at least one member marked as Family Head."],
    ["•", "'orphan' classification is only valid for child / teen members."],
    ["•", "'old_age' and 'single_mother' are only valid for adult members."],
    ["•", "A 'complete' or 'verified' family must have a valid Phone Number."],
    ["•", "Classification values must be spelled exactly as listed (lowercase, underscore)."],
    ["", ""],
    ["EXAMPLE", "See the Families and Members sheets for a worked example."],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guide);
  wsGuide["!cols"] = [{ wch: 26 }, { wch: 95 }];

  const famExample: (string | number)[][] = [
    ["FAM001", "Mohammed Family", "+251911234567", "Abebe Mohammed", "high", "complete", "Large family in need", "Met during outreach", "orphan, single_mother", "Kirkos, Addis Ababa"],
    ["FAM002", "Ahmed Family", "+251922334455", "Fatima Ahmed", "medium", "verified", "", "Verified last month", "old_age, disabled_disease", "Lideta"],
  ];

  const wsFam = XLSX.utils.aoa_to_sheet([FAMILY_HEADERS, ...famExample]);
  wsFam["!cols"] = FAMILY_HEADERS.map((h) => ({ wch: Math.max(12, h.length + 2) }));
  wsFam["!freeze"] = { xSplit: 0, ySplit: 1 };

  const memExample: (string | number)[][] = [
    ["FAM001", "Abebe Mohammed", "male", "adult", "no", "none", "yes", "single_mother", "self", "", "", "daily laborer", "2500", "", "Father of 3 orphans"],
    ["FAM001", "Sara Abebe", "female", "child", "yes", "both", "no", "orphan", "daughter", "grade 4", "healthy", "", "", "", "Both parents deceased"],
    ["FAM001", "Yonas Abebe", "male", "teen", "yes", "father", "no", "orphan", "son", "grade 8", "healthy", "", "", "", ""],
    ["FAM002", "Fatima Ahmed", "female", "adult", "no", "none", "yes", "old_age", "self", "", "diabetes", "", "", "", "Elderly head of household"],
    ["FAM002", "Hana Ahmed", "female", "adult", "no", "none", "no", "disabled_disease", "daughter", "", "physical disability", "", "", "", "Cares for mother"],
  ];

  const wsMem = XLSX.utils.aoa_to_sheet([MEMBER_HEADERS, ...memExample]);
  wsMem["!cols"] = MEMBER_HEADERS.map((h) => ({ wch: Math.max(12, h.length + 1) }));
  wsMem["!freeze"] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsGuide, "Guidelines");
  XLSX.utils.book_append_sheet(wb, wsFam, "Families");
  XLSX.utils.book_append_sheet(wb, wsMem, "Members");
  return wb;
}

function downloadTemplate() {
  const wb = buildTemplateWorkbook();
  const opts: XLSX.WritingOptions = { bookType: "xlsx" };
  try {
    XLSX.writeFile(wb, "amana-family-import-template.xlsx", { ...opts, cellStyles: true } as XLSX.WritingOptions);
  } catch {
    XLSX.writeFile(wb, "amana-family-import-template.xlsx", opts);
  }
}

/* ----------------------------- Parsing ----------------------------- */

interface ParsedMember {
  familyKey: string;
  fullName: string;
  gender?: string;
  ageGroup?: string;
  isOrphan: boolean;
  orphanType: string;
  isHead: boolean;
  memberClassification?: string;
  relationshipToHead?: string;
  education?: string;
  healthStatus?: string;
  occupation?: string;
  monthlyIncome?: number;
  photoUrl?: string;
  notes?: string;
  errors: string[];
  warnings: string[];
}

interface ParsedFamily {
  familyKey: string;
  familyName: string;
  phone?: string;
  familyHead?: string;
  urgency: string;
  regType: RegType;
  description?: string;
  notes?: string;
  address?: string;
  familyClassification: string[];
  members: ParsedMember[];
  errors: string[];
  warnings: string[];
  payload: Record<string, unknown>;
}

interface ProcessResult {
  families: ParsedFamily[];
  globalErrors: string[];
}

function processRows(
  famRows: Record<string, unknown>[],
  memRows: Record<string, unknown>[]
): ProcessResult {
  const families: ParsedFamily[] = [];
  const globalErrors: string[] = [];
  const keySeen = new Map<string, number>();

  for (const row of famRows) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const familyKey = norm(pick(row, "Family Key"));
    const familyName = norm(pick(row, "Family Name"));
    const phone = norm(pick(row, "Phone Number"));
    const familyHead = norm(pick(row, "Family Head"));
    const urgencyRaw = norm(pick(row, "Urgency Level")).toLowerCase();
    const regRaw = norm(pick(row, "Registration Type")).toLowerCase();
    const description = norm(pick(row, "Description")) || undefined;
    const notes = norm(pick(row, "Notes")) || undefined;
    const address = norm(pick(row, "Address")) || undefined;
    const classificationRaw = splitList(pick(row, "Family Classification"));

    if (!familyKey) errors.push("Family Key is required.");
    if (familyKey) {
      keySeen.set(familyKey, (keySeen.get(familyKey) || 0) + 1);
    }
    if (!familyName) errors.push("Family Name is required.");

    let regType: RegType;
    if ((REG_TYPES as readonly string[]).includes(regRaw)) {
      regType = regRaw as RegType;
    } else {
      errors.push(`Registration Type must be one of: ${REG_TYPES.join(", ")}.`);
      regType = "complete";
    }

    let urgency: string;
    if ((URGENCY_LEVELS as readonly string[]).includes(urgencyRaw)) {
      urgency = urgencyRaw;
    } else {
      if (urgencyRaw) warnings.push(`Urgency Level "${urgencyRaw}" invalid — defaulted to medium.`);
      urgency = "medium";
    }

    if (regType !== "quick") {
      if (!phone) errors.push("Phone Number is required for complete/verified families.");
      else if (!isValidPhone(phone)) errors.push(`Phone Number "${phone}" is invalid (use +2519XXXXXXXX or 09XXXXXXXX).`);
    }

    const familyClassification: string[] = [];
    for (const c of classificationRaw) {
      if ((CLASSIFICATIONS as readonly string[]).includes(c)) familyClassification.push(c);
      else errors.push(`Unknown Family Classification "${c}". Allowed: ${CLASSIFICATIONS.join(", ")}.`);
    }

    families.push({
      familyKey,
      familyName,
      phone: phone || undefined,
      familyHead: familyHead || undefined,
      urgency,
      regType,
      description,
      notes,
      address,
      familyClassification,
      members: [],
      errors,
      warnings,
      payload: {},
    });
  }

  for (const [key, count] of keySeen.entries()) {
    if (count > 1) {
      const f = families.find((x) => x.familyKey === key);
      f?.errors.push(`Family Key "${key}" is duplicated (${count}x). Keys must be unique.`);
    }
  }

  // Members
  for (const row of memRows) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const familyKey = norm(pick(row, "Family Key"));
    const fullName = norm(pick(row, "Full Name"));
    const genderRaw = norm(pick(row, "Gender")).toLowerCase();
    const ageRaw = norm(pick(row, "Age Group")).toLowerCase();
    const isOrphanRaw = pick(row, "Is Orphan");
    const orphanRaw = norm(pick(row, "Orphan Type")).toLowerCase();
    const isHeadRaw = pick(row, "Is Family Head");
    const memberClassRaw = norm(pick(row, "Member Classification")).toLowerCase();
    const relationshipToHead = norm(pick(row, "Relationship to Head")) || undefined;
    const education = norm(pick(row, "Education")) || undefined;
    const healthStatus = norm(pick(row, "Health Status")) || undefined;
    const occupation = norm(pick(row, "Occupation")) || undefined;
    const incomeRaw = norm(pick(row, "Monthly Income (ETB)"));
    const photoUrl = norm(pick(row, "Photo URL")) || undefined;
    const notes = norm(pick(row, "Notes")) || undefined;

    if (!familyKey) {
      errors.push("Member has no Family Key — cannot be linked to a family.");
      globalErrors.push(`A member row is missing its Family Key (Full Name: "${fullName || "?"})".`);
      continue;
    }
    const family = families.find((f) => f.familyKey === familyKey);
    if (!family) {
      errors.push(`Family Key "${familyKey}" does not match any family.`);
      globalErrors.push(`Member "${fullName}" references unknown Family Key "${familyKey}".`);
      continue;
    }
    if (!fullName) errors.push("Member Full Name is required.");

    let gender: string | undefined;
    if ((GENDERS as readonly string[]).includes(genderRaw)) {
      gender = genderRaw;
    } else if (genderRaw) {
      errors.push(`Gender "${genderRaw}" invalid.`);
    }

    let ageGroup: string | undefined;
    if ((AGE_GROUPS as readonly string[]).includes(ageRaw)) {
      ageGroup = ageRaw;
    } else if (ageRaw) {
      errors.push(`Age Group "${ageRaw}" invalid (use child/teen/adult).`);
    }

    const isOrphan = yn(isOrphanRaw);
    const orphanType = (ORPHAN_TYPES as readonly string[]).includes(orphanRaw) ? orphanRaw : "none";
    const isHead = yn(isHeadRaw);

    let memberClassification: string | undefined;
    if (memberClassRaw) {
      if ((CLASSIFICATIONS as readonly string[]).includes(memberClassRaw)) memberClassification = memberClassRaw;
      else errors.push(`Unknown Member Classification "${memberClassRaw}". Allowed: ${CLASSIFICATIONS.join(", ")}.`);
    }

    if (ageGroup) {
      if (memberClassification === "orphan" && ageGroup === "adult") {
        errors.push("'orphan' classification is only valid for child/teen members.");
      }
      if ((memberClassification === "old_age" || memberClassification === "single_mother") && ageGroup !== "adult") {
        errors.push(`'${memberClassification}' classification is only valid for adult members.`);
      }
      if (isOrphan && ageGroup === "adult") {
        warnings.push("Orphan flagged for an adult — ignored (orphans must be child/teen).");
      }
    }

    const monthlyIncome = incomeRaw ? (isNaN(parseFloat(incomeRaw)) ? undefined : parseFloat(incomeRaw)) : undefined;

    family.members.push({
      familyKey,
      fullName,
      gender,
      ageGroup,
      isOrphan,
      orphanType,
      isHead,
      memberClassification,
      relationshipToHead,
      education,
      healthStatus,
      occupation,
      monthlyIncome,
      photoUrl,
      notes,
      errors,
      warnings,
    });
  }

  // Per-family head + payload resolution
  for (const family of families) {
    const headFromMembers = family.members.filter((m) => m.isHead);
    let headName = family.familyHead;

    if (headFromMembers.length === 0) {
      if (family.familyHead) {
        const match = family.members.find((m) => m.fullName.toLowerCase() === family.familyHead!.toLowerCase());
        if (!match) family.errors.push(`Family Head "${family.familyHead}" does not match any member's Full Name.`);
        else headName = match.fullName;
      } else {
        family.errors.push("No family head specified (mark a member as head or set Family Head).");
      }
    } else {
      if (headFromMembers.length > 1) {
        family.warnings.push(`${headFromMembers.length} members marked as head — using the first.`);
      }
      headName = headFromMembers[0].fullName;
    }

    if (family.members.length === 0) {
      family.warnings.push("Family has no members.");
    }

    const membersPayload = family.members.map((m) => {
      const isAdult = m.ageGroup === "adult";
      return {
        fullName: m.fullName,
        gender: m.gender,
        beneficiaryType: isAdult ? "adult" : "child",
        ageGroup: m.ageGroup,
        isHead: m.isHead,
        photoUrl: m.photoUrl,
        isOrphan: !isAdult && m.isOrphan,
        orphanType: !isAdult && m.isOrphan ? m.orphanType : "none",
        memberClassification: m.memberClassification,
        relationshipToHead: m.relationshipToHead,
        educationStatus: m.education,
        healthStatus: m.healthStatus,
        occupation: m.occupation,
        monthlyIncome: m.monthlyIncome,
        notes: m.notes,
      };
    });

    const isVerified = family.regType === "verified";
    family.payload = {
      familyName: family.familyName,
      familyHead: headName,
      description: family.description,
      urgencyLevel: family.urgency,
      primaryPhone: family.phone ? family.phone.replace(/\s+/g, "") : undefined,
      familySize: family.members.length || undefined,
      childrenCount: family.members.filter((m) => m.ageGroup !== "adult").length || undefined,
      notes: family.notes,
      address: family.address,
      members: membersPayload,
      registrationType: isVerified ? "complete" : family.regType,
      registrationCompleted: family.regType !== "quick",
      isVerified,
      familyClassification:
        family.familyClassification.length > 0 ? family.familyClassification : undefined,
    };
  }

  return { families, globalErrors };
}

/* ----------------------------- Component ----------------------------- */

type Phase = "setup" | "review" | "importing" | "done";

const ImportFamiliesModal = ({ open, onClose, onImported }: ImportFamiliesModalProps) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("setup");
  const [fileName, setFileName] = useState("");
  const [families, setFamilies] = useState<ParsedFamily[]>([]);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ created: number; failed: number; failures: { familyKey: string; familyName: string; error: string }[] }>({
    created: 0,
    failed: 0,
    failures: [],
  });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reset = () => {
    setPhase("setup");
    setFileName("");
    setFamilies([]);
    setGlobalErrors([]);
    setProgress(0);
    setResults({ created: 0, failed: 0, failures: [] });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    if (busy) return;
    onClose();
    // allow the close animation; reset after
    setTimeout(reset, 150);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array", cellDates: true });
      const famSheet = wb.Sheets["Families"];
      const memSheet = wb.Sheets["Members"];
      if (!famSheet) {
        toast({ title: t("importModal.invalidFile"), description: t("importModal.missingFamiliesSheet"), variant: "destructive" });
        setBusy(false);
        return;
      }
      const famRows: Record<string, unknown>[] = famSheet
        ? XLSX.utils.sheet_to_json(famSheet, { defval: "" })
        : [];
      const memRows: Record<string, unknown>[] = memSheet
        ? XLSX.utils.sheet_to_json(memSheet, { defval: "" })
        : [];

      const { families: parsed, globalErrors: gErr } = processRows(famRows, memRows);
      setFamilies(parsed);
      setGlobalErrors(gErr);
      setFileName(file.name);
      setPhase("review");
    } catch (err) {
      toast({
        title: t("importModal.couldNotRead"),
        description: errMessage(err) || t("importModal.useTemplate"),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const hasBlockingErrors = () => {
    if (globalErrors.length > 0) return true;
    return families.some((f) => f.errors.length > 0 || f.members.some((m) => m.errors.length > 0));
  };

  const totalErrors =
    globalErrors.length +
    families.reduce(
      (acc, f) => acc + f.errors.length + f.members.reduce((a, m) => a + m.errors.length, 0),
      0
    );
  const totalWarnings =
    families.reduce(
      (acc, f) => acc + f.warnings.length + f.members.reduce((a, m) => a + m.warnings.length, 0),
      0
    );
  const totalMembers = families.reduce((acc, f) => acc + f.members.length, 0);

  const runImport = async () => {
    setPhase("importing");
    setBusy(true);
    setProgress(0);
    let created = 0;
    let failed = 0;
    const failures: { familyKey: string; familyName: string; error: string }[] = [];

    for (let i = 0; i < families.length; i++) {
      const f = families[i];
      try {
        await familyApi.create(f.payload as Partial<Family>);
        created++;
      } catch (err) {
        failed++;
        failures.push({
          familyKey: f.familyKey,
          familyName: f.familyName,
          error: errMessage(err),
        });
      }
      setProgress(Math.round(((i + 1) / families.length) * 100));
    }

    setResults({ created, failed, failures });
    setPhase("done");
    setBusy(false);
    if (created > 0 && onImported) onImported();
    toast({
      title: t("importModal.importComplete"),
      description: t("importModal.importCompleteDesc", { created, failed }),
      variant: failed > 0 && created === 0 ? "destructive" : "default",
    });
  };

  const downloadErrorReport = () => {
    const rows = results.failures.map((f) => ({
      "Family Key": f.familyKey,
      "Family Name": f.familyName,
      "Error": f.error,
    }));
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "Family Key": "", "Family Name": "", "Error": t("importModal.noFailures") }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Import Errors");
    XLSX.writeFile(wb, "amana-import-errors.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            {t("importModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("importModal.desc")}
          </DialogDescription>
        </DialogHeader>

        {phase === "setup" && (
          <div className="space-y-5">
            <Alert>
              <AlertDescription className="text-sm space-y-1">
                <p>{t("importModal.instruction1")}</p>
                <p>{t("importModal.instruction2")}</p>
                <p>{t("importModal.instruction3")}</p>
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                {t("importModal.downloadTemplate")}
              </Button>
            </div>

            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t("importModal.uploadHint")}
              </p>
              <div className="mt-3">
                <Label htmlFor="import-file" className="sr-only">
                  {t("importModal.importFileLabel")}
                </Label>
                <Input
                  id="import-file"
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFile}
                  disabled={busy}
                  className="mx-auto max-w-sm cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {phase === "review" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="font-medium truncate">{fileName}</span>
              <span className="shrink-0 text-muted-foreground">
                {t("importModal.familiesCount", { count: families.length, members: totalMembers })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={totalErrors > 0 ? "destructive" : "default"} className="gap-1">
                <XCircle className="h-3 w-3" /> {t("importModal.errorsCount", { count: totalErrors })}
              </Badge>
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
                <AlertTriangle className="h-3 w-3" /> {t("importModal.warningsCount", { count: totalWarnings })}
              </Badge>
            </div>

            {hasBlockingErrors() ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("importModal.fixErrorsBefore")}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  {t("importModal.validationPassed", { count: families.length, members: totalMembers })}
                  {totalWarnings > 0 && ` ${t("importModal.warningAutoCorrect", { count: totalWarnings })}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-64 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("importModal.tableFamilyKey")}</TableHead>
                    <TableHead>{t("importModal.tableFamilyName")}</TableHead>
                    <TableHead>{t("importModal.tableType")}</TableHead>
                    <TableHead>{t("importModal.tableClassifications")}</TableHead>
                    <TableHead>{t("importModal.tableMembers")}</TableHead>
                    <TableHead>{t("importModal.tableStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {families.map((f) => {
                    const errs = f.errors.length + f.members.reduce((a, m) => a + m.errors.length, 0);
                    const warns = f.warnings.length + f.members.reduce((a, m) => a + m.warnings.length, 0);
                    return (
                      <TableRow key={f.familyKey || Math.random()}>
                        <TableCell className="font-mono text-xs">{f.familyKey}</TableCell>
                        <TableCell className="max-w-[160px] truncate">{f.familyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{f.regType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {f.familyClassification.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              f.familyClassification.map((c) => (
                                <Badge key={c} variant="outline" className={CLASSIFICATION_COLORS[c]}>
                                  {CLASSIFICATION_LABELS[c] || c}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{f.members.length}</TableCell>
                        <TableCell>
                          {errs > 0 ? (
                            <span className="text-red-600 text-xs font-medium">{errs} error(s)</span>
                          ) : warns > 0 ? (
                            <span className="text-amber-600 text-xs font-medium">{warns} warn</span>
                          ) : (
                            <span className="text-emerald-600 text-xs font-medium">OK</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {globalErrors.length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-1">
                {globalErrors.slice(0, 10).map((g, i) => (
                  <div key={i}>• {g}</div>
                ))}
                {globalErrors.length > 10 && <div>• …and {globalErrors.length - 10} more</div>}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { reset(); }} disabled={busy}>
                {t("importModal.startOver")}
              </Button>
              <Button onClick={runImport} disabled={hasBlockingErrors() || busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                {t("importModal.importFamilies", { count: families.length })}
              </Button>
            </DialogFooter>
          </div>
        )}

        {phase === "importing" && (
          <div className="space-y-4 py-6">
            <p className="text-sm text-center text-muted-foreground">{t("importModal.importingFamilies")}</p>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm font-medium">{progress}%</p>
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                <p className="mt-1 text-2xl font-bold text-emerald-700">{results.created}</p>
                <p className="text-xs text-emerald-700">{t("importModal.created")}</p>
              </div>
              <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <XCircle className="mx-auto h-6 w-6 text-red-600" />
                <p className="mt-1 text-2xl font-bold text-red-700">{results.failed}</p>
                <p className="text-xs text-red-700">{t("importModal.failed")}</p>
              </div>
            </div>

            {results.failures.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("importModal.tableFamilyName")}</TableHead>
                      <TableHead>{t("importModal.tableError")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.failures.map((f, i) => (
                      <TableRow key={i}>
                        <TableCell className="max-w-[140px] truncate">
                          <span className="font-mono text-xs">{f.familyKey}</span>
                          <div className="text-xs text-muted-foreground truncate">{f.familyName}</div>
                        </TableCell>
                        <TableCell className="text-xs text-red-600">{f.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter className="gap-2">
              {results.failures.length > 0 && (
                <Button variant="outline" onClick={downloadErrorReport}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {t("importModal.downloadErrorReport")}
                </Button>
              )}
              <Button onClick={handleClose}>{t("importModal.done")}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportFamiliesModal;
