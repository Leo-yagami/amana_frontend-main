import { useState, useEffect } from "react";
import { supportHistoryApi } from "@/services/api.service";
import { Beneficiary, SupportHistory } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Calendar,
  Users,
  Heart,
  GraduationCap,
  Activity,
  FileText,
  MapPin,
} from "lucide-react";

interface BeneficiaryProfileModalProps {
  open: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
}

const BeneficiaryProfileModal = ({
  open,
  onClose,
  beneficiary,
}: BeneficiaryProfileModalProps) => {
  const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (beneficiary && open) {
      fetchSupportHistory();
    }
  }, [beneficiary, open]);

  const fetchSupportHistory = async () => {
    if (!beneficiary) return;
    
    setLoadingHistory(true);
    try {
      const response = await supportHistoryApi.getAll({
        beneficiaryId: beneficiary.id,
        limit: 50,
      });
      setSupportHistory(response.data.data);
    } catch (error) {
      console.error("Failed to fetch support history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!beneficiary) return null;

  const calculateAge = (dob?: string) => {
    if (!dob) return beneficiary.age || "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            {/* Profile Photo */}
            {beneficiary.photoUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
                <img 
                  src={beneficiary.photoUrl} 
                  alt={beneficiary.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20 flex-shrink-0">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <DialogTitle className="text-2xl">{beneficiary.fullName}</DialogTitle>
              <DialogDescription>
                Beneficiary ID: {beneficiary.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Support History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="mr-2 h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{calculateAge(beneficiary.dateOfBirth)} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium capitalize">{beneficiary.gender || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">
                      {beneficiary.dateOfBirth
                        ? new Date(beneficiary.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Relationship:</span>
                    <span className="font-medium">{beneficiary.relationshipToHead || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Family Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Family Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Name:</span>
                    <span className="font-medium">{beneficiary.family?.familyName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Code:</span>
                    <span className="font-medium">{beneficiary.family?.familyCode || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orphan Status:</span>
                    {beneficiary.isOrphan ? (
                      <Badge variant="destructive" className="capitalize">
                        {beneficiary.orphanType || "Orphan"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Orphan</Badge>
                    )}
                  </div>
                  {beneficiary.isOrphan && beneficiary.guardianName && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guardian:</span>
                        <span className="font-medium">{beneficiary.guardianName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guardian Relation:</span>
                        <span className="font-medium">{beneficiary.guardianRelationship || "N/A"}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Education Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education Level:</span>
                    <span className="font-medium capitalize">
                      {beneficiary.educationLevel?.replace("_", " ") || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School Name:</span>
                    <span className="font-medium">{beneficiary.schoolName || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Health Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Activity className="mr-2 h-5 w-5" />
                    Health Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health Status:</span>
                    <Badge
                      variant={
                        beneficiary.healthStatus === "good"
                          ? "default"
                          : beneficiary.healthStatus === "fair"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {beneficiary.healthStatus || "N/A"}
                    </Badge>
                  </div>
                  {beneficiary.specialNeeds && (
                    <div>
                      <span className="text-muted-foreground">Special Needs:</span>
                      <p className="mt-1 text-sm">{beneficiary.specialNeeds}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      beneficiary.verificationStatus === "verified"
                        ? "default"
                        : beneficiary.verificationStatus === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {beneficiary.verificationStatus}
                  </Badge>
                </div>
                {beneficiary.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified By:</span>
                    <span className="font-medium">{beneficiary.verifiedBy}</span>
                  </div>
                )}
                {beneficiary.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified At:</span>
                    <span className="font-medium">
                      {new Date(beneficiary.verifiedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {beneficiary.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{beneficiary.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Full Name</h4>
                    <p>{beneficiary.fullName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Gender</h4>
                    <p className="capitalize">{beneficiary.gender || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Date of Birth</h4>
                    <p>
                      {beneficiary.dateOfBirth
                        ? new Date(beneficiary.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Age</h4>
                    <p>{calculateAge(beneficiary.dateOfBirth)} years</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Relationship to Head</h4>
                    <p>{beneficiary.relationshipToHead || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Orphan Status</h4>
                    <p>{beneficiary.isOrphan ? `Yes (${beneficiary.orphanType || "Orphan"})` : "No"}</p>
                  </div>
                  {beneficiary.isOrphan && (
                    <>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Guardian Name</h4>
                        <p>{beneficiary.guardianName || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Guardian Relationship</h4>
                        <p>{beneficiary.guardianRelationship || "N/A"}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Education Level</h4>
                    <p className="capitalize">{beneficiary.educationLevel?.replace("_", " ") || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">School Name</h4>
                    <p>{beneficiary.schoolName || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Health Status</h4>
                    <p className="capitalize">{beneficiary.healthStatus?.replace("_", " ") || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Verification Status</h4>
                    <Badge
                      variant={
                        beneficiary.verificationStatus === "verified"
                          ? "default"
                          : beneficiary.verificationStatus === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {beneficiary.verificationStatus}
                    </Badge>
                  </div>
                </div>

                {beneficiary.specialNeeds && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Special Needs</h4>
                      <p className="text-sm">{beneficiary.specialNeeds}</p>
                    </div>
                  </>
                )}

                {beneficiary.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h4>
                      <p className="text-sm whitespace-pre-wrap">{beneficiary.notes}</p>
                    </div>
                  </>
                )}

                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-muted-foreground mb-1">Created At</h4>
                    <p>{new Date(beneficiary.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-muted-foreground mb-1">Last Updated</h4>
                    <p>{new Date(beneficiary.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support History Tab */}
          <TabsContent value="history" className="space-y-4">
            {loadingHistory ? (
              <div className="text-center py-8">Loading support history...</div>
            ) : supportHistory.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No support history found for this beneficiary.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {supportHistory.map((history) => (
                  <Card key={history.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{history.supportType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(history.supportDate).toLocaleDateString()}
                          </p>
                        </div>
                        {history.amountValue && (
                          <Badge variant="secondary">
                            {Number(history.amountValue).toFixed(2)} {history.currency || "ETB"}
                          </Badge>
                        )}
                      </div>
                      {history.description && (
                        <p className="text-sm mb-2">{history.description}</p>
                      )}
                      {history.itemsProvided && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Items: </span>
                          {history.itemsProvided}
                          {history.quantity && ` (Qty: ${history.quantity})`}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2 pt-2 border-t">
                        {history.donor && (
                          <div>
                            <strong>Donor:</strong> {history.donor.name}
                          </div>
                        )}
                        {history.volunteer && (
                          <div>
                            <strong>Volunteer:</strong> {history.volunteer.fullName}
                          </div>
                        )}
                        {history.deliveredBy && (
                          <div>
                            <strong>Delivered by:</strong> {history.deliveredBy}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiaryProfileModal;
