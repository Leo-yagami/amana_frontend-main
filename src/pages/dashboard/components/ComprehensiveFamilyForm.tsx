import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, User, Save, Baby, Heart, Accessibility, Home } from "lucide-react";
import { familyApi } from "@/services/api.service";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";
import DocumentUpload from "@/components/DocumentUpload";
import type { DocumentItem } from "@/components/DocumentUpload";
import Beneficiaries from "../Beneficiaries";

interface BeneficiaryFormData {
  tempId: string;
  fullName: string;
  ageGroup: "child" | "teen" | "adult" | "";  
  gender: string;
  beneficiaryType: string;
  relationshipToHead: string;
  isOrphan: boolean;
  orphanType: string;
  occupation: string;
  monthlyIncome: string;
  educationStatus: string;
  healthStatus: string;
  photoUrl: string;
  isFamilyHead: boolean;
  notes: string;
  memberClassification: string;
}

export default function ComprehensiveFamilyForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
      if (cleaned.startsWith('+251')) {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length <= 3) return cleaned;
        const after = digits.slice(3);
        if (after.length <= 2) return `+251 ${after}`;
        if (after.length <= 5) return `+251 ${after.slice(0, 2)} ${after.slice(2)}`;
        return `+251 ${after.slice(0, 2)} ${after.slice(2, 5)} ${after.slice(5, 9)}`;
      }
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length <= 4) return cleaned;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }

    const digits = cleaned.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  // Family data
  const [familyData, setFamilyData] = useState({
    familyName: "",
    primaryPhone: "",
    description: "",
    familySize: "",
    childrenCount: "",
    urgencyLevel: "medium",
    notes: "",
  });

  // Documents list
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Beneficiaries list
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryFormData[]>([]);

  // Current beneficiary being added/edited
  const [currentBeneficiary, setCurrentBeneficiary] = useState<BeneficiaryFormData>({
    tempId: "",
    fullName: "",
    ageGroup: "",
    gender: "",
    beneficiaryType: "child",
    relationshipToHead: "",
    isOrphan: false,
    orphanType: "none",
    occupation: "",
    monthlyIncome: "",
    educationStatus: "",
    healthStatus: "",
    photoUrl: "",
    isFamilyHead: false,
    notes: "",
    memberClassification: "",
  });

  const CHILD_AGES = Array.from({ length: 13 }, (_, i) => i); // 0..12
  const TEEN_AGES = Array.from({ length: 6 }, (_, i) => i + 13); // 13..18
  const ADULT_AGES = Array.from({ length: 83 }, (_, i) => i + 19); // 19..101

  // Handle age change
  // const handleAgeChange = (age: string) => {
  //   const ageNum = parseInt(age);
  //   const type = ageNum >= 18 ? "adult" : "child";
  //   setCurrentBeneficiary({ 
  //     ...currentBeneficiary, 
  //     age,
  //     beneficiaryType: type,
  //     isOrphan: type === "adult" ? false : currentBeneficiary.isOrphan,
  //     orphanType: type === "adult" ? "none" : currentBeneficiary.orphanType,
  //   });
  // };

  const handleAgeGroupChange = (ageGroup: "child" | "teen" | "adult") => {
    setCurrentBeneficiary({
      ...currentBeneficiary,
      ageGroup,
      beneficiaryType: ageGroup === "adult" ? "adult" : "child",
      isOrphan: ageGroup === "adult" ? false : currentBeneficiary.isOrphan,
      orphanType: ageGroup === "adult" ? "none" : currentBeneficiary.orphanType,
      memberClassification: ageGroup === "adult" ? "" : (currentBeneficiary.isOrphan ? "orphan" : ""),
    });
  };

  // Calculate total family income from working members
  const calculateFamilyIncome = (benList: BeneficiaryFormData[]) => {
    return benList
      .filter(b => b.monthlyIncome && parseFloat(b.monthlyIncome) > 0)
      .reduce((sum, b) => sum + parseFloat(b.monthlyIncome), 0);
  };

  // Add beneficiary to list
  const addBeneficiary = () => {
    if (!currentBeneficiary.fullName || !currentBeneficiary.ageGroup) {
      toast({
        title: t("familyForm.validationNameAndAgeRequired"),
        description: t("familyForm.validationNameAndAgeRequired"),
        variant: "destructive",
      });
      return;
    }

    const beneficiaryToAdd = {
      ...currentBeneficiary,
      tempId: Date.now().toString(),
      isFamilyHead: false,
    };

    let updatedBeneficiaries = [...beneficiaries, beneficiaryToAdd];

    const adults = updatedBeneficiaries.filter(b => b.beneficiaryType === "adult");
    if (adults.length === 1) {
      updatedBeneficiaries = updatedBeneficiaries.map(b => ({
        ...b,
        isFamilyHead: b.beneficiaryType === "adult"
      }));
    }

    setBeneficiaries(updatedBeneficiaries);

    // Auto-calculate and update family income
    const totalIncome = calculateFamilyIncome(updatedBeneficiaries);
    if (totalIncome > 0) {
      setFamilyData({ ...familyData, monthlyIncome: totalIncome.toString() });
    }

    // Reset form
    setCurrentBeneficiary({
      tempId: "",
      fullName: "",
      age: "",
      gender: "",
      beneficiaryType: "child",
      relationshipToHead: "",
      isOrphan: false,
      orphanType: "none",
      occupation: "",
      monthlyIncome: "",
      educationStatus: "",
      healthStatus: "",
      photoUrl: "",
      isFamilyHead: false,
      notes: "",
      memberClassification: "",
    });

    toast({
      title: t("common.success"),
      description: t("familyForm.memberAdded"),
    });
  };

  // Remove beneficiary
  const removeBeneficiary = (tempId: string) => {
    let updatedBeneficiaries = beneficiaries.filter(b => b.tempId !== tempId);

    const adults = updatedBeneficiaries.filter(b => b.beneficiaryType === "adult");
    if (adults.length === 1) {
      updatedBeneficiaries = updatedBeneficiaries.map(b => ({
        ...b,
        isFamilyHead: b.beneficiaryType === "adult"
      }));
    }

    setBeneficiaries(updatedBeneficiaries);
    
    // Recalculate family income
    const totalIncome = calculateFamilyIncome(updatedBeneficiaries);
    setFamilyData({ ...familyData, monthlyIncome: totalIncome > 0 ? totalIncome.toString() : "" });
  };

  // // Submit complete family registration
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!familyData.familyName) {
  //     toast({
  //       title: "Validation Error",
  //       description: "Family name is required",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (beneficiaries.length === 0) {
  //     toast({
  //       title: "Warning",
  //       description: "No beneficiaries added. Add at least one family member.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Prepare beneficiaries data
  //     const beneficiariesData = beneficiaries.map(ben => ({
  //       fullName: ben.fullName,
  //       age: parseInt(ben.age),
  //       dateOfBirth: ageToDateOfBirth(parseInt(ben.age)),
  //       gender: ben.gender || undefined,
  //       beneficiaryType: ben.beneficiaryType,
  //       relationshipToHead: ben.relationshipToHead || undefined,
  //       isOrphan: ben.isOrphan,
  //       orphanType: ben.orphanType,
  //       occupation: ben.occupation || undefined,
  //       monthlyIncome: ben.monthlyIncome ? parseFloat(ben.monthlyIncome) : undefined,
  //       educationStatus: ben.educationStatus || undefined,
  //       healthStatus: ben.healthStatus || undefined,
  //       photoUrl: ben.photoUrl || undefined,
  //       isFamilyHead: ben.isFamilyHead,
  //       verificationStatus: "pending",
  //       notes: ben.notes || undefined,
  //     }));

  //     // Prepare family data
  //     const submitData = {
  //       familyName: familyData.familyName,
  //       region: familyData.region || undefined,
  //       subRegion: familyData.subRegion || undefined,
  //       address: familyData.address || undefined,
  //       exactLocation: familyData.exactLocation || undefined,
  //       description: familyData.description || undefined,
  //       urgencyLevel: familyData.urgencyLevel,
  //       monthlyIncome: familyData.monthlyIncome ? parseFloat(familyData.monthlyIncome) : undefined,
  //       monthlyRentAmount: familyData.monthlyRentAmount ? parseFloat(familyData.monthlyRentAmount) : undefined,
  //       familySize: familyData.familySize ? parseInt(familyData.familySize) : beneficiaries.length,
  //       childrenCount: familyData.childrenCount ? parseInt(familyData.childrenCount) : beneficiaries.filter(b => b.beneficiaryType === "child").length,
  //       notes: familyData.notes || undefined,
  //       beneficiaries: beneficiariesData,
  //     };

  //     const response = await familyApi.create(submitData);

  //     toast({
  //       title: "Success",
  //       description: `Family "${familyData.familyName}" registered successfully with ${beneficiaries.length} members`,
  //     });

  //     navigate(`/dashboard/families/${response.data.id}`);
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.response?.data?.message || "Failed to register family",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //changed handlesumbit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyData.familyName.trim()) {
      toast({
        title: t("familyForm.validationNameRequired"),
        description: t("familyForm.validationNameRequired"),
        variant: "destructive",
      });
      return;
    }
    if (beneficiaries.length === 0) {
      toast({
        title: t("familyForm.validationMemberRequired"),
        description: t("familyForm.validationMemberRequired"),
        variant: "destructive",
      });
      return;
    }

    const phone = familyData.primaryPhone.replace(/\s+/g, '');
    const phoneOk = /^(?:\+251|0)(?:9|7)\d{8}$/.test(phone);
    if (!phoneOk) {
      toast({
        title: t("familyForm.validationPhoneRequired"),
        description: t("familyForm.validationPhoneFormat"),
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Convert local “members” form state into API payload objects
      // const membersPayload = beneficiaries.map((m) => {
      //   const ageNum = parseInt(m.age, 10);
      //   return {
      //     fullName: m.fullName.trim(),
      //     age: Number.isFinite(ageNum) ? ageNum : undefined,
      //     gender: m.gender || undefined,
      //     beneficiaryType: m.beneficiaryType, // keep as-is if backend expects it
      //     relationshipToHead: m.relationshipToHead || undefined,
      //     isOrphan: m.isOrphan,
      //     orphanType: m.isOrphan ? m.orphanType : "none",
      //     occupation: m.occupation || undefined,
      //     monthlyIncome: m.monthlyIncome ? parseFloat(m.monthlyIncome) : undefined,
      //     educationStatus: m.educationStatus || undefined,
      //     healthStatus: m.healthStatus || undefined,
      //     photoUrl: m.photoUrl || undefined,
      //     isFamilyHead: m.isFamilyHead,
      //     verificationStatus: "pending",
      //     notes: m.notes || undefined,
      //   };
      // });
      //changed version
      const membersPayload = beneficiaries.map((m) => {
        const isAdult = m.ageGroup === "adult";
      
        return {
          fullName: m.fullName.trim(),
          gender: m.gender || undefined,
      
          // keep existing backend expectation:
          beneficiaryType: isAdult ? "adult" : "child", // teen treated as child
      
          // NEW: keep the group explicitly (backend should accept it, or you can drop it)
          ageGroup: m.ageGroup,
          isHead: m.isFamilyHead,
      
          photoUrl: m.photoUrl || undefined,

      
          isOrphan: !isAdult ? m.isOrphan : false,
          orphanType: !isAdult && m.isOrphan ? m.orphanType : "none",

          memberClassification: m.memberClassification || undefined,
        };
      });
      // Prepare family payload
      const familySize =
        familyData.familySize && familyData.familySize.trim() !== ""
          ? parseInt(familyData.familySize, 10)
          : beneficiaries.length;
      const childrenCount =
        familyData.childrenCount && familyData.childrenCount.trim() !== ""
          ? parseInt(familyData.childrenCount, 10)
          : beneficiaries.filter((m) => m.beneficiaryType === "child").length;
      const submitData: any = {
        familyName: familyData.familyName.trim(),
        familyHead: beneficiaries.find(b=>b.isFamilyHead).fullName,
        description: familyData.description || undefined,
        urgencyLevel: familyData.urgencyLevel,
        primaryPhone: familyData.primaryPhone.replace(/\s+/g, ''),
        familySize,
        notes: familyData.notes || undefined,
        documents: documents.length > 0 ? documents : undefined,
        members: membersPayload,
      };
      const response = await familyApi.create(submitData);
      toast({
        title: t("common.success"),
        description: t("familyForm.registerSuccess", { name: familyData.familyName, count: beneficiaries.length }),
      });
      // navigate(`/dashboard/families/${response.data.id}`);
      navigate(`/dashboard/families`);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("familyForm.registerError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("familyForm.familyInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="familyName">{t("familyForm.familyName")}</Label>
            <Input
              id="familyName"
              className="text-sm sm:text-base"
              value={familyData.familyName}
              onChange={(e) => setFamilyData({ ...familyData, familyName: e.target.value })}
              placeholder={t("familyForm.familyNamePlaceholder")}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryPhone">{t("familyForm.phoneNumber")}</Label>
            <Input
              id="primaryPhone"
              ref={phoneRef}
              className="text-sm sm:text-base"
              value={familyData.primaryPhone}
              onChange={(e) => {
                const input = e.target;
                const cursorPos = input.selectionStart ?? 0;
                const rawBefore = (input.value.slice(0, cursorPos).match(/[\d+]/g) || []).length;
                const formatted = formatPhoneNumber(input.value);
                setFamilyData({ ...familyData, primaryPhone: formatted });
                if (formatted !== input.value) {
                  queueMicrotask(() => {
                    let newPos = 0;
                    let digitCount = 0;
                    for (let i = 0; i < formatted.length; i++) {
                      if (/[\d+]/.test(formatted[i])) digitCount++;
                      if (digitCount >= rawBefore) { newPos = i + 1; break; }
                    }
                    if (rawBefore === 0) newPos = 0;
                    if (digitCount < rawBefore) newPos = formatted.length;
                    input.setSelectionRange(newPos, newPos);
                  });
                }
              }}
              placeholder={t("familyForm.phonePlaceholder")}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {t("familyForm.phoneHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">{t("familyForm.urgencyLevel")}</Label>
            <Select
              value={familyData.urgencyLevel}
              onValueChange={(value) => setFamilyData({ ...familyData, urgencyLevel: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("common.low")}</SelectItem>
                <SelectItem value="medium">{t("common.medium")}</SelectItem>
                <SelectItem value="high">{t("common.high")}</SelectItem>
                <SelectItem value="critical">{t("common.critical")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("familyForm.notes")}</Label>
            <Textarea
              id="notes"
              value={familyData.notes}
              className="text-sm sm:text-base"
              onChange={(e) => setFamilyData({ ...familyData, notes: e.target.value })}
              placeholder={t("familyForm.notesPlaceholder")}
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("familyForm.supportingDocuments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload
            documents={documents}
            onChange={setDocuments}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Add Beneficiary Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("familyForm.addFamilyMember")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="space-y-2">
<Label htmlFor="benFullName">{t("familyForm.fullName")}</Label>
      <Input
        id="benFullName"
        className="text-sm sm:text-base"
        value={currentBeneficiary.fullName}
        onChange={(e) =>
          setCurrentBeneficiary({ ...currentBeneficiary, fullName: e.target.value })
        }
        placeholder={t("familyForm.fullNamePlaceholder")}
        disabled={loading}
    />
  </div>
  <div className="space-y-2">
<Label htmlFor="benAgeGroup">{t("familyForm.age")}</Label>
      <Select
        value={currentBeneficiary.ageGroup}
        onValueChange={(value) => handleAgeGroupChange(value as "child" | "teen" | "adult")}
        disabled={loading}
      >
        <SelectTrigger id="benAgeGroup">
          <SelectValue placeholder={t("familyForm.agePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="child">{t("familyForm.ageChild")}</SelectItem>
          <SelectItem value="teen">{t("familyForm.ageTeen")}</SelectItem>
          <SelectItem value="adult">{t("familyForm.ageAdult")}</SelectItem>
        </SelectContent>
      </Select>
  </div>
  
</div>

<div className="space-y-2">
<Label htmlFor="benGender">{t("familyForm.gender")}</Label>
      <Select
        value={currentBeneficiary.gender}
        onValueChange={(value) =>
          setCurrentBeneficiary({ ...currentBeneficiary, gender: value })
        }
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("familyForm.genderPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">{t("common.male")}</SelectItem>
          <SelectItem value="female">{t("common.female")}</SelectItem>
          <SelectItem value="other">{t("common.other")}</SelectItem>
        </SelectContent>
      </Select>
</div>

<ImageUpload
  label={t("familyForm.memberPhoto")}
  value={currentBeneficiary.photoUrl}
  onChange={(url) => setCurrentBeneficiary({ ...currentBeneficiary, photoUrl: url })}
  disabled={loading}
/>

<div className="space-y-4">
    <div className="flex items-center space-x-2">
      <Switch
        id="benOrphan"
        checked={currentBeneficiary.isOrphan}
        onCheckedChange={(checked) =>
          setCurrentBeneficiary({
            ...currentBeneficiary,
            isOrphan: checked,
            orphanType: checked ? currentBeneficiary.orphanType : "none",
            memberClassification: checked ? "orphan" : "",
          })
        }
        disabled={loading}
      />
      <Label htmlFor="benOrphan">{t("familyForm.orphanToggle")}</Label>
    </div>

    {currentBeneficiary.isOrphan && (
      <div className="space-y-2">
        <Label htmlFor="benOrphanType">{t("familyForm.orphanType")}</Label>
        <Select
          value={currentBeneficiary.orphanType}
          onValueChange={(value) =>
            setCurrentBeneficiary({ ...currentBeneficiary, orphanType: value, memberClassification: "orphan" })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("familyForm.orphanTypePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mother">{t("familyForm.lostMother")}</SelectItem>
            <SelectItem value="father">{t("familyForm.lostFather")}</SelectItem>
            <SelectItem value="both">{t("familyForm.lostBoth")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}
  </div>

{currentBeneficiary.ageGroup && currentBeneficiary.ageGroup === "adult" && (
  <div className="space-y-2">
    <Label htmlFor="benClassification">{t("familyForm.classification")}</Label>
    <Select
      value={currentBeneficiary.memberClassification}
      onValueChange={(value) =>
        setCurrentBeneficiary({ ...currentBeneficiary, memberClassification: value })
      }
      disabled={loading}
    >
      <SelectTrigger id="benClassification">
        <SelectValue placeholder={t("familyForm.classificationPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{t("familyForm.classificationNone")}</SelectItem>
        <SelectItem value="disabled_disease">
          <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-pink-500" /> {t("familyForm.classificationDisabled")}</span>
        </SelectItem>
        <SelectItem value="old_age">
          <span className="flex items-center gap-2"><Accessibility className="h-4 w-4 text-purple-500" /> {t("familyForm.classificationOldAge")}</span>
        </SelectItem>
        <SelectItem value="single_mother">
          <span className="flex items-center gap-2"><Home className="h-4 w-4 text-amber-500" /> {t("familyForm.classificationSingleMother")}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

          <Button
            type="button"
            onClick={addBeneficiary}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("familyForm.addToFamily")}
          </Button>
        </CardContent>
      </Card>

      {/* Select Head of Family */}
      {beneficiaries.filter(b => b.beneficiaryType === "adult").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("familyForm.headOfFamily")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="selectHead">{t("familyForm.selectHead")}</Label>
              <Select
                value={beneficiaries.find(b => b.isFamilyHead)?.tempId || "none"}
                onValueChange={(tempId) => {
                  setBeneficiaries(beneficiaries.map(b => ({
                    ...b,
                    isFamilyHead: b.tempId === tempId
                  })));
                }}
                disabled={loading}
              >
                <SelectTrigger id="selectHead">
                  <SelectValue placeholder={t("familyForm.selectHeadPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("familyForm.noHeadSelected")}</SelectItem>
                  {beneficiaries
                    .filter(b => b.beneficiaryType === "adult")
                    .map((ben) => (
                      <SelectItem key={ben.tempId} value={ben.tempId}>
                        {ben.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("familyForm.headHelper")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficiaries List */}
      {beneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("familyForm.familyMembers", { count: beneficiaries.length })}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {t("familyForm.adults")}: {beneficiaries.filter(b => b.beneficiaryType === "adult").length} • 
                {t("familyForm.children")}: {beneficiaries.filter(b => b.beneficiaryType === "child").length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {beneficiaries.map((ben) => (
                <div key={ben.tempId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {ben.photoUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2">
                        <img src={ben.photoUrl} alt={ben.fullName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{ben.fullName} {ben.isFamilyHead && `(${t("familyForm.familyHead")})`}</p>
                      <p className="text-sm text-muted-foreground">
                        {ben.ageGroup ? t(`familyForm.age${ben.ageGroup.charAt(0).toUpperCase() + ben.ageGroup.slice(1)}`) : ""} • {ben.gender ? t(`common.${ben.gender}`) : ""} • {t("common.members")}
                        {ben.relationshipToHead && ` • ${ben.relationshipToHead}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBeneficiary(ben.tempId)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        <Button
          className="w-full sm:w-auto sm:justify-self-start"
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard/families")}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
        <Button
        className="w-full sm:w-auto sm:justify-self-end"
        type="submit" disabled={loading || beneficiaries.length === 0}>
          {loading ? (
            <>{t("common.loading")}</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("familyForm.registerFamily", { count: beneficiaries.length })}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
