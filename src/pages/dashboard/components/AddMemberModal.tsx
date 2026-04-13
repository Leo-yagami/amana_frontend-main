import { useState, useEffect } from "react";
import { beneficiaryApi } from "@/services/api.service";
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
import { Loader2, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUpload from "@/components/ImageUpload";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  family: Family | null;
  onSuccess: () => void;
}

const AddMemberModal = ({
  open,
  onClose,
  family,
  onSuccess,
}: AddMemberModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
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

  // Convert age to date of birth (January 1st of birth year) in ISO-8601 format
  const ageToDateOfBirth = (age: number): string => {
    if (!age || age < 0) return "";
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return `${birthYear}-01-01T00:00:00.000Z`;
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
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
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;

    setLoading(true);

    try {
      // Prepare data with age converted to dateOfBirth
      const ageNum = parseInt(formData.age);
      const submitData = {
        familyId: family.id,
        ...formData,
        dateOfBirth: ageToDateOfBirth(ageNum),
        age: ageNum,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
        verificationStatus: "pending",
      };

      await beneficiaryApi.create(submitData);
      
      toast({
        title: "Success",
        description: `Added ${formData.fullName} to ${family.familyName}`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add family member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!family) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Member to {family.familyName}
          </DialogTitle>
          <DialogDescription>
            Family Code: {family.familyCode} | Head: {family.headBeneficiary?.fullName || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-sm">
            Adding a beneficiary to an existing family. The member will be linked to "{family.familyName}".
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipToHead">Relationship to Head *</Label>
                <Input
                  id="relationshipToHead"
                  value={formData.relationshipToHead}
                  onChange={(e) =>
                    setFormData({ ...formData, relationshipToHead: e.target.value })
                  }
                  placeholder="e.g., Child, Spouse, Parent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
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
          </div>

          {/* Orphan Information - Only for children */}
          {formData.beneficiaryType === "child" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Orphan Status</h3>
              
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
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional information, education, health status, special needs, etc."
              rows={3}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
