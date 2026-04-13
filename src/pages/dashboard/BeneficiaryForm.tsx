import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { beneficiaryApi, familyApi } from "@/services/api.service";
import { Beneficiary, Family } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUpload from "@/components/ImageUpload";

const BeneficiaryForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  const preselectedFamilyId = searchParams.get('familyId');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [families, setFamilies] = useState<Family[]>([]);

  const [formData, setFormData] = useState({
    familyId: preselectedFamilyId || "",
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
    verificationStatus: "pending",
    notes: "",
  });

  // Convert age to date of birth (January 1st of birth year) in ISO-8601 format
  const ageToDateOfBirth = (age: number): string => {
    if (!age || age < 0) return "";
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return `${birthYear}-01-01T00:00:00.000Z`;
  };

  // Update beneficiary type when age changes
  const handleAgeChange = (age: string) => {
    const ageNum = parseInt(age);
    const type = ageNum >= 18 ? "adult" : "child";
    setFormData({ 
      ...formData, 
      age: age,
      beneficiaryType: type,
      // Reset orphan status for adults
      isOrphan: type === "adult" ? false : formData.isOrphan,
      orphanType: type === "adult" ? "none" : formData.orphanType,
    });
  };

  useEffect(() => {
    fetchFamilies();
    if (isEditMode && id) {
      fetchBeneficiary();
    }
  }, [id]);

  const fetchFamilies = async () => {
    try {
      const response = await familyApi.getAll({ limit: 100 });
      setFamilies(response.data.data);
    } catch (error) {
      console.error("Failed to fetch families", error);
    }
  };

  const fetchBeneficiary = async () => {
    if (!id) return;
    
    setFetching(true);
    try {
      const response = await beneficiaryApi.getById(id);
      const beneficiary = response.data;
      
      setFormData({
        familyId: beneficiary.familyId || "",
        fullName: beneficiary.fullName,
        age: beneficiary.age?.toString() || "",
        gender: beneficiary.gender || "",
        beneficiaryType: beneficiary.beneficiaryType || "child",
        relationshipToHead: beneficiary.relationshipToHead || "",
        isOrphan: beneficiary.isOrphan,
        orphanType: beneficiary.orphanType || "none",
        occupation: beneficiary.occupation || "",
        monthlyIncome: beneficiary.monthlyIncome?.toString() || "",
        educationStatus: beneficiary.educationStatus || "",
        healthStatus: beneficiary.healthStatus || "",
        photoUrl: beneficiary.photoUrl || "",
        isFamilyHead: beneficiary.isFamilyHead || false,
        verificationStatus: beneficiary.verificationStatus,
        notes: beneficiary.notes || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch beneficiary",
        variant: "destructive",
      });
      navigate("/dashboard/beneficiaries");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data with age converted to dateOfBirth
      const ageNum = parseInt(formData.age);
      const submitData = {
        ...formData,
        dateOfBirth: ageToDateOfBirth(ageNum),
        age: ageNum,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
      };

      if (isEditMode && id) {
        await beneficiaryApi.update(id, submitData);
        toast({
          title: "Success",
          description: "Beneficiary updated successfully",
        });
        navigate(`/dashboard/beneficiaries/${id}`);
      } else {
        const response = await beneficiaryApi.create(submitData);
        toast({
          title: "Success",
          description: "Beneficiary registered successfully",
        });
        navigate(`/dashboard/beneficiaries/${response.data.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save beneficiary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Loading beneficiary details...</div>
        </div>
      </div>
    );
  }

  const selectedFamily = families.find(f => f.id === formData.familyId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(isEditMode ? `/dashboard/beneficiaries/${id}` : "/dashboard/beneficiaries")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              {isEditMode ? "Edit Beneficiary" : "Register New Beneficiary"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Update beneficiary information below" : "Add a new beneficiary to a family"}
            </p>
          </div>
        </div>
      </div>

      {!isEditMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Make sure to select the correct family. If the family doesn't exist, 
            please register them first from the Families page.
          </AlertDescription>
        </Alert>
      )}

      {selectedFamily && (
        <Alert>
          <AlertDescription>
            Adding beneficiary to: <strong>{selectedFamily.familyName}</strong> ({selectedFamily.familyCode})
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Family Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Family Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyId">
                Family <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.familyId}
                onValueChange={(value) =>
                  setFormData({ ...formData, familyId: value })
                }
                required
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select family" />
                </SelectTrigger>
                <SelectContent>
                  {families.map((family) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.familyName} ({family.familyCode})
                      {!family.registrationCompleted && " - Incomplete"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Can't find the family? <Button 
                  type="button" 
                  variant="link" 
                  className="h-auto p-0 text-xs"
                  onClick={() => navigate("/dashboard/families/new")}
                >
                  Register a new family first
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g., Ahmed Mohammed"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipToHead">Relationship to Head of Family</Label>
                <Input
                  id="relationshipToHead"
                  value={formData.relationshipToHead}
                  onChange={(e) =>
                    setFormData({ ...formData, relationshipToHead: e.target.value })
                  }
                  placeholder="e.g., Child, Spouse, Parent"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  placeholder="e.g., 25"
                  min="0"
                  max="150"
                  required
                  disabled={loading}
                />
                {formData.age && (
                  <p className="text-xs text-muted-foreground">
                    Type: {formData.beneficiaryType === "adult" ? "Adult (18+)" : "Child (Under 18)"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
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
            </div>

            {/* Education Status - for all ages */}
            <div className="space-y-2">
              <Label htmlFor="educationStatus">Education Status</Label>
              <Select
                value={formData.educationStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, educationStatus: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_enrolled">Not Enrolled</SelectItem>
                  <SelectItem value="preschool">Preschool</SelectItem>
                  <SelectItem value="primary">Primary School</SelectItem>
                  <SelectItem value="secondary">Secondary School</SelectItem>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="college">College/University</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="illiterate">Illiterate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Health Status - for all ages */}
            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={formData.healthStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, healthStatus: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="chronic_illness">Chronic Illness</SelectItem>
                  <SelectItem value="disability">Disability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload */}
            <ImageUpload
              label="Beneficiary Photo"
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              disabled={loading}
            />

            {/* Occupation and Monthly Income for adults */}
            {formData.beneficiaryType === "adult" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    placeholder="e.g., Teacher, Farmer, Unemployed"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income (ETB)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyIncome: e.target.value })
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Set as family head - only for adults */}
            {formData.beneficiaryType === "adult" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFamilyHead"
                  checked={formData.isFamilyHead}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFamilyHead: checked })
                  }
                  disabled={loading}
                />
                <Label htmlFor="isFamilyHead">Set as head of family</Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orphan Information - Only for children */}
        {formData.beneficiaryType === "child" && (
          <Card>
            <CardHeader>
              <CardTitle>Orphan Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isOrphan"
                  checked={formData.isOrphan}
                  onCheckedChange={(checked) =>
                    setFormData({ 
                      ...formData, 
                      isOrphan: checked,
                      orphanType: checked ? formData.orphanType : "none"
                    })
                  }
                  disabled={loading}
                />
                <Label htmlFor="isOrphan">This child is an orphan</Label>
              </div>

            {formData.isOrphan && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="orphanType">Orphan Type</Label>
                  <Select
                    value={formData.orphanType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, orphanType: value })
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
              </>
            )}
          </CardContent>
        </Card>
        )}

        {/* Verification & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Verification & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <Select
                value={formData.verificationStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, verificationStatus: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information about the beneficiary..."
                rows={4}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(isEditMode ? `/dashboard/beneficiaries/${id}` : "/dashboard/beneficiaries")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Beneficiary" : "Register Beneficiary"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BeneficiaryForm;
