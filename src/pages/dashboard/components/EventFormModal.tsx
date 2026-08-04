// --- ORIGINAL (preserved below) ---

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { eventApi } from "@/services/api.service";
import { Event } from "@/types/api";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  event?: Event | null;
}

const NS = "dashboard.eventForm";

const EventFormModal = ({ open, onClose, event }: EventFormModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditMode = !!event;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "other" as const,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    eventDate: undefined as Date | undefined,
    location: "",
    targetAmount: "",
    status: "draft" as const,
    organizedBy: "",
    imageUrls: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "other",
        startDate: event.startDate ? new Date(event.startDate) : undefined,
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        eventDate: event.eventDate ? new Date(event.eventDate) : undefined,
        location: event.location || "",
        targetAmount: event.targetAmount ? String(event.targetAmount) : "",
        status: event.status || "draft",
        organizedBy: event.organizedBy || "",
        imageUrls: event.imageUrls || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        eventType: "other",
        startDate: undefined,
        endDate: undefined,
        eventDate: undefined,
        location: "",
        targetAmount: "",
        status: "draft",
        organizedBy: "",
        imageUrls: "",
      });
    }
    setErrors({});
  }, [event, open]);

  const createMutation = useMutation({
    mutationFn: (data: any) => eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(t(`${NS}.createSuccess`, "Event created successfully!"));
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t(`${NS}.createErr`, "Failed to create event"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => eventApi.update(event!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event!._id] });
      toast.success(t(`${NS}.updateSuccess`, "Event updated successfully!"));
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t(`${NS}.updateErr`, "Failed to update event"));
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t(`${NS}.err.titleRequired`, "Event title is required");
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = t(`${NS}.err.endDate`, "End date must be after start date");
    }

    if (formData.targetAmount && isNaN(Number(formData.targetAmount))) {
      newErrors.targetAmount = t(`${NS}.err.amountValid`, "Target amount must be a valid number");
    }

    if (formData.targetAmount && Number(formData.targetAmount) < 0) {
      newErrors.targetAmount = t(`${NS}.err.amountNegative`, "Target amount cannot be negative");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t(`${NS}.err.fixErrors`, "Please fix the errors in the form"));
      return;
    }

    const submitData: any = {
      title: formData.title,
      description: formData.description || undefined,
      eventType: formData.eventType,
      startDate: formData.startDate ? formData.startDate.toISOString() : undefined,
      endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
      eventDate: formData.eventDate ? formData.eventDate.toISOString() : undefined,
      location: formData.location || undefined,
      targetAmount: formData.targetAmount ? Number(formData.targetAmount) : undefined,
      status: formData.status,
      organizedBy: formData.organizedBy || undefined,
      imageUrls: formData.imageUrls || undefined,
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      {/* old: scroll broke with lenis — added data-lenis-prevent */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? t(`${NS}.editTitle`, "Edit Event") : t(`${NS}.createTitle`, "Create New Event")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">
              {t(`${NS}.eventTitle`, "Event Title")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t(`${NS}.eventTitlePh`, "e.g., Annual Fundraising Gala")}
              className={errors.title ? "border-destructive " : "text-sm sm:text-base"}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t(`${NS}.description`, "Description")}</Label>
            <Textarea
              id="description"
              className="text-sm sm:text-base"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t(`${NS}.descriptionPh`, "Describe the event purpose and activities...")}
              rows={4}
            />
          </div>

          {/* Event Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventType">{t(`${NS}.eventType`, "Event Type")}</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value: any) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger id="eventType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundraising">{t(`${NS}.type.fundraising`, "Fundraising")}</SelectItem>
                  <SelectItem value="distribution">{t(`${NS}.type.distribution`, "Distribution")}</SelectItem>
                  <SelectItem value="awareness">{t(`${NS}.type.awareness`, "Awareness")}</SelectItem>
                  <SelectItem value="food_package">{t(`${NS}.type.food_package`, "Food Package")}</SelectItem>
                  <SelectItem value="medical_aid">{t(`${NS}.type.medical_aid`, "Medical Aid")}</SelectItem>
                  <SelectItem value="job_opportunity">{t(`${NS}.type.job_opportunity`, "Job Opportunity")}</SelectItem>
                  <SelectItem value="other">{t(`${NS}.type.other`, "Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">{t(`${NS}.status`, "Status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t(`${NS}.statusVal.draft`, "Draft")}</SelectItem>
                  <SelectItem value="upcoming">{t(`${NS}.statusVal.upcoming`, "Upcoming")}</SelectItem>
                  <SelectItem value="ongoing">{t(`${NS}.statusVal.ongoing`, "Ongoing")}</SelectItem>
                  <SelectItem value="completed">{t(`${NS}.statusVal.completed`, "Completed")}</SelectItem>
                  <SelectItem value="cancelled">{t(`${NS}.statusVal.cancelled`, "Cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t(`${NS}.eventDate`, "Event Date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.eventDate ? format(formData.eventDate, "PPP") : t(`${NS}.pickDate`, "Pick a date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.eventDate}
                    onSelect={(date) => setFormData({ ...formData, eventDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t(`${NS}.startDate`, "Start Date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : t(`${NS}.pickDate`, "Pick a date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t(`${NS}.endDate`, "End Date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : t(`${NS}.pickDate`, "Pick a date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">{t(`${NS}.location`, "Location")}</Label>
            <Input
              id="location"
              className="text-sm sm:text-base"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t(`${NS}.locationPh`, "e.g., Community Center, Downtown")}
            />
          </div>

          {/* Target Amount */}
          <div>
            <Label htmlFor="targetAmount">{t(`${NS}.targetAmount`, "Target Amount (ETB)")}</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="0.00"
              className={errors.targetAmount ? "border-destructive" : "text-sm sm:text-base"}
            />
            {errors.targetAmount && <p className="text-sm text-destructive mt-1">{errors.targetAmount}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {t(`${NS}.codeHint`, "Event code will be auto-generated (e.g., EVT-202601-0001)")}
            </p>
          </div>

          {/* Organized By */}
          <div>
            <Label htmlFor="organizedBy">{t(`${NS}.organizedBy`, "Organized By")}</Label>
            <Input
              id="organizedBy"
              className="text-sm sm:text-base"
              value={formData.organizedBy}
              onChange={(e) => setFormData({ ...formData, organizedBy: e.target.value })}
              placeholder={t(`${NS}.organizedByPh`, "Organization or person name")}
            />
          </div>

          {/* Event Photo */}
          <ImageUpload
            label={t(`${NS}.photo`, "Event Photo")}
            value={formData.imageUrls}
            onChange={(url) => setFormData({ ...formData, imageUrls: url })}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t(`${NS}.cancel`, "Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? t(`${NS}.update`, "Update Event") : t(`${NS}.create`, "Create Event")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormModal;
