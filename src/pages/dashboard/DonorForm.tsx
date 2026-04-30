import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { donorApi } from "@/services/api.service";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const DonorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    donorType: "Individual",
    // address: "",
    // country: "",
    // city: "",
    notes: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const isEditMode = !!id;

  // Fetch donor data if editing
  const { data: donorData, isLoading: isLoadingDonor } = useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await donorApi.getById(id);
      return response.data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (donorData) {
      setFormData({
        name: donorData.name || "",
        email: donorData.email || "",
        phone: donorData.phone || "",
        donorType: donorData.donorType || "Individual",
        // address: donorData.address || "",
        // country: donorData.country || "",
        // city: donorData.city || "",
        notes: donorData.notes || "",
      });
    }
  }, [donorData]);

  const validateForm = () => {
    let valid = true;
  
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };
  
    // Name required
    if (!formData.name.trim()) {
      newErrors.name = "Donor name is required";
      valid = false;
    }
  
    // Email format (optional, but must be valid if filled)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
        valid = false;
      }
    }
  
    // Ethiopian phone validation (optional, but must match if filled)
    if (formData.phone.trim()) {
      const phoneRegex = /^(?:\+251[79]\d{8}|0[79]\d{8})$/;
  
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone =
          "Phone must be: +2519XXXXXXXX, +2517XXXXXXXX, 09XXXXXXXX, or 07XXXXXXXX";
        valid = false;
      }
    }
  
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) return;
  

    setLoading(true);
    try {
      if (isEditMode && id) {
        await donorApi.update(id, formData);
        toast({
          title: "Success",
          description: "Donor updated successfully",
        });
      } else {
        await donorApi.create(formData);
        toast({
          title: "Success",
          description: "Donor created successfully",
        });
      }
      navigate("/dashboard/donors");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save donor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingDonor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/donors")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Donor" : "Add New Donor"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update donor information" : "Enter donor details to create a new record"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-4xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Primary details about the donor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <Label htmlFor="name">
                    Donor Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>{
                      setFormData({ ...formData, name: e.target.value })
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder="Enter donor name"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}

                {/* Donor Type */}
                <div>
                  <Label htmlFor="donorType">Donor Type</Label>
                  <Select
                    value={formData.donorType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, donorType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How to reach the donor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>{
                      setFormData({ ...formData, email: e.target.value })
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>{
                      setFormData({ ...formData, phone: e.target.value })
                      setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="+1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          {false && (<Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>
                Donor's address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Country"
                  />
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Full address"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>)}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Extra notes about the donor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes about the donor"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/donors")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? "Update Donor" : "Create Donor"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DonorForm;
