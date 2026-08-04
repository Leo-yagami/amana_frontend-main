// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign, Calendar, User, ArrowUpDown } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { donationApi, dashboardApi } from "@/services/api.service";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import  DonationTrendsChart  from "@/pages/dashboard/reports/monthlyDonations";

// const Donations = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit] = useState(12);
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [donationToDelete, setDonationToDelete] = useState<any>(null);
//   const [trendRange, setTrendRange] = useState<"3m" | "6m" | "1y">("6m");

//   const { toast } = useToast();
//   const queryClient = useQueryClient();
  
//   const { data: donationsData, isLoading, error } = useQuery({
//     queryKey: ['donations', { search: searchQuery, page, limit, status: statusFilter, type: typeFilter }],
//     queryFn: async () => {
//       const params: any = { page, limit };
//       if (searchQuery) params.search = searchQuery;
//       if (statusFilter !== "all") params.status = statusFilter;
//       if (typeFilter !== "all") params.donationType = typeFilter;
//       const response = await donationApi.getAll(params);
//       return response;
//     },
//   });

//   const { data: overview } = useQuery({
//     queryKey: ['dashboard', 'overview'],
//     queryFn: async () => {
//       const response = await dashboardApi.getOverview();
//       console.log(response)
//       return response.data;
//     },
//   });

//   const handleDeleteClick = (donation: any) => {
//     setDonationToDelete(donation);
//     setDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!donationToDelete) return;

//     try {
//       await donationApi.delete(donationToDelete._id);
//       toast({
//         title: "Success",
//         description: "Donation deleted successfully",
//       });
//       queryClient.invalidateQueries({ queryKey: ['donations'] });
//       queryClient.invalidateQueries({ queryKey: ['dashboard'] });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to delete donation",
//         variant: "destructive",
//       });
//     } finally {
//       setDeleteDialogOpen(false);
//       setDonationToDelete(null);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "received":
//         return "bg-success/10 text-success border-success/20";
//       case "pledged":
//         return "bg-warning/10 text-warning border-warning/20";
//       case "processing":
//         return "bg-info/10 text-info border-info/20";
//       default:
//         return "bg-muted text-muted-foreground border-muted";
//     }
//   };

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case "monetary":
//         return "bg-primary/10 text-primary border-primary/20";
//       case "in_kind":
//         return "bg-accent/10 text-accent border-accent/20";
//       default:
//         return "bg-muted text-muted-foreground border-muted";
//     }
//   };

//   const getTypeLabel = (type: string) => {
//     switch (type) {
//       case "monetary":
//         return "Money";
//       case "in_kind":
//         return "In-Kind";
//       default:
//         return type;
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     return status === "pledged" ? "Promised" : status.charAt(0).toUpperCase() + status.slice(1);
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(amount);
//   };

//   const formatDate = (date: string) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   //helper function to calculate the last N months
//   const getLastNMonths = async (n: number) => {
//     const months = [];
//     const values = [];
  
//     const now = new Date();
  
//     for (let i = n - 1; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
  
//       const label = date.toLocaleString("en-US", { month: "short" });
  
//       months.push(label);
  
//       // fake value logic for now (replace with backend later)
//       //making a separate route just to get the monthly data
//       values.push(Math.floor(4000 + Math.random() * 6000));
//     }
//     console.log("MONTHS", months)
//     const monthResponse = await donationApi.getMonth(months);
//     return { months, values };
//   };

//   const trendData = {
//     "3m": getLastNMonths(3),
//     "6m": getLastNMonths(6),
//     "1y": getLastNMonths(12),
//   }[trendRange];

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
//         <div className="min-w-0">
//           <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Donations</h1>
//           <p className="text-xs sm:text-sm text-muted-foreground truncate">Track and manage all contributions</p>
//         </div>
//         <Button variant="default" onClick={() => navigate("/dashboard/donations/new")} size="sm" className="text-xs sm:text-sm">
//           <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
//           <span className="hidden sm:inline">Record Donation</span>
//           <span className="sm:hidden">Add</span>
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       {overview && (
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {formatCurrency(overview?.donations?.totalAmount || 0)}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {overview?.donations?.totalCount || 0} donations
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">This Month</CardTitle>
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {formatCurrency(overview?.donations?.monthlyAmount || 0)}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Current month contributions
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
//               <User className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {overview?.donors?.active.toLocaleString() || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Donated this month
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//       {/** chart section */}
//       {/* Donation Trend Card */}
      
//       <Card>
//         <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-6">
//           <div className="min-w-0">
//             <CardTitle className="text-lg sm:text-xl">Donation Trend</CardTitle>
//             <CardDescription className="text-xs sm:text-sm">
//               Monthly Contribution analysis
//             </CardDescription>
//           </div>

//           <Select value={trendRange} onValueChange={(v: any) => setTrendRange(v)}>
//             <SelectTrigger className="w-full sm:w-[160px] text-sm">
//               <SelectValue placeholder="Time range" />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value="3m">Last 3 months</SelectItem>
//               <SelectItem value="6m">Last 6 months</SelectItem>
//               <SelectItem value="1y">Last year</SelectItem>
//             </SelectContent>
//           </Select>
//         </CardHeader>

//         <CardContent className="p-3 sm:p-6">
//           <div className="h-64 sm:h-80 lg:h-[330px] w-full">
//             <DonationTrendsChart
//               values={trendData.values}
//               labels={trendData.months}
//             />
//           </div>
//         </CardContent>
//       </Card>
//       {/* Filters */}
//       <div className="flex flex-col gap-3 sm:gap-4">
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm">
//           <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
//           <input
//             type="text"
//             placeholder="Search donations..."
//             value={searchQuery}
//             onChange={(e) => {
//               setSearchQuery(e.target.value);
//               setPage(1);
//             }}
//             className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
//           />
//         </div>
//         <div className="grid grid-cols-2 gap-2 sm:gap-4">
//           <Select
//             value={statusFilter}
//             onValueChange={(value) => {
//               setStatusFilter(value);
//               setPage(1);
//             }}
//           >
//             <SelectTrigger className="text-sm">
//               <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="received">Received</SelectItem>
//               <SelectItem value="pledged">Promised</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select
//             value={typeFilter}
//             onValueChange={(value) => {
//               setTypeFilter(value);
//               setPage(1);
//             }}
//           >
//             <SelectTrigger className="text-sm">
//               <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
//               <SelectValue placeholder="Type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="monetary">Money</SelectItem>
//               <SelectItem value="in_kind">In-Kind</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Donations Table */}
//       <Card>
//         <CardContent className="p-0 overflow-x-auto">
//           <Table className="min-w-full">
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="text-xs sm:text-sm w-24 sm:w-[140px]">Reference</TableHead>
//                 <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Donor</TableHead>
//                 <TableHead className="text-xs sm:text-sm w-16 sm:w-[120px]">Type</TableHead>
//                 <TableHead className="text-xs sm:text-sm w-20 sm:w-[130px] text-right">Amount</TableHead>
//                 <TableHead className="text-xs sm:text-sm w-16 sm:w-[110px]">Status</TableHead>
//                 <TableHead className="text-xs sm:text-sm hidden md:table-cell w-24 sm:w-[120px]">Date</TableHead>
//                 <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Allocated To</TableHead>
//                 <TableHead className="text-xs sm:text-sm w-16 sm:w-[120px] text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isLoading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <TableRow key={i}>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                     <TableCell><Skeleton className="h-4 w-full" /></TableCell>
//                   </TableRow>
//                 ))
//               ) : error ? (
//                 <TableRow>
//                   <TableCell colSpan={8}>
//                     <Alert variant="destructive">
//                       <AlertDescription>
//                         Failed to load donations. Please try again.
//                       </AlertDescription>
//                     </Alert>
//                   </TableCell>
//                 </TableRow>
//               ) : donationsData && donationsData.data.length > 0 ? (
//                 donationsData.data.map((donation: any) => (
//                   <TableRow 
//                     key={donation._id}
//                     className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
//                     onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
//                   >
//                     <TableCell className="font-medium font-mono text-xs sm:text-sm p-2 sm:p-4">
//                       {donation.donationReference.substring(0, 10)}
//                     </TableCell>
//                     <TableCell className="hidden sm:table-cell p-2 sm:p-4">
//                       <div className="flex items-center gap-2 truncate">
//                         <User className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground flex-shrink-0" />
//                         <span className="font-medium text-xs sm:text-sm truncate">
//                           {donation.donorName || "Anonymous"}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="p-2 sm:p-4">
//                       <Badge variant="outline" className={`${getTypeColor(donation.donationType)} text-xs`}>
//                         {getTypeLabel(donation.donationType)}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right font-semibold text-xs sm:text-sm p-2 sm:p-4">
//                       {donation.donationType === "monetary" 
//                         ? formatCurrency(Number(donation.amount || 0))
//                         : "-"}
//                     </TableCell>
//                     <TableCell className="p-2 sm:p-4">
//                       <Badge variant="outline" className={`${getStatusColor(donation.status)} text-xs`}>
//                         {getStatusLabel(donation.status)}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="hidden md:table-cell text-xs text-muted-foreground p-2 sm:p-4">
//                       {formatDate(donation.receivedAt)}
//                     </TableCell>
//                     <TableCell className="hidden lg:table-cell p-2 sm:p-4">
//                       <div className="text-xs sm:text-sm truncate">
//                         {donation.family && (
//                           <span className="text-foreground">{donation.family.familyName}</span>
//                         )}
//                         {donation.event && (
//                           <span className="text-foreground">{donation.event.title}</span>
//                         )}
//                         {donation.beneficiary && (
//                           <span className="text-foreground">{donation.beneficiary.fullName}</span>
//                         )}
//                         {!donation.family && !donation.event && !donation.beneficiary && (
//                           <span className="text-muted-foreground">General</span>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell className="p-2 sm:p-4">
//                       <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
//                           title="View Details"
//                           className="h-8 w-8 p-0"
//                         >
//                           <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => navigate(`/dashboard/donations/edit/${donation._id}`)}
//                           title="Edit"
//                           className="h-8 w-8 p-0"
//                         >
//                           <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => handleDeleteClick(donation)}
//                           title="Delete"
//                           className="text-destructive hover:text-destructive h-8 w-8 p-0"
//                         >
//                           <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
//                     No donations found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Pagination */}
//       {donationsData && donationsData.pagination && donationsData.pagination.totalPages > 1 && (
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
//           <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
//             Page {page} of {donationsData.pagination.totalPages} ({donationsData.pagination.total} total)
//           </p>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage(page - 1)}
//               disabled={page === 1}
//             >
//               Previous
//             </Button>
//             <div className="flex items-center gap-1">
//               {Array.from({ length: Math.min(5, donationsData.pagination.totalPages) }, (_, i) => {
//                 let pageNum;
//                 if (donationsData.pagination.totalPages <= 5) {
//                   pageNum = i + 1;
//                 } else if (page <= 3) {
//                   pageNum = i + 1;
//                 } else if (page >= donationsData.pagination.totalPages - 2) {
//                   pageNum = donationsData.pagination.totalPages - 4 + i;
//                 } else {
//                   pageNum = page - 2 + i;
//                 }
//                 return (
//                   <Button
//                     key={i}
//                     variant={page === pageNum ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setPage(pageNum)}
//                   >
//                     {pageNum}
//                   </Button>
//                 );
//               })}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage(page + 1)}
//               disabled={page === donationsData.pagination.totalPages}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Donation</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this donation? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={() => setDonationToDelete(null)}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDeleteConfirm}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default Donations;


//CLAUDE DEBUT!!!!!!!!
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign, Calendar, User, ArrowUpDown, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FamilyClassificationBadge from "@/components/FamilyClassificationBadge";
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
import { Input } from "@/components/ui/input";
import { exportDonationsPdf } from "@/lib/exportDonationPdf";
import  DonationTrendsChart  from "@/pages/dashboard/reports/monthlyDonations";

const Donations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<any>(null);
  const [trendRange, setTrendRange] = useState<"month" | "3m" | "6m" | "1y">("6m");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: donationsData, isLoading, error } = useQuery({
    queryKey: ['donations', { search: searchQuery, page, limit, status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      const params: any = { page, limit };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.donationType = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await donationApi.getAll(params);
      // console.log("CHART DATA", response)
      return response;
    },
    staleTime: 30 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      // console.log(response)
      return response.data;
    },
    staleTime: 5 * 60 * 1000,  // ✅ ADD
    gcTime: 30 * 60 * 1000,    // ✅ ADD
    refetchOnWindowFocus: false, // ✅ ADD
  });

  const { data: pledgedDonations } = useQuery({
    queryKey: ['donations', 'pledged', 'stats'],
    queryFn: async () => {
      const response = await donationApi.getAll({ page: 1, limit: 10000, status: 'pledged' });
      return response?.data[0]?.data || [];
    },
    staleTime: 30 * 1000,
  });

  const promisedMonetaryAmount = pledgedDonations
    ?.filter((d: any) => d.donationType === 'monetary')
    ?.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0) || 0;
  const promisedCount = pledgedDonations?.length || 0;

  const receivedMonetaryAmount = (overview?.donations?.totalAmount || 0) - promisedMonetaryAmount;
  const receivedTotalCount = (overview?.donations?.totalCount || 0) - promisedCount;

  const handleDeleteClick = (donation: any) => {
    setDonationToDelete(donation);
    setDeleteDialogOpen(true);
  };

  // Export the currently filtered set (search + status + type + date range) as a PDF.
  // The module converts the already-filtered list — it does not re-filter.
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const params: any = { page: 1, limit: 10000 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.donationType = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await donationApi.getAll(params);
      const all: any[] = response?.data?.[0]?.data || [];

      const filters: string[] = [];
      if (searchQuery) filters.push(`Search: "${searchQuery}"`);
      if (statusFilter !== "all") filters.push(`Status: ${statusFilter}`);
      if (typeFilter !== "all") filters.push(`Type: ${typeFilter}`);

      exportDonationsPdf(all, {
        dateRange: { start: startDate || undefined, end: endDate || undefined },
        filters,
      });
    } catch (error: any) {
      toast({
        title: t("dashboard.donationsPage.exportErrTitle"),
        description: error?.response?.data?.message || t("dashboard.donationsPage.exportErrDesc"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!donationToDelete) return;

    try {
      await donationApi.delete(donationToDelete._id);
      toast({
        title: t("dashboard.donationsPage.toastDeletedTitle"),
        description: t("dashboard.donationsPage.toastDeletedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error: any) {
      toast({
        title: t("dashboard.donationsPage.toastDeleteErrTitle"),
        description: error.response?.data?.message || t("dashboard.donationsPage.toastDeleteErrDesc"),
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
        return t("dashboard.donationsPage.typeMonetary");
      case "in_kind":
        return t("dashboard.donationsPage.typeInKind");
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pledged":
        return t("dashboard.donationsPage.statusPromised");
      case "received":
        return t("dashboard.donationsPage.statusReceived");
      case "processing":
        return t("dashboard.donationsPage.statusProcessing");
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  //helper function to calculate the last N months
  // const getLastNMonths = async (n: number) => {
  //   const months = [];
  //   const values = [];
  
  //   const now = new Date();
  
  //   for (let i = n - 1; i >= 0; i--) {
  //     const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
  
  //     const label = date.toLocaleString("en-US", { month: "short" });
  
  //     months.push(label);
  
  //     // fake value logic for now (replace with backend later)
  //     //making a separate route just to get the monthly data
  //     values.push(Math.floor(4000 + Math.random() * 6000));
  //   }
  //   console.log("MONTHS", months)
  //   const monthResponse = await donationApi.getMonth(months);
  //   return { months, values };
  // };

  // const trendData = {
  //   "3m": getLastNMonths(3),
  //   "6m": getLastNMonths(6),
  //   "1y": getLastNMonths(12),
  // }[trendRange];
  const fetchTrendData = async (range: "month" | "3m" | "6m" | "1y") => {
  if (range === "month") {
    const res = await dashboardApi.getAnalytics({ range: "month" });
    const data = res.data?.analytics ?? res.data;
    return {
      months: data?.monthlyTrends?.labels || [],
      values: data?.monthlyTrends?.values || [],
    };
  }

  const n = range === "3m" ? 3 : range === "6m" ? 6 : 12;

  const months: string[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleString("en-US", { month: "short" }));
  }

  const monthResponse = await donationApi.getMonth(months);

  return {
    months,
    values: monthResponse?.data || [],
  };
};

const { data: trendData, isLoading: trendLoading } = useQuery({
  queryKey: ["donations", "trend", trendRange],
  queryFn: () => fetchTrendData(trendRange),
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
});

  // ─── Reference label ─────────────────────────────────────────────────────
  // For Chapa donations we don't surface the payment reference in the table;
  // instead we show a truncated donation id with a DON- prefix.
  const getReferenceLabel = (donation: any) => {
    const isChapa =
      donation?.source === "chapa" ||
      donation?.receiptType === "chapa" ||
      (typeof donation?.receiptUrl === "string" && donation.receiptUrl.startsWith("http"));
    if (isChapa) return `DON-${String(donation?._id || "").slice(0, 8)}`;
    return (donation?.donationReference || "").substring(0, 10);
  };

  // ─── Donation Card (shown below sm breakpoint) ───────────────────────────
  const DonationCard = ({ donation }: { donation: any }) => (
    <div
      className="bg-card border border-border rounded-lg p-3 min-[400px]:p-4 space-y-3 cursor-pointer hover:bg-muted/40 transition-colors"
      onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
    >
      {/* Row 1: ref + amount */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <span className="font-mono text-xs text-muted-foreground leading-tight">
          {getReferenceLabel(donation)}
        </span>
        <span className="font-semibold text-sm text-foreground shrink-0">
          {donation.donationType === "monetary"
            ? formatCurrency(Number(donation.amount || 0))
            : "—"}
        </span>
      </div>

      {/* Row 2: donor name */}
      <div className="flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {donation.donorName || t("dashboard.donationsPage.anonymous")}
        </span>
      </div>

      {/* Row 3: badges + date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`${getTypeColor(donation.donationType)} text-[10px] px-1.5 py-0`}>
            {getTypeLabel(donation.donationType)}
          </Badge>
          <Badge variant="outline" className={`${getStatusColor(donation.status)} text-[10px] px-1.5 py-0`}>
            {getStatusLabel(donation.status)}
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {formatDate(donation.receivedAt)}
        </span>
      </div>

      {/* Row 4: classification + allocated to */}
      <div className="text-[11px] text-muted-foreground border-t border-border pt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex gap-1 items-center justify-start">
          {t("dashboard.donationsPage.classificationLabel")}{" "}
          {donation.familyClassification  ? (
            <FamilyClassificationBadge classification={donation.familyClassification} t={t} short />
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0">
              {t("dashboard.classifications.none")}
            </Badge>
          )}
        </span>
        {(donation.family || donation.event || donation.beneficiary) && (
          <span>
            {t("dashboard.donationsPage.allocatedTo")}{" "}
            <span className="text-foreground font-medium">
              {donation.family?.familyName ||
                donation.event?.title ||
                donation.beneficiary?.fullName}
            </span>
          </span>
        )}
      </div>

      {/* Row 5: actions */}
      <div
        className="flex items-center gap-1 border-t border-border pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
          className="h-7 px-2 text-xs gap-1"
        >
          <Eye className="w-3 h-3" /> {t("dashboard.donationsPage.viewShort")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/dashboard/donations/edit/${donation._id}`)}
          className="h-7 px-2 text-xs gap-1"
        >
          <Edit className="w-3 h-3" /> {t("dashboard.donationsPage.editTitle")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDeleteClick(donation)}
          className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive ml-auto"
        >
          <Trash2 className="w-3 h-3" /> {t("common.delete")}
        </Button>
      </div>
    </div>
  );

  // ─── Loading skeleton card ────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-card border border-border rounded-lg p-3 min-[400px]:p-4 space-y-3 pt-4">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="space-y-3 min-[400px]:space-y-4 sm:space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-start gap-4 min-[484px]:flex-row min-[484px]:items-center min-[484px]:justify-between min-[484px]:gap-2">
        <div className="min-w-0">
          <h1 className="text-lg min-[400px]:text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            {t("dashboard.donationsPage.title")}
          </h1>
          <p className="text-[11px] min-[400px]:text-xs sm:text-sm text-muted-foreground truncate">
            {t("dashboard.donationsPage.subtitleDetail")}
          </p>
        </div>
        <div className="  flex items-center gap-2 shrink-0">
          <Button
            variant="default"
            onClick={() => navigate("/dashboard/donations/new")}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Plus className="w-3 ml-1 sm:ml-0 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden min-[400px]:inline">{t("dashboard.donationsPage.record")}</span>
            {/* <span className="min-[400px]:hidden">+</span> */}
            <span className="hidden sm:inline"> {t("dashboard.donationsPage.recordDonation")}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={isExporting}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Download className="w-3 ml-1 sm:ml-0 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            {isExporting ? t("dashboard.donationsPage.exporting") : t("dashboard.donationsPage.exportPdf")}
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      {overview && (
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-2 min-[400px]:gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3 sm:pb-2 sm:pt-4 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard.donationsPage.totalDonationsCard")}</CardTitle>
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg min-[400px]:text-xl sm:text-2xl font-bold">
                {formatCurrency(receivedMonetaryAmount)}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t("dashboard.donationsPage.donationsCountLabel", {
                  count: receivedTotalCount,
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3 sm:pb-2 sm:pt-4 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard.donationsPage.thisMonth")}</CardTitle>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg min-[400px]:text-xl sm:text-2xl font-bold">
                {formatCurrency(overview?.donations?.monthlyAmount || 0)}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t("dashboard.donationsPage.currentMonth")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3 sm:pb-2 sm:pt-4 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard.donationsPage.promisedCard")}</CardTitle>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg min-[400px]:text-xl sm:text-2xl font-bold">
                {formatCurrency(promisedMonetaryAmount)}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t("dashboard.donationsPage.promisedCountLabel", { count: promisedCount })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3 sm:pb-2 sm:pt-4 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard.donationsPage.activeDonorsCard")}</CardTitle>
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg min-[400px]:text-xl sm:text-2xl font-bold">
                {overview?.donors?.active.toLocaleString() || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t("dashboard.donationsPage.donatedThisMonth")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Donation Trend Chart ────────────────────────────────────────────── */}
      <Card className="min-w-0 overflow-hidden [&_canvas]:max-w-full">
        {/* <CardHeader className="flex flex-col min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between gap-2 min-[500px]:gap-4 pb-2 sm:pb-4 pt-3 px-3 sm:pt-4 sm:px-4"> */}
        {/* <CardHeader className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[500px]:items-center min-[500px]:justify-items-between gap-2 min-[500px]:gap-4 pb-2 sm:pb-4 pt-3 px-3 sm:pt-4 sm:px-4"> */}
        <CardHeader className=" flex flex-col min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between gap-2 min-[500px]:gap-4 pb-2 sm:pb-4 pt-3 px-3 sm:pt-4 sm:px-4">
        
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg lg:text-2xl">{t("dashboard.donationsPage.trendTitle")}</CardTitle>
            <CardDescription className="text-[11px] sm:text-sm">
              {t("dashboard.donationsPage.trendDesc")}
            </CardDescription>
          </div>
          <Select value={trendRange} onValueChange={(v: any) => setTrendRange(v)}>
            <SelectTrigger className="w-full min-[500px]:w-[150px] text-xs sm:text-sm h-8 sm:h-9">
              <SelectValue placeholder={t("dashboard.donationsPage.timeRangePh")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t("dashboard.donationsPage.trendMonth", "This Month")}</SelectItem>
              <SelectItem value="3m">{t("dashboard.donationsPage.trend3m")}</SelectItem>
              <SelectItem value="6m">{t("dashboard.donationsPage.trend6m")}</SelectItem>
              <SelectItem value="1y">{t("dashboard.donationsPage.trend1y")}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        {false &&(<CardContent className="p-2 min-[400px]:p-3 sm:p-6">
          <div className="w-full overflow-hidden">
            <div className="h-48 min-[400px]:h-56 sm:h-80 lg:h-[330px] w-full">
              {/* <DonationTrendsChart
                values={trendData.values}
                labels={trendData.months}
                /> */}
                {trendLoading ? (
                  <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                    {t("dashboard.donationsPage.loadingChart")}
                  </div>
                ) : (
                  <DonationTrendsChart
                    values={trendData?.values || []}
                    labels={trendData?.months || []}
                  />
                )}
            </div>
          </div>
        </CardContent>)}
        <CardContent className="p-2 min-[400px]:p-3 sm:p-6 min-w-0 overflow-hidden">
          <div className="w-full h-[230px] sm:h-[330px] min-w-0 max-w-full overflow-hidden">
            <div className="h-48 min-[400px]:h-56 sm:h-80 lg:h-[330px] w-full min-w-0 max-w-full overflow-hidden">
              {trendLoading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                  {t("dashboard.donationsPage.loadingChart")}
                </div>
              ) : (
                <DonationTrendsChart
                  values={trendData?.values || []}
                  labels={trendData?.months || []}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm">
          <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={t("dashboard.donationsPage.searchPh")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-xs sm:text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        {/* Status + Type filters */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
              <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <SelectValue placeholder={t("dashboard.donationsPage.statusPh")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.donationsPage.allStatus")}</SelectItem>
              <SelectItem value="received">{t("dashboard.donationsPage.statusReceived")}</SelectItem>
              <SelectItem value="pledged">{t("dashboard.donationsPage.statusPromised")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
              <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <SelectValue placeholder={t("dashboard.donationsPage.typePh")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.donationsPage.allTypes")}</SelectItem>
              <SelectItem value="monetary">{t("dashboard.donationsPage.typeMonetary")}</SelectItem>
              <SelectItem value="in_kind">{t("dashboard.donationsPage.typeInKind")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Date range */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto sm:flex-1 min-w-0"
            aria-label={t("dashboard.donationsPage.fromDate")}
          />
          <span className="text-xs text-muted-foreground text-center sm:px-1">
            {t("dashboard.donationsPage.toDateLabel")}
          </span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto sm:flex-1 min-w-0"
            aria-label={t("dashboard.donationsPage.toDate")}
          />
        </div>
      </div>

      {/* ── Donation List ───────────────────────────────────────────────────── */}

      {/* CARD STACK — shown only below sm (< 640px) */}
      <div className="sm:hidden space-y-2 min-[400px]:space-y-2.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{t("dashboard.donationsPage.loadErr")}</AlertDescription>
          </Alert>
        ) : donationsData && donationsData?.data[0]?.data?.length > 0 ? (
          donationsData?.data[0]?.data?.map((donation: any) => (
            <DonationCard key={donation._id} donation={donation} />
          ))
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            {t("dashboard.donationsPage.empty")}
          </div>
        )}
      </div>

      {/* TABLE — shown from sm (≥ 640px) upwards */}
      <Card className="hidden sm:block">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {/* Always visible ≥ sm */}
                <TableHead className="hidden min-[798px]:table-cell text-xs sm:text-sm w-[120px] sm:w-[140px]">{t("dashboard.donationsPage.colReference")}</TableHead>
                {/* Donor: visible ≥ sm */}
                <TableHead className="text-xs sm:text-sm">{t("dashboard.donationsPage.colDonor")}</TableHead>
                {/* Type: hidden sm, visible ≥ md */}
                <TableHead className="text-xs sm:text-sm w-[110px] text-right">{t("dashboard.donationsPage.colAmount")}</TableHead>
                {/* Classification: visible ≥ md */}
                <TableHead className="text-xs sm:text-sm hidden md:table-cell w-[140px]">{t("dashboard.donationsPage.colClassification")}</TableHead>
                {/* Status: always visible ≥ sm */}
                <TableHead className="text-xs sm:text-sm  w-[110px]">{t("dashboard.donationsPage.colType")}</TableHead>
                {/* Amount: always visible ≥ sm */}
                <TableHead className="text-xs hidden min-[906px]:table-cell min-[1086px]:hidden min-[1178px]:table-cell sm:text-sm w-[100px]">{t("dashboard.donationsPage.colStatus")}</TableHead>
                {/* Date: hidden sm, visible ≥ md */}
                <TableHead className="text-xs sm:text-sm hidden min-[1242px]:table-cell w-[110px]">{t("dashboard.donationsPage.colDate")}</TableHead>
                {/* Allocated To: hidden until lg */}
                <TableHead className="text-xs sm:text-sm hidden min-[1354px]:table-cell">{t("dashboard.donationsPage.colAllocatedTo")}</TableHead>
                {/* Actions: always visible */}
                <TableHead className="text-xs sm:text-sm w-[100px] text-right">{t("dashboard.donationsPage.colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="hidden min-[798px]:table-cell h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className=""><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="hidden min-[906px]:table-cell min-[1086px]:hidden min-[1178px]:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="hidden min-[1242px]:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="hidden min-[1354px]:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Alert variant="destructive">
                      <AlertDescription>
                        {t("dashboard.donationsPage.loadErr")}
                      </AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : donationsData && donationsData?.data[0]?.data?.length > 0 ? (
                donationsData?.data[0]?.data?.map((donation: any) => (
                  <TableRow
                    key={donation._id}
                    className="text-xs sm:text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                  >
                    <TableCell className=" hidden min-[798px]:table-cell font-medium font-mono text-xs sm:text-sm p-2 sm:p-4">
                      {getReferenceLabel(donation)}
                    </TableCell>

                    <TableCell className="p-2 sm:p-4">
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {donation.donorName || t("dashboard.donationsPage.anonymous")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-semibold text-xs
                     p-2 sm:p-4 xl:text-sm">
                      {donation.donationType === "monetary"
                        ? formatCurrency(Number(donation.amount || 0))
                        : "-"}
                    </TableCell>

                    <TableCell className="hidden md:table-cell p-2 sm:p-4">
                      {donation.familyClassification ? (
                        <FamilyClassificationBadge classification={donation.familyClassification} t={t} short />
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                          {t("dashboard.classifications.none")}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className=" p-2 sm:p-4">
                      <Badge variant="outline" className={`${getTypeColor(donation.donationType)} text-xs`}>
                        {getTypeLabel(donation.donationType)}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-2 hidden min-[906px]:table-cell min-[1086px]:hidden min-[1178px]:table-cell sm:p-4">
                      <Badge variant="outline" className={`${getStatusColor(donation.status)} text-xs`}>
                        {getStatusLabel(donation.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden min-[1242px]:table-cell text-xs text-muted-foreground p-2 sm:p-4">
                      {formatDate(donation.receivedAt)}
                    </TableCell>

                    <TableCell className="p-2 sm:p-4 hidden min-[1354px]:table-cell">
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
                          <span className="text-muted-foreground">{t("dashboard.donationsPage.generalAllocation")}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="p-2 sm:p-4">
                      <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/${donation._id}`)}
                          title={t("dashboard.donationsPage.viewDetailsTitle")}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/donations/edit/${donation._id}`)}
                          title={t("dashboard.donationsPage.editTitle")}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(donation)}
                          title={t("dashboard.donationsPage.deleteTitleAction")}
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
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    {t("dashboard.donationsPage.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {donationsData && donationsData?.data[0]?.pagination && donationsData?.data[0]?.pagination?.totalPages > 1 && (
        <div className="flex flex-col min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between gap-2 min-[500px]:gap-4">
          <p className="text-[11px] sm:text-sm text-muted-foreground text-center min-[500px]:text-left">
            {t("dashboard.donationsPage.pageInfo", {
              page,
              totalPages: donationsData?.data[0]?.pagination?.totalPages,
              total: donationsData?.data[0]?.pagination?.total,
            })}
          </p>
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              {t("dashboard.donationsPage.prev")}
            </Button>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: Math.min(5, donationsData?.data[0]?.pagination?.totalPages) }, (_, i) => {
                let pageNum;
                if (donationsData?.data[0]?.pagination?.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= donationsData?.data[0]?.pagination?.totalPages - 2) {
                  pageNum = donationsData?.data[0]?.pagination?.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={i}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="text-xs h-7 sm:h-8 w-7 sm:w-8 p-0"
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
              disabled={page === donationsData?.data[0]?.pagination?.totalPages}
              className="text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              {t("dashboard.donationsPage.next")}
            </Button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.donationsPage.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.donationsPage.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col min-[400px]:flex-row gap-2 min-[640px]:gap-0 min-[400px]:items-center min-[400px]:justify-center">
            <AlertDialogCancel onClick={() => setDonationToDelete(null)} className="min-[400px]:my-0">
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

export default Donations;