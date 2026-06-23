import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { familyApi } from "@/services/api.service";
import { Family, Beneficiary } from "@/types/api";
import ComprehensiveFamilyForm from "./components/ComprehensiveFamilyForm";
import ComprehensiveFamilyEditForm from "./components/ComprehensiveFamilyEditForm";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, ArrowLeft, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FamilyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEditMode = !!id;

  // If creating new family, use comprehensive form with beneficiaries
  if (!isEditMode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/families")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("familyForm.registerNew")}</h1>
              <p className="text-muted-foreground">
                Register family with all members in one comprehensive form
              </p>
            </div>
          </div>
        </div>

        <ComprehensiveFamilyForm />
      </div>
    );
  }

  // If editing family, use comprehensive edit form
  if (isEditMode && id) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/families")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("familyForm.editFamily")}</h1>
              <p className="text-muted-foreground">
                Edit family details and manage all members in one place
              </p>
            </div>
          </div>
        </div>

        <ComprehensiveFamilyEditForm familyId={id} />
      </div>
    );
  }

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [formData, setFormData] = useState({
    familyName: "",
    headBeneficiaryId: "",
    address: "",
    exactLocation: "",
    region: "",
    subRegion: "",
    description: "",
    urgencyLevel: "medium",
    monthlyIncome: "",
    monthlyRentAmount: "",
    familySize: "",
    childrenCount: "",
    notes: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchFamily();
    }
  }, [id]);

  const fetchFamily = async () => {
    if (!id) return;
    
    setFetching(true);
    try {
      const response = await familyApi.getById(id);
      const family = response.data;
      
      setFormData({
        familyName: family.familyName,
        headBeneficiaryId: family.headBeneficiaryId || "",
        address: family.address || "",
        exactLocation: family.exactLocation || "",
        region: family.region || "",
        subRegion: family.subRegion || "",
        description: family.description || "",
        urgencyLevel: family.urgencyLevel || "medium",
        monthlyIncome: family.monthlyIncome?.toString() || "",
        monthlyRentAmount: family.monthlyRentAmount?.toString() || "",
        familySize: family.familySize?.toString() || "",
        childrenCount: family.childrenCount?.toString() || "",
        notes: family.notes || "",
      });

      // Set beneficiaries if available
      if (family.beneficiaries) {
        setBeneficiaries(family.beneficiaries);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch family",
        variant: "destructive",
      });
      navigate("/dashboard/families");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && id) {
        await familyApi.update(id, formData);
        toast({
          title: "Success",
          description: "Family updated successfully",
        });
        navigate(`/dashboard/families/${id}`);
      } else {
        const response = await familyApi.create(formData);
        toast({
          title: "Success",
          description: "Family registered successfully",
        });
        navigate(`/dashboard/families/${response.data.id}`);
      }
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

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Loading family details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(isEditMode ? `/dashboard/families/${id}` : "/dashboard/families")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              {isEditMode ? t("familyForm.editFamily") : t("familyForm.registerNew")}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? t("familyForm.updateDescription") : t("familyForm.registerDescription")}
            </p>
          </div>
        </div>
      </div>

      {!isEditMode && (
        <Alert>
          <AlertDescription>
            💡 <strong>Tip:</strong> Fill in as much information as possible for better record keeping. 
            All fields marked with * are required.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="e.g., Ahmed Family"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headBeneficiaryId">Head of Family (Optional)</Label>
                {isEditMode && beneficiaries.length > 0 ? (
                  <Select
                    value={formData.headBeneficiaryId || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, headBeneficiaryId: value === "none" ? "" : value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select head beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {beneficiaries
                        .filter(b => b.beneficiaryType === 'adult')
                        .map((beneficiary) => (
                          <SelectItem key={beneficiary.id} value={beneficiary.id}>
                            {beneficiary.fullName} ({beneficiary.age || 'N/A'} yrs)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="headBeneficiaryId"
                    value={formData.headBeneficiaryId}
                    onChange={(e) =>
                      setFormData({ ...formData, headBeneficiaryId: e.target.value })
                    }
                    placeholder="Add beneficiaries first, then select head"
                    disabled={true}
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  {isEditMode && beneficiaries.length === 0 
                    ? "Add family members first to select a head" 
                    : "Select an adult family member as the head of family"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  placeholder="e.g., Addis Ababa"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subRegion">Sub Region</Label>
                <Input
                  id="subRegion"
                  value={formData.subRegion}
                  onChange={(e) =>
                    setFormData({ ...formData, subRegion: e.target.value })
                  }
                  placeholder="e.g., Kirkos"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street address, house number, etc."
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exactLocation">Exact Location (GPS/Landmarks)</Label>
              <Textarea
                id="exactLocation"
                value={formData.exactLocation}
                onChange={(e) =>
                  setFormData({ ...formData, exactLocation: e.target.value })
                }
                placeholder="GPS coordinates, nearby landmarks, etc."
                rows={2}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Family Details */}
        <Card>
          <CardHeader>
            <CardTitle>Family Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familySize">Family Size</Label>
                <Input
                  id="familySize"
                  type="number"
                  value={formData.familySize}
                  onChange={(e) =>
                    setFormData({ ...formData, familySize: e.target.value })
                  }
                  placeholder="Number of family members"
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="childrenCount">Children Count</Label>
                <Input
                  id="childrenCount"
                  type="number"
                  value={formData.childrenCount}
                  onChange={(e) =>
                    setFormData({ ...formData, childrenCount: e.target.value })
                  }
                  placeholder="Number of children"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="monthlyRentAmount">Monthly Rent (ETB)</Label>
                <Input
                  id="monthlyRentAmount"
                  type="number"
                  value={formData.monthlyRentAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyRentAmount: e.target.value })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

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
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the family's situation..."
                rows={3}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or comments about the family..."
              rows={4}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(isEditMode ? `/dashboard/families/${id}` : "/dashboard/families")}
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
                {isEditMode ? "Update Family" : "Register Family"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;
