import { useState, useEffect } from "react";
import { beneficiaryApi, familyApi } from "@/services/api.service";
import { Beneficiary, Family } from "@/types/api";
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
import { Loader2 } from "lucide-react";

interface BeneficiaryFormModalProps {
  open: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  preselectedFamilyId?: string;
  onSuccess: () => void;
}

const BeneficiaryFormModal = ({
  open,
  onClose,
  beneficiary,
  preselectedFamilyId,
  onSuccess,
}: BeneficiaryFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    familyId: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    relationshipToHead: "",
    isOrphan: false,
    orphanType: "",
    guardianName: "",
    guardianRelationship: "",
    educationLevel: "",
    schoolName: "",
    healthStatus: "",
    specialNeeds: "",
    verificationStatus: "pending",
    notes: "",
  });

  // Fetch families for dropdown
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await familyApi.getAll({ limit: 100 });
        setFamilies(response.data.data);
      } catch (error) {
        console.error("Failed to fetch families", error);
      }
    };
    if (open) {
      fetchFamilies();
    }
  }, [open]);

  // Populate form when editing or preselected family
  useEffect(() => {
    if (beneficiary) {
      setFormData({
        familyId: beneficiary.familyId,
        fullName: beneficiary.fullName,
        dateOfBirth: beneficiary.dateOfBirth || "",
        gender: beneficiary.gender || "",
        relationshipToHead: beneficiary.relationshipToHead || "",
        isOrphan: beneficiary.isOrphan,
        orphanType: beneficiary.orphanType || "",
        guardianName: beneficiary.guardianName || "",
        guardianRelationship: beneficiary.guardianRelationship || "",
        educationLevel: beneficiary.educationLevel || "",
        schoolName: beneficiary.schoolName || "",
        healthStatus: beneficiary.healthStatus || "",
        specialNeeds: beneficiary.specialNeeds || "",
        verificationStatus: beneficiary.verificationStatus,
        notes: beneficiary.notes || "",
      });
    } else {
      // Reset form for new beneficiary (with optional preselected family)
      setFormData({
        familyId: preselectedFamilyId || "",
        fullName: "",
        dateOfBirth: "",
        gender: "",
        relationshipToHead: "",
        isOrphan: false,
        orphanType: "",
        guardianName: "",
        guardianRelationship: "",
        educationLevel: "",
        schoolName: "",
        healthStatus: "",
        specialNeeds: "",
        verificationStatus: "pending",
        notes: "",
      });
    }
  }, [beneficiary, preselectedFamilyId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (beneficiary) {
        await beneficiaryApi.update(beneficiary.id, formData);
        toast({
          title: "Success",
          description: "Beneficiary updated successfully",
        });
      } else {
        await beneficiaryApi.create(formData);
        toast({
          title: "Success",
          description: "Beneficiary created successfully",
        });
      }
      onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {beneficiary ? "Edit Beneficiary" : "Add New Beneficiary"}
          </DialogTitle>
          <DialogDescription>
            {beneficiary
              ? "Update beneficiary information below"
              : "Fill in the details to add a new beneficiary"}
          </DialogDescription>
        </DialogHeader>

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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyId">Family *</Label>
                <Select
                  value={formData.familyId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, familyId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select family" />
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={family.id}>
                        {family.familyName} ({family.familyCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
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

            <div className="space-y-2">
              <Label htmlFor="relationshipToHead">Relationship to Head of Family</Label>
              <Input
                id="relationshipToHead"
                value={formData.relationshipToHead}
                onChange={(e) =>
                  setFormData({ ...formData, relationshipToHead: e.target.value })
                }
                placeholder="e.g., Child, Spouse, Sibling"
              />
            </div>
          </div>

          {/* Orphan Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Orphan Information</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isOrphan"
                checked={formData.isOrphan}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isOrphan: checked })
                }
              />
              <Label htmlFor="isOrphan">This person is an orphan</Label>
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select orphan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maternal">Maternal (Lost Mother)</SelectItem>
                      <SelectItem value="paternal">Paternal (Lost Father)</SelectItem>
                      <SelectItem value="double">Double (Lost Both Parents)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input
                      id="guardianName"
                      value={formData.guardianName}
                      onChange={(e) =>
                        setFormData({ ...formData, guardianName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianRelationship">Guardian Relationship</Label>
                    <Input
                      id="guardianRelationship"
                      value={formData.guardianRelationship}
                      onChange={(e) =>
                        setFormData({ ...formData, guardianRelationship: e.target.value })
                      }
                      placeholder="e.g., Uncle, Aunt, Grandparent"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Education & Health */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Education & Health</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="educationLevel">Education Level</Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, educationLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">Preschool</SelectItem>
                    <SelectItem value="primary">Primary School</SelectItem>
                    <SelectItem value="secondary">Secondary School</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="college">College/University</SelectItem>
                    <SelectItem value="not_enrolled">Not Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={formData.healthStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, healthStatus: value })
                }
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

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs</Label>
              <Textarea
                id="specialNeeds"
                value={formData.specialNeeds}
                onChange={(e) =>
                  setFormData({ ...formData, specialNeeds: e.target.value })
                }
                placeholder="Describe any special needs or conditions"
                rows={2}
              />
            </div>
          </div>

          {/* Verification & Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Verification & Notes</h3>
            
            <div className="space-y-2">
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <Select
                value={formData.verificationStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, verificationStatus: value })
                }
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : beneficiary ? (
                "Update Beneficiary"
              ) : (
                "Add Beneficiary"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiaryFormModal;
