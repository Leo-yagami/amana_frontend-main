import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, Users, TrendingUp, Heart } from "lucide-react";
import { reportsApi } from "@/services/api.service";
import { Line, Pie, Bar } from "react-chartjs-2";

const DonorReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["donor-report", startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await reportsApi.getDonorReport(params);
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
  const donorTypeData = {
    labels: reportData?.byType?.map((t: any) => t.donorType) || [],
    datasets: [
      {
        data: reportData?.byType?.map((t: any) => t._count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(14, 165, 233, 0.8)",
        ],
      },
    ],
  };

  const retention = reportData?.retention?.[0] || {};
  const retentionData = {
    labels: ["One-Time", "Occasional (2-3)", "Regular (4+)"],
    datasets: [
      {
        label: "Donors",
        data: [
          Number(retention.one_time || 0),
          Number(retention.occasional || 0),
          Number(retention.regular || 0),
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
      },
    ],
  };

  const newDonorsData = {
    labels: reportData?.newDonorsByMonth?.map((m: any) => 
      new Date(m.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    ).reverse() || [],
    datasets: [
      {
        label: "New Donors",
        data: reportData?.newDonorsByMonth?.map((m: any) => Number(m.count)).reverse() || [],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Donor Engagement Report</h2>
          <p className="text-muted-foreground">Analysis of donor activity and retention</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Donors</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.totalDonors || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Donors</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.activeDonors || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reportData?.summary?.totalDonors > 0
                    ? Math.round((reportData.summary.activeDonors / reportData.summary.totalDonors) * 100)
                    : 0}% of total
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
                <p className="text-sm text-muted-foreground mb-1">Inactive Donors</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.inactiveDonors || 0}
                </p>
              </div>
              <Heart className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donors by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Donors by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Pie
                  data={donorTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donor Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Retention Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={retentionData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">One-Time Donors:</span>
                <span className="font-medium">{Number(retention.one_time || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occasional Donors:</span>
                <span className="font-medium">{Number(retention.occasional || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regular Donors:</span>
                <span className="font-medium text-success">{Number(retention.regular || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Donors Trend */}
      <Card>
        <CardHeader>
          <CardTitle>New Donor Acquisition (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={newDonorsData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorReport;
