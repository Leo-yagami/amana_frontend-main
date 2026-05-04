import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Mail, Phone, Eye, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { donorApi, dashboardApi } from "@/services/api.service";
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
import type { Donor } from "@/types/api";

const getTypeColor = (type: string) => {
  switch (type) {
    case "Individual":
      return "bg-info/10 text-info border-info/20";
    case "Corporate":
      return "bg-primary/10 text-primary border-primary/20";
    case "Foundation":
      return "bg-accent/10 text-accent border-accent/20";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
};

const Donors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [donorTypeFilter, setDonorTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<Donor | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: donorsData, isLoading, error } = useQuery({
    queryKey: ['donors', { search: searchQuery, page, limit, donorType: donorTypeFilter }],
    queryFn: async () => {
      const params: any = { search: searchQuery, page, limit };
      if (donorTypeFilter !== "all") {
        params.donorType = donorTypeFilter;
      }
      const response = await donorApi.getAll(params);
      // console.log("RESPONNSEEEEEEEEE",response)
      return response;
    },
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      console.log(response.data)
      return response.data;
    },
  });

  const handleDeleteClick = (donor: Donor) => {
    setDonorToDelete(donor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log("THIS IS ITTTTTTTTT", donorToDelete)
    if (!donorToDelete) return;

    try {
      await donorApi.delete(donorToDelete._id);
      toast({
        title: "Success",
        description: "Donor deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete donor",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDonorToDelete(null);
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Donors</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Manage donor relationships and track contributions</p>
        </div>
        <Button variant="default" onClick={() => navigate("/dashboard/donors/new")} size="sm" className="text-xs sm:text-sm">
          <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Donor</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Total Donors</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {overview ? overview?.donors?.total : '-' }
          </p>
        </div>
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Active Donors</p>
          <p className="text-2xl sm:text-3xl font-bold text-success">
            {overview ? overview?.donors?.active?.toLocaleString() : '-' }
          </p>
        </div>
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Total Donated</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {overview ? `$${overview?.donations?.totalAmount?.toLocaleString()}` : '-' || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search donors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <Select
          value={donorTypeFilter}
          onValueChange={(value) => {
            setDonorTypeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="text-sm">
            <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Individual">Individual</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Foundation">Foundation</SelectItem>
            <SelectItem value="Organization">Organization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load donors. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Donor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </>
        ) : donorsData && donorsData.data.length > 0 ? (
          donorsData.data.map((donor) => (
          <div
            key={donor._id}
            className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <Avatar className="h-10 sm:h-14 w-10 sm:w-14 flex-shrink-0">
                <AvatarImage src={donor.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-lg">
                  {donor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{donor.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{donor.donorCode}</p>
                  </div>
                  <Badge variant="outline" className={`${getTypeColor(donor.donorType)} text-xs flex-shrink-0`}>
                    {donor.donorType}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              {donor.email && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
                  <Mail className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{donor.email}</span>
                </div>
              )}
              {donor.phone && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
                  <Phone className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{donor.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  {new Date(donor.registeredAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/dashboard/donors/${donor._id}`)}
                  title="View Details"
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/dashboard/donors/edit/${donor._id}`)}
                  title="Edit"
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(donor)}
                  title="Delete"
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">No donors found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {donorsData && donorsData.pagination && donorsData.pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Page {page} of {donorsData.pagination.totalPages} ({donorsData.pagination.total} total)
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, donorsData.pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (donorsData.pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= donorsData.pagination.totalPages - 2) {
                  pageNum = donorsData.pagination.totalPages - 4 + i;
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
              disabled={page === donorsData.pagination.totalPages}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the donor "{donorToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDonorToDelete(null)}>
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

export default Donors;
