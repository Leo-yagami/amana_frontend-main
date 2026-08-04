import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { supportHistoryApi, donorApi } from "@/services/api.service";
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
import { Loader2, Heart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Donor } from "@/types/api";

const NS = "dashboard.recordSupport";

interface RecordSupportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: "family" | "beneficiary" | "event";
  targetId: string;
  targetName: string;
  onSuccess: () => void;
}

const RecordSupportModal = ({
  open,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}: RecordSupportModalProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    supportType: "",
    supportDate: new Date().toISOString().split("T")[0],
    amountValue: "",
    currency: "ETB",
    deliveredBy: "",
    donorId: "",
    volunteerId: "",
    description: "",
    notes: "",
  });

  const [items, setItems] = useState<Array<{name: string; quantity: string; unit: string}>>([]);
  const [currentItem, setCurrentItem] = useState({name: "", quantity: "", unit: ""});

  useEffect(() => {
    if (open) {
      fetchDonors();
    }
  }, [open]);

  const fetchDonors = async () => {
    setLoadingDonors(true);
    try {
      const response = await donorApi.getAll({ limit: 100 });
      console.log(response)
      setDonors(response.data.data);
    } catch (error) {
      console.error("Failed to fetch donors", error);
    } finally {
      setLoadingDonors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supportData: any = {
        supportType: formData.supportType,
        supportDate: new Date(formData.supportDate).toISOString(), // Convert to ISO-8601 DateTime
        targetType: targetType, // Required field in schema
        amountValue: formData.amountValue ? parseFloat(formData.amountValue) : undefined,
        currency: formData.currency || undefined,
        itemsProvided: items.length > 0 ? items : undefined,
        // deliveredBy: formData.deliveredBy || undefined,
        // donorId: formData.donorId || undefined,
        // volunteerId: formData.volunteerId || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      };

      // Add target based on type
      if (targetType === "family") {
        supportData.familyId = targetId;
      } else if (targetType === "beneficiary") {
        supportData.beneficiaryId = targetId;
      } else if (targetType === "event") {
        supportData.eventId = targetId;
      }

      await supportHistoryApi.create(supportData);
      
      toast({
        title: t(`${NS}.toastSuccessTitle`),
        description: t(`${NS}.toastSuccessDesc`),
      });

      // Reset form
      setFormData({
        supportType: "",
        supportDate: new Date().toISOString().split("T")[0],
        amountValue: "",
        currency: "ETB",
        deliveredBy: "",
        donorId: "",
        volunteerId: "",
        description: "",
        notes: "",
      });
      setItems([]);
      setCurrentItem({name: "", quantity: "", unit: ""});

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: t(`${NS}.toastErrorTitle`),
        description: error.response?.data?.message || t(`${NS}.toastErrorDesc`),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (currentItem.name && currentItem.quantity && currentItem.unit) {
      setItems([...items, currentItem]);
      setCurrentItem({name: "", quantity: "", unit: ""});
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* old: scroll broke with lenis — added data-lenis-prevent */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t(`${NS}.title`)}
          </DialogTitle>
          <DialogDescription>
            {t(`${NS}.description`, { name: targetName })}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-sm">
            {t(`${NS}.alert`)}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Support Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportType">
                {t(`${NS}.supportType`)} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.supportType}
                onValueChange={(value) =>
                  setFormData({ ...formData, supportType: value })
                }
                required
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t(`${NS}.selectType`)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">{t(`${NS}.typeFinancial`)}</SelectItem>
                  <SelectItem value="food">{t(`${NS}.typeFood`)}</SelectItem>
                  <SelectItem value="clothing">{t(`${NS}.typeClothing`)}</SelectItem>
                  <SelectItem value="education">{t(`${NS}.typeEducation`)}</SelectItem>
                  <SelectItem value="medical">{t(`${NS}.typeMedical`)}</SelectItem>
                  <SelectItem value="housing">{t(`${NS}.typeHousing`)}</SelectItem>
                  <SelectItem value="other">{t(`${NS}.typeOther`)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportDate">
                {t(`${NS}.date`)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supportDate"
                className="text-xs sm:text-base"
                type="date"
                value={formData.supportDate}
                onChange={(e) =>
                  setFormData({ ...formData, supportDate: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Financial Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t(`${NS}.financialSupport`)}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amountValue">{t(`${NS}.amount`)}</Label>
                <Input
                  id="amountValue"
                  className="text-sm sm:text-base"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, amountValue: e.target.value })
                  }
                  placeholder={t(`${NS}.amountPh`)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t(`${NS}.currency`)}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETB">ETB (Birr)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Items Provided */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t(`${NS}.itemsProvided`)}</h3>
            
            {/* Added Items List */}
            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="flex-1">
                      {item.name}: {item.quantity} {item.unit}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Item Form */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 space-y-2">
                <Label htmlFor="itemName">{t(`${NS}.itemName`)}</Label>
                <Input
                  id="itemName"
                  className="text-sm sm:text-base"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  placeholder={t(`${NS}.itemNamePh`)}
                  disabled={loading}
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="itemQuantity">{t(`${NS}.quantity`)}</Label>
                <Input
                  id="itemQuantity"
                  className="text-sm sm:text-base"
                  type="number"
                  step="0.1"
                  min="0"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, quantity: e.target.value })
                  }
                  placeholder={t(`${NS}.quantityPh`)}
                  disabled={loading}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="itemUnit">{t(`${NS}.unit`)}</Label>
                <Input
                  id="itemUnit"
                  className="text-sm sm:text-base"
                  value={currentItem.unit}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, unit: e.target.value })
                  }
                  placeholder={t(`${NS}.unitPh`)}
                  disabled={loading}
                />
              </div>
              <div className="col-span-2 flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  disabled={loading || !currentItem.name || !currentItem.quantity || !currentItem.unit}
                  className="w-full"
                >
                  <Plus className="w-3 ml-1 sm:ml-0 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {false && (

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t(`${NS}.deliveryAttribution`)}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorId">{t(`${NS}.donor`)}</Label>
                <Select
                  value={formData.donorId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, donorId: value })
                  }
                  disabled={loading || loadingDonors}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder={t(`${NS}.selectDonor`)} />
                  </SelectTrigger>
                  <SelectContent>
                    {donors.map((donor) => (
                      <SelectItem key={donor._id} value={donor._id}>
                        {donor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.donorId && (
                  <button
                  type="button"
                  onClick={() => setFormData({ ...formData, donorId: "" })}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    {t(`${NS}.clearSelection`)}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteerId">{t(`${NS}.volunteerStaff`)}</Label>
                <Input
                  id="volunteerId"
                  className="text-sm sm:text-base"
                  value={formData.volunteerId}
                  onChange={(e) =>
                    setFormData({ ...formData, volunteerId: e.target.value })
                  }
                  placeholder={t(`${NS}.volunteerPh`)}
                  disabled={loading}
                  />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveredBy">{t(`${NS}.deliveredBy`)}</Label>
              <Input
                id="deliveredBy"
                className="text-sm sm:text-base"
                value={formData.deliveredBy}
                onChange={(e) =>
                  setFormData({ ...formData, deliveredBy: e.target.value })
                }
                placeholder={t(`${NS}.deliveredByPh`)}
                disabled={loading}
                />
            </div>
          </div>
          )}

          {/* Description & Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t(`${NS}.description`)}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t(`${NS}.descriptionPh`)}
                rows={2}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t(`${NS}.notes`)}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={t(`${NS}.notesPh`)}
                rows={2}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t(`${NS}.cancel`)}
            </Button>
            <Button
            className="mb-3"
             type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t(`${NS}.recording`)}
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  {t(`${NS}.recordSupportBtn`)}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordSupportModal;
