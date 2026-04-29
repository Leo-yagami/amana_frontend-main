import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, User, Save } from "lucide-react";
import { familyApi } from "@/services/api.service";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";
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
}

export default function ComprehensiveFamilyForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
      beneficiaryType: ageGroup === "adult" ? "adult" : "child", // teen maps to child in existing API
      isOrphan: ageGroup === "adult" ? false : currentBeneficiary.isOrphan,
      orphanType: ageGroup === "adult" ? "none" : currentBeneficiary.orphanType,
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
        title: "Validation Error",
        description: "Name and age are required for beneficiary",
        variant: "destructive",
      });
      return;
    }

    const beneficiaryToAdd = {
      ...currentBeneficiary,
      tempId: Date.now().toString(),
      isFamilyHead: false, // Don't set head here, use the dropdown instead
    };

    const updatedBeneficiaries = [...beneficiaries, beneficiaryToAdd];
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
    });

    toast({
      title: "Success",
      description: "Beneficiary added to the list",
    });
  };

  // Remove beneficiary
  const removeBeneficiary = (tempId: string) => {
    const updatedBeneficiaries = beneficiaries.filter(b => b.tempId !== tempId);
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
        title: "Validation Error",
        description: "Family name is required",
        variant: "destructive",
      });
      return;
    }
    if (beneficiaries.length === 0) {
      toast({
        title: "Validation Error",
        description: "Add at least one family member.",
        variant: "destructive",
      });
      return;
    }

    const phone = familyData.primaryPhone.trim();
    const phoneOk = /^(?:\+251|0)(?:9|7)\d{8}$/.test(phone);
    if (!phoneOk) {
      toast({
        title: "Validation Error",
        description: "Phone must be +2519XXXXXXXX / +2517XXXXXXXX / 09XXXXXXXX / 07XXXXXXXX",
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
        primaryPhone: familyData.primaryPhone.trim(),
        familySize,
        notes: familyData.notes || undefined,
        // Embedded members on the family document:
        // Keep the key name your backend currently accepts.
        // beneficiaries: membersPayload,
        // If your backend uses `members` instead, switch to:
        members: membersPayload,
      };
      const response = await familyApi.create(submitData);
      toast({
        title: "Success",
        description: `Family "${familyData.familyName}" registered successfully with ${beneficiaries.length} member(s)`,
      });
      // navigate(`/dashboard/families/${response.data.id}`);
      navigate(`/dashboard/families`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to register family",
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
          <CardTitle>Family Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="familyName">Family Name *</Label>
            <Input
              id="familyName"
              value={familyData.familyName}
              onChange={(e) => setFamilyData({ ...familyData, familyName: e.target.value })}
              placeholder="e.g., Ahmed Family"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryPhone">Phone Number *</Label>
            <Input
              id="primaryPhone"
              value={familyData.primaryPhone}
              onChange={(e) => setFamilyData({ ...familyData, primaryPhone: e.target.value })}
              placeholder="+2519XXXXXXXX / 09XXXXXXXX / 07XXXXXXXX"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: +2519XXXXXXXX, +2517XXXXXXXX, 09XXXXXXXX, 07XXXXXXXX
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Urgency Level</Label>
            <Select
              value={familyData.urgencyLevel}
              onValueChange={(value) => setFamilyData({ ...familyData, urgencyLevel: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={familyData.notes}
              onChange={(e) => setFamilyData({ ...familyData, notes: e.target.value })}
              placeholder="Any additional information about the family..."
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Beneficiary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Family Member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="benFullName">Full Name *</Label>
    <Input
      id="benFullName"
      value={currentBeneficiary.fullName}
      onChange={(e) =>
        setCurrentBeneficiary({ ...currentBeneficiary, fullName: e.target.value })
      }
      placeholder="e.g., Ahmed Mohammed"
      disabled={loading}
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="benAgeGroup">Age</Label>
    <Select
      value={currentBeneficiary.ageGroup}
      onValueChange={(value) => handleAgeGroupChange(value as "child" | "teen" | "adult")}
      disabled={loading}
    >
      <SelectTrigger id="benAgeGroup">
        <SelectValue placeholder="Select age group" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="child">Child (0–12)</SelectItem>
        <SelectItem value="teen">Teen (13–18)</SelectItem>
        <SelectItem value="adult">Adult (19+)</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
</div>

<div className="space-y-2">
  <Label htmlFor="benGender">Gender</Label>
  <Select
    value={currentBeneficiary.gender}
    onValueChange={(value) =>
      setCurrentBeneficiary({ ...currentBeneficiary, gender: value })
    }
    disabled={loading}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select gender" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="male">Male</SelectItem>
      <SelectItem value="female">Female</SelectItem>
      <SelectItem value="other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>

<ImageUpload
  label="Beneficiary Photo"
  value={currentBeneficiary.photoUrl}
  onChange={(url) => setCurrentBeneficiary({ ...currentBeneficiary, photoUrl: url })}
  disabled={loading}
/>

{/* Orphan toggle — keep same behavior, but show for child + teen (< 19) */}
{currentBeneficiary.ageGroup && currentBeneficiary.ageGroup !== "adult" && (
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
          })
        }
        disabled={loading}
      />
      <Label htmlFor="benOrphan">This child is an orphan</Label>
    </div>

    {currentBeneficiary.isOrphan && (
      <div className="space-y-2">
        <Label htmlFor="benOrphanType">Orphan Type</Label>
        <Select
          value={currentBeneficiary.orphanType}
          onValueChange={(value) =>
            setCurrentBeneficiary({ ...currentBeneficiary, orphanType: value })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select orphan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mother">Lost Mother</SelectItem>
            <SelectItem value="father">Lost Father</SelectItem>
            <SelectItem value="both">Lost Both Parents</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}
  </div>
)}

          <Button
            type="button"
            onClick={addBeneficiary}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Family
          </Button>
        </CardContent>
      </Card>

      {/* Select Head of Family */}
      {beneficiaries.filter(b => b.beneficiaryType === "adult").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Head of Family</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="selectHead">Select Head of Family</Label>
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
                  <SelectValue placeholder="Select an adult as head of family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Head Selected</SelectItem>
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
                The head of family should be an adult member. This is required to complete registration.
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
              <CardTitle>Family Members ({beneficiaries.length})</CardTitle>
              <div className="text-sm text-muted-foreground">
                {beneficiaries.filter(b => b.beneficiaryType === "adult").length} Adults • 
                {beneficiaries.filter(b => b.beneficiaryType === "child").length} Children
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
                      <p className="font-medium">{ben.fullName} {ben.isFamilyHead && "(Head)"}</p>
                      <p className="text-sm text-muted-foreground">
                        {ben.age} years • {ben.gender} • {ben.beneficiaryType}
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
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard/families")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || beneficiaries.length === 0}>
          {loading ? (
            <>Loading...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Register Family ({beneficiaries.length} members)
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
