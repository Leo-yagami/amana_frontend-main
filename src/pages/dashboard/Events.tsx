import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Users, Search, Filter, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { eventApi } from "@/services/api.service";
import { Event } from "@/types/api";
import { toast } from "sonner";
import EventFormModal from "./components/EventFormModal";

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

const Events = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', page, search, statusFilter, typeFilter],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.eventType = typeFilter;
      
      const response = await eventApi.getAll(params);
      return response;
    },
  });

   // Fetch event stats
   const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["event-stats", id],
    queryFn: async () => {
      console.log("HELLLLLLO")
      const response = await eventApi.getStats(id!);
      console.log("YOU GOT THISSSSSSSSSSSSSS", response.data)
      return response.data;
    },
    enabled: !!id,
  });

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/dashboard/events/${eventId}`);
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const formatEventDate = (startDate?: string, endDate?: string, eventDate?: string) => {
    const dateToFormat = eventDate || startDate;
    if (!dateToFormat) return "No date";
    
    const date = new Date(dateToFormat);
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      full: date.toLocaleDateString(),
    };
  };

  const calculateProgress = (collected: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((collected / target) * 100), 100);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Events</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load events. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Events</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Plan and manage charity events</p>
        </div>
        <Button onClick={handleCreateEvent} size="sm" className="text-xs sm:text-sm">
          <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Create Event</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          size="sm"
          className="text-xs sm:text-sm"
        >
          <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">Event Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="food_package">Food Package</SelectItem>
                    <SelectItem value="medical_aid">Medical Aid</SelectItem>
                    <SelectItem value="job_opportunity">Job Opportunity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.data.map((event: Event) => {
              const dateInfo = formatEventDate(event.startDate, event.endDate, event.eventDate);
              const progress = calculateProgress(Number(event?.collectedAmount), event?.targetAmount ? Number(event?.targetAmount) : undefined);
              
              return (
                <Card key={event._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewEvent(event.id)}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg sm:rounded-xl bg-primary/10 flex flex-col items-center justify-center" />

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{event.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Code: {event.campaignCode || event._id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <Badge variant="outline" className={`${getEventTypeColor(event.eventType)} text-xs`}>
                              {getEventTypeLabel(event.eventType)}
                            </Badge>
                            <Badge variant="outline" className={`${getStatusColor(event.status)} text-xs`}>
                              {getStatusLabel(event.status)}
                            </Badge>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {event.participantCount > 0 && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>{event.participantCount}</span>
                            </div>
                          )}
                          {event._count && event._count.donations > 0 && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <DollarSign className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>{event._count.donations}</span>
                            </div>
                          )}
                        </div>

                        {/* Fundraising Progress */}
                        {event.targetAmount && Number(event.targetAmount) > 0 && (
                          <div className="mt-2 sm:mt-3">
                            <div className="flex items-center justify-between text-xs sm:text-sm mb-1 gap-2">
                              <span className="text-muted-foreground flex-shrink-0">Goal</span>
                              <span className="font-medium text-xs sm:text-sm text-right">
                                ETB {Number(event?.collectedAmount).toLocaleString()} / ETB {Number(event?.targetAmount).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                              <div
                                className="bg-primary h-1.5 sm:h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {progress}% reached
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(event._id);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => handleEditEvent(event, e)}
                          className="text-xs sm:text-sm"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first event"}
            </p>
            {!search && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={handleCreateEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Form Modal */}
      <EventFormModal
        open={showEventForm}
        onClose={handleCloseEventForm}
        event={selectedEvent}
      />
    </div>
  );
};

export default Events;
