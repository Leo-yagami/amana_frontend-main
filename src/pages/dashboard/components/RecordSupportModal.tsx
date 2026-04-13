import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
import { Donor } from "@/types/api";

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
        deliveredBy: formData.deliveredBy || undefined,
        donorId: formData.donorId || undefined,
        volunteerId: formData.volunteerId || undefined,
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
        title: "Success",
        description: "Support recorded successfully",
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
        title: "Error",
        description: error.response?.data?.message || "Failed to record support",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Record Support
          </DialogTitle>
          <DialogDescription>
            Record support provided to {targetName}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-sm">
            Document all support provided including financial assistance, items, services, 
            or other forms of aid.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Support Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportType">
                Support Type <span className="text-red-500">*</span>
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
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Assistance</SelectItem>
                  <SelectItem value="food">Food Supply</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="education">Educational Support</SelectItem>
                  <SelectItem value="medical">Medical Assistance</SelectItem>
                  <SelectItem value="housing">Housing Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportDate">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supportDate"
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
            <h3 className="font-semibold text-sm">Financial Support (Optional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amountValue">Amount</Label>
                <Input
                  id="amountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, amountValue: e.target.value })
                  }
                  placeholder="e.g., 500.00"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
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
            <h3 className="font-semibold text-sm">Items Provided (Optional)</h3>
            
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
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  placeholder="e.g., Rice, Oil"
                  disabled={loading}
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="itemQuantity">Quantity</Label>
                <Input
                  id="itemQuantity"
                  type="number"
                  step="0.1"
                  min="0"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, quantity: e.target.value })
                  }
                  placeholder="5"
                  disabled={loading}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="itemUnit">Unit</Label>
                <Input
                  id="itemUnit"
                  value={currentItem.unit}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, unit: e.target.value })
                  }
                  placeholder="kg, lt"
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
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Delivery & Attribution (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorId">Donor</Label>
                <Select
                  value={formData.donorId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, donorId: value })
                  }
                  disabled={loading || loadingDonors}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select donor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {donors.map((donor) => (
                      <SelectItem key={donor.id} value={donor.id}>
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
                    Clear selection
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteerId">Volunteer/Staff</Label>
                <Input
                  id="volunteerId"
                  value={formData.volunteerId}
                  onChange={(e) =>
                    setFormData({ ...formData, volunteerId: e.target.value })
                  }
                  placeholder="Volunteer ID (optional)"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveredBy">Delivered By</Label>
              <Input
                id="deliveredBy"
                value={formData.deliveredBy}
                onChange={(e) =>
                  setFormData({ ...formData, deliveredBy: e.target.value })
                }
                placeholder="Name of person/organization"
                disabled={loading}
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the support"
                rows={2}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information"
                rows={2}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Record Support
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
