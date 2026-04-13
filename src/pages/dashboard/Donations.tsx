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

const Donations = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<any>(null);
  
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
      return response.data;
    },
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
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
      await donationApi.delete(donationToDelete.id);
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
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.totalDonations || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {overview.donationCount || 0} donations
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
                {formatCurrency(overview.monthlyDonations || 0)}
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
                {overview.totalDonors || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered donors
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
                    key={donation.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/donations/${donation.id}`)}
                  >
                    <TableCell className="font-medium font-mono text-sm">
                      {donation.donationReference || `DON-${donation.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {donation.donor?.name || "Anonymous"}
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
                          onClick={() => navigate(`/dashboard/donations/${donation.id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/edit/${donation.id}`)}
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
