

// export default Families;
import { useState, useMemo } from "react";
import { familyApi } from "@/services/api.service";
import { Family, FamilyFilters } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Users,
  AlertCircle,
  UserCheck,
  Clock,
  Eye,
  Edit,
  UserPlus,
  MoreVertical,
  Download,
  Zap,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuickFamilyRegistrationModal from "./components/QuickFamilyRegistrationModal";
import RegistrationStatusBadge from "@/components/RegistrationStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api.service";

const Families = () => {
  const { t } = useTranslation();
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters
  const [filters, setFilters] = useState<FamilyFilters>({
    page: 1,
    limit: 20,
    search: "",
  });

  // ✅ React Query — cached, no refetch on nav
  const { data: families = [], isLoading: loading } = useQuery({
    queryKey: ["families", filters],
    queryFn: async () => {
      const response = await familyApi.getAll(filters);
      console.log(response)
      return response?.data[0];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ Overview stats from dashboard endpoint (not page-scoped)
  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(
    () => ({
      total: overview?.families?.total ?? families?.pagination?.total ?? 0,
      verified: overview?.families?.verified ?? 0,
      pending: overview?.families?.pending ?? 0,
      incomplete: overview?.families?.incomplete ?? 0,
      urgent: overview?.families?.urgent ?? 0,
    }),
    [overview, families]
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["families"] });

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FamilyFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  // Handle quick registration success
  const handleQuickRegistrationSuccess = (
    familyId: string,
    shouldAddMember: boolean
  ) => {
    setShowQuickAddModal(false);
    invalidate();
    if (shouldAddMember) {
      navigate(`/dashboard/families/${familyId}/edit?focus=members`);
    } else {
      navigate(`/dashboard/families/${familyId}`);
    }
  };

  // Handle verify
  const handleVerify = async (id: string) => {
    try {
      await familyApi.update(id, { isVerified: true });
      toast({ title: "Success", description: "Family verified successfully" });
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastVerifyErr"),
        variant: "destructive",
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? families?.data?.map((f) => f._id) : []);
  };

  // Handle select one
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.length === 0) {
      toast({
        title: t("dashboard.familiesPage.toastNoSelection"),
        description: t("dashboard.familiesPage.toastSelectFirst"),
        variant: "destructive",
      });
      return;
    }
    try {
      await Promise.all(
        selectedIds.map((id) =>
          familyApi.update(id, { isVerified: status === "verified" })
        )
      );
      toast({
        title: t("common.success"),
        description:
          selectedIds.length === 1
            ? t("dashboard.familiesPage.toastBulkOkOne")
            : t("dashboard.familiesPage.toastBulkOk", { count: selectedIds.length }),
      });
      setSelectedIds([]);
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastBulkErr"),
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = () => {
    const exportData =
      selectedIds.length > 0
        ? families?.data?.filter((f) => selectedIds.includes(f._id))
        : families?.data;

    const csvContent = [
      ["Family Code","Family Name","Head of Family","Region","Members","Status","Urgency","Created"].join(","),
      ...exportData.map((f) =>
        [
          f.familyCode,
          f.familyName,
          f.headBeneficiary?.fullName || "N/A",
          f.region || "N/A",
          f.familySize || 0,
          f.registrationStatus,
          f.urgencyLevel || "N/A",
          new Date(f.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `families-${selectedIds.length > 0 ? "selected-" : ""}${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    if (selectedIds.length > 0) {
      toast({
        title: t("dashboard.familiesPage.toastExport"),
        description:
          selectedIds.length === 1
            ? t("dashboard.familiesPage.toastExportOne")
            : t("dashboard.familiesPage.toastExportSelected", { count: selectedIds.length }),
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await familyApi.delete(id);
      toast({
        title: t("common.deleted"),
        description: t("dashboard.familiesPage.toastDeleted"),
      });
      invalidate();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || t("dashboard.familiesPage.toastDeleteErr"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {t("dashboard.familiesPage.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {selectedIds.length > 0
              ? t("dashboard.familiesPage.selected", { count: selectedIds.length })
              : t("dashboard.familiesPage.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {selectedIds.length > 0 ? (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{t("common.export")}</span>
                <span className="sm:hidden">{t("common.export")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkStatus("verified"); setShowBulkStatusDialog(true); }}
                className="text-xs sm:text-sm"
              >
                <CheckCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{t("dashboard.registrationStatus.verified")}</span>
                <span className="sm:hidden">✓</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setBulkStatus("pending"); setShowBulkStatusDialog(true); }}
                className="text-xs sm:text-sm"
              >
                <AlertCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{t("dashboard.registrationStatus.pending")}</span>
                <span className="sm:hidden">⏳</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="text-xs sm:text-sm">
                {t("common.cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{t("common.export")}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQuickAddModal(true)} className="text-xs sm:text-sm">
                <Zap className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{t("common.add")}</span>
              </Button>
              <Button onClick={() => navigate("/dashboard/families/new")} size="sm" className="text-xs sm:text-sm">
                <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{t("dashboard.familiesPage.title")}</span>
                <span className="sm:hidden">{t("common.add")}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 sm:gap-y-5">
        {[
          { label: "Total",      value: stats.total,      icon: <Users className="h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" /> },
          { label: "Verified",   value: stats.verified,   icon: <UserCheck className="h-3 sm:h-4 w-3 sm:w-4 text-green-500" /> },
          { label: "Pending",    value: stats.pending,    icon: <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-orange-500" /> },
          { label: "Incomplete", value: stats.incomplete, icon: <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-500" /> },
          { label: "Urgent",     value: stats.urgent,     icon: <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row p-0 pt-4 px-6 pb-1.5 items-center justify-between space-y-0 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{label}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent className="pl-7 pb-2 sm:pb-4">
              <div className="text-xl sm:text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search families..."
                  className="pl-10 text-sm"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Select
                value={filters.registrationStatus || "all"}
                onValueChange={(value) =>
                  handleFilterChange("registrationStatus", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.urgencyLevel || "all"}
                onValueChange={(value) =>
                  handleFilterChange("urgencyLevel", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.registrationCompleted === undefined
                    ? "all"
                    : filters.registrationCompleted
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  handleFilterChange("registrationCompleted", value === "all" ? undefined : value === "true")
                }
              >
                <SelectTrigger className="text-sm col-span-2 sm:col-span-1">
                  <SelectValue placeholder="Registration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Complete</SelectItem>
                  <SelectItem value="false">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Families Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            {t("dashboard.familiesPage.title")} ({families?.data?.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-sm">{t("dashboard.familiesPage.loading")}</div>
          ) : families?.data?.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("dashboard.familiesPage.empty")}
            </div>
          ) : (
            <>
              {/* TABLE VIEW (770px and above) */}
              <div className="hidden min-[770px]:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.length === families?.data?.length && families?.data?.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs hidden min-[850px]:table-cell">Family Name</TableHead>
                      <TableHead className="text-xs hidden min-[925px]:table-cell">Head</TableHead>
                      <TableHead className="text-xs">Members</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden min-[1152px]:table-cell">Urgency</TableHead>
                      <TableHead className="text-xs hidden min-[925px]:table-cell">Registered</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {families?.data?.map((family) => (
                      <TableRow key={family._id} className="text-xs">
                        <TableCell className="p-2 pl-4">
                          <Checkbox
                            checked={selectedIds.includes(family._id)}
                            onCheckedChange={(checked) => handleSelectOne(family._id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium p-2">{family.familyCode}</TableCell>
                        <TableCell className="hidden min-[850px]:table-cell p-2">
                          <div className="truncate max-w-[200px]">{family.familyName}</div>
                        </TableCell>
                        <TableCell className="hidden min-[925px]:table-cell p-2">
                          <div className="truncate max-w-[170px]">{family.familyHead || t("common.na")}</div>
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge variant="secondary" className="text-xs">
                            {family?.members?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2">
                          <RegistrationStatusBadge status={family.registrationStatus} />
                        </TableCell>
                        <TableCell className="hidden min-[1152px]:table-cell p-2">
                          <Badge
                            variant={
                              family.urgencyLevel === "high"
                                ? "destructive"
                                : family.urgencyLevel === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize text-xs"
                          >
                            {family.urgencyLevel || t("common.na")}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden min-[925px]:table-cell p-2 text-xs">
                          {new Date(family.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <FamilyActionsMenu
                            family={family}
                            onVerify={handleVerify}
                            onDelete={handleDelete}
                            navigate={navigate}
                            t={t}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* CARD VIEW (below 770px) */}
              <div className="min-[770px]:hidden space-y-3 p-3">
                {families?.data?.map((family) => (
                  <Card key={family._id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedIds.includes(family._id)}
                            onCheckedChange={(checked) => handleSelectOne(family._id, checked as boolean)}
                          />
                          <p className="font-semibold text-sm truncate">{family.familyName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">Code: {family.familyCode}</p>
                        <p className="text-xs text-muted-foreground truncate">Head: {family.familyHead || "N/A"}</p>
                      </div>
                      <FamilyActionsMenu
                        family={family}
                        onVerify={handleVerify}
                        onDelete={handleDelete}
                        navigate={navigate}
                        t={t}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        Members: {family?.members?.length || 0}
                      </Badge>
                      <RegistrationStatusBadge status={family.registrationStatus} />
                      <Badge
                        variant={
                          family.urgencyLevel === "high"
                            ? "destructive"
                            : family.urgencyLevel === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize text-xs"
                      >
                        {family.urgencyLevel || "N/A"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Registered: {new Date(family.createdAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <QuickFamilyRegistrationModal
        open={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSuccess={handleQuickRegistrationSuccess}
      />

      {/* Bulk Status Update Dialog */}
      <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {selectedIds.length} famil
              {selectedIds.length === 1 ? "y" : "ies"} to status:{" "}
              <strong className="capitalize">{bulkStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkStatusUpdate(bulkStatus);
                setShowBulkStatusDialog(false);
              }}
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ── Extracted to avoid re-creating the dropdown JSX twice ──────────────────
const FamilyActionsMenu = ({
  family,
  onVerify,
  onDelete,
  navigate,
  t,
}: {
  family: Family;
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
  t: (key: string) => string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="text-sm">
      <DropdownMenuLabel>{t("dashboard.familiesPage.actionsLabel")}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}`)}>
        <Eye className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.viewProfile")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}/edit`)}>
        <Edit className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.editFamily")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}/edit?focus=members`)}>
        <UserPlus className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.addMember")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}?action=support`)}>
        <Zap className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.recordSupport")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {family.registrationStatus !== "verified" && (
        <DropdownMenuItem onClick={() => onVerify(family._id)}>
          <UserCheck className="mr-2 h-4 w-4" />
          {t("dashboard.familiesPage.verifyFamily")}
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => onDelete(family._id)} className="text-red-600">
        <Trash2 className="mr-2 h-4 w-4" />
        {t("dashboard.familiesPage.deleteFamily")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Families;
