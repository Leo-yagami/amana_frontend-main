import { useState, useEffect, useRef } from "react";
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
import ImageUpload from "@/components/ImageUpload";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const NS = "dashboard.donorForm";

const DonorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    donorType: "Individual",
    establishmentDate: "",
    primaryAid: "" as
      | ""
      | "emergency_relief"
      | "child_welfare"
      | "medical_aid"
      | "food_distribution"
      | "education_fund"
      | "wash_programs"
      | "other",
    logo: "",
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
  const phoneRef = useRef<HTMLInputElement>(null);
  const initialDataRef = useRef<typeof formData | null>(null);

  const isEditMode = !!id;

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
      const loaded = {
        name: donorData.name || "",
        email: donorData.email || "",
        phone: formatPhoneNumber(donorData.phone || ""),
        donorType: donorData.donorType || "Individual",
        establishmentDate: donorData.establishmentDate
          ? new Date(donorData.establishmentDate).toISOString().slice(0, 10)
          : "",
        primaryAid: (donorData.primaryAid || "") as typeof formData.primaryAid,
        logo: donorData.avatar || "",
        // address: donorData.address || "",
        // country: donorData.country || "",
        // city: donorData.city || "",
        notes: donorData.notes || "",
      };
      setFormData(loaded);
      initialDataRef.current = loaded;
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
      newErrors.name = t(`${NS}.nameRequired`);
      valid = false;
    }
  
    // Email format (optional, but must be valid if filled)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t(`${NS}.emailInvalid`);
        valid = false;
      }
    }
  
    // Ethiopian phone validation (optional, but must match if filled)
    if (formData.phone.trim()) {
      const phoneRegex = /^(?:\+251[79]\d{8}|0[79]\d{8})$/;
      const cleanPhone = formData.phone.replace(/\s+/g, '');

      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = t(`${NS}.phoneInvalid`);
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

    const payload: Record<string, unknown> = {
      ...formData,
      phone: formData.phone.replace(/\s+/g, ""),
    };
    // Only send establishment/aid/logo for org/embassy donors; clear otherwise.
    if (formData.donorType !== "Organization" && formData.donorType !== "Embassy") {
      delete payload.establishmentDate;
      delete payload.primaryAid;
      delete payload.avatar;
    } else {
      payload.avatar = formData.logo;
    }

    try {
      if (isEditMode && id) {
        await donorApi.update(id, payload);
        toast({
          title: t(`${NS}.toastUpdateTitle`),
          description: t(`${NS}.toastUpdateDesc`),
        });
      } else {
        await donorApi.create(payload);
        toast({
          title: t(`${NS}.toastCreateTitle`),
          description: t(`${NS}.toastCreateDesc`),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/dashboard/donors");
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || "";
      const newErrors = { ...errors };
      if (serverMsg.toLowerCase().includes("email")) {
        newErrors.email = serverMsg;
      }
      if (serverMsg.toLowerCase().includes("phone")) {
        newErrors.phone = serverMsg;
      }
      setErrors(newErrors);
      if (!newErrors.email && !newErrors.phone) {
        toast({
          title: t(`${NS}.toastErrorTitle`),
          description: serverMsg || t(`${NS}.toastErrorDesc`),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = !isEditMode || !initialDataRef.current ? true : (
    formData.name !== initialDataRef.current.name ||
    formData.email !== initialDataRef.current.email ||
    formData.phone !== initialDataRef.current.phone ||
    formData.donorType !== initialDataRef.current.donorType ||
    formData.establishmentDate !== initialDataRef.current.establishmentDate ||
    formData.primaryAid !== initialDataRef.current.primaryAid ||
    formData.logo !== initialDataRef.current.logo ||
    formData.notes !== initialDataRef.current.notes
  );

  const isOrgOrEmbassy =
    formData.donorType === "Organization" || formData.donorType === "Embassy";

  if (isLoadingDonor) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="md:container mx-auto py-6 space-y-6">
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
            {isEditMode ? t(`${NS}.editTitle`) : t(`${NS}.addTitle`)}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? t(`${NS}.editSubtitle`) : t(`${NS}.addSubtitle`)}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-4xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t(`${NS}.basicInfo`)}</CardTitle>
              <CardDescription>
                {t(`${NS}.basicInfoDesc`)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <Label htmlFor="name">
                    {t(`${NS}.donorName`)} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    className="text-sm sm:text-base"
                    value={formData.name}
                    onChange={(e) =>{
                      setFormData({ ...formData, name: e.target.value })
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder={t(`${NS}.donorNamePh`)}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Donor Type */}
                <div>
                  <Label htmlFor="donorType">{t(`${NS}.donorType`)}</Label>
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
                      <SelectItem value="Individual">{t(`${NS}.typeIndividual`)}</SelectItem>
                      <SelectItem value="Corporate">{t(`${NS}.typeCorporate`)}</SelectItem>
                      <SelectItem value="Foundation">{t(`${NS}.typeFoundation`)}</SelectItem>
                      <SelectItem value="Organization">{t(`${NS}.typeOrganization`)}</SelectItem>
                      <SelectItem value="Embassy">{t(`${NS}.typeEmbassy`)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization / Embassy only — establishment date + primary aid */}
                {isOrgOrEmbassy && (
                  <>
                    {/* Establishment date */}
                    <div>
                      <Label htmlFor="establishmentDate">
                        {t(`${NS}.establishmentDate`)}
                      </Label>
                      <Input
                        id="establishmentDate"
                        type="date"
                        className="text-sm sm:text-base"
                        value={formData.establishmentDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            establishmentDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Primary kind of aid */}
                    <div>
                      <Label htmlFor="primaryAid">
                        {t(`${NS}.primaryAid`)}
                      </Label>
                      <Select
                        value={formData.primaryAid}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            primaryAid: value as typeof formData.primaryAid,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(`${NS}.primaryAidPh`)}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency_relief">
                            {t(`${NS}.aidEmergencyRelief`)}
                          </SelectItem>
                          <SelectItem value="child_welfare">
                            {t(`${NS}.aidChildWelfare`)}
                          </SelectItem>
                          <SelectItem value="medical_aid">
                            {t(`${NS}.aidMedical`)}
                          </SelectItem>
                          <SelectItem value="food_distribution">
                            {t(`${NS}.aidFoodDistribution`)}
                          </SelectItem>
                          <SelectItem value="education_fund">
                            {t(`${NS}.aidEducation`)}
                          </SelectItem>
                          <SelectItem value="wash_programs">
                            {t(`${NS}.aidWash`)}
                          </SelectItem>
                          <SelectItem value="other">
                            {t(`${NS}.aidOther`)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Logo */}
                    <div className="col-span-1 md:col-span-2">
                      <ImageUpload
                        label={t(`${NS}.logo`)}
                        value={formData.logo}
                        onChange={(url) =>
                          setFormData({ ...formData, logo: url })
                        }
                        disabled={loading}
                        uploadPath="/upload/donor-logo"
                        fieldName="logo"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t(`${NS}.contactInfo`)}</CardTitle>
              <CardDescription>
                {t(`${NS}.contactInfoDesc`)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email">{t(`${NS}.email`)}</Label>
                  <Input
                    id="email"
                    className="text-sm sm:text-base"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>{
                      setFormData({ ...formData, email: e.target.value })
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder={t(`${NS}.emailPh`)}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">{t(`${NS}.phone`)}</Label>
                  <Input
                    id="phone"
                    ref={phoneRef}
                    className="text-sm sm:text-base"
                    value={formData.phone}
                    onChange={(e) =>{
                      const input = e.target;
                      const cursorPos = input.selectionStart ?? 0;
                      const rawBefore = (input.value.slice(0, cursorPos).match(/[\d+]/g) || []).length;
                      const formatted = formatPhoneNumber(input.value);
                      setFormData({ ...formData, phone: formatted })
                      setErrors({ ...errors, phone: "" });
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
                    placeholder={t(`${NS}.phonePh`)}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          {false && (<Card>
            <CardHeader>
              <CardTitle>{t(`${NS}.locationInfo`)}</CardTitle>
              <CardDescription>
                {t(`${NS}.locationInfoDesc`)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <div>
                  <Label htmlFor="country">{t(`${NS}.country`)}</Label>
                  <Input
                    id="country"
                    className="text-sm sm:text-base"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder={t(`${NS}.countryPh`)}
                  />
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city">{t(`${NS}.city`)}</Label>
                  <Input
                    id="city"
                    className="text-sm sm:text-base"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder={t(`${NS}.cityPh`)}
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <Label htmlFor="address">{t(`${NS}.address`)}</Label>
                  <Textarea
                    id="address"
                    className="text-sm sm:text-base"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder={t(`${NS}.addressPh`)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>)}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t(`${NS}.additionalInfo`)}</CardTitle>
              <CardDescription>
                {t(`${NS}.additionalInfoDesc`)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">{t(`${NS}.notes`)}</Label>
                <Textarea
                  id="notes"
                  className="text-sm sm:text-base"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={t(`${NS}.notesPh`)}
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
              {t(`${NS}.cancel`)}
            </Button>
            <Button type="submit" disabled={loading || !hasChanges}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? t(`${NS}.updateDonor`) : t(`${NS}.createDonor`)}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DonorForm;
