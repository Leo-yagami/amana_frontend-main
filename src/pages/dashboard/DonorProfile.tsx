import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportDonorDonationsPdf } from "@/lib/exportDonationPdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { donorApi } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Gift,
  Repeat,
  Edit,
  AlertCircle,
  ArrowLeft,
  Building2,
  User,
  Trash2,
  Plus,
  MoreVertical,
  Download
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const NS = "dashboard.donorProfile";

const DonorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [historyStatus, setHistoryStatus] = useState<string>("all");
  const [historyType, setHistoryType] = useState<string>("all");
  const [historyStart, setHistoryStart] = useState<string>("");
  const [historyEnd, setHistoryEnd] = useState<string>("");

  const { data: donor, isLoading, error } = useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      if (!id) throw new Error("No donor ID provided");
      const response = await donorApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const handleDeleteDonor = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await donorApi.delete(id);
      toast({
        title: t(`${NS}.toastDeleteTitle`),
        description: t(`${NS}.toastDeleteDesc`),
      });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate("/dashboard/donors");
    } catch (error: any) {
      toast({
        title: t(`${NS}.toastDeleteErrTitle`),
        description: error.response?.data?.message || t(`${NS}.toastDeleteErrDesc`),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleRecordDonation = () => {
    // Navigate to donation form page with donor pre-selected
    navigate(`/dashboard/donations/new?donor=${id}`);
  };

  const filteredDonations = useMemo(() => {
    if (!donor?.donations) return [];
    return donor.donations.filter((d: any) => {
      if (historyStatus !== "all" && d.status !== historyStatus) return false;
      if (historyType !== "all" && d.donationType !== historyType) return false;
      const received = d.receivedAt ? new Date(d.receivedAt) : null;
      if (historyStart && received && received < new Date(historyStart)) return false;
      if (historyEnd) {
        const end = new Date(historyEnd);
        end.setHours(23, 59, 59, 999);
        if (received && received > end) return false;
      }
      return true;
    });
  }, [donor?.donations, historyStatus, historyType, historyStart, historyEnd]);

  const handleExportHistoryPdf = () => {
    const filters: string[] = [];
    if (historyStatus !== "all") filters.push(`Status: ${historyStatus}`);
    if (historyType !== "all") filters.push(`Type: ${historyType}`);
    exportDonorDonationsPdf(donor, filteredDonations, {
      dateRange: { start: historyStart || undefined, end: historyEnd || undefined },
      filters,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Individual":
        return "bg-info/10 text-info border-info/20";
      case "Corporate":
        return "bg-primary/10 text-primary border-primary/20";
      case "Foundation":
        return "bg-accent/10 text-accent border-accent/20";
      case "Organization":
        return "bg-warning/10 text-warning border-warning/20";
      case "Embassy":
        return "bg-sky-500/10 text-sky-600 border-sky-500/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const formatCurrency = (amount: number, currency = "ETB") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as any)?.response?.data?.message || t(`${NS}.loadErr`)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="sm:container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/donors")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t(`${NS}.title`)}</h1>
          <p className="text-muted-foreground">{t(`${NS}.subtitle`)}</p>
        </div>
        <div className="flex gap-2">
          {/* Desktop: Show all buttons */}
          <div className="hidden md:flex gap-2">
            <Button onClick={handleRecordDonation} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              {t(`${NS}.recordDonation`)}
            </Button>
            <Button onClick={() => navigate(`/dashboard/donors/edit/${id}`)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              {t(`${NS}.edit`)}
            </Button>
            <Button 
              onClick={() => setDeleteDialogOpen(true)} 
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t(`${NS}.delete`)}
            </Button>
          </div>

          {/* Mobile: Show dropdown menu */}
          <div className="md:hidden flex items-center gap-2">
            <Button onClick={handleRecordDonation} variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Record
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/dashboard/donors/edit/${id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t(`${NS}.editDonor`)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRecordDonation}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t(`${NS}.recordDonation`)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t(`${NS}.deleteDonor`)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6 flex-wrap">
            <Avatar className="h-24 w-24">
              <AvatarImage src={donor.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {donor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 ">
              <div className="flex flex-col gap-4 items-start justify-center sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-3">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{donor.name}</h2>
                  <p className="text-sm text-muted-foreground">{donor.donorCode}</p>
                </div>
                <Badge variant="outline" className={getTypeColor(donor.donorType)}>
                  {donor.donorType === "Individual" ? <User className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                  {t(`dashboard.donorsPage.${donor.donorType.toLowerCase()}`)}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {donor.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{donor.email}</span>
                  </div>
                )}
                {donor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{donor.phone}</span>
                  </div>
                )}
                {(donor.city || donor.country) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{[donor.city, donor.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{t(`${NS}.joined`)} {formatDate(donor.registeredAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t(`${NS}.totalDonated`)}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(Number(donor.totalDonated || 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t(`${NS}.lifetimeContributions`)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t(`${NS}.totalDonations`)}</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {donor.donations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {donor.lastDonationAt && t(`${NS}.last`, { date: formatDate(donor.lastDonationAt) })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t(`${NS}.recurringDonations`)}</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {donor.recurringDonations?.filter((rd: any) => rd.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t(`${NS}.activeSubscriptions`)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donations">
            {t(`${NS}.donationsTab`)} ({filteredDonations.length})
          </TabsTrigger>
          {/* <TabsTrigger value="recurring">
            Recurring ({donor.recurringDonations?.length || 0})
          </TabsTrigger> */}
          <TabsTrigger value="details">{t(`${NS}.detailsTab`)}</TabsTrigger>
        </TabsList>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>{t(`${NS}.donationHistory`)}</CardTitle>
                <CardDescription>{t(`${NS}.donationHistoryDesc`)}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportHistoryPdf}
                disabled={filteredDonations.length === 0}
                className="shrink-0"
              >
                <Download className="w-4 h-4 mr-2" />
                {t(`${NS}.exportPdf`)}
              </Button>
            </CardHeader>
            <CardContent className="px-4 py-3 sm:p-6">
              {/* Filter row */}
              <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:flex-wrap">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Select value={historyStatus} onValueChange={setHistoryStatus}>
                    <SelectTrigger className="h-8 text-xs sm:text-sm">
                      <SelectValue placeholder={t(`${NS}.statusFilter`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t(`${NS}.allStatus`)}</SelectItem>
                      <SelectItem value="received">{t(`${NS}.received`)}</SelectItem>
                      <SelectItem value="pledged">{t(`${NS}.pledged`)}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={historyType} onValueChange={setHistoryType}>
                    <SelectTrigger className="h-8 text-xs sm:text-sm">
                      <SelectValue placeholder={t(`${NS}.typeFilter`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t(`${NS}.allTypes`)}</SelectItem>
                      <SelectItem value="monetary">{t(`${NS}.monetary`)}</SelectItem>
                      <SelectItem value="in_kind">{t(`${NS}.inKind`)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={historyStart}
                    onChange={(e) => setHistoryStart(e.target.value)}
                    className="h-8 text-xs sm:text-sm"
                    aria-label="From date"
                  />
                  <span className="text-xs text-muted-foreground">{t(`${NS}.toDate`)}</span>
                  <Input
                    type="date"
                    value={historyEnd}
                    onChange={(e) => setHistoryEnd(e.target.value)}
                    className="h-8 text-xs sm:text-sm"
                    aria-label="To date"
                  />
                </div>
              </div>

              {filteredDonations.length > 0 ? (
                <div data-lenis-prevent className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                  {filteredDonations.map((donation: any) => (
                    <div
                      key={donation.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-lg text-foreground">
                            {formatCurrency(
                              Number(donation.originalAmount ?? donation.amount) || 0,
                              donation.originalCurrency ?? donation.currency
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(donation.donationType === 'monetary' ? "dashboard.donationsPage.typeMonetary" : "dashboard.donationsPage.typeInKind")}
                            {donation.originalCurrency && donation.originalCurrency !== "ETB" && (
                              <> · ≈ {formatCurrency(Number(donation.amount || 0))}</>
                            )}
                          </p>
                        </div>
                        <Badge variant="outline" className={
                          donation.status === 'received' ? 'bg-success/10 text-success border-success/20' :
                          donation.status === 'pledged' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-muted text-muted-foreground'
                        }>
                          {t(donation.status === 'pledged' ? "dashboard.donationsPage.statusPromised" : `dashboard.donationsPage.status${donation.status.charAt(0).toUpperCase()}${donation.status.slice(1)}`)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {donation.event && (
                          <p>{t(`${NS}.event`)}: {donation.event.title}</p>
                        )}
                        {donation.family && (
                          <p>{t(`${NS}.family`)}: {donation.family.familyName}</p>
                        )}
                        <p>{t(`${NS}.date`)}: {formatDate(donation.receivedAt)}</p>
                      </div>
                      {donation.notes && (
                        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          {donation.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t(`${NS}.noDonationsMatch`)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recurring Donations Tab */}
        {false && (<TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Donations</CardTitle>
              <CardDescription>Active and inactive recurring contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {donor.recurringDonations && donor.recurringDonations.length > 0 ? (
                <div className="space-y-3">
                  {donor.recurringDonations.map((recurring: any) => (
                    <div
                      key={recurring._id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-lg text-foreground">
                            {formatCurrency(Number(recurring.amount))} / {recurring.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started {formatDate(recurring.startDate)}
                          </p>
                        </div>
                        <Badge variant="outline" className={
                          recurring.isActive 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-muted text-muted-foreground'
                        }>
                          {recurring.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {(recurring.designatedFamily || recurring.designatedEvent) && (
                        <div className="text-sm text-muted-foreground">
                          {recurring.designatedFamily && (
                            <p>For: {recurring.designatedFamily.familyName}</p>
                          )}
                          {recurring.designatedEvent && (
                            <p>Event: {recurring.designatedEvent.title}</p>
                          )}
                        </div>
                      )}
                      {recurring._count && (
                        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          {recurring._count.paymentRecords} payments processed
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recurring donations set up
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>)}

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t(`${NS}.additionalDetails`)}</CardTitle>
              <CardDescription>{t(`${NS}.additionalDetailsDesc`)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {donor.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t(`${NS}.address`)}</p>
                  <p className="text-foreground">{donor.address}</p>
                </div>
              )}
              {donor.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t(`${NS}.notes`)}</p>
                  <p className="text-foreground whitespace-pre-wrap">{donor.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t(`${NS}.statusLabel`)}</p>
                {(() => {
                  const now = new Date();
                  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  const donatedThisMonth = (donor.lastDonationAt && new Date(donor.lastDonationAt) >= startOfMonth) ||
                    donor.donations?.some((d: any) => d.receivedAt && new Date(d.receivedAt) >= startOfMonth);
                  const isActive = donatedThisMonth || donor.isActive;
                  return (
                    <Badge variant="outline" className={
                      isActive
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-muted text-muted-foreground'
                    }>
                      {isActive ? t(`${NS}.active`) : t(`${NS}.inactive`)}
                    </Badge>
                  );
                })()}
              </div>
              {donor.lastDonationAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t(`${NS}.lastDonation`)}</p>
                  <p className="text-foreground">{formatDate(donor.lastDonationAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${NS}.deleteTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${NS}.deleteDesc`, { name: donor?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t(`${NS}.cancel`)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDonor}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t(`${NS}.deleting`) : t(`${NS}.deleteDonorBtn`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DonorProfile;
