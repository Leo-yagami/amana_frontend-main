import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
          title: "Invalid File Type",
          description: "Please upload an image (JPEG, PNG) or PDF file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
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
        title: "Success!",
        description: "Your payment proof has been uploaded successfully. We'll verify it soon.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload proof. Please try again.",
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
                Invalid or expired verification link. Please contact the organization if you believe this is an error.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button onClick={() => navigate("/")} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
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
                {donation.verificationStatus === 'verified' ? 'Donation Verified!' : 'Proof Submitted!'}
              </h2>
              <p className="text-muted-foreground">
                {donation.verificationStatus === 'verified' 
                  ? 'Your donation has been verified. Thank you for your contribution!'
                  : 'Your payment proof has been received. We will verify it shortly.'}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Donation Amount</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(Number(donation.amount), donation.currency)}
              </p>
            </div>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return to Homepage
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
          <CardTitle className="text-2xl">Verify Your Donation</CardTitle>
          <CardDescription>
            Please upload proof of your payment to complete the verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Donation Details */}
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Donation Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>Amount</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(Number(donation.amount), donation.currency)}
                </span>
              </div>
              
              {donation.donor && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Donor</span>
                  </div>
                  <span className="font-medium text-foreground">{donation.donor.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatDate(donation.receivedAt)}
                </span>
              </div>

              {(donation.family || donation.event) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Designated For</span>
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
                    <span>Reference</span>
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
              <h3 className="font-semibold text-foreground mb-2">Upload Payment Proof</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please upload a screenshot or photo of your bank transfer, receipt, or payment confirmation.
                Accepted formats: JPEG, PNG, PDF (max 10MB)
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
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, or PDF</p>
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
                    Change
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Submit Proof"}
                </Button>
              </div>
            )}
          </div>

          {/* Help Text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After submitting your payment proof, our team will verify it within 1-2 business days.
              You'll receive a confirmation once verified.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyDonation;
