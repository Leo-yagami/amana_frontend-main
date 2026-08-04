import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const phoneRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    familyName: "",
    phoneNumber: "",
    // region: "",
    briefReason: "",
    addFirstMember: false,
  });

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
        title: t("quickRegistration.successTitle"),
        description: t("quickRegistration.successDesc"),
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
        title: t("common.error"),
        description: error.response?.data?.message || t("quickRegistration.errorDesc"),
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
            {t("quickRegistration.title")}
          </DialogTitle>
          <DialogDescription>
            {t("quickRegistration.description")}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-sm">
            ⚡ {t("quickRegistration.alert")}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">
              {t("quickRegistration.familyName")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="familyName"
              value={formData.familyName}
              onChange={(e) =>
                setFormData({ ...formData, familyName: e.target.value })
              }
              placeholder={t("quickRegistration.familyNamePlaceholder")}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              {t("quickRegistration.phoneNumber")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              ref={phoneRef}
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                const input = e.target;
                const cursorPos = input.selectionStart ?? 0;
                const rawBefore = (input.value.slice(0, cursorPos).match(/[\d+]/g) || []).length;
                const formatted = formatPhoneNumber(input.value);
                setFormData({ ...formData, phoneNumber: formatted });
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
              placeholder={t("quickRegistration.phonePlaceholder")}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="briefReason">{t("quickRegistration.briefReason")}</Label>
            <Textarea
              id="briefReason"
              value={formData.briefReason}
              onChange={(e) =>
                setFormData({ ...formData, briefReason: e.target.value })
              }
              placeholder={t("quickRegistration.briefReasonPlaceholder")}
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
              {t("quickRegistration.addFirstMember")}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t("quickRegistration.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("quickRegistration.registering")}
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  {t("quickRegistration.quickRegister")}
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
