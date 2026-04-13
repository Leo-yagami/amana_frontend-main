import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";

interface FamilyFormModalProps {
  open: boolean;
  onClose: () => void;
  family: Family | null;
  onSuccess: () => void;
}

const FamilyFormModal = ({
  open,
  onClose,
  family,
  onSuccess,
}: FamilyFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    familyName: "",
    headBeneficiaryId: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    region: "",
    subcity: "",
    woreda: "",
    kebele: "",
    houseNumber: "",
    addressDetails: "",
    gpsCoordinates: "",
    urgencyLevel: "medium",
    verificationStatus: "pending",
    incomeLevel: "",
    housingStatus: "",
    notes: "",
    registrationCompleted: true,
  });

  // Populate form when editing
  useEffect(() => {
    if (family) {
      setFormData({
        familyName: family.familyName,
        headBeneficiaryId: family.headBeneficiaryId || "",
        primaryPhone: family.primaryPhone || "",
        secondaryPhone: family.secondaryPhone || "",
        email: family.email || "",
        region: family.region || "",
        subcity: family.subcity || "",
        woreda: family.woreda || "",
        kebele: family.kebele || "",
        houseNumber: family.houseNumber || "",
        addressDetails: family.addressDetails || "",
        gpsCoordinates: family.gpsCoordinates || "",
        urgencyLevel: family.urgencyLevel || "medium",
        verificationStatus: family.verificationStatus,
        incomeLevel: family.incomeLevel || "",
        housingStatus: family.housingStatus || "",
        notes: family.notes || "",
        registrationCompleted: true,
      });
    } else {
      // Reset form
      setFormData({
        familyName: "",
        headBeneficiaryId: "",
        primaryPhone: "",
        secondaryPhone: "",
        email: "",
        region: "",
        subcity: "",
        woreda: "",
        kebele: "",
        houseNumber: "",
        addressDetails: "",
        gpsCoordinates: "",
        urgencyLevel: "medium",
        verificationStatus: "pending",
        incomeLevel: "",
        housingStatus: "",
        notes: "",
        registrationCompleted: true,
      });
    }
  }, [family, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (family) {
        await familyApi.update(family.id, formData);
        toast({
          title: "Success",
          description: "Family updated successfully",
        });
      } else {
        await familyApi.create(formData);
        toast({
          title: "Success",
          description: "Family registered successfully",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save family",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {family ? "Edit Family" : "Register New Family"}
          </DialogTitle>
          <DialogDescription>
            {family
              ? "Update family information below"
              : "Complete family registration with all details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name *</Label>
                <Input
                  id="familyName"
                  value={formData.familyName}
                  onChange={(e) =>
                    setFormData({ ...formData, familyName: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headBeneficiaryId">Head Beneficiary ID (Optional)</Label>
                <Input
                  id="headBeneficiaryId"
                  value={formData.headBeneficiaryId}
                  onChange={(e) =>
                    setFormData({ ...formData, headBeneficiaryId: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input
                  id="primaryPhone"
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryPhone: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                <Input
                  id="secondaryPhone"
                  type="tel"
                  value={formData.secondaryPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, secondaryPhone: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Address Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcity">Subcity</Label>
                <Input
                  id="subcity"
                  value={formData.subcity}
                  onChange={(e) =>
                    setFormData({ ...formData, subcity: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="woreda">Woreda</Label>
                <Input
                  id="woreda"
                  value={formData.woreda}
                  onChange={(e) =>
                    setFormData({ ...formData, woreda: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kebele">Kebele</Label>
                <Input
                  id="kebele"
                  value={formData.kebele}
                  onChange={(e) =>
                    setFormData({ ...formData, kebele: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseNumber">House Number</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, houseNumber: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressDetails">Address Details</Label>
              <Textarea
                id="addressDetails"
                value={formData.addressDetails}
                onChange={(e) =>
                  setFormData({ ...formData, addressDetails: e.target.value })
                }
                placeholder="Additional address details, landmarks, directions..."
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
              <Input
                id="gpsCoordinates"
                value={formData.gpsCoordinates}
                onChange={(e) =>
                  setFormData({ ...formData, gpsCoordinates: e.target.value })
                }
                placeholder="e.g., 9.0320,38.7469"
                disabled={loading}
              />
            </div>
          </div>

          {/* Family Status */}
          <div className="space-y-4">
            <h3 className="font-semibold">Family Status</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, urgencyLevel: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomeLevel">Income Level</Label>
                <Select
                  value={formData.incomeLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, incomeLevel: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Income</SelectItem>
                    <SelectItem value="very_low">Very Low</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="housingStatus">Housing Status</Label>
                <Select
                  value={formData.housingStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, housingStatus: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or comments about the family"
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
                  Saving...
                </>
              ) : family ? (
                "Update Family"
              ) : (
                "Register Family"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyFormModal;
