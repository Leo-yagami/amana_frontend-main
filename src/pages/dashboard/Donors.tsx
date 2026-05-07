import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      staleTime: 5 * 60 * 1000,   // ✅ ADD
      gcTime: 30 * 60 * 1000,     // ✅ ADD
      refetchOnWindowFocus: false, // ✅ ADD
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      console.log(response.data)
      return response.data;
    },
    staleTime: 5 * 60 * 1000,   // ✅ ADD
    gcTime: 30 * 60 * 1000,     // ✅ ADD
    refetchOnWindowFocus: false, // ✅ ADD
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
        title: t("dashboard.donorsPage.toastSuccessTitle"),
        description: t("dashboard.donorsPage.toastDeleted"),
      });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error: any) {
      toast({
        title: t("dashboard.donorsPage.toastErrorTitle"),
        description: error.response?.data?.message || t("dashboard.donorsPage.toastDeleteErr"),
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{t("dashboard.donorsPage.title")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("dashboard.donorsPage.subtitle")}</p>
        </div>
        <Button variant="default" onClick={() => navigate("/dashboard/donors/new")} size="sm" className="text-xs sm:text-sm">
          <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t("dashboard.donorsPage.addDonor")}</span>
          <span className="sm:hidden">{t("dashboard.donorsPage.addShort")}</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">{t("dashboard.donorsPage.statsTotalDonors")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {overview ? overview?.donors?.total : '-' }
          </p>
        </div>
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">{t("dashboard.donorsPage.statsActiveDonors")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-success">
            {overview ? overview?.donors?.active?.toLocaleString() : '-' }
          </p>
        </div>
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">{t("dashboard.donorsPage.statsTotalDonated")}</p>
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
            placeholder={t("dashboard.donorsPage.searchPh")}
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
            <SelectValue placeholder={t("dashboard.donorsPage.filterPh")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.donorsPage.allTypes")}</SelectItem>
            <SelectItem value="Individual">{t("dashboard.donorsPage.individual")}</SelectItem>
            <SelectItem value="Corporate">{t("dashboard.donorsPage.corporate")}</SelectItem>
            <SelectItem value="Foundation">{t("dashboard.donorsPage.foundation")}</SelectItem>
            <SelectItem value="Organization">{t("dashboard.donorsPage.organization")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t("dashboard.donorsPage.loadErr")}
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
                <p className="text-xs text-muted-foreground">{t("dashboard.donorsPage.registered")}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  {new Date(donor.registeredAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/dashboard/donors/${donor._id}`)}
                  title={t("dashboard.donorsPage.viewDetails")}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/dashboard/donors/edit/${donor._id}`)}
                  title={t("dashboard.donorsPage.editTitle")}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(donor)}
                  title={t("dashboard.donorsPage.deleteAction")}
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
            <p className="text-muted-foreground">{t("dashboard.donorsPage.empty")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {donorsData && donorsData.pagination && donorsData.pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {t("dashboard.donorsPage.pageInfo", {
              page,
              totalPages: donorsData.pagination.totalPages,
              total: donorsData.pagination.total,
            })}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {t("dashboard.donorsPage.previous")}
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
              {t("dashboard.donorsPage.next")}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.donorsPage.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.donorsPage.deleteConfirmDesc", { name: donorToDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDonorToDelete(null)}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Donors;
