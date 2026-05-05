import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  HandHeart,
  DollarSign,
  Megaphone,
  Calendar,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardApi, eventApi } from "@/services/api.service";
import type {
  DashboardOverview,
  TopDonor,
  RecentActivity,
  Event,
} from "@/types/api";

const Dashboard = () => {
  const { t } = useTranslation();
  // State for all dashboard data
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [overviewRes, eventsRes, donorsRes, activitiesRes] =
          await Promise.all([
            dashboardApi.getOverview(),
            eventApi.getAll({ status: "Active", limit: 3 }),
            dashboardApi.getTopDonors({ limit: 3 }),
            dashboardApi.getRecentActivities({ limit: 9 }),
          ]);

        setOverview(overviewRes.data);
        setEvents(eventsRes.data || []);
        setTopDonors(donorsRes.data || []);
        setRecentActivities(activitiesRes.data || []);
        console.log("overview data: ", overviewRes)
        console.log("event data: ", eventsRes)
        console.log("donor data: ", donorsRes)
        console.log("activity data: ", activitiesRes.data)
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || t("dashboard.home.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {t("dashboard.home.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.home.subtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            {t("dashboard.home.thisMonth")}
          </Button>
          <Button variant="default">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("dashboard.home.generateReport")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6"
              >
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </>
        ) : overview ? (
          <>
            <StatCard
              title={t("dashboard.home.activeDonors")}
              value={overview.donors.active.toLocaleString()}
              change={`${overview.donors.total} ${t("dashboard.home.totalSuffix")}`}
              trend="up"
              icon={HandHeart}
              iconColor="text-success"
              iconBgColor="bg-success/10"
            />
            <StatCard
              title={t("dashboard.home.fundsMtd")}
              value={`$${overview.donations.monthlyAmount.toLocaleString()}`}
              change={`${overview.donations.totalCount} ${t("dashboard.home.donationsSuffix")}`}
              trend="up"
              icon={DollarSign}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <StatCard
              title={t("dashboard.home.activeEvents")}
              value={overview?.events?.active?.toString()}
              change={`${overview?.events?.total} ${t("dashboard.home.totalSuffix")}`}
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
            <h2 className="text-lg font-semibold text-foreground">
              {t("dashboard.home.recentActivity")}
            </h2>
            <Button variant="ghost" size="sm">
              {t("dashboard.home.viewAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {loading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-3">
                    <Skeleton className="w-2 h-2 rounded-full mt-2" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-foreground text-sm">
                      {activity.description}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No recent activities
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {t("dashboard.home.upcomingEvents")}
            </h2>
            <Button variant="ghost" size="sm">
              {t("dashboard.home.viewAll")}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </>
            ) : events?.length > 0 ? (
              events?.map((event) => (
                <div
                  key={event._id}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium text-foreground mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString()
                        : t("common.tbd")}
                    </span>
                    <span className="capitalize">{event.eventType}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                {t("dashboard.home.noEvents")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Donors / Campaigns */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{t("dashboard.home.topDonors")}</h2>
          <Button variant="ghost" size="sm">
            {t("dashboard.home.viewAll")}
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-6">
          {loading ? (
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
          ) : topDonors.length > 0 ? (
            topDonors.map((donor) => (
              <div key={donor.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{donor.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.home.donationCount", { count: donor.donationCount })}
                  </span>
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
            <p className="text-muted-foreground text-sm text-center py-4">
              {t("dashboard.home.noDonors")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
