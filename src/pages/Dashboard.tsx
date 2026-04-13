import { Users, HandHeart, DollarSign, Megaphone, Calendar, TrendingUp, ArrowUpRight } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, eventApi } from "@/services/api.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  // Fetch dashboard data
  const { data: overview, isLoading: isLoadingOverview, error: overviewError } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return response.data;
    },
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events', 'active'],
    queryFn: async () => {
      const response = await eventApi.getAll({ status: 'Active', limit: 3 });
      return response.data;
    },
  });

  const { data: topDonors, isLoading: isLoadingDonors } = useQuery({
    queryKey: ['dashboard', 'top-donors'],
    queryFn: async () => {
      const response = await dashboardApi.getTopDonors({ limit: 3 });
      return response.data;
    },
  });

  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      const response = await dashboardApi.getRecentActivities({ limit: 5 });
      return response.data;
    },
  });

  // Show error state
  if (overviewError) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="default">
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingOverview ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </>
        ) : overview ? (
          <>
            <StatCard
              title="Total Beneficiaries"
              value={overview.beneficiaries.total.toLocaleString()}
              change={`${overview.beneficiaries.orphaned} orphaned`}
              trend="up"
              icon={Users}
              iconColor="text-info"
              iconBgColor="bg-info/10"
            />
            <StatCard
              title="Active Donors"
              value={overview.donors.active.toLocaleString()}
              change={`${overview.donors.total} total`}
              trend="up"
              icon={HandHeart}
              iconColor="text-success"
              iconBgColor="bg-success/10"
            />
            <StatCard
              title="Funds Raised (MTD)"
              value={`$${overview.donations.monthlyAmount.toLocaleString()}`}
              change={`${overview.donations.totalCount} donations`}
              trend="up"
              icon={DollarSign}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <StatCard
              title="Active Events"
              value={overview.events.active.toString()}
              change={`${overview.events.total} total`}
              trend="up"
              icon={Megaphone}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
          </>
        ) : null}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {isLoadingActivities ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-3">
                    <Skeleton className="w-2 h-2 rounded-full mt-2" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </>
            ) : recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-foreground text-sm">{activity.description}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {isLoadingEvents ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </>
            ) : events && events.data.length > 0 ? (
              events.data.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium text-foreground mb-1">{event.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    <span className="capitalize">{event.eventType}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Progress */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Top Campaigns</h2>
          <Button variant="ghost" size="sm">
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-6">
          {isLoadingDonors ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </>
          ) : topDonors && topDonors.length > 0 ? (
            topDonors.map((donor) => (
              <div key={donor.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{donor.name}</h3>
                  <span className="text-sm text-muted-foreground">{donor.donationCount} donations</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={100} className="flex-1 h-2" />
                  <span className="text-sm font-semibold text-primary min-w-[100px] text-right">
                    ${donor.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">No donor data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
