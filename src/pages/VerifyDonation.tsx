import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  DollarSign,
  User,
  Calendar,
  Heart,
  Home
} from "lucide-react";

const VerifyDonation = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['verify-donation', token],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/donation-verification/verify/${token}`);
      return response.data;
    },
    enabled: !!token,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t("verifyDonation.invalidFileTitle"),
          description: t("verifyDonation.invalidFileDesc"),
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t("verifyDonation.fileLargeTitle"),
          description: t("verifyDonation.fileLargeDesc"),
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('proof', selectedFile);

      await axios.post(
        `${API_URL}/api/donation-verification/verify/${token}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadSuccess(true);
      toast({
        title: t("verifyDonation.successTitle"),
        description: t("verifyDonation.successDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("verifyDonation.uploadFailTitle"),
        description: error.response?.data?.message || t("verifyDonation.uploadFailDesc"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("verifyDonation.invalidLink")}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button onClick={() => navigate("/")} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                {t("verifyDonation.goHome")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (uploadSuccess || donation.verificationStatus === 'submitted' || donation.verificationStatus === 'verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {donation.verificationStatus === 'verified'
                  ? t("verifyDonation.verifiedTitle")
                  : t("verifyDonation.submittedTitle")}
              </h2>
              <p className="text-muted-foreground">
                {donation.verificationStatus === 'verified'
                  ? t("verifyDonation.verifiedDesc")
                  : t("verifyDonation.submittedDesc")}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-1">{t("verifyDonation.donationAmount")}</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(Number(donation.amount), donation.currency)}
              </p>
            </div>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              {t("verifyDonation.returnHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("verifyDonation.pageTitle")}</CardTitle>
          <CardDescription>
            {t("verifyDonation.pageSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Donation Details */}
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("verifyDonation.detailsTitle")}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{t("common.amount")}</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(Number(donation.amount), donation.currency)}
                </span>
              </div>
              
              {donation.donor && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{t("common.donor")}</span>
                  </div>
                  <span className="font-medium text-foreground">{donation.donor.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{t("common.date")}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatDate(donation.receivedAt)}
                </span>
              </div>

              {(donation.family || donation.event) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>{t("common.designatedFor")}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {donation.family?.familyName || donation.event?.title}
                  </span>
                </div>
              )}

              {donation.donationReference && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{t("common.reference")}</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">
                    {donation.donationReference}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t("verifyDonation.uploadTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("verifyDonation.uploadHelp")}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <Button
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{t("verifyDonation.clickUpload")}</p>
                  <p className="text-xs text-muted-foreground">{t("verifyDonation.formatsShort")}</p>
                </div>
              </Button>
            ) : (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  {selectedFile.type === 'application/pdf' ? (
                    <FileText className="w-8 h-8 text-destructive" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-primary" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    {t("common.change")}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? t("verifyDonation.uploading") : t("verifyDonation.submitProof")}
                </Button>
              </div>
            )}
          </div>

          {/* Help Text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("verifyDonation.helpAlert")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyDonation;
