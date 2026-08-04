// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Download, Users, DollarSign, Calendar } from "lucide-react";
// import {useQuery} from "@tanstack/react-query"
// import {dashboardApi} from "@/services/api.service"
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";


// import DonationTrendsChart from "@/pages/dashboard/reports/monthlyDonations";
// import AnalyticsDonutChart from "@/components/charts/AnalyticsDonutChart";

// type RangeType = "month" | "3m" | "6m" | "1y";

// const {
//   data: analyticsPayload,
//   isLoading,
//   error,
// } = useQuery({
//   queryKey: ["dashboard", "analytics", range],
//   queryFn: async () => {
//     const res = await dashboardApi.getAnalytics({ range });
//     return res.data;
//   },
// });

// const analytics = analyticsPayload?.analytics;

// const ReportsAnalytics = () => {
//   const [range, setRange] = useState<RangeType>("month");
//   const [activeTab, setActiveTab] = useState("summary");

//   /**
//    * YOU WILL REPLACE THIS OBJECT WITH API DATA
//    * based on the `range` value.
//    */
//   const analyticsData = {
//     month: {
//       stats: {
//         families: { total: 156, change: 12 },
//         donations: { total: 24680, change: 18 },
//         events: { total: 12, change: -5 },
//       },
//       monthlyTrends: {
//         labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
//         values: [110, 120, 130, 150],
//       },
//       urgencyLevels: [
//         { label: "Critical", value: 12, color: "#EF4444" },
//         { label: "High", value: 48, color: "#F97316" },
//         { label: "Medium", value: 56, color: "#EAB308" },
//         { label: "Low", value: 20, color: "#22C55E" },
//       ],
//       donationSources: [
//         { label: "Individual", value: 65, color: "#3B82F6" },
//         { label: "Corporate", value: 20, color: "#8B5CF6" },
//         { label: "NGO", value: 10, color: "#EC4899" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//       eventTypes: [
//         { label: "Food Aid", value: 45, color: "#22C55E" },
//         { label: "Medical", value: 25, color: "#3B82F6" },
//         { label: "Job Support", value: 15, color: "#A855F7" },
//         { label: "Education", value: 10, color: "#F59E0B" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//     },

//     "3m": {
//       stats: {
//         families: { total: 430, change: 8 },
//         donations: { total: 78600, change: 22 },
//         events: { total: 32, change: 15 },
//       },
//       monthlyTrends: {
//         labels: ["Mar", "Apr", "May"],
//         values: [5200, 9000, 7600],
//       },
//       urgencyLevels: [
//         { label: "Critical", value: 40, color: "#EF4444" },
//         { label: "High", value: 90, color: "#F97316" },
//         { label: "Medium", value: 180, color: "#EAB308" },
//         { label: "Low", value: 120, color: "#22C55E" },
//       ],
//       donationSources: [
//         { label: "Individual", value: 55, color: "#3B82F6" },
//         { label: "Corporate", value: 30, color: "#8B5CF6" },
//         { label: "NGO", value: 10, color: "#EC4899" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//       eventTypes: [
//         { label: "Food Aid", value: 40, color: "#22C55E" },
//         { label: "Medical", value: 30, color: "#3B82F6" },
//         { label: "Job Support", value: 15, color: "#A855F7" },
//         { label: "Education", value: 10, color: "#F59E0B" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//     },

//     "6m": {
//       stats: {
//         families: { total: 880, change: 14 },
//         donations: { total: 156000, change: 30 },
//         events: { total: 61, change: 18 },
//       },
//       monthlyTrends: {
//         labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//         values: [4500, 6500, 5200, 9000, 7600, 6000],
//       },
//       urgencyLevels: [
//         { label: "Critical", value: 80, color: "#EF4444" },
//         { label: "High", value: 190, color: "#F97316" },
//         { label: "Medium", value: 320, color: "#EAB308" },
//         { label: "Low", value: 290, color: "#22C55E" },
//       ],
//       donationSources: [
//         { label: "Individual", value: 60, color: "#3B82F6" },
//         { label: "Corporate", value: 25, color: "#8B5CF6" },
//         { label: "NGO", value: 10, color: "#EC4899" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//       eventTypes: [
//         { label: "Food Aid", value: 45, color: "#22C55E" },
//         { label: "Medical", value: 25, color: "#3B82F6" },
//         { label: "Job Support", value: 15, color: "#A855F7" },
//         { label: "Education", value: 10, color: "#F59E0B" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//     },

//     "1y": {
//       stats: {
//         families: { total: 1750, change: 20 },
//         donations: { total: 320000, change: 40 },
//         events: { total: 120, change: 25 },
//       },
//       monthlyTrends: {
//         labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
//         values: [3000, 4200, 5000, 6100, 7000, 8200, 9000, 7600, 6800, 7200, 8000, 9500],
//       },
//       urgencyLevels: [
//         { label: "Critical", value: 140, color: "#EF4444" },
//         { label: "High", value: 400, color: "#F97316" },
//         { label: "Medium", value: 600, color: "#EAB308" },
//         { label: "Low", value: 610, color: "#22C55E" },
//       ],
//       donationSources: [
//         { label: "Individual", value: 65, color: "#3B82F6" },
//         { label: "Corporate", value: 20, color: "#8B5CF6" },
//         { label: "NGO", value: 10, color: "#EC4899" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//       eventTypes: [
//         { label: "Food Aid", value: 50, color: "#22C55E" },
//         { label: "Medical", value: 20, color: "#3B82F6" },
//         { label: "Job Support", value: 15, color: "#A855F7" },
//         { label: "Education", value: 10, color: "#F59E0B" },
//         { label: "Other", value: 5, color: "#64748B" },
//       ],
//     },
//   };

//   const current = analyticsData[range];

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
//             Reports & Analytics
//           </h1>
//           <p className="text-muted-foreground">
//             Analyze families, donations, and event performance
//           </p>
//         </div>

//         <div className="flex gap-3 items-center">
//           <Select value={range} onValueChange={(v: RangeType) => setRange(v)}>
//             <SelectTrigger className="w-[170px]">
//               <SelectValue placeholder="Select range" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="month">This Month</SelectItem>
//               <SelectItem value="3m">Last 3 Months</SelectItem>
//               <SelectItem value="6m">Last 6 Months</SelectItem>
//               <SelectItem value="1y">Last Year</SelectItem>
//             </SelectContent>
//           </Select>

//           <Button variant="default">
//             <Download className="w-4 h-4 mr-2" />
//             Export Reports
//           </Button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="w-full justify-start">
//           <TabsTrigger value="summary">Summary</TabsTrigger>
//           <TabsTrigger value="families">Families</TabsTrigger>
//           <TabsTrigger value="donations">Donations</TabsTrigger>
//           <TabsTrigger value="events">Events</TabsTrigger>
//         </TabsList>

//         {/* Summary */}
//         <TabsContent value="summary" className="space-y-6">
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Families</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-xs text-muted-foreground">
//                   Total registered families
//                 </div>
//                 <div className="text-2xl font-bold">
//                   {current.stats.families.total}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   <span
//                     className={
//                       current.stats.families.change >= 0
//                         ? "text-success"
//                         : "text-destructive"
//                     }
//                   >
//                     {current.stats.families.change >= 0 ? "+" : ""}
//                     {current.stats.families.change}%
//                   </span>{" "}
//                   from previous period
//                 </p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Donations</CardTitle>
//                 <DollarSign className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-xs text-muted-foreground">
//                   Total donation amount
//                 </div>
//                 <div className="text-2xl font-bold">
//                   {formatCurrency(current.stats.donations.total)}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   <span
//                     className={
//                       current.stats.donations.change >= 0
//                         ? "text-success"
//                         : "text-destructive"
//                     }
//                   >
//                     {current.stats.donations.change >= 0 ? "+" : ""}
//                     {current.stats.donations.change}%
//                   </span>{" "}
//                   from previous period
//                 </p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Events</CardTitle>
//                 <Calendar className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-xs text-muted-foreground">
//                   Total events organized
//                 </div>
//                 <div className="text-2xl font-bold">
//                   {current.stats.events.total}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   <span
//                     className={
//                       current.stats.events.change >= 0
//                         ? "text-success"
//                         : "text-destructive"
//                     }
//                   >
//                     {current.stats.events.change >= 0 ? "+" : ""}
//                     {current.stats.events.change}%
//                   </span>{" "}
//                   from previous period
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Monthly Trends */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Monthly Trends</CardTitle>
//               <CardDescription>Performance based on selected range</CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="h-[330px] w-full">
//                 <DonationTrendsChart
//                   labels={current.monthlyTrends.labels}
//                   values={current.monthlyTrends.values}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Donuts */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Family Urgency Levels</CardTitle>
//               <CardDescription>Urgency distribution</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <AnalyticsDonutChart
//                 items={[
//                   { label: "Critical", value: 12, color: "#EF4444" },
//                   { label: "High", value: 48, color: "#F97316" },
//                   { label: "Medium", value: 56, color: "#EAB308" },
//                   { label: "Low", value: 20, color: "#22C55E" },
//                 ]}
//               />
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Donation Sources</CardTitle>
//               <CardDescription>Where donations come from</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <AnalyticsDonutChart
//                 items={[
//                   { label: "Individual", value: 65, color: "#3B82F6" },
//                   { label: "Corporate", value: 20, color: "#8B5CF6" },
//                   { label: "NGO", value: 10, color: "#EC4899" },
//                   { label: "Other", value: 5, color: "#64748B" },
//                 ]}
//               />
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Event Types</CardTitle>
//               <CardDescription>Breakdown of event categories</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <AnalyticsDonutChart
//                 items={[
//                   { label: "Food Aid", value: 45, color: "#22C55E" },
//                   { label: "Medical", value: 25, color: "#3B82F6" },
//                   { label: "Job Support", value: 15, color: "#A855F7" },
//                   { label: "Education", value: 10, color: "#F59E0B" },
//                   { label: "Other", value: 5, color: "#64748B" },
//                 ]}
//               />
//             </CardContent>
//           </Card>
//         </div>
//         </TabsContent>

//         {/* Other tabs placeholders */}
//         <TabsContent value="families">
//           <Card>
//             <CardHeader>
//               <CardTitle>Families Analytics</CardTitle>
//               <CardDescription>More detailed family analytics coming soon</CardDescription>
//             </CardHeader>
//             <CardContent className="text-muted-foreground text-sm">
//               You can add extra charts here later.
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="donations">
//           <Card>
//             <CardHeader>
//               <CardTitle>Donations Analytics</CardTitle>
//               <CardDescription>More detailed donation analytics coming soon</CardDescription>
//             </CardHeader>
//             <CardContent className="text-muted-foreground text-sm">
//               You can add extra charts here later.
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="events">
//           <Card>
//             <CardHeader>
//               <CardTitle>Events Analytics</CardTitle>
//               <CardDescription>More detailed event analytics coming soon</CardDescription>
//             </CardHeader>
//             <CardContent className="text-muted-foreground text-sm">
//               You can add extra charts here later.
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ReportsAnalytics;


import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Users, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { dashboardApi } from "@/services/api.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import DonationTrendsChart from "@/pages/dashboard/reports/monthlyDonations";
import AnalyticsDonutChart from "@/components/charts/AnalyticsDonutChart";

import { useInView } from "@/hooks/useInView";

type RangeType = "month" | "3m" | "6m" | "1y";

type StatBlock = {
  total: number;
  change: number;
};

type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type DashboardAnalytics = {
  stats: {
    families: StatBlock;
    donations: StatBlock;
    events: StatBlock;
  };
  monthlyTrends: {
    labels: string[];
    values: number[];
  };
  urgencyLevels: DonutSlice[];
  donationSources: DonutSlice[];
  eventTypes: DonutSlice[];
};

type DashboardAnalyticsResponse = {
  analytics: DashboardAnalytics;
};


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const DONUT_LABEL_KEYS: Record<string, string> = {
  // urgency
  Critical: "dashboard.reports2.urgency.critical",
  High: "dashboard.reports2.urgency.high",
  Medium: "dashboard.reports2.urgency.medium",
  Low: "dashboard.reports2.urgency.low",
  // donation sources
  Individual: "dashboard.reports2.source.individual",
  Corporate: "dashboard.reports2.source.corporate",
  NGO: "dashboard.reports2.source.ngo",
  Other: "dashboard.reports2.source.other",
  Foundation: "dashboard.reports2.source.foundation",
  Organization: "dashboard.reports2.source.organization",
  // event types
  "Food Aid": "dashboard.reports2.eventType.foodAid",
  "Food Package": "dashboard.reports2.eventType.foodAid",
  Medical: "dashboard.reports2.eventType.medical",
  "Medical Aid": "dashboard.reports2.eventType.medical",
  "Job Support": "dashboard.reports2.eventType.jobSupport",
  "Job Opportunity": "dashboard.reports2.eventType.jobSupport",
  Education: "dashboard.reports2.eventType.education",
  Distribution: "dashboard.reports2.eventType.distribution",
  Fundraising: "dashboard.reports2.eventType.fundraising",
  Awareness: "dashboard.reports2.eventType.awareness",
};

const translateDonutItems = (
  t: (k: string, fallback: string) => string,
  items: DonutSlice[]
): DonutSlice[] =>
  items.map((item) => ({
    ...item,
    label: DONUT_LABEL_KEYS[item.label]
      ? t(DONUT_LABEL_KEYS[item.label], item.label)
      : item.label,
  }));

// const ChangeText = ({ value }: { value: number }) => (
//   <div className="bg-primary/10 rounded-xl p-2 border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
//   <span className={value >= 0 ? "text-success" : "text-destructive"}>
//     {value >= 0 ? "+" : ""}
//     {value}%
//   </span>
//   <span>

//   {value > 0? <TrendingUp className="w-3 h-3" /> : value < 0? <TrendingDown className="w-3 h-3" /> : ""}
//   </span>
//   </div>
// );

const ChangeText = ({ value }: { value: number }) => (
  <span className={`inline-flex items-center gap-1 ${value < 0 ? "bg-destructive/10" : "bg-primary/10"} rounded-full px-2 py-1 border border-border w-fit`}>
    <span className={`text-xs font-medium ${value >= 0 ? "text-success" : "text-destructive"}`}>
      {/* {value > 0 ? "+" : ""} */}
      {value < 0? Math.abs(value) : value}%
    </span>
    {value > 0 ? (
      <TrendingUp className="w-3.5 h-3.5 text-success" />
    ) : value < 0 ? (
      <TrendingDown className="w-3.5 h-3.5 text-destructive" />
    ) : null}
  </span>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, idx) => (
      <Card key={idx}>
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const SummarySkeleton = () => (
  <div className="space-y-6">
    <StatsSkeleton />

    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[330px] w-full" />
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, idx) => (
        <Card key={idx}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ---- constants ----
const CACHE_KEY   = "reports_analytics_cache_v3";  // incremented on backend schema change
const SEEN_KEY    = "reports_analytics_seen";   // sessionStorage — clears on tab close
const RANGES: RangeType[] = ["month", "3m", "6m", "1y"];

// ---- helpers ----
const readCache = (): Partial<Record<RangeType, DashboardAnalytics>> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const writeCache = (data: Partial<Record<RangeType, DashboardAnalytics>>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
};

const ReportsAnalytics = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<RangeType>("6m");
  const [activeTab, setActiveTab] = useState("summary");

  // First-load gate: skip skeleton if user has visited this session
  const hasSeenBefore = sessionStorage.getItem(SEEN_KEY) === "1";

  const queryClient = useQueryClient();

  const { ref, isInView } = useInView({ threshold: 0, rootMargin: "0px", once: true });
  const shouldReveal = isInView;

  // Force refetch month data whenever user selects "This Month"
  useEffect(() => {
    if (range === "month") {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "analytics", "month"], refetchType: "active" });
    }
  }, [range, queryClient]);

  const cachedData = useMemo(readCache, []);
  
  
  const analyticsQueries = useQueries({
    queries: RANGES.map((r) => ({
      queryKey: ["dashboard", "analytics", r],
      queryFn: async () => {
        const res = await dashboardApi.getAnalytics({ range: r });
        // supports either { analytics: {...} } or raw analytics object
        console.log("HIIIIIIIIIIIIIIII", res.data)
        console.log("AAAAAAAAAAAAAAAAAA")
        return (res.data?.analytics ?? res.data) as DashboardAnalytics;
      },
      // Seed from localStorage so the page renders instantly after refresh
      initialData: cachedData[r],
      staleTime: 5 * 60 * 1000,
      gcTime:    30 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });
  // isLoading gate — still skip skeleton on revisit (good UX)
const isLoading = !hasSeenBefore && analyticsQueries.every((q) => q.isLoading);

  const analyticsByRange = useMemo(() => {
    return RANGES.reduce((acc, r, idx) => {
      acc[r] = analyticsQueries[idx].data;
      return acc;
    }, {} as Record<RangeType, DashboardAnalytics | undefined>);
  }, [analyticsQueries]);

  // Persist to localStorage whenever we get fresh data + mark session as seen
  useEffect(() => {
    const fresh = RANGES.reduce((acc, r, idx) => {
      const d = analyticsQueries[idx].data;
      if (d) acc[r] = d;
      return acc;
    }, {} as Partial<Record<RangeType, DashboardAnalytics>>);

    if (Object.keys(fresh).length > 0) {
      writeCache({ ...cachedData, ...fresh });
      sessionStorage.setItem(SEEN_KEY, "1");
    }
  }, [analyticsByRange]);

  // const isLoading = analyticsQueries.some((q) => q.isLoading);
  const isFetching = analyticsQueries.some((q) => q.isFetching);
  const firstError = analyticsQueries.find((q) => q.error)?.error as any;

  const analytics = analyticsByRange[range];


  const safeAnalytics = useMemo<DashboardAnalytics>(
    () => ({
      stats: {
        families: {
          total: analytics?.stats?.families?.total ?? 0,
          change: analytics?.stats?.families?.change ?? 0,
        },
        donations: {
          total: analytics?.stats?.donations?.total ?? 0,
          change: analytics?.stats?.donations?.change ?? 0,
        },
        events: {
          total: analytics?.stats?.events?.total ?? 0,
          change: analytics?.stats?.events?.change ?? 0,
        },
      },
      monthlyTrends: {
        labels: analytics?.monthlyTrends?.labels ?? [],
        values: analytics?.monthlyTrends?.values ?? [],
      },
      urgencyLevels: translateDonutItems(t, analytics?.urgencyLevels ?? []),
      donationSources: translateDonutItems(t, analytics?.donationSources ?? []),
      eventTypes: translateDonutItems(t, analytics?.eventTypes ?? []),
    }),
    [analytics, t]
  );

  // const errorMessage =
  //   (error as any)?.response?.data?.message ??
  //   "Failed to load analytics. Please try again.";

  const errorMessage =
    firstError?.response?.data?.message ?? t("dashboard.reports2.loadError");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 ref={ref} className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            {t("dashboard.reports2.title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {t("dashboard.reports2.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-stretch mt-2 sm:mt-0">
          {false && (<Button variant="default" disabled={isLoading || isFetching} size="default" className="text-xs sm:text-sm mb-4 sm:mb-0 h">
            <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t("dashboard.reports2.exportFull")}</span>
            <span className="sm:hidden">{t("dashboard.reports2.export")}</span>
          </Button>)}
        </div>
      </div>

      {/* Error state */}
      {firstError ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-auto sm:w-auto justify-start overflow-x-auto mb-3">
          <TabsTrigger value="summary" className="text-xs sm:text-sm">{t("dashboard.reports2.tabSummary")}</TabsTrigger>
          <TabsTrigger value="families" className="text-xs sm:text-sm">{t("dashboard.reports2.tabFamilies")}</TabsTrigger>
          <TabsTrigger value="donations" className="text-xs sm:text-sm">{t("dashboard.reports2.tabDonations")}</TabsTrigger>
          <TabsTrigger value="events" className="text-xs sm:text-sm">{t("dashboard.reports2.tabEvents")}</TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-6">
          {isLoading ? (
            <SummarySkeleton />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
                <Card className="">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium">{t("dashboard.reports2.cardFamilies")}</CardTitle>
                    <Users className="h-5 sm:h-7 w-5 sm:w-7 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pb-6 ">
                    <div className="text-xs text-muted-foreground">
                      {t("common.total")}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {safeAnalytics.stats.families.total}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <ChangeText value={safeAnalytics.stats.families.change} />
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium">{t("dashboard.reports2.cardDonations")}</CardTitle>
                    <DollarSign className="h-5 sm:h-7 w-5 sm:w-7 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pb-6 sm:pb-0">
                    <div className="text-xs text-muted-foreground">
                      {t("common.total")}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {formatCurrency(safeAnalytics.stats.donations.total)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <ChangeText value={safeAnalytics.stats.donations.change} />
                    </p>
                  </CardContent>
                </Card>

                <Card className="">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium">{t("dashboard.reports2.cardEvents")}</CardTitle>
                    <Calendar className="h-5 sm:h-7 w-5 sm:w-7 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pb-6 sm:pb-0">
                    <div className="text-xs text-muted-foreground">
                      {t("common.total")}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">
                      {safeAnalytics.stats.events.total}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <ChangeText value={safeAnalytics.stats.events.change} />
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              <Card className="min-w-0 overflow-hidden [&_canvas]:max-w-full">
                <div className="flex flex-col px-6 sm:px-0 sm:pr-6 sm:flex-row gap-2 sm:gap-0  items-start  sm:items-center justify-between">
                <CardHeader className="pb-3 ">
                  <CardTitle className="text-lg sm:text-xl">{t("dashboard.reports2.monthlyRegTitle")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {t("dashboard.reports2.monthlyRegDesc")}
                  </CardDescription>
                </CardHeader>
                <Select value={range} onValueChange={(v: string) => setRange(v as RangeType)}>
                  <SelectTrigger className="w-full sm:w-[170px] text-sm">
                    <SelectValue placeholder={t("dashboard.reports2.selectRange")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">{t("dashboard.reports2.rangeMonth")}</SelectItem>
                    <SelectItem value="3m">{t("dashboard.reports2.range3m")}</SelectItem>
                    <SelectItem value="6m">{t("dashboard.reports2.range6m")}</SelectItem>
                    <SelectItem value="1y">{t("dashboard.reports2.range1y")}</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                {/* <CardContent className="p-3 sm:p-6">
                  <div ref={ref} className="h-64 sm:h-80 lg:h-[330px] w-full">
                    {shouldReveal ? (
                      <DonationTrendsChart
                      labels={safeAnalytics.monthlyTrends.labels}
                      values={safeAnalytics.monthlyTrends.values}
                    />
                    ):
                    (<Skeleton className="h-full w-full rounded-xl" />

                    )}
                  </div>
                </CardContent> */}
                <CardContent className="p-2 min-[400px]:p-3 sm:p-6 min-w-0 overflow-hidden">
                  <div className="w-full h-[230px] sm:h-[330px] min-w-0 max-w-full overflow-hidden">
                    <div className="h-48 min-[400px]:h-56 sm:h-80 lg:h-[330px] w-full min-w-0 max-w-full overflow-hidden">
                      {shouldReveal ? (
                      <DonationTrendsChart
                      labels={safeAnalytics.monthlyTrends.labels}
                      values={safeAnalytics.monthlyTrends.values}
                    />
                    ):
                    (<Skeleton className="h-full w-full rounded-xl" />

                    )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">{t("dashboard.reports2.urgencyTitle")}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{t("dashboard.reports2.urgencyDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    {/* old: scroll broke with lenis — added data-lenis-prevent */}
                    <div  className="h-52 sm:h-60 overflow-y-auto scrollbar-hide" data-lenis-prevent>
                      {shouldReveal ? (<AnalyticsDonutChart items={safeAnalytics.urgencyLevels} />
                      ) : (<Skeleton className="h-full w-full rounded-xl" />
                    )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">{t("dashboard.reports2.sourcesTitle")}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{t("dashboard.reports2.sourcesDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    {/* old: scroll broke with lenis — added data-lenis-prevent */}
                    <div  className="h-52 sm:h-60 overflow-y-auto scrollbar-hide" data-lenis-prevent>
                      {shouldReveal ? (<AnalyticsDonutChart items={safeAnalytics.donationSources} />
                      ) : (<Skeleton className="h-full w-full rounded-xl" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">{t("dashboard.reports2.eventTypesTitle")}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{t("dashboard.reports2.eventTypesDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    {/* old: scroll broke with lenis — added data-lenis-prevent */}
                    <div  className="h-52 sm:h-60 overflow-y-auto scrollbar-hide" data-lenis-prevent>
                      {shouldReveal ? (<AnalyticsDonutChart items={safeAnalytics.eventTypes} />
                      ) : (<Skeleton className="h-full w-full rounded-xl" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Other tabs placeholders */}
        <TabsContent value="families">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.reports2.famAnalyticsTitle")}</CardTitle>
              <CardDescription>{t("dashboard.reports2.famAnalyticsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.reports2.donAnalyticsTitle")}</CardTitle>
              <CardDescription>{t("dashboard.reports2.donAnalyticsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.reports2.evAnalyticsTitle")}</CardTitle>
              <CardDescription>{t("dashboard.reports2.evAnalyticsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
