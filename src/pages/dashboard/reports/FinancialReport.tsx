import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { reportsApi } from "@/services/api.service";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const FinancialReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["financial-report", startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await reportsApi.getFinancialReport(params);
      return response.data;
    },
  });

  const handleApplyFilter = () => {
    refetch();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Export PDF");
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log("Export Excel");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-24 sm:h-32 w-full" />
        <Skeleton className="h-48 sm:h-64 w-full" />
        <Skeleton className="h-48 sm:h-64 w-full" />
      </div>
    );
  }

  // Prepare chart data
  const donationByTypeData = {
    labels: reportData?.byType?.map((t: any) => t.donationType) || [],
    datasets: [
      {
        label: "Amount (ETB)",
        data: reportData?.byType?.map((t: any) => Number(t._sum.amount || 0)) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
      },
    ],
  };

  const donationByMonthData = {
    labels: reportData?.byMonth?.map((m: any) => 
      new Date(m.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    ).reverse() || [],
    datasets: [
      {
        label: "Donations (ETB)",
        data: reportData?.byMonth?.map((m: any) => Number(m.total || 0)).reverse() || [],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const donationByStatusData = {
    labels: reportData?.byStatus?.map((s: any) => s.status) || [],
    datasets: [
      {
        data: reportData?.byStatus?.map((s: any) => Number(s._sum.amount || 0)) || [],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };

  const recurringVsOneTime = reportData?.recurringVsOneTime || [];
  const recurringData = recurringVsOneTime.find((r: any) => r.type === "recurring");
  const oneTimeData = recurringVsOneTime.find((r: any) => r.type === "one-time");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate">Financial Summary Report</h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Comprehensive analysis of donations and financial activities</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportExcel} size="sm" className="text-xs sm:text-sm">
            <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button variant="outline" onClick={handleExportPDF} size="sm" className="text-xs sm:text-sm">
            <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-end">
            <div>
              <Label htmlFor="startDate" className="text-xs sm:text-sm">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs sm:text-sm">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button onClick={handleApplyFilter} size="sm" className="text-xs sm:text-sm">
              <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Apply</span>
              <span className="sm:hidden">Go</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Donations</p>
                <p className="text-lg sm:text-2xl font-bold truncate">
                  ETB {Number(reportData?.summary?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-primary opacity-50 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Count</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {reportData?.summary?.totalCount || 0}
                </p>
              </div>
              <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-success opacity-50 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Recurring</p>
                <p className="text-lg sm:text-2xl font-bold truncate">
                  ETB {Number(recurringData?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {recurringData?.count || 0}
                </p>
              </div>
              <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-info opacity-50 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">One-Time</p>
                <p className="text-lg sm:text-2xl font-bold truncate">
                  ETB {Number(oneTimeData?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {oneTimeData?.count || 0}
                </p>
              </div>
              <TrendingDown className="w-6 sm:w-8 h-6 sm:h-8 text-warning opacity-50 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Donations by Type */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Donations by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="h-48 sm:h-64">
              <Bar
                data={donationByTypeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Donations by Status */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Donations by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="flex justify-center">
              <div className="w-40 h-40 sm:w-64 sm:h-64">
                <Pie
                  data={donationByStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Donation Trends (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={donationByMonthData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Top Donors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top 10 Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData?.topDonors?.map((donor: any, index: number) => (
              <div
                key={donor.donor?.id || index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{donor.donor?.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {donor.donationCount} donation{donor.donationCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ETB {Number(donor.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReport;
