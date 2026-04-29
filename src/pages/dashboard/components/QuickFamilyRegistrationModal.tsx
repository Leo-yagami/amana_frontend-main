import { useState } from "react";
import { familyApi } from "@/services/api.service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuickFamilyRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (familyId: string, shouldAddMember: boolean) => void;
}

const QuickFamilyRegistrationModal = ({
  open,
  onClose,
  onSuccess,
}: QuickFamilyRegistrationModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    familyName: "",
    // region: "",
    briefReason: "",
    addFirstMember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create family with minimal information
      const familyData = {
        familyName: formData.familyName,
        primaryPhone: formData.phoneNumber,
        // region: formData.region || undefined,
        notes: formData.briefReason || undefined,
        // Smart defaults
        urgencyLevel: "medium",
        registrationStatus: "incomplete",
        registrationCompleted: false, // Flag as incomplete
        registrationType: "quick",
        members: [],
      };

      const response = await familyApi.create(familyData);
      
      toast({
        title: "Success! Family registered",
        description: "Remember to complete the full registration later.",
      });

      // Call onSuccess with family ID and whether to add member
      onSuccess(response.data._id, formData.addFirstMember);
      
      // Reset form
      setFormData({
        familyName: "",
        phoneNumber: "",
        // region: "",
        briefReason: "",
        addFirstMember: false,
      });
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

  //removed code relocation
//   <div className="space-y-2">
//   <Label htmlFor="region">Region/Kebele (Optional)</Label>
//   <Input
//     id="region"
//     value={formData.region}
//     onChange={(e) =>
//       setFormData({ ...formData, region: e.target.value })
//     }
//     placeholder="e.g., Addis Ababa, Kirkos"
//     disabled={loading}
//   />
// </div>

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Family Registration
          </DialogTitle>
          <DialogDescription>
            Register a family quickly with minimal information. You can complete full details later.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-sm">
            ⚡ This is a quick registration. The family will be flagged as "Needs Completion" 
            for follow-up.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">
              Family Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="familyName"
              value={formData.familyName}
              onChange={(e) =>
                setFormData({ ...formData, familyName: e.target.value })
              }
              placeholder="e.g., Mohammed Family"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="e.g., +2519XXXXXXXX, 09XXXXXXXX"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="briefReason">Brief Reason for Assistance (Optional)</Label>
            <Textarea
              id="briefReason"
              value={formData.briefReason}
              onChange={(e) =>
                setFormData({ ...formData, briefReason: e.target.value })
              }
              placeholder="Brief description of family's situation"
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-2">
            <Checkbox
              id="addFirstMember"
              checked={formData.addFirstMember}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, addFirstMember: checked as boolean })
              }
              disabled={loading}
            />
            <Label
              htmlFor="addFirstMember"
              className="text-sm font-normal cursor-pointer"
            >
              Add first family member now
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Quick Register
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickFamilyRegistrationModal;
