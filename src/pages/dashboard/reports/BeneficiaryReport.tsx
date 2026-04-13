import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar, Users, TrendingUp, MapPin, AlertCircle } from "lucide-react";
import { reportsApi } from "@/services/api.service";
import { Bar, Pie, Doughnut } from "react-chartjs-2";

const BeneficiaryReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["beneficiary-report", startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await reportsApi.getBeneficiaryReport(params);
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
  const regionData = {
    labels: reportData?.byRegion?.map((r: any) => r.region || "Unknown") || [],
    datasets: [
      {
        label: "Families",
        data: reportData?.byRegion?.map((r: any) => r._count) || [],
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

  const urgencyData = {
    labels: reportData?.byUrgency?.map((u: any) => u.urgencyLevel || "Unknown") || [],
    datasets: [
      {
        data: reportData?.byUrgency?.map((u: any) => u._count) || [],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // high - red
          "rgba(245, 158, 11, 0.8)", // medium - orange
          "rgba(16, 185, 129, 0.8)", // low - green
        ],
      },
    ],
  };

  const ageGroupData = {
    labels: reportData?.byAgeGroup?.map((a: any) => a.age_group) || [],
    datasets: [
      {
        label: "Beneficiaries",
        data: reportData?.byAgeGroup?.map((a: any) => Number(a.count)) || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
    ],
  };

  const supportTypeData = {
    labels: reportData?.supportHistory?.map((s: any) => s.supportType) || [],
    datasets: [
      {
        label: "Support Count",
        data: reportData?.supportHistory?.map((s: any) => s._count) || [],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Beneficiary Impact Report</h2>
          <p className="text-muted-foreground">Analysis of families and beneficiaries served</p>
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
                <p className="text-sm text-muted-foreground mb-1">Total Families</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.totalFamilies || 0}
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
                <p className="text-sm text-muted-foreground mb-1">Total Beneficiaries</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.totalBeneficiaries || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Family Size</p>
                <p className="text-2xl font-bold">
                  {reportData?.summary?.totalFamilies > 0
                    ? Math.round((reportData?.summary?.totalBeneficiaries / reportData?.summary?.totalFamilies) * 10) / 10
                    : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Families by Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Families by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={regionData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>

        {/* Families by Urgency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Families by Urgency Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut
                  data={urgencyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beneficiaries by Age Group */}
        <Card>
          <CardHeader>
            <CardTitle>Beneficiaries by Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={ageGroupData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>

        {/* Support by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Support History by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={supportTypeData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                indexAxis: 'y' as const,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Support */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Support Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData?.recentSupport?.slice(0, 10).map((support: any) => (
              <div
                key={support.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{support.supportType}</p>
                  <p className="text-sm text-muted-foreground">
                    {support.family?.familyName || support.family?.familyCode || "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(support.supportDate).toLocaleDateString()}
                  </p>
                  {support.amountValue && (
                    <p className="text-sm font-medium">
                      ETB {Number(support.amountValue).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiaryReport;
