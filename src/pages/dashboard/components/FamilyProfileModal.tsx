// import { useState, useEffect } from "react";
// import { beneficiaryApi, supportHistoryApi } from "@/services/api.service";
// import { Family, Beneficiary, SupportHistory } from "@/types/api";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Users,
//   MapPin,
//   Phone,
//   Mail,
//   Calendar,
//   AlertCircle,
//   UserPlus,
//   Heart,
//   FileText,
//   Home,
// } from "lucide-react";

// interface FamilyProfileModalProps {
//   open: boolean;
//   onClose: () => void;
//   family: Family | null;
//   onRefresh: () => void;
// }

// const FamilyProfileModal = ({
//   open,
//   onClose,
//   family,
//   onRefresh,
// }: FamilyProfileModalProps) => {
//   const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
//   const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
//   const [loadingMembers, setLoadingMembers] = useState(false);
//   const [loadingHistory, setLoadingHistory] = useState(false);

//   useEffect(() => {
//     if (family && open) {
//       fetchFamilyMembers();
//       fetchSupportHistory();
//     }
//   }, [family, open]);

//   const fetchFamilyMembers = async () => {
//     if (!family) return;
    
//     setLoadingMembers(true);
//     try {
//       const response = await beneficiaryApi.getAll({
//         familyId: family.id,
//         limit: 100,
//       });
//       setBeneficiaries(response.data.data);
//     } catch (error) {
//       console.error("Failed to fetch family members", error);
//     } finally {
//       setLoadingMembers(false);
//     }
//   };

//   const fetchSupportHistory = async () => {
//     if (!family) return;
    
//     setLoadingHistory(true);
//     try {
//       const response = await supportHistoryApi.getAll({
//         familyId: family.id,
//         limit: 50,
//       });
//       setSupportHistory(response.data.data);
//     } catch (error) {
//       console.error("Failed to fetch support history", error);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   if (!family) return null;

//   const calculateAge = (dob?: string) => {
//     if (!dob) return null;
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const ageDistribution = beneficiaries.reduce((acc, b) => {
//     const age = b.age || calculateAge(b.dateOfBirth);
//     if (!age) return acc;
    
//     if (age < 5) acc.infants++;
//     else if (age < 13) acc.children++;
//     else if (age < 18) acc.teens++;
//     else if (age < 60) acc.adults++;
//     else acc.seniors++;
    
//     return acc;
//   }, { infants: 0, children: 0, teens: 0, adults: 0, seniors: 0 });

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl flex items-center gap-2">
//             <Users className="h-6 w-6" />
//             {family.familyName}
//           </DialogTitle>
//           <DialogDescription>
//             Family Code: {family.familyCode} | Registered: {new Date(family.createdAt).toLocaleDateString()}
//           </DialogDescription>
//         </DialogHeader>

//         <Tabs defaultValue="information" className="w-full">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="information">Information</TabsTrigger>
//             <TabsTrigger value="members">
//               Members ({beneficiaries.length})
//             </TabsTrigger>
//             <TabsTrigger value="support">Support History</TabsTrigger>
//             <TabsTrigger value="documents">Documents</TabsTrigger>
//           </TabsList>

//           {/* Tab 1: Family Information */}
//           <TabsContent value="information" className="space-y-4">
//             <div className="grid gap-4 md:grid-cols-2">
//               {/* Basic Info Card */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <Users className="mr-2 h-5 w-5" />
//                     Basic Information
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Family Name:</span>
//                     <span className="font-medium">{family.familyName}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Family Code:</span>
//                     <span className="font-medium">{family.familyCode}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Head of Family:</span>
//                     <span className="font-medium">{family.headBeneficiary?.fullName || "N/A"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Number of Members:</span>
//                     <Badge variant="secondary">{family.numberOfMembers || 0}</Badge>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Registration Status:</span>
//                     {family.registrationCompleted ? (
//                       <Badge variant="default">Complete</Badge>
//                     ) : (
//                       <Badge variant="outline">Incomplete</Badge>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Contact Info Card */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <Phone className="mr-2 h-5 w-5" />
//                     Contact Information
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="flex items-start justify-between">
//                     <span className="text-muted-foreground flex items-center">
//                       <Phone className="mr-2 h-4 w-4" />
//                       Primary Phone:
//                     </span>
//                     <span className="font-medium">{family.primaryPhone || "N/A"}</span>
//                   </div>
//                   {family.secondaryPhone && (
//                     <div className="flex items-start justify-between">
//                       <span className="text-muted-foreground flex items-center">
//                         <Phone className="mr-2 h-4 w-4" />
//                         Secondary Phone:
//                       </span>
//                       <span className="font-medium">{family.secondaryPhone}</span>
//                     </div>
//                   )}
//                   {family.email && (
//                     <div className="flex items-start justify-between">
//                       <span className="text-muted-foreground flex items-center">
//                         <Mail className="mr-2 h-4 w-4" />
//                         Email:
//                       </span>
//                       <span className="font-medium">{family.email}</span>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Location Card */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <MapPin className="mr-2 h-5 w-5" />
//                     Location
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Region:</span>
//                     <span className="font-medium">{family.region || "N/A"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Subcity:</span>
//                     <span className="font-medium">{family.subcity || "N/A"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Woreda:</span>
//                     <span className="font-medium">{family.woreda || "N/A"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Kebele:</span>
//                     <span className="font-medium">{family.kebele || "N/A"}</span>
//                   </div>
//                   {family.houseNumber && (
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">House Number:</span>
//                       <span className="font-medium">{family.houseNumber}</span>
//                     </div>
//                   )}
//                   {family.gpsCoordinates && (
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">GPS:</span>
//                       <span className="font-medium text-xs">{family.gpsCoordinates}</span>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Status Card */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <AlertCircle className="mr-2 h-5 w-5" />
//                     Family Status
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-muted-foreground">Urgency Level:</span>
//                     <Badge
//                       variant={
//                         family.urgencyLevel === "high"
//                           ? "destructive"
//                           : family.urgencyLevel === "medium"
//                           ? "secondary"
//                           : "outline"
//                       }
//                       className="capitalize"
//                     >
//                       {family.urgencyLevel || "N/A"}
//                     </Badge>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-muted-foreground">Verification Status:</span>
//                     <Badge
//                       variant={
//                         family.verificationStatus === "verified"
//                           ? "default"
//                           : family.verificationStatus === "pending"
//                           ? "secondary"
//                           : "destructive"
//                       }
//                       className="capitalize"
//                     >
//                       {family.verificationStatus}
//                     </Badge>
//                   </div>
//                   {family.incomeLevel && (
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Income Level:</span>
//                       <span className="font-medium capitalize">{family.incomeLevel.replace("_", " ")}</span>
//                     </div>
//                   )}
//                   {family.housingStatus && (
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Housing Status:</span>
//                       <span className="font-medium capitalize">{family.housingStatus}</span>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Address Details */}
//             {family.addressDetails && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <Home className="mr-2 h-5 w-5" />
//                     Address Details
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-sm">{family.addressDetails}</p>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Notes */}
//             {family.notes && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <FileText className="mr-2 h-5 w-5" />
//                     Notes
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-sm whitespace-pre-wrap">{family.notes}</p>
//                 </CardContent>
//               </Card>
//             )}
//           </TabsContent>

//           {/* Tab 2: Family Members */}
//           <TabsContent value="members" className="space-y-4">
//             {/* Age Distribution */}
//             {beneficiaries.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg">Age Distribution</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-5 gap-4 text-center">
//                     <div>
//                       <div className="text-2xl font-bold">{ageDistribution.infants}</div>
//                       <div className="text-xs text-muted-foreground">0-4 years</div>
//                     </div>
//                     <div>
//                       <div className="text-2xl font-bold">{ageDistribution.children}</div>
//                       <div className="text-xs text-muted-foreground">5-12 years</div>
//                     </div>
//                     <div>
//                       <div className="text-2xl font-bold">{ageDistribution.teens}</div>
//                       <div className="text-xs text-muted-foreground">13-17 years</div>
//                     </div>
//                     <div>
//                       <div className="text-2xl font-bold">{ageDistribution.adults}</div>
//                       <div className="text-xs text-muted-foreground">18-59 years</div>
//                     </div>
//                     <div>
//                       <div className="text-2xl font-bold">{ageDistribution.seniors}</div>
//                       <div className="text-xs text-muted-foreground">60+ years</div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {loadingMembers ? (
//               <div className="text-center py-8">Loading family members...</div>
//             ) : beneficiaries.length === 0 ? (
//               <Card>
//                 <CardContent className="py-8 text-center text-muted-foreground">
//                   <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <p>No family members added yet.</p>
//                   <Button className="mt-4">
//                     <UserPlus className="mr-2 h-4 w-4" />
//                     Add First Member
//                   </Button>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-3">
//                 {beneficiaries.map((member) => (
//                   <Card key={member.id}>
//                     <CardContent className="pt-6">
//                       <div className="flex justify-between items-start">
//                         <div className="space-y-1">
//                           <h4 className="font-semibold">{member.fullName}</h4>
//                           <div className="text-sm text-muted-foreground space-y-1">
//                             <div>
//                               Age: {member.age || calculateAge(member.dateOfBirth) || "N/A"} | 
//                               Gender: {member.gender || "N/A"} | 
//                               Relationship: {member.relationshipToHead || "N/A"}
//                             </div>
//                             {member.educationLevel && (
//                               <div>Education: {member.educationLevel.replace("_", " ")}</div>
//                             )}
//                             {member.schoolName && (
//                               <div>School: {member.schoolName}</div>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           {member.isOrphan && (
//                             <Badge variant="destructive" className="capitalize">
//                               {member.orphanType || "Orphan"}
//                             </Badge>
//                           )}
//                           <Badge
//                             variant={
//                               member.verificationStatus === "verified"
//                                 ? "default"
//                                 : "secondary"
//                             }
//                           >
//                             {member.verificationStatus}
//                           </Badge>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           {/* Tab 3: Support History */}
//           <TabsContent value="support" className="space-y-4">
//             {loadingHistory ? (
//               <div className="text-center py-8">Loading support history...</div>
//             ) : supportHistory.length === 0 ? (
//               <Card>
//                 <CardContent className="py-8 text-center text-muted-foreground">
//                   <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <p>No support history found for this family.</p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-3">
//                 {supportHistory.map((history) => (
//                   <Card key={history.id}>
//                     <CardContent className="pt-6">
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <h4 className="font-semibold">{history.supportType}</h4>
//                           <p className="text-sm text-muted-foreground">
//                             {new Date(history.supportDate).toLocaleDateString()}
//                           </p>
//                         </div>
//                         {history.amountValue && (
//                           <Badge variant="secondary">
//                             {Number(history.amountValue).toFixed(2)} {history.currency || "ETB"}
//                           </Badge>
//                         )}
//                       </div>
//                       {history.description && (
//                         <p className="text-sm mb-2">{history.description}</p>
//                       )}
//                       {history.itemsProvided && (
//                         <div className="text-sm">
//                           <span className="text-muted-foreground">Items: </span>
//                           {history.itemsProvided}
//                           {history.quantity && ` (Qty: ${history.quantity})`}
//                         </div>
//                       )}
//                       <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2 pt-2 border-t">
//                         {history.donor && (
//                           <div>
//                             <strong>Donor:</strong> {history.donor.name}
//                           </div>
//                         )}
//                         {history.volunteer && (
//                           <div>
//                             <strong>Volunteer:</strong> {history.volunteer.fullName}
//                           </div>
//                         )}
//                         {history.deliveredBy && (
//                           <div>
//                             <strong>Delivered by:</strong> {history.deliveredBy}
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           {/* Tab 4: Documents */}
//           <TabsContent value="documents" className="space-y-4">
//             <Card>
//               <CardContent className="py-8 text-center text-muted-foreground">
//                 <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                 <p>Document upload feature coming soon.</p>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default FamilyProfileModal;

import { useState, useEffect, useMemo } from "react";
import { supportHistoryApi } from "@/services/api.service";
import type { Family, Beneficiary, SupportHistory } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Heart,
  FileText,
  Home,
} from "lucide-react";

interface FamilyProfileModalProps {
  open: boolean;
  onClose: () => void;
  family: Family | null;
  onRefresh: () => void;
}

const FamilyProfileModal = ({ open, onClose, family }: FamilyProfileModalProps) => {
  const [members, setMembers] = useState<Beneficiary[]>([]);
  const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!family || !open) return;
    setMembers(family.beneficiaries || []);
  }, [family, open]);

  useEffect(() => {
    if (!family || !open) return;
    fetchSupportHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family?.id, open]);

  const fetchSupportHistory = async () => {
    if (!family) return;

    setLoadingHistory(true);
    try {
      const response = await supportHistoryApi.getAll({
        familyId: family.id,
        limit: 50,
      });
      setSupportHistory(response.data.data);
    } catch (error) {
      console.error("Failed to fetch support history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!family) return null;

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

  const ageDistribution = useMemo(() => {
    return members.reduce(
      (acc, m) => {
        const age = m.age || calculateAge(m.dateOfBirth);
        if (age === null || age === undefined) return acc;

        if (age < 5) acc.infants++;
        else if (age < 13) acc.children++;
        else if (age < 18) acc.teens++;
        else if (age < 60) acc.adults++;
        else acc.seniors++;

        return acc;
      },
      { infants: 0, children: 0, teens: 0, adults: 0, seniors: 0 }
    );
  }, [members]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            {family.familyName}
          </DialogTitle>
          <DialogDescription>
            Family Code: {family.familyCode} | Registered:{" "}
            {new Date(family.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="support">Support History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Name:</span>
                    <span className="font-medium">{family.familyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Code:</span>
                    <span className="font-medium">{family.familyCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Head of Family:</span>
                    <span className="font-medium">{family.headBeneficiary?.fullName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Members:</span>
                    <Badge variant="secondary">{family.numberOfMembers || members.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration Status:</span>
                    {family.registrationCompleted ? (
                      <Badge variant="default">Complete</Badge>
                    ) : (
                      <Badge variant="outline">Incomplete</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Primary Phone:
                    </span>
                    <span className="font-medium">{family.primaryPhone || "N/A"}</span>
                  </div>
                  {family.secondaryPhone && (
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Secondary Phone:
                      </span>
                      <span className="font-medium">{family.secondaryPhone}</span>
                    </div>
                  )}
                  {family.email && (
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email:
                      </span>
                      <span className="font-medium">{family.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="mr-2 h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span className="font-medium">{family.region || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subcity:</span>
                    <span className="font-medium">{family.subcity || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Woreda:</span>
                    <span className="font-medium">{family.woreda || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kebele:</span>
                    <span className="font-medium">{family.kebele || "N/A"}</span>
                  </div>
                  {family.houseNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">House Number:</span>
                      <span className="font-medium">{family.houseNumber}</span>
                    </div>
                  )}
                  {family.gpsCoordinates && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GPS:</span>
                      <span className="font-medium text-xs">{family.gpsCoordinates}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Family Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Urgency Level:</span>
                    <Badge
                      variant={
                        family.urgencyLevel === "high"
                          ? "destructive"
                          : family.urgencyLevel === "medium"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {family.urgencyLevel || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Verification Status:</span>
                    <Badge
                      variant={
                        family.verificationStatus === "verified"
                          ? "default"
                          : family.verificationStatus === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="capitalize"
                    >
                      {family.verificationStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {family.addressDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Home className="mr-2 h-5 w-5" />
                    Address Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{family.addressDetails}</p>
                </CardContent>
              </Card>
            )}

            {family.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{family.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{ageDistribution.infants}</div>
                      <div className="text-xs text-muted-foreground">0-4 years</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{ageDistribution.children}</div>
                      <div className="text-xs text-muted-foreground">5-12 years</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{ageDistribution.teens}</div>
                      <div className="text-xs text-muted-foreground">13-17 years</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{ageDistribution.adults}</div>
                      <div className="text-xs text-muted-foreground">18-59 years</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{ageDistribution.seniors}</div>
                      <div className="text-xs text-muted-foreground">60+ years</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {members.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No family members added yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{m.fullName}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              Age: {m.age || calculateAge(m.dateOfBirth) || "N/A"} | Gender:{" "}
                              {m.gender || "N/A"} | Relationship: {m.relationshipToHead || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {m.isOrphan && (
                            <Badge variant="destructive" className="capitalize">
                              {m.orphanType || "Orphan"}
                            </Badge>
                          )}
                          <Badge variant={m.verificationStatus === "verified" ? "default" : "secondary"}>
                            {m.verificationStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            {loadingHistory ? (
              <div className="text-center py-8">Loading support history...</div>
            ) : supportHistory.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No support history found for this family.</p>
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
                      {history.description && <p className="text-sm mb-2">{history.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Document upload feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyProfileModal;