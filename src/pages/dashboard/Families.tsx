import { useState, useEffect } from "react";
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
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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

const Families = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filters
  const [filters, setFilters] = useState<FamilyFilters>({
    page: 1,
    limit: 20,
    search: "",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    incomplete: 0,
    urgent: 0,
  });

  // Fetch families
  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await familyApi.getAll(filters);
      console.log(response.data)
      setFamilies(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const verified = response.data.filter(f => f.registrationStatus === "verified").length;
      const pending = response.data.filter(f => f.registrationStatus === "pending").length;
      const incomplete = response.data.filter(f => f.registrationStatus === "incomplete").length;
      const urgent = response.data.filter(f => f.urgencyLevel === "high" || f.urgencyLevel === "critical").length;
      
      setStats({ total, verified, pending, incomplete, urgent });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch families",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FamilyFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  // Handle quick registration success
  const handleQuickRegistrationSuccess = (familyId: string, shouldAddMember: boolean) => {
    setShowQuickAddModal(false);
    fetchFamilies();
    
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
      toast({
        title: "Success",
        description: "Family verified successfully",
      });
      fetchFamilies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify family",
        variant: "destructive",
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(families.map(f => f._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle select one
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.length === 0) {
      toast({
        title: "No selection",
        description: "Please select families to update",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update each selected family
      await Promise.all(
        selectedIds.map(id => familyApi.update(id, { isVerified: status === "verified" }))
      );

      toast({
        title: "Success",
        description: `Updated ${selectedIds.length} famil${selectedIds.length === 1 ? 'y' : 'ies'}`,
      });

      setSelectedIds([]);
      fetchFamilies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update families",
        variant: "destructive",
      });
    }
  };

  // Handle bulk export
  const handleExport = () => {
    const exportData = selectedIds.length > 0
      ? families.filter(f => selectedIds.includes(f.id))
      : families;

    const csvContent = [
      ["Family Code", "Family Name", "Head of Family", "Region", "Members", "Status", "Urgency", "Created"].join(","),
      ...exportData.map(f => [
        f.familyCode,
        f.familyName,
        f.headBeneficiary?.fullName || "N/A",
        f.region || "N/A",
        f.familySize || 0,
        f.registrationStatus,
        f.urgencyLevel || "N/A",
        new Date(f.createdAt).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `families-${selectedIds.length > 0 ? 'selected-' : ''}${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    if (selectedIds.length > 0) {
      toast({
        title: "Export Complete",
        description: `Exported ${selectedIds.length} selected famil${selectedIds.length === 1 ? 'y' : 'ies'}`,
      });
    }
  };

  //handling delete
  const handleDelete = async (id: string) => {
    try {
      await familyApi.delete(id);
  
      toast({
        title: "Deleted",
        description: "Family deleted successfully",
      });
  
      fetchFamilies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete family",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Families</h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            {selectedIds.length > 0 
              ? `${selectedIds.length} selected`
              : "Manage family registrations and information"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 ? (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Export Selected</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkStatus("verified");
                  setShowBulkStatusDialog(true);
                }}
                className="text-xs sm:text-sm"
              >
                <CheckCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Verified</span>
                <span className="sm:hidden">✓</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkStatus("pending");
                  setShowBulkStatusDialog(true);
                }}
                className="text-xs sm:text-sm"
              >
                <AlertCircle className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden">⏳</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="text-xs sm:text-sm"
              >
                Clear
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQuickAddModal(true)} className="text-xs sm:text-sm">
                <Zap className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Quick Add</span>
              </Button>
              <Button onClick={() => navigate("/dashboard/families/new")} size="sm" className="text-xs sm:text-sm">
                <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Register</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2 sm:pb-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-3 sm:h-4 w-3 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2 sm:pb-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2 sm:pb-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Incomplete</CardTitle>
            <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="pb-2 sm:pb-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.incomplete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-3 sm:h-4 w-3 sm:w-4 text-red-500" />
          </CardHeader>
          <CardContent className="pb-2 sm:pb-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.urgent}</div>
          </CardContent>
        </Card>
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
                value={filters.registrationCompleted === undefined ? "all" : filters.registrationCompleted ? "true" : "false"}
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
          <CardTitle className="text-lg sm:text-xl">Families ({families.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-sm">Loading...</div>
          ) : families.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No families found. Register your first family to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 sm:w-12">
                      <Checkbox
                        checked={selectedIds.length === families.length && families.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm">Code</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Family Name</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Head</TableHead>
                    <TableHead className="text-xs sm:text-sm">Members</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Urgency</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Registered</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {families.map((family) => (
                  <TableRow key={family._id} className="text-xs sm:text-sm">
                    <TableCell className="p-2 sm:p-4">
                      <Checkbox
                        checked={selectedIds.includes(family._id)}
                        onCheckedChange={(checked) => handleSelectOne(family._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium p-2 sm:p-4">{family.familyCode}</TableCell>
                    <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                      <div className="flex items-center gap-2 truncate">
                        {family.familyName}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell p-2 sm:p-4 truncate">{family.familyHead || "N/A"}</TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <Badge variant="secondary" className="text-xs">{family.members.length || 0}</Badge>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <RegistrationStatusBadge status={family.registrationStatus} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell p-2 sm:p-4">
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
                    </TableCell>
                    <TableCell className="hidden md:table-cell p-2 sm:p-4 text-xs">
                      {new Date(family.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right p-2 sm:p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-3 sm:h-4 w-3 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-sm">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}`)}>
                            <Eye className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}/edit`)}>
                            <Edit className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                            Edit Family
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}/edit?focus=members`)}>
                            <UserPlus className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                            Add Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/families/${family._id}?action=support`)}>
                            <Zap className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                            Record Support
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {family.registrationStatus !== "verified" && (
                            <DropdownMenuItem onClick={() => handleVerify(family._id)}>
                              <UserCheck className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                              Verify Family
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(family._id)} className="text-red-600">
                            <Trash2 className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                            Delete Family
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <QuickFamilyRegistrationModal
        open={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSuccess={handleQuickRegistrationSuccess}
      />

      {/* Bulk Status Update Confirmation Dialog */}
      <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {selectedIds.length} famil{selectedIds.length === 1 ? 'y' : 'ies'} 
              to status: <strong className="capitalize">{bulkStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              handleBulkStatusUpdate(bulkStatus);
              setShowBulkStatusDialog(false);
            }}>
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Families;
