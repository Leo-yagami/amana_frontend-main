import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign, Calendar, User, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { donationApi, dashboardApi } from "@/services/api.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import  DonationTrendsChart  from "@/pages/dashboard/reports/monthlyDonations";

const Donations = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<any>(null);
  const [trendRange, setTrendRange] = useState<"3m" | "6m" | "1y">("6m");
  // const [trendData, setTrendData] = useState({ months: [], values: [] });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: donationsData, isLoading, error } = useQuery({
    queryKey: ['donations', { search: searchQuery, page, limit, status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      const params: any = { page, limit };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.donationType = typeFilter;
      const response = await donationApi.getAll(params);
      return response;
    },
  });

  // const { data: overview } = useQuery({
  //   queryKey: ['dashboard', 'overview'],
  //   queryFn: async () => {
  //     const response = await dashboardApi.getOverview();
  //     console.log(response)
  //     return response.data;
  //   },
  // });

  //new version with loading
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return response.data;
    },
  });

  const handleDeleteClick = (donation: any) => {
    setDonationToDelete(donation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!donationToDelete) return;

    try {
      await donationApi.delete(donationToDelete._id);
      toast({
        title: "Success",
        description: "Donation deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete donation",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDonationToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-success/10 text-success border-success/20";
      case "pledged":
        return "bg-warning/10 text-warning border-warning/20";
      case "processing":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "monetary":
        return "bg-primary/10 text-primary border-primary/20";
      case "in_kind":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "monetary":
        return "Money";
      case "in_kind":
        return "In-Kind";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    return status === "pledged" ? "Promised" : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  //helper function to calculate the last N months
  // const getLastNMonths = async (n: number) => {
  //   const months = [];
  //   let values = [];
  
  //   const now = new Date();
  
  //   for (let i = n - 1; i >= 0; i--) {
  //     const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
  
  //     const label = date.toLocaleString("en-US", { month: "short" });
  
  //     months.push(label);
  
  //     // fake value logic for now (replace with backend later)
  //     //making a separate route just to get the monthly data
  //     values.push(Math.floor(4000 + Math.random() * 6000));
  //   }
  //   console.log("BEFORE", values)
  //   // console.log("MONTHS", months)
  //   const monthResponse = await donationApi.getMonth(months);
  //   // console.log(monthResponse)
  //   values = monthResponse?.data
  //   console.log("AFTER", values)
  //   return { months, values };
  // };

  const fetchTrendData = async (range) => {
    const n = range === "3m" ? 3 : range === "6m" ? 6 : 12;
  
    const months = [];
    const now = new Date();
  
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString("en-US", { month: "short" }));
    }
  
    const monthResponse = await donationApi.getMonth(months);
  
    return { months, values: monthResponse?.data || [] };
  };

  const TREND_RANGES: Array<"3m" | "6m" | "1y"> = ["3m", "6m", "1y"];

  const trendQueries = useQueries({
    queries: TREND_RANGES.map((r) => ({
      queryKey: ["donations", "trend", r],
      queryFn: () => fetchTrendData(r),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });
  
  const trendDataByRange = TREND_RANGES.reduce((acc, r, idx) => {
    acc[r] = trendQueries[idx].data;
    return acc;
  }, {} as Record<"3m" | "6m" | "1y", { months: string[]; values: number[] } | undefined>);
  
  const trendData = trendDataByRange[trendRange];
  const trendLoading = trendQueries.some((q) => q.isLoading);
  // const { data: trendData, isFetching: trendLoading } = useQuery({
  //   queryKey: ["donations", "trend", trendRange],
  //   queryFn: () => fetchTrendData(trendRange),
  //   staleTime: 1000 * 60 * 10, // cache for 10 min
  //   keepPreviousData: true,    // prevents chart from going blank
  // });
  // useEffect(() => {
  //   queryClient.prefetchQuery({
  //     queryKey: ["donations", "trend", "3m"],
  //     queryFn: () => fetchTrendData("3m"),
  //   });
    
  //   queryClient.prefetchQuery({
  //     queryKey: ["donations", "trend", "6m"],
  //     queryFn: () => fetchTrendData("6m"),
  //   });
    
  //   queryClient.prefetchQuery({
  //     queryKey: ["donations", "trend", "1y"],
  //     queryFn: () => fetchTrendData("1y"),
  //   });
  // }, []);



  // const trendData = {
  //   "3m": getLastNMonths(3),
  //   "6m": getLastNMonths(6),
  //   "1y": getLastNMonths(12),
  // }[trendRange];
  // USE 'USE EFFECT' TO SET asynchornous data
  // useEffect(() => {
  //   const loadTrendData = async () => {
  //     const result = await getLastNMonths(
  //       trendRange === "3m" ? 3 : trendRange === "6m" ? 6 : 12
  //     );
  //     setTrendData(result);
  //   };
  
  //   loadTrendData();
  // }, [trendRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Donations</h1>
          <p className="text-muted-foreground">Track and manage all contributions</p>
        </div>
        <Button variant="default" onClick={() => navigate("/dashboard/donations/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Record Donation
        </Button>
      </div>

      {/* Stats Cards */}
      {false && overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview?.donations?.totalAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {overview?.donations?.totalCount || 0} donations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview?.donations?.monthlyAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.donors?.active.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Donated this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overviewLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(overview?.donations?.totalAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overview?.donations?.totalCount || 0} donations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(overview?.donations?.monthlyAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current month contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview?.donors?.active?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Donated this month
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {/** chart section */}
      {/* Donation Trend Card */}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Donation Trend</CardTitle>
            <CardDescription>
              Monthly Contribution analysis
            </CardDescription>
          </div>

          <Select value={trendRange} onValueChange={(v: any) => setTrendRange(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="h-[330px] w-full">
          <DonationTrendsChart
            values={trendData?.values || []}
            labels={trendData?.months || []}
          />
          </div>
        </CardContent>
      </Card>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search donations..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="pledged">Promised</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="monetary">Money</SelectItem>
            <SelectItem value="in_kind">In-Kind</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Donations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Reference</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[130px] text-right">Amount</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Allocated To</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Alert variant="destructive">
                      <AlertDescription>
                        Failed to load donations. Please try again.
                      </AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : donationsData && donationsData.data.length > 0 ? (
                donationsData.data.map((donation: any) => (
                  <TableRow 
                    key={donation._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                  >
                    <TableCell className="font-medium font-mono text-sm">
                      {donation.donationReference }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {donation.donorName || "Anonymous"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(donation.donationType)}>
                        {getTypeLabel(donation.donationType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {donation.donationType === "monetary" 
                        ? formatCurrency(Number(donation.amount || 0))
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(donation.status)}>
                        {getStatusLabel(donation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(donation.receivedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {donation.family && (
                          <span className="text-foreground">{donation.family.familyName}</span>
                        )}
                        {donation.event && (
                          <span className="text-foreground">{donation.event.title}</span>
                        )}
                        {donation.beneficiary && (
                          <span className="text-foreground">{donation.beneficiary.fullName}</span>
                        )}
                        {!donation.family && !donation.event && !donation.beneficiary && (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/edit/${donation._id}`)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(donation)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No donations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {donationsData && donationsData.pagination && donationsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, donationsData.pagination.total)} of {donationsData.pagination.total} donations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, donationsData.pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (donationsData.pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= donationsData.pagination.totalPages - 2) {
                  pageNum = donationsData.pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={i}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === donationsData.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this donation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDonationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Donations;
