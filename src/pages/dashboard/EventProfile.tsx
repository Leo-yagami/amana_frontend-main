import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    distribution: "Distribution",
    fundraising: "Fundraising",
    awareness: "Awareness",
    food_package: "Food Package",
    medical_aid: "Medical Aid",
    job_opportunity: "Job Opportunity",
    other: "Other",
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
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const EventProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      toast.success("Event deleted successfully");
      navigate("/dashboard/events");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete event");
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
          Back to Events
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>Failed to load event details</p>
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
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard/events")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRecordSupportModal(true)}>
            <Heart className="w-4 h-4 mr-2" />
            Record Support
          </Button>
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Event Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
                  <p className="text-muted-foreground">
                    Event Code: {event.campaignCode || `ID: ${event._id.slice(0, 8)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getEventTypeColor(event.eventType)}>
                    {getEventTypeLabel(event.eventType)}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(event.status)}>
                    {getStatusLabel(event.status)}
                  </Badge>
                </div>
              </div>

              {event.description && (
                <p className="text-muted-foreground mb-4">{event.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <strong>Event Date:</strong> {formatDate(event.eventDate || event.startDate)}
                  </span>
                </div>
                {event.startDate && event.endDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Duration:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Location:</strong> {event.location}
                    </span>
                  </div>
                )}
                {event.organizedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Organized By:</strong> {event.organizedBy}
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
                <p className="text-sm text-muted-foreground mb-1">Total Donations</p>
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
                <p className="text-sm text-muted-foreground mb-1">Unique Donors</p>
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
                <p className="text-sm text-muted-foreground mb-1">Families Supported</p>
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
                <p className="text-sm text-muted-foreground mb-1">Participants</p>
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
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Fundraising Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    ETB {Number(stats?.totalAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of ETB {Number(event?.targetAmount).toLocaleString()} goal (received)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{progress}%</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
              <Progress value={progress} className="h-3" />
              
              {/* Show promised donations if any */}
              {event.donations && event.donations.some((d: any) => d.status === 'promised') && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Promised donations:</span>
                    <span className="font-medium text-blue-600">
                      ETB {event.donations
                        .filter((d: any) => d.status === 'promised')
                        .reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({event.donations.filter((d: any) => d.status === 'promised').length} promised donation{event.donations.filter((d: any) => d.status === 'promised').length !== 1 ? 's' : ''})
                  </p>
                </div>
              )}
              
              {progress >= 100 && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Goal achieved! 🎉</span>
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
            Donations ({event?.donations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="support">
            Support History ({event._count?.supportHistory || 0})
          </TabsTrigger>
          {event.outcomeSummary && <TabsTrigger value="outcome">Outcome</TabsTrigger>}
        </TabsList>

        <TabsContent value="donations">
          <Card>
            <CardContent className="p-6">
              {event.donations && event.donations.length > 0 ? (
                <div className="space-y-4">
                  {event.donations.map((donation: any) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {donation?.donorName || donation.donor?.email || "Anonymous"}
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
                            {donation?.status}
                          </Badge>
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
                  <p>No donations recorded for this event yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardContent className="p-6">
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
                                  {group.families.length} families
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
                              <p className="font-semibold text-lg">
                                ETB {Number(group.amountValue).toLocaleString()}
                                {group.families.length > 1 && <span className="text-xs text-muted-foreground"> / family</span>}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Items Provided */}
                        {group.itemsProvided && group.itemsProvided.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Items Provided:</p>
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
                            {group.deliveredBy && <span>Delivered by: {group.deliveredBy}</span>}
                            {group.donorId && group.deliveredBy && <span> • </span>}
                            {group.donorId && <span>Donor: {group.donorId.name}</span>}
                          </div>
                        )}

                        {/* Families List */}
                        {group.families.length > 0 && (
                          <div className="border-t pt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Families Supported ({group.families.length}):
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
                            <p className="font-medium mb-1">Notes:</p>
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
                  <p>No support history recorded for this event yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {event.outcomeSummary && (
          <TabsContent value="outcome">
            <Card>
              <CardHeader>
                <CardTitle>Event Outcome Summary</CardTitle>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{event.title}". This action cannot be undone.
              {event._count && event._count.donations > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This event has {event._count.donations} donation(s) associated with it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventProfile;
