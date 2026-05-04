import { useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      console.log(response)
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
  const getLastNMonths = async (n: number) => {
    const months = [];
    const values = [];
  
    const now = new Date();
  
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
  
      const label = date.toLocaleString("en-US", { month: "short" });
  
      months.push(label);
  
      // fake value logic for now (replace with backend later)
      //making a separate route just to get the monthly data
      values.push(Math.floor(4000 + Math.random() * 6000));
    }
    console.log("MONTHS", months)
    const monthResponse = await donationApi.getMonth(months);
    return { months, values };
  };

  const trendData = {
    "3m": getLastNMonths(3),
    "6m": getLastNMonths(6),
    "1y": getLastNMonths(12),
  }[trendRange];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Donations</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Track and manage all contributions</p>
        </div>
        <Button variant="default" onClick={() => navigate("/dashboard/donations/new")} size="sm" className="text-xs sm:text-sm">
          <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Record Donation</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
      {/** chart section */}
      {/* Donation Trend Card */}
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-6">
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl">Donation Trend</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monthly Contribution analysis
            </CardDescription>
          </div>

          <Select value={trendRange} onValueChange={(v: any) => setTrendRange(v)}>
            <SelectTrigger className="w-full sm:w-[160px] text-sm">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          <div className="h-64 sm:h-80 lg:h-[330px] w-full">
            <DonationTrendsChart
              values={trendData.values}
              labels={trendData.months}
            />
          </div>
        </CardContent>
      </Card>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="text-sm">
              <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <SelectValue placeholder="Status" />
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
            <SelectTrigger className="text-sm">
              <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="monetary">Money</SelectItem>
              <SelectItem value="in_kind">In-Kind</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Donations Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm w-24 sm:w-[140px]">Reference</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Donor</TableHead>
                <TableHead className="text-xs sm:text-sm w-16 sm:w-[120px]">Type</TableHead>
                <TableHead className="text-xs sm:text-sm w-20 sm:w-[130px] text-right">Amount</TableHead>
                <TableHead className="text-xs sm:text-sm w-16 sm:w-[110px]">Status</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell w-24 sm:w-[120px]">Date</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Allocated To</TableHead>
                <TableHead className="text-xs sm:text-sm w-16 sm:w-[120px] text-right">Actions</TableHead>
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
                    className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                  >
                    <TableCell className="font-medium font-mono text-xs sm:text-sm p-2 sm:p-4">
                      {donation.donationReference.substring(0, 10)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {donation.donorName || "Anonymous"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <Badge variant="outline" className={`${getTypeColor(donation.donationType)} text-xs`}>
                        {getTypeLabel(donation.donationType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs sm:text-sm p-2 sm:p-4">
                      {donation.donationType === "monetary" 
                        ? formatCurrency(Number(donation.amount || 0))
                        : "-"}
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <Badge variant="outline" className={`${getStatusColor(donation.status)} text-xs`}>
                        {getStatusLabel(donation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground p-2 sm:p-4">
                      {formatDate(donation.receivedAt)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell p-2 sm:p-4">
                      <div className="text-xs sm:text-sm truncate">
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
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                          title="View Details"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/edit/${donation._id}`)}
                          title="Edit"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(donation)}
                          title="Delete"
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Page {page} of {donationsData.pagination.totalPages} ({donationsData.pagination.total} total)
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
