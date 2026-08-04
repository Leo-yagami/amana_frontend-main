

// export default Families;
import { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { familyApi } from "@/services/api.service";
import { Family, FamilyFilters } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Users,
  AlertCircle,
  UserCheck,
  Clock,
  Eye,
  Edit,
  UserPlus,
  MoreVertical,
  Download,
  FileSpreadsheet,
  Zap,
  CheckCircle,
  Trash2,
  Heart,
  Baby,
  Accessibility,
  Home,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuickFamilyRegistrationModal from "./components/QuickFamilyRegistrationModal";
import ImportFamiliesModal from "./components/ImportFamiliesModal";
import RegistrationStatusBadge from "@/components/RegistrationStatusBadge";
import FamilyClassificationBadge from "@/components/FamilyClassificationBadge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api.service";
import gsap from "gsap";
import { createPortal } from "react-dom";

function getEffectiveClassification(family: Family): string[] {
  if (family.familyClassification && family.familyClassification.length > 0) {
    return family.familyClassification;
  }
  const memberClasses = new Set(
    (family.members || [])
      .map((m) => (m as any).memberClassification)
      .filter(Boolean)
  );
  return memberClasses.size > 0 ? Array.from(memberClasses) : [];
}

const Families = () => {
  const { t } = useTranslation();
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const statsRef = useRef<HTMLDivElement>(null);

  // Verify dialog state
  const [verifyDialogFamily, setVerifyDialogFamily] = useState<Family | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState<string[]>([]);

  // Filters
  const [filters, setFilters] = useState<FamilyFilters>({
    page: 1,
    limit: 20,
    search: "",
  });
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // ✅ React Query — cached, no refetch on nav
  const { data: families = [], isLoading: loading } = useQuery({
    queryKey: ["families", filters],
    queryFn: async () => {
      const response = await familyApi.getAll(filters);
      console.log(response)
      return response?.data[0];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ Overview stats from dashboard endpoint (not page-scoped)
  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(
    () => ({
      total: overview?.families?.total ?? families?.pagination?.total ?? 0,
      verified: overview?.families?.verified ?? 0,
      pending: overview?.families?.pending ?? 0,
      incomplete: overview?.families?.incomplete ?? 0,
      rejected: overview?.families?.rejected ?? 0,
      urgent: overview?.families?.urgent ?? 0,
      classifications: overview?.families?.classifications ?? {
        orphan: 0,
        disabled_disease: 0,
        old_age: 0,
        single_mother: 0,
      },
    }),
    [overview, families]
  );

  const sortedFamilies = useMemo(() => {
    const data = families?.data ? [...families.data] : [];
    if (sortOrder === "newest") {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return data;
  }, [families, sortOrder]);

  const memberClassificationStats = useMemo(() => {
    const counts = { orphan: 0, disabled_disease: 0, old_age: 0, single_mother: 0 };
    let totalMembers = 0;
    sortedFamilies.forEach((family) => {
      (family.members || []).forEach((member) => {
        totalMembers++;
        const mc = (member as any).memberClassification;
        if (mc && mc in counts) counts[mc as keyof typeof counts]++;
      });
    });
    return { ...counts, totalMembers };
  }, [sortedFamilies]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["families"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FamilyFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  // Handle quick registration success
  const handleQuickRegistrationSuccess = (
    familyId: string,
    shouldAddMember: boolean
  ) => {
    setShowQuickAddModal(false);
    invalidate();
    if (shouldAddMember) {
      navigate(`/dashboard/families/${familyId}/edit?focus=members`);
    } else {
      navigate(`/dashboard/families/${familyId}`);
    }
  };

  // Handle verify
  const handleVerify = async (id: string) => {
    setVerifyDialogFamily(sortedFamilies.find((f) => f._id === id) || null);
    setSelectedClassification([]);
    setVerifyDialogOpen(true);
  };

  // Handle verify with classification
  const handleVerifyWithClassification = async () => {
    if (!verifyDialogFamily) return;
    try {
      const membersPayload = (verifyDialogFamily.members || []).map((m: any) => ({
        fullName: m.fullName,
        gender: m.gender || undefined,
        ageGroup: m.ageGroup,
        beneficiaryType: m.beneficiaryType || (m.ageGroup === "adult" ? "adult" : "child"),
        photoUrl: m.photoUrl || undefined,
        isOrphan: m.isOrphan || false,
        orphanType: m.orphanType || "none",
        memberClassification: m.memberClassification || undefined,
      }));

      await familyApi.update(verifyDialogFamily._id, {
        isVerified: true,
        familyClassification: selectedClassification.length > 0 ? selectedClassification : undefined,
        members: membersPayload,
      });
      toast({ title: "Success", description: "Family verified successfully" });
      setVerifyDialogOpen(false);
      setVerifyDialogFamily(null);
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastVerifyErr"),
        variant: "destructive",
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? sortedFamilies.map((f) => f._id) : []);
  };

  // Handle select one
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  const [bulkClassification, setBulkClassification] = useState<string[]>([]);
  const [showBulkClassDialog, setShowBulkClassDialog] = useState(false);
  const [bulkClassificationMemberIds, setBulkClassificationMemberIds] = useState<Record<string, string[]>>({});

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.length === 0) {
      toast({
        title: t("dashboard.familiesPage.toastNoSelection"),
        description: t("dashboard.familiesPage.toastSelectFirst"),
        variant: "destructive",
      });
      return;
    }
    if (status === "verified") {
      setBulkClassification([]);
      setShowBulkClassDialog(true);
      return;
    }
    try {
      const familyList: Family[] = families && !Array.isArray(families) && (families as any)?.data
        ? (families as any).data : [];
      await Promise.all(
        selectedIds.map((id) => {
          const family = familyList.find((f: Family) => f._id === id);
          const membersPayload = family?.members?.map((m: any) => ({
            ...m,
            memberClassification: null,
          })) ?? [];
          return familyApi.update(id, {
            isVerified: false,
            familyClassification: [],
            ...(membersPayload.length > 0 ? { members: membersPayload } : {}),
          });
        })
      );
      toast({
        title: t("common.success"),
        description:
          selectedIds.length === 1
            ? t("dashboard.familiesPage.toastBulkOkOne")
            : t("dashboard.familiesPage.toastBulkOk", { count: selectedIds.length }),
      });
      setSelectedIds([]);
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastBulkErr"),
        variant: "destructive",
      });
    }
  };

  const handleBulkVerifyWithClassification = async () => {
    try {
      const memberClassMap: Record<string, string> = {};
      Object.entries(bulkClassificationMemberIds).forEach(([cls, ids]) => {
        ids.forEach((id) => { memberClassMap[id] = cls; });
      });

      await Promise.all(
        selectedIds.map((id) => {
          const family = sortedFamilies.find((f) => f._id === id);
          const membersPayload = (family?.members || []).map((m: any) => {
            const memberId = m._id || m.id || `__idx_${id}_${family?.members?.indexOf(m) ?? 0}`;
            return {
              fullName: m.fullName,
              gender: m.gender || undefined,
              ageGroup: m.ageGroup,
              beneficiaryType: m.beneficiaryType || (m.ageGroup === "adult" ? "adult" : "child"),
              photoUrl: m.photoUrl || undefined,
              isOrphan: m.isOrphan || false,
              orphanType: m.orphanType || "none",
              memberClassification: memberClassMap[memberId] !== undefined ? memberClassMap[memberId] : m.memberClassification || undefined,
            };
          });
          const appliedClasses = [...new Set(
            membersPayload.map((m) => m.memberClassification).filter(Boolean)
          )] as string[];
          return familyApi.update(id, {
            isVerified: true,
            familyClassification: appliedClasses.length > 0 ? appliedClasses : undefined,
            members: membersPayload,
          });
        })
      );
      toast({
        title: t("common.success"),
        description:
          selectedIds.length === 1
            ? t("dashboard.familiesPage.toastBulkOkOne")
            : t("dashboard.familiesPage.toastBulkOk", { count: selectedIds.length }),
      });
      setSelectedIds([]);
      setShowBulkClassDialog(false);
      setBulkClassificationMemberIds({});
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastBulkErr"),
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = () => {
    const exportData =
      selectedIds.length > 0
        ? families?.data?.filter((f) => selectedIds.includes(f._id))
        : families?.data;

    const csvContent = [
      ["Family Code","Family Name","Head of Family","Region","Members","Status","Urgency","Created"].join(","),
      ...exportData.map((f) =>
        [
          f.familyCode,
          f.familyName,
          f.headBeneficiary?.fullName || "N/A",
          f.region || "N/A",
          f.familySize || 0,
          f.registrationStatus,
          f.urgencyLevel || "N/A",
          new Date(f.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `families-${selectedIds.length > 0 ? "selected-" : ""}${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    if (selectedIds.length > 0) {
      toast({
        title: t("dashboard.familiesPage.toastExport"),
        description:
          selectedIds.length === 1
            ? t("dashboard.familiesPage.toastExportOne")
            : t("dashboard.familiesPage.toastExportSelected", { count: selectedIds.length }),
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await familyApi.delete(id);
      toast({
        title: t("common.deleted"),
        description: t("dashboard.familiesPage.toastDeleted"),
      });
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastDeleteErr"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {t("dashboard.familiesPage.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {selectedIds.length > 0
              ? t("dashboard.familiesPage.selected", { count: selectedIds.length })
              : t("dashboard.familiesPage.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {selectedIds.length > 0 ? (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden">
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("common.export")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { handleBulkStatusUpdate("verified"); }}
                className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden"
              >
                <CheckCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("dashboard.registrationStatus.verified")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkStatus("pending"); setShowBulkStatusDialog(true); }}
                className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden"
              >
                <AlertCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("dashboard.registrationStatus.pending")}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden">
                <span className="truncate">{t("common.cancel")}</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden">
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("common.export")}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)} className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden">
                <FileSpreadsheet className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("common.import")}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQuickAddModal(true)} className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden">
                <Zap className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("common.add")}</span>
              </Button>
              <Button onClick={() => navigate("/dashboard/families/new")} size="sm" className="text-xs sm:text-sm max-w-[140px] min-w-0 overflow-hidden">
                <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
                <span className="truncate">{t("dashboard.familiesPage.title")}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 sm:gap-y-5">
        {[
          { label: t("dashboard.familiesPage.statsTotal"),      value: stats.total,      icon: <Users className="h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" /> },
          { label: t("dashboard.familiesPage.statsPending"),    value: stats.pending,    icon: <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-orange-500" /> },
          { label: t("dashboard.familiesPage.statsIncomplete"), value: stats.incomplete, icon: <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-500" /> },
          // { label: "Rejected",   value: stats.rejected,   icon: <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-700" /> },
          { label: t("dashboard.familiesPage.statsUrgent"),     value: stats.urgent,     icon: <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row p-0 pt-4 px-6 pb-1.5 items-center justify-between space-y-0 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{label}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent className="pl-7 pb-2 sm:pb-4">
              <div className="text-xl sm:text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}

        {/* ===== OLD Verified card replaced by Classifications card ===== */}
        {/* { label: "Verified", value: stats.verified, ... } */}
        <ExpandableClassificationCard
          classifications={stats.classifications}
          memberClassificationStats={memberClassificationStats}
          totalVerified={stats.verified}
          t={t}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("dashboard.familiesPage.searchPlaceholder")}
                  className="pl-10 text-sm"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1 sm:gap-1 md:gap-4">
              <Select
                value={filters.registrationStatus || "all"}
                onValueChange={(value) =>
                  handleFilterChange("registrationStatus", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder={t("dashboard.familiesPage.filterStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.familiesPage.filterAllStatus")}</SelectItem>
                  <SelectItem value="verified">{t("dashboard.familiesPage.filterVerified")}</SelectItem>
                  <SelectItem value="pending">{t("dashboard.familiesPage.filterPending")}</SelectItem>
                  <SelectItem value="rejected">{t("dashboard.familiesPage.filterRejected")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.urgencyLevel || "all"}
                onValueChange={(value) =>
                  handleFilterChange("urgencyLevel", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder={t("dashboard.familiesPage.filterUrgency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.familiesPage.filterAllUrgency")}</SelectItem>
                  <SelectItem value="low">{t("common.low")}</SelectItem>
                  <SelectItem value="medium">{t("common.medium")}</SelectItem>
                  <SelectItem value="high">{t("common.high")}</SelectItem>
                  <SelectItem value="critical">{t("common.critical")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.registrationCompleted === undefined
                    ? "all"
                    : filters.registrationCompleted
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  handleFilterChange("registrationCompleted", value === "all" ? undefined : value === "true")
                }
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder={t("dashboard.familiesPage.filterRegistration")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("dashboard.familiesPage.filterAll")}</SelectItem>
                  <SelectItem value="true">{t("dashboard.familiesPage.filterComplete")}</SelectItem>
                  <SelectItem value="false">{t("dashboard.familiesPage.filterIncomplete")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder={t("dashboard.familiesPage.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("dashboard.familiesPage.sortNewest")}</SelectItem>
                  <SelectItem value="oldest">{t("dashboard.familiesPage.sortOldest")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Families Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            {t("dashboard.familiesPage.title")} ({sortedFamilies.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-sm">{t("dashboard.familiesPage.loading")}</div>
          ) : sortedFamilies.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("dashboard.familiesPage.empty")}
            </div>
          ) : (
            <>
              {/* TABLE VIEW (770px and above) */}
              <div className="hidden min-[770px]:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.length === sortedFamilies.length && sortedFamilies.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-xs">{t("dashboard.familiesPage.tableCode")}</TableHead>
                      <TableHead className="text-xs">{t("dashboard.familiesPage.tableFamilyName")}</TableHead>
                      <TableHead className="text-xs hidden min-[1000px]:table-cell">{t("dashboard.familiesPage.tableHead")}</TableHead>
                      <TableHead className="text-xs hidden min-[820px]:table-cell">{t("dashboard.familiesPage.tableMembers")}</TableHead>
                      <TableHead className="text-xs">{t("dashboard.familiesPage.tableStatus")}</TableHead>
                      <TableHead className="text-xs hidden min-[900px]:table-cell">{t("dashboard.familiesPage.tableClassification")}</TableHead>
                      <TableHead className="text-xs hidden min-[1265px]:table-cell">{t("dashboard.familiesPage.tableUrgency")}</TableHead>
                      <TableHead className="text-xs hidden min-[1180px]:table-cell">{t("dashboard.familiesPage.tableRegistered")}</TableHead>
                      <TableHead className="text-xs text-right">{t("dashboard.familiesPage.tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sortedFamilies.map((family) => (
                      <TableRow
                        key={family._id}
                        className="text-xs cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/dashboard/families/${family._id}`)}
                      >
                        <TableCell className="p-2 pl-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.includes(family._id)}
                            onCheckedChange={(checked) => handleSelectOne(family._id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium p-2">{family.familyCode}</TableCell>
                        <TableCell className="p-2">
                          <div className="truncate max-w-[200px]">{family.familyName}</div>
                        </TableCell>
                        <TableCell className="hidden min-[1000px]:table-cell p-2">
                          <div className="truncate max-w-[170px]">{family.familyHead || t("common.na")}</div>
                        </TableCell>
                        <TableCell className="hidden min-[820px]:table-cell p-2">
                          <Badge variant="secondary" className="text-xs">
                            {family?.members?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2">
                          <RegistrationStatusBadge status={family.registrationStatus} />
                        </TableCell>
                        <TableCell className="hidden min-[900px]:table-cell p-2">
                          <FamilyClassificationBadge classification={getEffectiveClassification(family)} t={t} />
                        </TableCell>
                        <TableCell className="hidden min-[1265px]:table-cell p-2">
                          <Badge
                            variant={
                              family.urgencyLevel === "high"
                                ? "destructive"
                                : family.urgencyLevel === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize text-xs"
                          >
                            {family.urgencyLevel ? t(`common.${family.urgencyLevel}`) : t("common.na")}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden min-[1180px]:table-cell p-2 text-xs">
                          {new Date(family.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <FamilyActionsMenu
                            family={family}
                            onVerify={handleVerify}
                            onDelete={handleDelete}
                            navigate={navigate}
                            t={t}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARD VIEW (below 770px) */}
              <div className="min-[770px]:hidden space-y-3 p-3">
                {sortedFamilies.map((family) => (
                  <Card key={family._id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/dashboard/families/${family._id}`)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.includes(family._id)}
                            onCheckedChange={(checked) => handleSelectOne(family._id, checked as boolean)}
                          />
                          <p className="font-semibold text-sm truncate">{family.familyName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{t("dashboard.familiesPage.cardCode")} {family.familyCode}</p>
                        <p className="text-xs text-muted-foreground truncate">{t("dashboard.familiesPage.cardHead")} {family.familyHead || t("common.na")}</p>
                      </div>
                      <FamilyActionsMenu
                        family={family}
                        onVerify={handleVerify}
                        onDelete={handleDelete}
                        navigate={navigate}
                        t={t}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {t("dashboard.familiesPage.cardMembers")} {family?.members?.length || 0}
                      </Badge>
                      <RegistrationStatusBadge status={family.registrationStatus} />
                      <FamilyClassificationBadge classification={getEffectiveClassification(family)} t={t} />
                      <Badge
                        variant={
                          family.urgencyLevel === "high"
                            ? "destructive"
                            : family.urgencyLevel === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize text-xs"
                      >
                        {family.urgencyLevel ? t(`common.${family.urgencyLevel}`) : "N/A"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      {t("dashboard.familiesPage.cardRegistered")} {new Date(family.createdAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <QuickFamilyRegistrationModal
        open={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSuccess={handleQuickRegistrationSuccess}
      />

      <ImportFamiliesModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={invalidate}
      />

      {/* Bulk Status Update Dialog */}
      <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.familiesPage.bulkStatusTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.familiesPage.bulkStatusDesc", { count: selectedIds.length, suffix: selectedIds.length === 1 ? "y" : "ies", status: bulkStatus })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkStatusUpdate(bulkStatus);
                setShowBulkStatusDialog(false);
              }}
            >
              {t("dashboard.familiesPage.confirmUpdate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Verify Classification Dialog (multi-select) */}
      <AlertDialog open={showBulkClassDialog} onOpenChange={setShowBulkClassDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.classifications.selectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.familiesPage.bulkStatusDesc", { count: selectedIds.length, suffix: selectedIds.length === 1 ? "y" : "ies", status: "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto" data-lenis-prevent>
            {selectedIds.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: "orphan", label: t("dashboard.classifications.orphan"), icon: <Baby className="h-5 w-5 text-blue-500" />, desc: t("dashboard.familiesPage.classificationDescOrphan") },
                  { value: "disabled_disease", label: t("dashboard.classifications.disabled_disease"), icon: <Heart className="h-5 w-5 text-pink-500" />, desc: t("dashboard.familiesPage.classificationDescDisabledDisease") },
                  { value: "old_age", label: t("dashboard.classifications.old_age"), icon: <Accessibility className="h-5 w-5 text-purple-500" />, desc: t("dashboard.familiesPage.classificationDescOldAge") },
                  { value: "single_mother", label: t("dashboard.classifications.single_mother"), icon: <Home className="h-5 w-5 text-amber-500" />, desc: t("dashboard.familiesPage.classificationDescSingleMother") },
                ].map(({ value, label, icon, desc }) => {
                  const selectedFamilies = sortedFamilies.filter((f) => selectedIds.includes(f._id));
                  const seenIds = new Set<string>();
                  const allMembers = selectedFamilies.flatMap((f) =>
                    (f.members || []).map((m: any) => {
                      const mId = m._id || m.id || `__idx_${f._id}_${f.members.indexOf(m)}`;
                      return { ...m, _uid: mId, _familyId: f._id };
                    })
                  ).filter((m: any) => {
                    if (seenIds.has(m._uid)) return false;
                    seenIds.add(m._uid);
                    return true;
                  });
                  const eligible = allMembers.filter(
                    (member: any) =>
                      (value !== "orphan" || member.ageGroup === "child" || member.ageGroup === "teen") &&
                      (value !== "single_mother" || member.ageGroup === "adult") &&
                      (value !== "old_age" || member.ageGroup === "adult")
                  );
                  const alreadyAssignedIds = new Set(
                    Object.entries(bulkClassificationMemberIds)
                      .filter(([cls]) => cls !== value)
                      .flatMap(([, ids]) => ids)
                  );
                  const filtered = eligible.filter(
                    (member: any) => !alreadyAssignedIds.has(member._uid)
                  );

                  return (
                    <div key={value} className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className={`flex items-start gap-3 p-3 w-full text-left transition-colors ${
                          bulkClassification.includes(value)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          if (bulkClassification.includes(value)) {
                            setBulkClassification((prev) => prev.filter((v) => v !== value));
                            setBulkClassificationMemberIds((prev) => {
                              const { [value]: _, ...rest } = prev;
                              return rest;
                            });
                          } else {
                            setBulkClassification((prev) => [...prev, value]);
                          }
                        }}
                      >
                        <div className="mt-0.5">{icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                        {bulkClassification.includes(value) && (
                          <CheckCircle className={`h-5 w-5 shrink-0 ${bulkClassification.includes(value) ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                      </button>
                      {bulkClassification.includes(value) && (
                        <div className="px-4 pb-3 space-y-1.5 border-t pt-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            {value === "orphan"
                              ? t("dashboard.familiesPage.assignToChildren")
                              : t("dashboard.familiesPage.assignToMembers")}
                          </p>
                          {filtered.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">{t("dashboard.familiesPage.noEligibleMembers")}</p>
                          ) : (
                            filtered.map((member: any) => (
                              <div key={member._uid} className="flex items-center gap-2 text-sm py-0.5">
                                <Checkbox
                                  checked={bulkClassificationMemberIds[value]?.includes(member._uid) || false}
                                  onCheckedChange={(checked) => {
                                    setBulkClassificationMemberIds((prev) => {
                                      const current = prev[value] || [];
                                      return {
                                        ...prev,
                                        [value]: checked
                                          ? [...current, member._uid]
                                          : current.filter((id) => id !== member._uid),
                                      };
                                    });
                                  }}
                                />
                                <span className="truncate">{member.fullName}</span>
                                <span className="text-xs text-muted-foreground shrink-0">({member.ageGroup})</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowBulkClassDialog(false); setBulkClassificationMemberIds({}); }}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkVerifyWithClassification}>
              {bulkClassification.length > 0 ? t("dashboard.classifications.verifyWithClass") : t("dashboard.classifications.verify")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Classification Dialog (multi-select) */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.classifications.selectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.classifications.selectDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {[
              { value: "orphan", label: t("dashboard.classifications.orphan"), icon: <Baby className="h-5 w-5 text-blue-500" />, desc: t("dashboard.familiesPage.classificationDescOrphan") },
              { value: "disabled_disease", label: t("dashboard.classifications.disabled_disease"), icon: <Heart className="h-5 w-5 text-pink-500" />, desc: t("dashboard.familiesPage.classificationDescDisabledDisease") },
              { value: "old_age", label: t("dashboard.classifications.old_age"), icon: <Accessibility className="h-5 w-5 text-purple-500" />, desc: t("dashboard.familiesPage.classificationDescOldAge") },
              { value: "single_mother", label: t("dashboard.classifications.single_mother"), icon: <Home className="h-5 w-5 text-amber-500" />, desc: t("dashboard.familiesPage.classificationDescSingleMother") },
            ].map(({ value, label, icon, desc }) => (
              <button
                key={value}
                type="button"
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selectedClassification.includes(value)
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                onClick={() => {
                  setSelectedClassification((prev) =>
                    prev.includes(value)
                      ? prev.filter((v) => v !== value)
                      : [...prev, value]
                  );
                }}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setVerifyDialogOpen(false); setVerifyDialogFamily(null); }}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleVerifyWithClassification}>
              {selectedClassification.length > 0 ? t("dashboard.classifications.verifyWithClass") : t("dashboard.classifications.verify")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ── Extracted to avoid re-creating the dropdown JSX twice ──────────────────
const FamilyActionsMenu = ({
  family,
  onVerify,
  onDelete,
  navigate,
  t,
}: {
  family: Family;
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
  t: (key: string) => string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="text-sm">
      <DropdownMenuLabel>{t("dashboard.familiesPage.actionsLabel")}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}`)}>
        <Eye className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.viewProfile")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}/edit`)}>
        <Edit className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.editFamily")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}/edit?focus=members`)}>
        <UserPlus className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.addMember")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}?action=support`)}>
        <Zap className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.recordSupport")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {family.registrationStatus !== "verified" && (
        <DropdownMenuItem onClick={() => onVerify(family._id)}>
          <UserCheck className="mr-2 h-4 w-4" />
          {t("dashboard.familiesPage.verifyFamily")}
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => onDelete(family._id)} className="text-red-600">
        <Trash2 className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.deleteFamily")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// ── Classification Badge ────────────────────────────────────────────────────
// Extracted to src/components/FamilyClassificationBadge.tsx

// ── Expanding Classification Card (GSAP FLIP) ────────────────────────────────
const ExpandableClassificationCard = ({
  classifications,
  memberClassificationStats,
  totalVerified,
  t,
}: {
  classifications: { orphan: number; disabled_disease: number; old_age: number; single_mother: number };
  memberClassificationStats: { orphan: number; disabled_disease: number; old_age: number; single_mother: number; totalMembers: number };
  totalVerified: number;
  t: (key: string) => string;
}) => {
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const isAnimating = useRef(false);
  const reducedMotion = useRef(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogTitleId = useRef(`expand-class-${Date.now()}`);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const countsFamilyRef = useRef<(HTMLSpanElement | null)[]>([]);
  const countsMemberRef = useRef<(HTMLSpanElement | null)[]>([]);
  const iconsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function open() {
    if (phase !== "closed" || isAnimating.current) return;
    isAnimating.current = true;
    setPhase("opening");
  }

  function close() {
    if (phase !== "open" || isAnimating.current) return;
    isAnimating.current = true;
    setPhase("closing");
  }

  const totalClassified =
    classifications.orphan +
    classifications.disabled_disease +
    classifications.old_age +
    classifications.single_mother;

  const memberTotalClassified =
    memberClassificationStats.orphan +
    memberClassificationStats.disabled_disease +
    memberClassificationStats.old_age +
    memberClassificationStats.single_mother;

  const classificationItems = [
    {
      key: "orphan", label: t("dashboard.classifications.orphan"), icon: Baby,
      color: "text-blue-600 dark:text-blue-400", barColor: "bg-blue-500",
      count: classifications.orphan, memberCount: memberClassificationStats.orphan,
    },
    {
      key: "disabled_disease", label: t("dashboard.classifications.disabled_disease"), icon: Heart,
      color: "text-pink-600 dark:text-pink-400", barColor: "bg-pink-500",
      count: classifications.disabled_disease, memberCount: memberClassificationStats.disabled_disease,
    },
    {
      key: "old_age", label: t("dashboard.classifications.old_age"), icon: Accessibility,
      color: "text-purple-600 dark:text-purple-400", barColor: "bg-purple-500",
      count: classifications.old_age, memberCount: memberClassificationStats.old_age,
    },
    {
      key: "single_mother", label: t("dashboard.classifications.single_mother"), icon: Home,
      color: "text-amber-600 dark:text-amber-400", barColor: "bg-amber-500",
      count: classifications.single_mother, memberCount: memberClassificationStats.single_mother,
    },
  ];
  const maxCount = Math.max(1, ...classificationItems.map((i) => i.count));
  const targetCounts = classificationItems.map((i) => i.count);
  const targetMemberCounts = classificationItems.map((i) => i.memberCount);

  // ---- OPENING ----
  useLayoutEffect(() => {
    if (phase !== "opening") return;
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    if (!trigger || !container || !backdrop || !content) return;

    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetW = Math.min(560, vw * 0.92);
    // Let content dictate height — no fixed targetH
    const target = {
      width: targetW,
      left: (vw - targetW) / 2,
      top: Math.max(48, (vh - 520) / 2),
    };

    const items = classificationItems.map((_, i) => itemsRef.current[i]).filter(Boolean) as HTMLDivElement[];
    const bars = classificationItems.map((_, i) => barsRef.current[i]).filter(Boolean) as HTMLDivElement[];
    const famCounts = classificationItems.map((_, i) => countsFamilyRef.current[i]).filter(Boolean) as HTMLSpanElement[];
    const memCounts = classificationItems.map((_, i) => countsMemberRef.current[i]).filter(Boolean) as HTMLSpanElement[];
    const iconEls = classificationItems.map((_, i) => iconsRef.current[i]).filter(Boolean) as HTMLDivElement[];

    gsap.set(container, {
      top: rect.top, left: rect.left, width: rect.width, height: rect.height, borderRadius: 12,
      autoAlpha: 0,
    });
    gsap.set(content, { autoAlpha: 0 });
    gsap.set(backdrop, { autoAlpha: 0 });
    gsap.set(items, { autoAlpha: 0, y: 16, filter: "blur(4px)" });
    gsap.set(iconEls, { scale: 0.6, autoAlpha: 0 });
    gsap.set(bars, { width: "0%" });
    famCounts.forEach((el) => { el.textContent = "0"; });
    memCounts.forEach((el) => { el.textContent = "0"; });

    const finish = () => {
      isAnimating.current = false;
      setPhase("open");
      document.body.style.overflow = "hidden";
      famCounts.forEach((el, i) => { el.textContent = String(targetCounts[i]); });
      memCounts.forEach((el, i) => { el.textContent = String(targetMemberCounts[i]); });
      bars.forEach((el, i) => { el.style.width = `${(targetCounts[i] / maxCount) * 100}%`; });
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    };

    if (reducedMotion.current) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(container, { autoAlpha: 1 }, 0);
      tl.set(items, { autoAlpha: 1, y: 0, filter: "blur(0px)" }, 0);
      tl.set(iconEls, { scale: 1, autoAlpha: 1 }, 0);
      tl.set(bars, { width: `${(targetCounts[0] / maxCount) * 100}%` }, 0);
      tl.set(famCounts, { textContent: targetCounts.map(String) }, 0);
      tl.to(container, { height: Math.min(520, vh * 0.86), borderRadius: 20, duration: 0.18, ease: "power2.out" }, 0);
      tl.to(container, { ...target, duration: 0.18 }, 0);
      tl.to(backdrop, { autoAlpha: 1, duration: 0.15 }, 0);
      return () => { tl.kill(); };
    }

    const tl = gsap.timeline({ onComplete: finish });

    // 1. Anticipatory press
    tl.to(trigger, { scale: 0.96, duration: 0.1, ease: "power2.in" }, 0)
      .to(trigger, { scale: 1, duration: 0.18, ease: "power2.out" }, 0.1);

    // 2. Crossfade trigger → container
    tl.to(container, { autoAlpha: 1, duration: 0.18, ease: "power1.out" }, 0.28);
    tl.to(trigger, { autoAlpha: 0, duration: 0.18, ease: "power1.out" }, 0.28);

    // 3. FLIP morph to modal position
    tl.to(container, {
      ...target, height: Math.min(520, vh * 0.86), borderRadius: 20,
      duration: 0.7, ease: "expo.inOut",
    }, 0.3);

    // 4. Backdrop fades in
    tl.to(backdrop, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.35);

    // 5. Content reveals
    tl.to(content, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.7);

    // 6. Items stagger in (each entry)
    tl.to(items, {
      autoAlpha: 1, y: 0, filter: "blur(0px)",
      duration: 0.45, ease: "expo.out", stagger: 0.06,
    }, 0.78);

    // 7. Icons pop in with a slight bounce
    tl.to(iconEls, {
      scale: 1, autoAlpha: 1,
      duration: 0.4, ease: "back.out(1.7)", stagger: 0.06,
    }, 0.82);

    // 8. Bars animate to width
    bars.forEach((el, i) => {
      tl.to(el, {
        width: `${(targetCounts[i] / maxCount) * 100}%`,
        duration: 0.6, ease: "expo.out",
      }, 1.05);
    });

    // 9. Family counters animate up
    famCounts.forEach((el, i) => {
      const obj = { val: 0 };
      tl.to(obj, {
        val: targetCounts[i],
        duration: 0.7, ease: "expo.out",
        onUpdate: () => { el.textContent = String(Math.round(obj.val)); },
      }, 1.15);
    });

    // 10. Member counters animate up (slightly delayed)
    memCounts.forEach((el, i) => {
      const obj = { val: 0 };
      tl.to(obj, {
        val: targetMemberCounts[i],
        duration: 0.6, ease: "expo.out",
        onUpdate: () => { el.textContent = String(Math.round(obj.val)); },
      }, 1.25);
    });

    return () => { tl.kill(); };
  }, [phase]);

  // ---- CLOSING ----
  useLayoutEffect(() => {
    if (phase !== "closing") return;
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    if (!trigger || !container || !backdrop || !content) return;

    const rect = trigger.getBoundingClientRect();
    const target = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };

    const items = classificationItems.map((_, i) => itemsRef.current[i]).filter(Boolean) as HTMLDivElement[];
    const bars = classificationItems.map((_, i) => barsRef.current[i]).filter(Boolean) as HTMLDivElement[];
    const famCounts = classificationItems.map((_, i) => countsFamilyRef.current[i]).filter(Boolean) as HTMLSpanElement[];
    const memCounts = classificationItems.map((_, i) => countsMemberRef.current[i]).filter(Boolean) as HTMLSpanElement[];

    const finish = () => {
      isAnimating.current = false;
      setPhase("closed");
      document.body.style.overflow = "";
      trigger.focus();
    };

    if (reducedMotion.current) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(content, { autoAlpha: 0, duration: 0.12 }, 0);
      tl.to(backdrop, { autoAlpha: 0, duration: 0.15 }, 0);
      tl.to(container, { ...target, borderRadius: 12, autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 0);
      tl.set(trigger, { autoAlpha: 1 }, 0.16);
      return () => { tl.kill(); };
    }

    const tl = gsap.timeline({ onComplete: finish });

    // 1. Counters count down
    famCounts.forEach((el, i) => {
      const obj = { val: targetCounts[i] };
      tl.to(obj, {
        val: 0, duration: 0.25, ease: "power2.in",
        onUpdate: () => { el.textContent = String(Math.round(obj.val)); },
      }, 0);
    });
    memCounts.forEach((el, i) => {
      const obj = { val: targetMemberCounts[i] };
      tl.to(obj, {
        val: 0, duration: 0.2, ease: "power2.in",
        onUpdate: () => { el.textContent = String(Math.round(obj.val)); },
      }, 0.05);
    });

    // 2. Bars shrink
    tl.to(bars, { width: "0%", duration: 0.25, ease: "power2.in" }, 0);

    // 3. Items stagger out (reverse order)
    tl.to([...items].reverse(), {
      autoAlpha: 0, y: 10, filter: "blur(3px)",
      duration: 0.2, ease: "power2.in", stagger: 0.03,
    }, 0.15);

    // 4. Backdrop + content fade
    tl.to(backdrop, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0.25);
    tl.to(content, { autoAlpha: 0, duration: 0.15, ease: "power1.in" }, 0.25);

    // 5. Container morphs back to trigger position
    tl.to(container, { ...target, borderRadius: 12, duration: 0.5, ease: "expo.inOut" }, 0.3);
    tl.to(container, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, 0.65);
    tl.set(trigger, { autoAlpha: 1 }, 0.7);

    return () => { tl.kill(); };
  }, [phase]);

  // Re-centre on viewport resize
  useEffect(() => {
    if (phase !== "open") return;
    function onResize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(560, vw * 0.92);
      gsap.to(containerRef.current, {
        left: (vw - w) / 2, top: Math.max(48, (vh - 520) / 2),
        width: w, duration: 0.3, ease: "power2.out",
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  // Escape + focus trap
  useEffect(() => {
    if (phase !== "open") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { e.stopPropagation(); close(); return; }
      if (e.key === "Tab" && containerRef.current) {
        const f = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!f.length) return;
        const list = Array.from(f);
        if (e.shiftKey && document.activeElement === list[0]) {
          e.preventDefault(); list[list.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === list[list.length - 1]) {
          e.preventDefault(); list[0].focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      if (phase === "open" || phase === "opening") document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPortal = phase !== "closed";

  return (
    <>
      {/* Trigger card */}
      <Card
        ref={triggerRef}
        className="cursor-pointer select-none transition-all duration-200 hover:shadow-md"
        onClick={open}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={phase !== "closed"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between p-0 pt-4 px-6 pb-1.5 space-y-0 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            {t("dashboard.classifications.title")}
          </CardTitle>
          <UserCheck className="h-3 sm:h-4 w-3 sm:w-4 text-green-500" />
        </CardHeader>
        <CardContent className="pl-7 pb-2 sm:pb-4">
          <div className="text-xl sm:text-2xl font-bold">{totalVerified}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalClassified} fam &middot; {memberTotalClassified}/{memberClassificationStats.totalMembers} mem
          </div>
        </CardContent>
      </Card>

      {/* Portal: backdrop + expanded modal */}
      {showPortal &&
        createPortal(
          <>
            <div
              ref={backdropRef}
              onClick={close}
              className="fixed inset-0 z-[998] bg-background/70 backdrop-blur-md"
              style={{ visibility: "hidden", opacity: 0 }}
              aria-hidden="true"
            />
            <div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId.current}
              className="fixed z-[999] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              style={{
                visibility: "hidden",
                willChange: "top, left, width, height, border-radius, opacity",
              }}
            >
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto p-7 sm:p-9"
                data-lenis-prevent
              >
                {/* Header */}
                <div className="mb-10 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3
                      id={dialogTitleId.current}
                      className="text-2xl font-semibold tracking-tight text-foreground"
                    >
                      {t("dashboard.classifications.title")}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {totalClassified} families &middot; {memberTotalClassified} members
                    </p>
                  </div>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Classification items */}
                <div>
                  {classificationItems.map((item, i) => (
                    <div key={item.key}>
                      {i > 0 && <div className="h-px bg-border" />}
                      <div
                        ref={(el) => { itemsRef.current[i] = el; }}
                        className="py-5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              ref={(el) => { iconsRef.current[i] = el; }}
                              className="shrink-0"
                            >
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="tabular-nums text-right">
                              <span
                                ref={(el) => { countsFamilyRef.current[i] = el; }}
                                className="text-xl font-bold text-foreground"
                              >
                                {item.count}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">fam</span>
                            </span>
                            <span className="text-muted-foreground/20">|</span>
                            <span className="tabular-nums text-right">
                              <span
                                ref={(el) => { countsMemberRef.current[i] = el; }}
                                className="text-sm font-medium text-foreground"
                              >
                                {item.memberCount}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">mem</span>
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 h-[3px] rounded-full bg-muted overflow-hidden">
                          <div
                            ref={(el) => { barsRef.current[i] = el; }}
                            className={`h-full rounded-full ${item.barColor}`}
                            style={{ width: "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default Families;
