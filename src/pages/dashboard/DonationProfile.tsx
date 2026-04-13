import { useState } from "react";
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
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Copy,
  Eye
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DonationProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [verificationLinkDialogOpen, setVerificationLinkDialogOpen] = useState(false);
  const [verificationLink, setVerificationLink] = useState("");
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['donation', id],
    queryFn: async () => {
      if (!id) throw new Error("No donation ID provided");
      const response = await donationApi.getById(id);
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
        title: "Success",
        description: "Donation deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate("/dashboard/donations");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete donation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleGenerateVerificationLink = async () => {
    if (!id) return;

    try {
      const response = await donationVerificationApi.generateVerificationLink(id);
      setVerificationLink(response.data.verificationUrl);
      setVerificationLinkDialogOpen(true);
      toast({
        title: "Success",
        description: "Verification link generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['donation', id] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate verification link",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationLink);
    toast({
      title: "Copied!",
      description: "Verification link copied to clipboard",
    });
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
        title: "Success",
        description: "Donation verified successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['donation', id] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setVerifyDialogOpen(false);
      setVerificationNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify donation",
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
        title: "Success",
        description: "Verification rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['donation', id] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setRejectDialogOpen(false);
      setVerificationNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject verification",
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
            Verified
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-info/10 text-info border-info/20">
            <Clock className="w-3 h-3 mr-1" />
            Awaiting Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
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
            {(error as any)?.response?.data?.message || "Failed to load donation details"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/donations")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Donation Details</h1>
            {donation.verificationStatus && getVerificationStatusBadge(donation.verificationStatus)}
          </div>
          <p className="text-muted-foreground">
            {donation.donationReference || `DON-${donation.id.slice(0, 8)}`}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Desktop: Show all buttons */}
          <div className="hidden md:flex gap-2">
            {donation.donationType === 'monetary' && (
              <>
                {donation.verificationStatus === 'submitted' && (
                  <>
                    <Button onClick={() => setVerifyDialogOpen(true)} variant="default">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                    <Button onClick={() => setRejectDialogOpen(true)} variant="outline" className="text-destructive hover:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {(donation.verificationStatus === 'pending' || !donation.verificationStatus) && (
                  <Button onClick={handleGenerateVerificationLink} variant="outline">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Generate Link
                  </Button>
                )}
              </>
            )}
            <Button onClick={() => navigate(`/dashboard/donations/edit/${id}`)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              onClick={() => setDeleteDialogOpen(true)} 
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Card with Amount */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Donation Amount</p>
              <p className="text-4xl font-bold text-foreground">
                {donation.donationType === "monetary" 
                  ? formatCurrency(Number(donation.amount || 0), donation.currency)
                  : donation.donationType.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className={getStatusColor(donation.status)}>
                {donation.status}
              </Badge>
              <Badge variant="outline" className={getTypeColor(donation.donationType)}>
                {donation.donationType.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date Received</p>
                <p className="font-medium text-foreground">{formatDate(donation.receivedAt)}</p>
              </div>
            </div>

            {donation.donationType === 'monetary' && donation.paymentMethod && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground capitalize">
                    {donation.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donor Information */}
      {donation.donor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Donor Information
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
      {(donation.family || donation.event || donation.beneficiary) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Allocation
            </CardTitle>
            <CardDescription>This donation is designated for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {donation.family && (
              <div 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-3"
                onClick={() => navigate(`/dashboard/families/${donation.family.id}`)}
              >
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Family</p>
                  <p className="font-medium text-foreground">{donation.family.familyName}</p>
                  <p className="text-sm text-muted-foreground">{donation.family.familyCode}</p>
                </div>
              </div>
            )}

            {donation.event && (
              <div 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-3"
                onClick={() => navigate(`/dashboard/events/${donation.event.id}`)}
              >
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Event</p>
                  <p className="font-medium text-foreground">{donation.event.title}</p>
                </div>
              </div>
            )}

            {donation.beneficiary && (
              <div 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-3"
                onClick={() => navigate(`/dashboard/beneficiaries/${donation.beneficiary.id}`)}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Beneficiary</p>
                  <p className="font-medium text-foreground">{donation.beneficiary.fullName}</p>
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
                Description
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
                Usage Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{donation.usageNote}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Receipt - Only for received donations */}
      {donation.status === 'received' && donation.receiptUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Receipt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Receipt Document</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded on {formatDate(donation.createdAt)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${donation.receiptUrl}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Details */}
      {donation.donationType === 'monetary' && donation.verificationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Verification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                {getVerificationStatusBadge(donation.verificationStatus)}
              </div>
              {donation.verifiedAt && (
                <div>
                  <p className="text-muted-foreground mb-1">Verified At</p>
                  <p className="text-foreground">{formatDate(donation.verifiedAt)}</p>
                </div>
              )}
              {donation.verifiedBy && (
                <div>
                  <p className="text-muted-foreground mb-1">Verified By</p>
                  <p className="text-foreground">{donation.verifiedBy}</p>
                </div>
              )}
            </div>
            {donation.verificationProofUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Uploaded Document</p>
                    <p className="text-xs text-muted-foreground">Click to view</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${donation.verificationProofUrl}`, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}
            {donation.verificationNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{donation.verificationNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Donation ID</p>
              <p className="font-mono text-foreground">{donation.id}</p>
            </div>
            {donation.donationType === 'monetary' && donation.donationReference && (
              <div>
                <p className="text-muted-foreground mb-1">Reference Number</p>
                <p className="font-mono text-foreground">{donation.donationReference}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p className="text-foreground">{formatDate(donation.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p className="text-foreground">{formatDate(donation.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Link Dialog */}
      <AlertDialog open={verificationLinkDialogOpen} onOpenChange={setVerificationLinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verification Link Generated</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with the donor to upload payment proof
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-mono break-all">{verificationLink}</p>
            </div>
            <Button onClick={handleCopyLink} variant="outline" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Donation</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that you have reviewed the payment proof and want to verify this donation
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="verifyNotes">Verification Notes (Optional)</Label>
              <Textarea
                id="verifyNotes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add any notes about the verification..."
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyDonation}
              disabled={isVerifying}
              className="bg-success text-white hover:bg-success/90"
            >
              {isVerifying ? "Verifying..." : "Verify Donation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this verification
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="rejectNotes">Reason for Rejection <span className="text-destructive">*</span></Label>
              <Textarea
                id="rejectNotes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Explain why the verification is being rejected..."
                rows={3}
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectVerification}
              disabled={isVerifying || !verificationNotes.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isVerifying ? "Rejecting..." : "Reject Verification"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this donation of{" "}
              <strong>
                {donation.donationType === "monetary" 
                  ? formatCurrency(Number(donation.amount || 0), donation.currency)
                  : donation.donationType}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDonation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Donation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DonationProfile;
