import { useState, useEffect } from "react";
import { X, Search, Heart, Loader2 } from "lucide-react";
import { supportHistoryApi, donorApi, familyApi } from "@/services/api.service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Donor, Family } from "@/types/api";

interface RecordEventSupportModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  onSuccess: () => void;
}

const RecordEventSupportModal = ({
  open,
  onClose,
  eventId,
  eventName,
  onSuccess,
}: RecordEventSupportModalProps) => {
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [familySearch, setFamilySearch] = useState("");
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    supportType: "",
    supportDate: new Date().toISOString().split("T")[0],
    totalAmount: "",
    distributeEqually: true,
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
      fetchFamilies();
    }
  }, [open]);

  const fetchDonors = async () => {
    setLoadingDonors(true);
    try {
      const response = await donorApi.getAll({ page: 1, limit: 100 });
      console.log("RESPOOOOOOONSE", response)
      setDonors(response.data);
    } catch (error) {
      console.error("Failed to fetch donors", error);
      toast.error("Failed to load donors");
    } finally {
      setLoadingDonors(false);
    }
  };

  const fetchFamilies = async () => {
    setLoadingFamilies(true);
    try {
      const response = await familyApi.getAll({ page: 1, limit: 100 });
      console.log("RESPOOOOOOOOOOOOOOOOOOOOOOOONS",response)
      setFamilies(response.data);
    } catch (error) {
      console.error("Failed to fetch families", error);
      toast.error("Failed to load families");
    } finally {
      setLoadingFamilies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFamilyIds.length === 0) {
      toast.error("Please select at least one family");
      return;
    }

    setLoading(true);

    try {
      const supportData: any = {
        eventId,
        familyIds: selectedFamilyIds,
        supportType: formData.supportType,
        supportDate: new Date(formData.supportDate).toISOString(),
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
        distributeEqually: formData.distributeEqually,
        currency: formData.currency || undefined,
        itemsProvided: items.length > 0 ? items : undefined,
        deliveredBy: formData.deliveredBy || undefined,
        donorId: formData.donorId || undefined,
        volunteerId: formData.volunteerId || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      };

      //logging purposes
      console.log("FINAL PAYLOAD:", supportData);
      console.log("selectedFamilyIds:", selectedFamilyIds);

      const response = await supportHistoryApi.createBulk(supportData);

      toast.success(response.data.message || `Support recorded for ${selectedFamilyIds.length} families`);

      // Reset form
      setFormData({
        supportType: "",
        supportDate: new Date().toISOString().split("T")[0],
        totalAmount: "",
        distributeEqually: true,
        currency: "ETB",
        deliveredBy: "",
        donorId: "",
        volunteerId: "",
        description: "",
        notes: "",
      });
      setItems([]);
      setCurrentItem({name: "", quantity: "", unit: ""});
      setSelectedFamilyIds([]);

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to record support");
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

  const toggleFamilySelection = (familyId: string) => {
    setSelectedFamilyIds((prev) =>
      prev.includes(familyId)
        ? prev.filter((id) => id !== familyId)
        : [...prev, familyId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFamilyIds.length === filteredFamilies.length) {
      setSelectedFamilyIds([]);
    } else {
      setSelectedFamilyIds(filteredFamilies.map((f) => f._id));
    }
  };

  const filteredFamilies = families.filter((family) => {
    if (!familySearch) return true;
    const search = familySearch.toLowerCase();
    return (
      family.familyCode?.toLowerCase().includes(search) ||
      family.familyName?.toLowerCase().includes(search) ||
      family.region?.toLowerCase().includes(search)
    );
  });

  const amountPerFamily = formData.totalAmount && selectedFamilyIds.length > 0
    ? formData.distributeEqually
      ? (parseFloat(formData.totalAmount) / selectedFamilyIds.length).toFixed(2)
      : formData.totalAmount
    : "0";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Support for Event</DialogTitle>
          <DialogDescription>
            Record support provided during "{eventName}" to multiple families
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportType">
                Support Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.supportType}
                onValueChange={(value) =>
                  setFormData({ ...formData, supportType: value })
                }
                disabled={loading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food Distribution</SelectItem>
                  <SelectItem value="medical">Medical Aid</SelectItem>
                  <SelectItem value="education">Education Support</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="shelter">Shelter/Housing</SelectItem>
                  <SelectItem value="financial">Financial Aid</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportDate">
                Date <span className="text-destructive">*</span>
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

          {/* Family Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Select Families <span className="text-destructive">*</span>
              </Label>
              <Badge variant="secondary">
                {selectedFamilyIds.length} selected
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search families by code, or name..."
                value={familySearch}
                onChange={(e) => setFamilySearch(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center space-x-2 border-b pb-2">
              <Checkbox
                id="select-all"
                checked={selectedFamilyIds.length === filteredFamilies.length && filteredFamilies.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Select All ({filteredFamilies.length} families)
              </label>
            </div>

            {/* Family List */}
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {loadingFamilies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFamilies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No families found
                </div>
              ) : (
                <div className="space-y-2">
                  {true && (filteredFamilies.map((family) => (
                    <div
                      key={family.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={(e) => {
                        // Only toggle if clicking on the div itself, not the checkbox
                        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.flex-1')) {
                          toggleFamilySelection(family._id);
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedFamilyIds.includes(family._id)}
                        onCheckedChange={() => toggleFamilySelection(family._id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {family.familyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {family.familyCode} • {family.region || "Unknown region"}
                        </p>
                      </div>
                      {family.urgencyLevel && (
                        <Badge variant="outline" className="text-xs">
                          {family.urgencyLevel}
                        </Badge>
                      )}
                    </div>
                  )))}
                  {/*replacement for filtered families selection*/}
                  {false && (filteredFamilies.map((family) => (
                    <div
                      key={family.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => toggleFamilySelection(family._id)}
                    >
                      <Checkbox
                        checked={selectedFamilyIds.includes(family._id)}
                        onCheckedChange={() => toggleFamilySelection(family._id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1">
                        <p className="font-medium text-sm">{family.familyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {family.familyCode} • {family.region || "Unknown region"}
                        </p>
                      </div>

                      {family.urgencyLevel && (
                        <Badge variant="outline" className="text-xs">
                          {family.urgencyLevel}
                        </Badge>
                      )}
                    </div>
                    )))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Financial Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Financial Support (Optional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  className="text-sm sm:text-base"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  placeholder="e.g., 10000.00"
                  disabled={loading}
                />
                {formData.totalAmount && selectedFamilyIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.distributeEqually ? "≈ " : ""}ETB {amountPerFamily} per family
                  </p>
                )}
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="distributeEqually"
                checked={formData.distributeEqually}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, distributeEqually: checked as boolean })
                }
              />
              <label
                htmlFor="distributeEqually"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Distribute amount equally among families
              </label>
            </div>
          </div>

          {/* Items Provided */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Items Provided (Optional)</h3>
            
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

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 sm:col-span-5 space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  className="text-sm sm:text-base"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  placeholder="e.g., Rice"
                  disabled={loading}
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  className="text-sm sm:text-base"
                  type="number"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, quantity: e.target.value })
                  }
                  placeholder="10"
                  disabled={loading}
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  className="text-sm sm:text-base"
                  value={currentItem.unit}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, unit: e.target.value })
                  }
                  placeholder="kg"
                  disabled={loading}
                />
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addItem}
                  disabled={loading || !currentItem.name || !currentItem.quantity || !currentItem.unit}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Delivery Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorId">Donor (Optional)</Label>
                <Select
                  value={formData.donorId}
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
                      <SelectItem key={donor.id} value={donor._id}>
                        {donor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveredBy">Delivered By</Label>
                <Input
                  id="deliveredBy"
                  className="text-xs sm:text-base"
                  value={formData.deliveredBy}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveredBy: e.target.value })
                  }
                  placeholder="Name of person/organization"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="text-sm sm:text-base"
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
                className="text-sm sm:text-base"
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
            <Button className="mb-3 sm:mb-0" type="submit" disabled={loading || selectedFamilyIds.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Record Support ({selectedFamilyIds.length} families)
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordEventSupportModal;
