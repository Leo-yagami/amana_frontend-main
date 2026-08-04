import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { donationApi, donationVerificationApi } from "@/services/api.service";
import { downloadReceiptPdf } from "@/lib/exportDonationPdf";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Calendar,
  User,
  FileText,
  CreditCard,
  Edit,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Receipt,
  Heart,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Eye,
  Upload,
  X,
  Loader2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Baby, Accessibility, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const NS = "dashboard.donationProfile";

const CLASSIFICATION_META: Record<string, { labelKey: string; className: string; Icon: any }> = {
  orphan: {
    labelKey: "dashboard.classifications.orphan",
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-700",
    Icon: Baby,
  },
  disabled_disease: {
    labelKey: "dashboard.classifications.disabled_disease",
    className: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/70 dark:text-pink-300 dark:border-pink-700",
    Icon: Heart,
  },
  old_age: {
    labelKey: "dashboard.classifications.old_age",
    className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/70 dark:text-purple-300 dark:border-purple-700",
    Icon: Accessibility,
  },
  single_mother: {
    labelKey: "dashboard.classifications.single_mother",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/70 dark:text-amber-300 dark:border-amber-700",
    Icon: Home,
  },
};

const CHAPA_RECEIPT_BASE = "https://checkout.chapa.co/checkout/test-payment-receipt/";

const ClassificationTag = ({ classification }: { classification: string }) => {
  const { t } = useTranslation();
  const meta = CLASSIFICATION_META[classification];
  if (!meta) return <p className="font-medium text-foreground">{t(`dashboard.classifications.${classification}`)}</p>;
  const { labelKey, className, Icon } = meta;
  return (
    <Badge variant="outline" className={`${className} text-xs`}>
      <Icon className="h-3 w-3 mr-1" />
      {t(labelKey)}
    </Badge>
  );
};

const ChapaReceiptDialog = ({
  open,
  onOpenChange,
  donationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  donationId?: string;
}) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["donation-receipt", donationId],
    queryFn: async () => {
      const res = await donationApi.getReceipt(donationId as string);
      console.log("RECEIIIPT", res)
      return res?.data?.receipt;
    },
    enabled: open && !!donationId,
  });

  const fmt = (amount?: number, currency?: string) =>
    typeof amount === "number"
      ? `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || "ETB"}`
      : "N/A";

  const handleDownload = () => {
    if (!data) return;
    downloadReceiptPdf(data);
  };

  const receiptRows = [
    [t(`${NS}.receiptRef`), data?.reference || t("common.na")],
    [t(`${NS}.receiptTxRef`), data?.txRef || t("common.na")],
    [t(`${NS}.receiptDonor`), data?.donorName || t("dashboard.donationsPage.anonymous")],
    [t(`${NS}.receiptAmount`), fmt(data?.amount, data?.currency)],
    ...(data?.originalAmount && data?.originalCurrency && data?.originalCurrency !== data?.currency
      ? [[t(`${NS}.receiptOriginal`), fmt(data?.originalAmount, data?.originalCurrency)]]
      : []),
    [t(`${NS}.receiptMethod`), data?.paymentMethod || "Chapa"],
    [t(`${NS}.receiptEvent`), data?.eventName || t(`${NS}.receiptGeneral`)],
    [t(`${NS}.receiptStatus`), data?.status || "received"],
    [t(`${NS}.receiptDate`), data?.date ? new Date(data?.date).toLocaleString() : t("common.na")],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`${NS}.chapaReceiptTitle`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`${NS}.chapaReceiptDesc`)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t(`${NS}.receiptLoadError`)}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="rounded-lg border divide-y text-sm">
            {receiptRows.map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground text-right break-all">{v}</span>
              </div>
            ))}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{t(`${NS}.close`)}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDownload} disabled={!data}>
            <FileText className="w-4 h-4 mr-2" />
            {t(`${NS}.downloadPdf`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ReceiptContent = ({ donation, id }: { donation: any; id?: string }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [chapaReceiptOpen, setChapaReceiptOpen] = useState(false);
  const queryClient = useQueryClient();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // receiptType may be missing on older records (it wasn't always persisted),
  // so infer it: source/receiptType "chapa" or an absolute http(s) URL is a
  // Chapa donation, anything else is a manual upload.
  const isChapa =
    donation.source === "chapa" ||
    donation.receiptType === "chapa" ||
    (typeof donation.receiptUrl === "string" && donation.receiptUrl.startsWith("http"));
  // Chapa donations always have an (internal) receipt available, even when Chapa
  // didn't return a hosted URL (e.g. test mode).
  const hasReceipt = isChapa || !!donation.receiptUrl;
  const isManual = !isChapa && !!donation.receiptUrl;

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
    toast({
      title: t(`${NS}.toastUploadLargeTitle`),
      description: t(`${NS}.toastUploadLargeDesc`),
      variant: "destructive",
    });
      return;
    }
    setReceiptFile(file);
  };

  const handleUpload = async () => {
    if (!receiptFile || !id) return;
    setUploading(true);
    try {
      await donationApi.uploadReceipt(id, receiptFile);
      toast({
        title: t(`${NS}.toastUploadTitle`),
        description: t(`${NS}.toastUploadDesc`),
      });
      setReceiptFile(null);
      setReplaceMode(false);
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
    } catch (error: any) {
      toast({
        title: t(`${NS}.toastUploadErrTitle`),
        description: error?.response?.data?.error || t(`${NS}.toastUploadErrDesc`),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3" data-lenis-prevent>
      {isChapa && (
        // <div className="border rounded-lg p-4 flex items-center gap-4">
        //   <div className="bg-primary/10 rounded-lg p-3">
        //     <FileText className="w-8 h-8 text-primary" />
        //   </div>
        //   <div className="flex-1 min-w-0">
        //     <p className="font-medium text-foreground">Chapa Payment Receipt</p>
        //     <p className="text-sm text-muted-foreground">Generated from the verified transaction</p>
        //   </div>
        //   <Button
        //     size="sm"
        //     variant="outline"
        //     onClick={() => {
        //       // Only open Chapa's own hosted page when it genuinely provided one.
        //       // The old fabricated chapa.link/payment-receipt/<ref> URLs 404 in
        //       // test mode, so those fall through to our internal receipt.
        //       const url: string | undefined = donation.receiptUrl;
        //       if (url && url.startsWith("http") && !url.includes("/payment-receipt/")) {
        //         window.open(url, "_blank");
        //       } else {
        //         setChapaReceiptOpen(true);
        //       }
        //     }}
        //   >
        //     <Eye className="w-4 h-4 mr-2" />
        //     View Receipt
        //   </Button>
        // </div>
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-4 border rounded-lg p-4">
  {/* Icon Container - Forced to keep its shape */}
  <div className="bg-primary/10 rounded-lg p-3 w-fit h-fit flex items-center justify-center justify-self-start">
    <FileText className="w-8 h-8 text-primary shrink-0" />
  </div>

  {/* Text Area - Takes up remaining space */}
  <div className="min-w-0">
    <p className="font-medium text-foreground">{t(`${NS}.chapaPaymentReceipt`)}</p>
    <p className="text-sm text-muted-foreground">{t(`${NS}.chapaVerifiedTransaction`)}</p>
  </div>

  {/* Button - Aligns nicely on mobile, pushes right on desktop */}
  <Button
    size="sm"
    variant="outline"
    className="w-full sm:w-auto sm:justify-self-end w-fit"
    onClick={() => {
      // donationReference holds Chapa's real reference for online donations
      // (see backend paymentComplete). Open the REAL Chapa-hosted receipt in a
      // new tab. Synthetic DON- refs aren't valid Chapa receipts, so those fall
      // back to our internal generated receipt dialog.
      const ref: string | undefined = donation.donationReference;
      if (ref && !ref.startsWith("DON-")) {
        window.open(`${CHAPA_RECEIPT_BASE}${encodeURIComponent(ref)}`, "_blank");
      } else {
        setChapaReceiptOpen(true);
      }
    }}
  >
    <Eye className="w-4 h-4 mr-2 shrink-0" />
    {t(`${NS}.viewReceipt`)}
  </Button>
</div>
      )}

      <ChapaReceiptDialog
        open={chapaReceiptOpen}
        onOpenChange={setChapaReceiptOpen}
        donationId={id || donation._id}
      />

      {isManual && (
        <div className="border rounded-lg p-4 flex items-center gap-4">
          <div className="bg-primary/10 rounded-lg p-3">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{t(`${NS}.manualReceipt`)}</p>
            <p className="text-sm text-muted-foreground">
              {t(`${NS}.uploadedOn`)}{" "}
              {new Date(donation.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                donation.receiptUrl.startsWith("http")
                  ? donation.receiptUrl
                  : `${apiUrl}${donation.receiptUrl}`,
                "_blank"
              )
            }
          >
            <Eye className="w-4 h-4 mr-2" />
            {t(`${NS}.view`)}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplaceMode(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t(`${NS}.replaceReceipt`)}
          </Button>
        </div>
      )}

      {(!hasReceipt || replaceMode) && (
        <div>
          {!receiptFile ? (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {replaceMode ? t(`${NS}.replaceReceipt`) : t(`${NS}.uploadReceipt`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`${NS}.uploadClick`)}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {receiptFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReceiptFile(null)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
                  <Button size="sm" onClick={handleUpload} disabled={uploading}>
                    {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t(`${NS}.upload`)}
                  </Button>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              if (e.target) e.target.value = "";
            }}
          />
          {replaceMode && hasReceipt && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setReplaceMode(false)}
            >
              {t(`${NS}.cancel`)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const DonationProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['donation', id],
    queryFn: async () => {
      if (!id) throw new Error("No donation ID provided");
      const response = await donationApi.getById(id);
      // console.log("PLEEEEEEEEASE WORK", response)
      return response.data;
    },
    enabled: !!id,
  });

  const handleDeleteDonation = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await donationApi.delete(id);
      toast({
        title: t(`${NS}.toastDeleteTitle`),
        description: t(`${NS}.toastDeleteDesc`),
      });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate("/dashboard/donations");
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

  const handleVerifyDonation = async () => {
    if (!id) return;

    setIsVerifying(true);
    try {
      await donationVerificationApi.verifyDonation(id, {
        status: 'verified',
        verificationNotes,
      });
      toast({
        title: t(`${NS}.toastVerifyTitle`),
        description: t(`${NS}.toastVerifyDesc`),
      });
      queryClient.invalidateQueries({ queryKey: ['donation', id] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donor'] });
      setVerifyDialogOpen(false);
      setVerificationNotes("");
    } catch (error: any) {
      toast({
        title: t(`${NS}.toastVerifyErrTitle`),
        description: error.response?.data?.message || t(`${NS}.toastVerifyErrDesc`),
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!id) return;

    setIsVerifying(true);
    try {
      await donationVerificationApi.rejectVerification(id, {
        verificationNotes,
      });
      toast({
        title: t(`${NS}.toastRejectTitle`),
        description: t(`${NS}.toastRejectDesc`),
      });
      queryClient.invalidateQueries({ queryKey: ['donation', id] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donor'] });
      setRejectDialogOpen(false);
      setVerificationNotes("");
    } catch (error: any) {
      toast({
        title: t(`${NS}.toastRejectErrTitle`),
        description: error.response?.data?.message || t(`${NS}.toastRejectErrDesc`),
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
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
      case "service":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t(`${NS}.vsVerified`)}
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-info/10 text-info border-info/20">
            <Clock className="w-3 h-3 mr-1" />
            {t(`${NS}.vsAwaiting`)}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            {t(`${NS}.vsRejected`)}
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            {t(`${NS}.vsPending`)}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !donation) {
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
        <div className="flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/donations")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t(`${NS}.title`)}</h1>
            {donation.verificationStatus && getVerificationStatusBadge(donation.verificationStatus)}
          </div>
          <p className="text-muted-foreground">
            {donation.donationReference || `DON-${donation._id.slice(0, 8)}`}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          {/* Buttons wrap below the title on small viewports */}
          <div className="flex flex-wrap gap-2">
            {donation.donationType === 'monetary' && (
              <>
                {donation.verificationStatus === 'submitted' && (
                  <>
                    <Button onClick={() => setVerifyDialogOpen(true)} variant="default">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t(`${NS}.verify`)}
                    </Button>
                    <Button onClick={() => setRejectDialogOpen(true)} variant="outline" className="text-destructive hover:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      {t(`${NS}.reject`)}
                    </Button>
                  </>
                )}
              </>
            )}
            {donation.status === 'received' && (
              <Button onClick={() => setReceiptDialogOpen(true)} variant="outline">
                <Receipt className="w-4 h-4 mr-2" />
                {donation.receiptUrl || donation.source === "chapa" || donation.receiptType === "chapa"
                  ? t(`${NS}.viewReceipt`)
                  : t(`${NS}.uploadReceipt`)}
              </Button>
            )}
            <Button onClick={() => navigate(`/dashboard/donations/edit/${id}`)} variant="outline">
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
        </div>
      </div>

      {/* Main Card with Amount */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-0 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t(`${NS}.donationAmount`)}</p>
              <p className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground">
                {donation.donationType === "monetary" 
                  ? formatCurrency(
                      Number(donation.originalAmount ?? donation.amount) || 0,
                      donation.originalCurrency ?? donation.currency
                    )
                  : donation.donationType === 'in_kind'
                    ? t("dashboard.donationsPage.typeInKind")
                    : donation.donationType.toUpperCase()}
              </p>
              {donation.originalCurrency && donation.originalCurrency !== "ETB" && (
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ {formatCurrency(Number(donation.amount || 0), "ETB")}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-center">
              <Badge variant="outline" className={getStatusColor(donation.status)}>
                {t(`dashboard.donationsPage.status${donation.status === 'pledged' ? 'Promised' : donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}`)}
              </Badge>
              <Badge variant="outline" className={getTypeColor(donation.donationType)}>
                {t(`dashboard.donationsPage.type${donation.donationType === 'monetary' ? 'Monetary' : 'InKind'}`)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t(`${NS}.dateReceived`)}</p>
                <p className="font-medium text-foreground">{formatDate(donation.receivedAt)}</p>
              </div>
            </div>

            {donation.donationType === 'monetary' && donation.paymentMethod && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t(`${NS}.paymentMethod`)}</p>
                  <p className="font-medium text-foreground capitalize">
                    {donation.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t(`${NS}.familyClassification`)}</p>
                <div className="mt-1.5">
                  {donation.familyClassification ? (
                    <ClassificationTag classification={donation.familyClassification} />
                  ) : (
                    <p className="font-medium text-foreground">{t(`${NS}.none`)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Information */}
      {donation.donor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t(`${NS}.donorInformation`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
              onClick={() => navigate(`/dashboard/donors/${donation.donor.id}`)}
            >
              <p className="font-semibold text-lg text-foreground">{donation.donor.name}</p>
              <p className="text-sm text-muted-foreground">{donation.donor.donorCode}</p>
              {donation.donor.email && (
                <p className="text-sm text-muted-foreground mt-2">{donation.donor.email}</p>
              )}
              {donation.donor.phone && (
                <p className="text-sm text-muted-foreground">{donation.donor.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Allocation */}
      {(donation.family || donation.event) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t(`${NS}.allocation`)}
            </CardTitle>
            <CardDescription>{t(`${NS}.allocationDesc`)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {donation.family && (
              <div 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-3"
                onClick={() => navigate(`/dashboard/families/${donation.family.id}`)}
              >
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                <p className="text-sm text-muted-foreground">{t(`${NS}.family`)}</p>
                <p className="font-medium text-foreground">{donation.family.familyName}</p>
                <p className="text-sm text-muted-foreground">{donation.family.familyCode}</p>
                </div>
              </div>
            )}

            {donation.event && (
              <div 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-3"
                onClick={() => navigate(`/dashboard/events/${donation.event._id}`)}
              >
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                <p className="text-sm text-muted-foreground">{t(`${NS}.event`)}</p>
                <p className="font-medium text-foreground">{donation.event.title}</p>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description */}
        {donation.description && (
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t(`${NS}.description`)}
            </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{donation.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Usage Note */}
        {donation.usageNote && (
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {t(`${NS}.usageNote`)}
            </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{donation.usageNote}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Receipt - Only for received donations */}
      {donation.status === 'received' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {t(`${NS}.receipt`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiptContent donation={donation} id={id} />
          </CardContent>
        </Card>
      )}

      {/* Verification Details */}
      {donation.donationType === 'monetary' && donation.verificationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {t(`${NS}.verificationDetails`)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">{t(`${NS}.statusLabel`)}</p>
                {getVerificationStatusBadge(donation.verificationStatus)}
              </div>
              {donation.verifiedAt && (
                <div>
                  <p className="text-muted-foreground mb-1">{t(`${NS}.verifiedAt`)}</p>
                  <p className="text-foreground">{formatDate(donation.verifiedAt)}</p>
                </div>
              )}
              {donation.verifiedBy && (
                <div>
                  <p className="text-muted-foreground mb-1">{t(`${NS}.verifiedBy`)}</p>
                  <p className="text-foreground">{donation.verifiedBy}</p>
                </div>
              )}
            </div>
            {donation.verificationProofUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t(`${NS}.paymentProof`)}</p>
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{t(`${NS}.uploadedDocument`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`${NS}.clickToView`)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${donation.verificationProofUrl}`, '_blank')}
                  >
                    {t(`${NS}.view`)}
                  </Button>
                </div>
              </div>
            )}
            {donation.verificationNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t(`${NS}.notes`)}</p>
                <p className="text-foreground whitespace-pre-wrap">{donation.verificationNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
          <CardHeader>
            <CardTitle>{t(`${NS}.metadata`)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">{t(`${NS}.donationId`)}</p>
                <p className="font-mono text-foreground">{donation._id}</p>
              </div>
              {donation.donationType === 'monetary' && donation.donationReference && (
                <div>
                  <p className="text-muted-foreground mb-1">{t(`${NS}.referenceNumber`)}</p>
                  <p className="font-mono text-foreground">{donation.donationReference}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">{t(`${NS}.created`)}</p>
                <p className="text-foreground">{formatDate(donation.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{t(`${NS}.lastUpdated`)}</p>
                <p className="text-foreground">{formatDate(donation.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
      </Card>

      {/* Receipt Viewer Dialog */}
      <AlertDialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${NS}.viewReceiptDialogTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${NS}.viewReceiptDialogDesc`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ReceiptContent donation={donation} id={id} />
          <AlertDialogFooter>
            <AlertDialogCancel>{t(`${NS}.close`)}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${NS}.verifyTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${NS}.verifyDesc`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="verifyNotes">{t(`${NS}.verifyNotes`)}</Label>
              <Textarea
                id="verifyNotes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={t(`${NS}.verifyNotesPh`)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>{t(`${NS}.cancel`)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyDonation}
              disabled={isVerifying}
              className="bg-success text-white hover:bg-success/90"
            >
              {isVerifying ? t(`${NS}.verifying`) : t(`${NS}.verifyDonationBtn`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${NS}.rejectTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${NS}.rejectDesc`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="rejectNotes">{t(`${NS}.rejectReason`)} <span className="text-destructive">*</span></Label>
              <Textarea
                id="rejectNotes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={t(`${NS}.rejectReasonPh`)}
                rows={3}
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>{t(`${NS}.cancel`)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectVerification}
              disabled={isVerifying || !verificationNotes.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isVerifying ? t(`${NS}.rejecting`) : t(`${NS}.rejectVerificationBtn`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${NS}.deleteTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${NS}.deleteDesc`, {
                amount:
                  donation.donationType === "monetary" 
                    ? formatCurrency(
                        Number(donation.originalAmount ?? donation.amount) || 0,
                        donation.originalCurrency ?? donation.currency
                      )
                    : t(`dashboard.donationsPage.type${donation.donationType === 'monetary' ? 'Monetary' : 'InKind'}`),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t(`${NS}.cancel`)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDonation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t(`${NS}.deleting`) : t(`${NS}.deleteDonationBtn`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DonationProfile;
