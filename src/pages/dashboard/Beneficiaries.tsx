import { useState, useEffect } from "react";
import { beneficiaryApi } from "@/services/api.service";
import { Beneficiary, BeneficiaryFilters } from "@/types/api";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  User,
  UserCheck,
  Users,
  Baby,
  AlertCircle,
  Eye,
  Edit,
  CheckCircle,
  FileText,
  MoreVertical,
  Download,
  Filter,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FamilySearchModal from "./components/FamilySearchModal";
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

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilySearchModal, setShowFamilySearchModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filters
  const [filters, setFilters] = useState<BeneficiaryFilters>({
    page: 1,
    limit: 20,
    search: "",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    children: 0,
    orphans: 0,
    verified: 0,
    pending: 0,
  });

  // Fetch beneficiaries
  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryApi.getAll(filters);
      setBeneficiaries(response.data.data);
      
      // Calculate stats
      const total = response.data.pagination.total;
      const children = response.data.data.filter(b => (b.age || 0) < 18).length;
      const orphans = response.data.data.filter(b => b.isOrphan).length;
      const verified = response.data.data.filter(b => b.verificationStatus === "verified").length;
      const pending = response.data.data.filter(b => b.verificationStatus === "pending").length;
      
      setStats({ total, children, orphans, verified, pending });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch beneficiaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  // Handle filter change
  const handleFilterChange = (key: keyof BeneficiaryFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  // Handle add/edit - Now shows family search first
  const handleAddNew = () => {
    setShowFamilySearchModal(true);
  };

  // Handle family selected from search
  const handleFamilySelected = (familyId: string) => {
    setShowFamilySearchModal(false);
    navigate(`/dashboard/beneficiaries/new?familyId=${familyId}`);
  };

  // Handle skip family search
  const handleSkipFamilySearch = () => {
    setShowFamilySearchModal(false);
    navigate("/dashboard/beneficiaries/new");
  };

  // Handle verify
  const handleVerify = async (id: string) => {
    try {
      await beneficiaryApi.update(id, { verificationStatus: "verified" });
      toast({
        title: "Success",
        description: "Beneficiary verified successfully",
      });
      fetchBeneficiaries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify beneficiary",
        variant: "destructive",
      });
    }
  };

  // Handle bulk export
  const handleExport = () => {
    const csvContent = [
      ["Name", "Age", "Gender", "Family", "Orphan", "Status", "Created"].join(","),
      ...beneficiaries.map(b => [
        b.fullName,
        b.age || "N/A",
        b.gender || "N/A",
        b.family?.familyName || "N/A",
        b.isOrphan ? "Yes" : "No",
        b.verificationStatus,
        new Date(b.createdAt).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beneficiaries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Calculate age from date of birth
  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(beneficiaries.map(b => b.id));
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
        description: "Please select beneficiaries to update",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update each selected beneficiary
      await Promise.all(
        selectedIds.map(id => beneficiaryApi.update(id, { verificationStatus: status }))
      );

      toast({
        title: "Success",
        description: `Updated ${selectedIds.length} beneficiar${selectedIds.length === 1 ? 'y' : 'ies'}`,
      });

      setSelectedIds([]);
      fetchBeneficiaries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update beneficiaries",
        variant: "destructive",
      });
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    const exportData = selectedIds.length > 0
      ? beneficiaries.filter(b => selectedIds.includes(b.id))
      : beneficiaries;

    const csvContent = [
      ["Name", "Age", "Gender", "Family", "Orphan", "Status", "Created"].join(","),
      ...exportData.map(b => [
        b.fullName,
        b.age || calculateAge(b.dateOfBirth) || "N/A",
        b.gender || "N/A",
        b.family?.familyName || "N/A",
        b.isOrphan ? "Yes" : "No",
        b.verificationStatus,
        new Date(b.createdAt).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beneficiaries-${selectedIds.length > 0 ? 'selected-' : ''}${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    if (selectedIds.length > 0) {
      toast({
        title: "Export Complete",
        description: `Exported ${selectedIds.length} selected beneficiar${selectedIds.length === 1 ? 'y' : 'ies'}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Beneficiaries</h1>
          <p className="text-muted-foreground">
            {selectedIds.length > 0 
              ? `${selectedIds.length} selected`
              : "Manage and track beneficiary information"}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 ? (
            <>
              <Button variant="outline" onClick={handleBulkExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Selected ({selectedIds.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkStatus("verified");
                  setShowBulkStatusDialog(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Verified
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkStatus("pending");
                  setShowBulkStatusDialog(true);
                }}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Mark as Pending
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBulkExport}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Beneficiary
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.children}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orphans</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orphans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={filters.verificationStatus || "all"}
              onValueChange={(value) => 
                handleFilterChange("verificationStatus", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
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
              value={filters.isOrphan === undefined ? "all" : filters.isOrphan ? "true" : "false"}
              onValueChange={(value) => 
                handleFilterChange("isOrphan", value === "all" ? undefined : value === "true")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Orphan Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Orphans Only</SelectItem>
                <SelectItem value="false">Non-Orphans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Beneficiaries ({beneficiaries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : beneficiaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No beneficiaries found. Add your first beneficiary to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === beneficiaries.length && beneficiaries.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Orphan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(beneficiary.id)}
                        onCheckedChange={(checked) => handleSelectOne(beneficiary.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      {beneficiary.photoUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                          <img 
                            src={beneficiary.photoUrl} 
                            alt={beneficiary.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-primary/20">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{beneficiary.fullName}</TableCell>
                    <TableCell>
                      {beneficiary.age || calculateAge(beneficiary.dateOfBirth) || "N/A"}
                    </TableCell>
                    <TableCell>{beneficiary.gender || "N/A"}</TableCell>
                    <TableCell>{beneficiary.family?.familyName || "N/A"}</TableCell>
                    <TableCell>
                      {beneficiary.isOrphan ? (
                        <Badge variant="destructive">{beneficiary.orphanType || "Yes"}</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          beneficiary.verificationStatus === "verified"
                            ? "default"
                            : beneficiary.verificationStatus === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {beneficiary.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(beneficiary.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/beneficiaries/${beneficiary.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/beneficiaries/${beneficiary.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {beneficiary.verificationStatus !== "verified" && (
                            <DropdownMenuItem onClick={() => handleVerify(beneficiary.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Verified
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/beneficiaries/${beneficiary.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Support History
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
      <FamilySearchModal
        open={showFamilySearchModal}
        onClose={() => setShowFamilySearchModal(false)}
        onFamilySelected={handleFamilySelected}
        onSkip={handleSkipFamilySearch}
      />

      {/* Bulk Status Update Confirmation Dialog */}
      <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {selectedIds.length} beneficiar{selectedIds.length === 1 ? 'y' : 'ies'} 
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

export default Beneficiaries;
