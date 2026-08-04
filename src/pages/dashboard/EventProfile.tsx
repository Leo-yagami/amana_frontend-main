import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  Target,
  AlertCircle,
  Heart,
  Baby,
  Accessibility,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { eventApi, donationApi } from "@/services/api.service";
import { Event, Donation } from "@/types/api";
import EventFormModal from "./components/EventFormModal";
import RecordEventSupportModal from "./components/RecordEventSupportModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NS = "dashboard.eventProfile";

const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    distribution: `${NS}.type.distribution`,
    fundraising: `${NS}.type.fundraising`,
    awareness: `${NS}.type.awareness`,
    food_package: `${NS}.type.food_package`,
    medical_aid: `${NS}.type.medical_aid`,
    job_opportunity: `${NS}.type.job_opportunity`,
    other: `${NS}.type.other`,
  };
  return labels[type] || type;
};

const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    fundraising: "bg-warning/10 text-warning border-warning/20",
    distribution: "bg-success/10 text-success border-success/20",
    awareness: "bg-info/10 text-info border-info/20",
    food_package: "bg-purple/10 text-purple-600 border-purple/20",
    medical_aid: "bg-red-50 text-red-600 border-red-200",
    job_opportunity: "bg-blue-50 text-blue-600 border-blue-200",
    other: "bg-muted text-muted-foreground border-muted",
  };
  return colors[type] || colors.other;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-muted",
    upcoming: "bg-blue-50 text-blue-600 border-blue-200",
    ongoing: "bg-success/10 text-success border-success/20",
    completed: "bg-gray-100 text-gray-600 border-gray-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };
  return colors[status] || colors.draft;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: `${NS}.status.draft`,
    upcoming: `${NS}.status.upcoming`,
    ongoing: `${NS}.status.ongoing`,
    completed: `${NS}.status.completed`,
    cancelled: `${NS}.status.cancelled`,
  };
  return labels[status] || status;
};

const CLASSIFICATION_META: Record<string, { label: string; className: string; Icon: any }> = {
  orphan: {
    label: `${NS}.class.orphan`,
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-700",
    Icon: Baby,
  },
  disabled_disease: {
    label: `${NS}.class.disabled_disease`,
    className: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/70 dark:text-pink-300 dark:border-pink-700",
    Icon: Heart,
  },
  old_age: {
    label: `${NS}.class.old_age`,
    className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/70 dark:text-purple-300 dark:border-purple-700",
    Icon: Accessibility,
  },
  single_mother: {
    label: `${NS}.class.single_mother`,
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/70 dark:text-amber-300 dark:border-amber-700",
    Icon: Home,
  },
};

const EventClassificationTag = ({ classification }: { classification: string }) => {
  const { t } = useTranslation();
  const meta = CLASSIFICATION_META[classification];
  if (!meta) return null;
  const { label, className, Icon } = meta;
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {t(label)}
    </Badge>
  );
};

const EventProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRecordSupportModal, setShowRecordSupportModal] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await eventApi.getById(id!);
      console.log("YOU GOT THISSSSSSSSSSSSSS", response.data)
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch event stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["event-stats", id],
    queryFn: async () => {
      const response = await eventApi.getStats(id!);
      return response.data;
    },
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => eventApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(t(`${NS}.deleteSuccess`, "Event deleted successfully"));
      navigate("/dashboard/events");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t(`${NS}.deleteErr`, "Failed to delete event"));
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const calculateProgress = (collected: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((collected / target) * 100), 100);
  };

  if (eventLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/events")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t(`${NS}.back`, "Back to Events")}
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{t(`${NS}.loadErr`, "Failed to load event details")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress(Number(stats?.totalAmount * 1), event.targetAmount ? Number(event.targetAmount) : undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row  sm:items-center sm:gap-0 justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t(`${NS}.back`, "Back to Events")}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowRecordSupportModal(true)}>
              <Heart className="w-4 h-4 mr-2" />
              {t(`${NS}.recordSupport`, "Record Support")}
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              {t(`${NS}.edit`, "Edit")}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t(`${NS}.delete`, "Delete")}
            </Button>
          </div>
      </div>

      {/* Event Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-0 mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">{event.title}</h1>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    {t(`${NS}.eventCode`, "Event Code")}: {event.campaignCode || `ID: ${event._id.slice(0, 8)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getEventTypeColor(event.eventType)}>
                    {t(getEventTypeLabel(event.eventType))}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(event.status)}>
                    {t(getStatusLabel(event.status))}
                  </Badge>
                </div>
              </div>

              {event.description && (
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4">{event.description}</p>
              )}

              <div className="text-base sm:text-lg md:text-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4  text-muted-foreground" />
                   <span>
                     <strong>{t(`${NS}.eventDate`, "Event Date")}:</strong> {formatDate(event.eventDate || event.startDate)}
                   </span>
                </div>
                {event.startDate && event.endDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                   <span>
                     <strong>{t(`${NS}.duration`, "Duration")}:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}
                   </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                   <span>
                     <strong>{t(`${NS}.location`, "Location")}:</strong> {event.location}
                   </span>
                  </div>
                )}
                {event.organizedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                   <span>
                     <strong>{t(`${NS}.organizedBy`, "Organized By")}:</strong> {event.organizedBy}
                   </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t(`${NS}.stat.totalDonations`, "Total Donations")}</p>
                <p className="text-2xl font-bold">
                  {stats?.totalDonations || event._count?.donations || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t(`${NS}.stat.uniqueDonors`, "Unique Donors")}</p>
                <p className="text-2xl font-bold">{stats?.uniqueDonors || 0}</p>
              </div>
              <Users className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t(`${NS}.stat.familiesSupported`, "Families Supported")}</p>
                <p className="text-2xl font-bold">{  stats?.familiesSupported || 0}</p>
              </div>
              <Users className="w-8 h-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t(`${NS}.stat.participants`, "Participants")}</p>
                <p className="text-2xl font-bold">{event.participantCount || stats?.familiesSupported + stats?.uniqueDonors || 0}</p>
              </div>
              <Users className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fundraising Progress */}
      {event.targetAmount && Number(event.targetAmount) > 0 && (
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl">
                <Target className="w-5 h-5" />
                {t(`${NS}.fundraisingProgress`, "Fundraising Progress")}
              </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                    ETB {Number(stats?.totalAmount)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t(`${NS}.goalReceived`, "of ETB {{amount}} goal (received)", { amount: Number(event?.targetAmount).toLocaleString() })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{progress}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t(`${NS}.completed`, "Completed")}</p>
                </div>
              </div>
              <Progress value={progress} className="h-3" />
              
              {/* Show promised donations if any */}
              {event.donations && event.donations.some((d: any) => d.status === 'promised') && (
                <div className="pt-2 border-t">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">{t(`${NS}.promisedDonations`, "Promised donations")}:</span>
                     <span className="font-medium text-blue-600">
                       ETB {event.donations
                         .filter((d: any) => d.status === 'promised')
                         .reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)
                         .toLocaleString()}
                     </span>
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {t(`${NS}.promisedCount`, "{{count}} promised donation", { count: event.donations.filter((d: any) => d.status === 'promised').length })}
                   </p>
                </div>
              )}
              
              {progress >= 100 && (
                 <div className="flex items-center gap-2 text-success text-sm">
                   <TrendingUp className="w-4 h-4" />
                   <span className="font-medium">{t(`${NS}.goalAchieved`, "Goal achieved! 🎉")}</span>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Donations, Support History */}
      <Tabs defaultValue="donations" className="w-full">
        <TabsList>
          <TabsTrigger value="donations">
            {t(`${NS}.tab.donations`, "Donations")} ({event?._count?.donations || 0})
          </TabsTrigger>
          <TabsTrigger value="support">
            {t(`${NS}.tab.support`, "Support History")} ({event._count?.supportHistory || 0})
          </TabsTrigger>
          {event.outcomeSummary && <TabsTrigger value="outcome">{t(`${NS}.tab.outcome`, "Outcome")}</TabsTrigger>}
        </TabsList>

        <TabsContent value="donations">
          <Card>
            <CardContent className="p-2 sm:p-6">
              {event.donations && event.donations.length > 0 ? (
                <div className="space-y-4">
                  {event.donations.map((donation: any) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                    >
                      <div className="flex-1 space-y-3.5 sm:space-y-0">
                        <div className="flex flex-row items-start gap-2 sm:gap-2 sm:flex-row sm:items-center mb-1">
                          <p className="font-medium">
                            {donation?.donorName || donation.donor?.email || t(`${NS}.anonymous`, "Anonymous")}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              donation?.status === 'received' 
                                ? 'bg-success/10 text-success border-success/20' 
                                : donation?.status === 'promised'
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-muted text-muted-foreground border-muted'
                            }`}
                          >
                            {t(`${NS}.status.${donation?.status}`, donation?.status)}
                          </Badge>
                          {donation?.familyClassification && (
                            <EventClassificationTag classification={donation.familyClassification} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(donation?.receivedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">ETB {Number(donation?.amount).toLocaleString()}</p>
                        {donation?.paymentMethod && (
                          <p className="text-xs text-muted-foreground mt-1">
                            via {donation?.paymentMethod}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t(`${NS}.noDonations`, "No donations recorded for this event yet")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardContent className="p-2 sm:p-6">
              {event.supportHistory && event.supportHistory.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    // Group support records by supportDate + supportType + description
                    const grouped = event.supportHistory.reduce((acc: any, support: any) => {
                      const key = `${support.supportDate}_${support.supportType}_${support.description || ''}_${support.amountValue || ''}`;
                      if (!acc[key]) {
                        acc[key] = {
                          ...support,
                          families: [],
                        };
                      }
                      if (support.familyId) {
                        acc[key].families.push(support.familyId);
                      }
                      return acc;
                    }, {});

                    return Object.values(grouped).map((group: any, index: number) => (
                      <div
                        key={`group-${index}`}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-lg">{group.supportType}</p>
                              {group.families.length > 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  {t(`${NS}.familiesCount`, "{{count}} families", { count: group.families.length })}
                                </Badge>
                              )}
                            </div>
                            {group.description && (
                              <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-medium text-muted-foreground">
                               {formatDateShort(group.supportDate)}
                             </p>
                             {group.amountValue && (
                               <p className="font-semibold text-base sm:text-lg">
                                 ETB {Number(group.amountValue).toLocaleString()}
                                 {group.families.length > 1 && <span className="text-xs text-muted-foreground"> {t(`${NS}.perFamily`, "/ family")}</span>}
                               </p>
                             )}
                          </div>
                        </div>

                        {/* Items Provided */}
                        {group.itemsProvided && group.itemsProvided.length > 0 && (
                          <div className="mb-3">
                             <p className="text-xs font-medium text-muted-foreground mb-1">{t(`${NS}.itemsProvided`, "Items Provided:")}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.itemsProvided.map((item: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {item.name}: {item.quantity} {item.unit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Info */}
                        {(group.deliveredBy || group.donorId) && (
                          <div className="mb-3 text-xs text-muted-foreground">
                             {group.deliveredBy && <span>{t(`${NS}.deliveredBy`, "Delivered by")}: {group.deliveredBy}</span>}
                             {group.donorId && group.deliveredBy && <span> • </span>}
                             {group.donorId && <span>{t(`${NS}.donor`, "Donor")}: {group.donorId.name}</span>}
                          </div>
                        )}

                        {/* Families List */}
                        {group.families.length > 0 && (
                          <div className="border-t pt-3">
                             <p className="text-xs font-medium text-muted-foreground mb-2">
                               {t(`${NS}.familiesSupportedList`, "Families Supported ({{count}}):", { count: group.families.length })}
                             </p>
                            <div className="flex flex-wrap gap-2">
                              {group.families.map((family: any, idx: number) => (
                                <div
                                  key={family.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs cursor-pointer hover:bg-muted/80"
                                  onClick={() => navigate(`/dashboard/families/${family.id}`)}
                                >
                                  <Users className="w-3 h-3" />
                                  <span className="font-medium">{family.familyName || family.familyCode}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {group.notes && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                             <p className="font-medium mb-1">{t(`${NS}.notes`, "Notes:")}</p>
                            <p className="text-muted-foreground">{group.notes}</p>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t(`${NS}.noSupport`, "No support history recorded for this event yet")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {event.outcomeSummary && (
          <TabsContent value="outcome">
            <Card>
              <CardHeader>
                <CardTitle>{t(`${NS}.outcomeSummary`, "Event Outcome Summary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.outcomeSummary}</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Record Support Modal */}
      <RecordEventSupportModal
        open={showRecordSupportModal}
        onClose={() => setShowRecordSupportModal(false)}
        eventId={id!}
        eventName={event.title}
        onSuccess={() => {
          setShowRecordSupportModal(false);
          queryClient.invalidateQueries({ queryKey: ['event', id] });
        }}
      />

      {/* Edit Modal */}
      <EventFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={event}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${NS}.deleteTitle`, "Are you sure?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${NS}.deleteDesc`, "This will permanently delete the event \"{{title}}\". This action cannot be undone.", { title: event.title })}
              {event._count && event._count.donations > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  {t(`${NS}.deleteWarning`, "Warning: This event has {{count}} donation(s) associated with it.", { count: event._count.donations })}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(`${NS}.cancel`, "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t(`${NS}.deleteEvent`, "Delete Event")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventProfile;
