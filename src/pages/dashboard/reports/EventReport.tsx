import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Calendar, Target, TrendingUp, Users } from "lucide-react";
import { reportsApi } from "@/services/api.service";
import { Bar, Pie } from "react-chartjs-2";

const EventReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["event-report", startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await reportsApi.getEventReport(params);
      return response.data;
    },
  });

  const handleApplyFilter = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Chart data
  const eventTypeData = {
    labels: reportData?.byType?.map((t: any) => t.eventType) || [],
    datasets: [
      {
        data: reportData?.byType?.map((t: any) => t._count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
      },
    ],
  };

  const eventStatusData = {
    labels: reportData?.byStatus?.map((s: any) => s.status) || [],
    datasets: [
      {
        data: reportData?.byStatus?.map((s: any) => s._count) || [],
        backgroundColor: [
          "rgba(156, 163, 175, 0.8)", // draft
          "rgba(59, 130, 246, 0.8)",  // upcoming
          "rgba(245, 158, 11, 0.8)",  // ongoing
          "rgba(16, 185, 129, 0.8)",  // completed
          "rgba(239, 68, 68, 0.8)",   // cancelled
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Event Performance Report</h2>
          <p className="text-muted-foreground">Analysis of event effectiveness and impact</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleApplyFilter}>
              <Calendar className="w-4 h-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.totalEvents || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.completedEvents || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.upcomingEvents || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ongoing</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.ongoingEvents || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Pie
                  data={eventTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={eventStatusData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Fundraising Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top Fundraising Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.fundraisingPerformance?.map((event: any) => (
              <div key={event.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
                    </p>
                  </div>
                  <Badge variant="outline" className={
                    event.successRate >= 100 ? "bg-success/10 text-success border-success/20" :
                    event.successRate >= 50 ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-muted text-muted-foreground border-muted"
                  }>
                    {event.successRate}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ETB {Number(event.collectedAmount).toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      of ETB {Number(event.targetAmount).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={Math.min(event.successRate, 100)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Events by Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Most Popular Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData?.topEvents?.slice(0, 10).map((event: any, index: number) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event._count?.donations || 0} donations • {event._count?.supportHistory || 0} support records
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{event.participantCount || 0}</p>
                  <p className="text-xs text-muted-foreground">participants</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventReport;
