// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { familyApi, supportHistoryApi } from "@/services/api.service";
// import RecordSupportModal from "./components/RecordSupportModal";
// import { Family, Beneficiary, SupportHistory } from "@/types/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Users,
//   MapPin,
//   Phone,
//   Mail,
//   AlertCircle,
//   UserPlus,
//   Heart,
//   FileText,
//   Home,
//   Edit,
//   ArrowLeft,
//   CheckCircle,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import RegistrationStatusBadge from "@/components/RegistrationStatusBadge";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// const FamilyProfile = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [family, setFamily] = useState<Family | null>(null);
//   const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
//   const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMembers, setLoadingMembers] = useState(false);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [showRecordSupportModal, setShowRecordSupportModal] = useState(false);

//   useEffect(() => {
//     if (id) {
//       fetchFamily();
//       fetchFamilyMembers();
//       fetchSupportHistory();
//     }
//   }, [id]);

//   const fetchFamily = async () => {
//     if (!id) return;
    
//     setLoading(true);
//     try {
//       const response = await familyApi.getById(id);
      
//       const fam = response.data;
//       setFamily(fam);
//       setBeneficiaries(fam.beneficiaries || []);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to fetch family",
//         variant: "destructive",
//       });
//       navigate("/dashboard/families");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const fetchFamilyMembers = async () => {
//   //   if (!id) return;
    
//   //   setLoadingMembers(true);
//   //   try {
//   //     const response = await beneficiaryApi.getAll({
//   //       familyId: id,
//   //       limit: 100,
//   //     });
//   //     setBeneficiaries(response.data.data);
//   //   } catch (error) {
//   //     console.error("Failed to fetch family members", error);
//   //   } finally {
//   //     setLoadingMembers(false);
//   //   }
//   // };

//   const fetchSupportHistory = async () => {
//     if (!id) return;
    
//     setLoadingHistory(true);
//     try {
//       const response = await supportHistoryApi.getAll({
//         familyId: id,
//         limit: 50,
//       });
//       setSupportHistory(response.data.data);
//     } catch (error) {
//       console.error("Failed to fetch support history", error);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   const handleVerify = async () => {
//     if (!family) return;
    
//     try {
//       await familyApi.update(family.id, { isVerified: true });
//       toast({
//         title: "Success",
//         description: "Family verified successfully",
//       });
//       fetchFamily();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to verify family",
//         variant: "destructive",
//       });
//     }
//   };

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

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="text-lg">Loading family details...</div>
//         </div>
//       </div>
//     );
//   }

//   if (!family) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="text-lg text-muted-foreground">Family not found</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/families")}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <div>
//             <div className="flex items-center gap-3">
//               <h1 className="text-3xl font-bold">{family.familyName}</h1>
//               <RegistrationStatusBadge status={family.registrationStatus} />
//             </div>
//             <p className="text-muted-foreground">
//               Family Code: {family.familyCode} | Registered: {new Date(family.createdAt).toLocaleDateString()}
//             </p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => setShowRecordSupportModal(true)}>
//             <Heart className="mr-2 h-4 w-4" />
//             Record Support
//           </Button>
//           {family.registrationStatus !== "verified" && (
//             <Button variant="outline" onClick={handleVerify}>
//               <CheckCircle className="mr-2 h-4 w-4" />
//               Verify Family
//             </Button>
//           )}
//           <Button variant="outline" onClick={() => navigate(`/dashboard/families/${id}/edit`)}>
//             <Edit className="mr-2 h-4 w-4" />
//             Edit Details
//           </Button>

//         </div>
//       </div>

//       {/* Registration Status Banner */}
//       {family.registrationStatus === "incomplete" && (
//         <Alert variant="destructive">
//           <AlertDescription className="flex items-center justify-between">
//             <span>
//               <strong>Incomplete Registration:</strong> This family needs a head assigned and required fields filled to move to pending status.
//             </span>
//             <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/families/${id}/edit`)}>
//               Complete Registration
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}
//       {family.registrationStatus === "pending" && (
//         <Alert>
//           <AlertDescription className="flex items-center justify-between">
//             <span>
//               <strong>Pending Verification:</strong> This family has all required information and is awaiting admin verification.
//             </span>
//             <Button variant="outline" size="sm" onClick={handleVerify}>
//               Verify Now
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}

//       <Tabs defaultValue="information" className="w-full">
//         <TabsList>
//           <TabsTrigger value="information">Information</TabsTrigger>
//           <TabsTrigger value="members">
//             Members ({beneficiaries.length})
//           </TabsTrigger>
//           <TabsTrigger value="support">Support History</TabsTrigger>
//           <TabsTrigger value="documents">Documents</TabsTrigger>
//         </TabsList>

//         {/* Tab 1: Family Information */}
//         <TabsContent value="information" className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-2">
//             {/* Basic Info Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <Users className="mr-2 h-5 w-5" />
//                   Basic Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Family Name:</span>
//                   <span className="font-medium">{family.familyName}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Family Code:</span>
//                   <span className="font-medium">{family.familyCode}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Head of Family:</span>
//                   <span className="font-medium">{family.headBeneficiary?.fullName || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Number of Members:</span>
//                   <Badge variant="secondary">{family.numberOfMembers || 0}</Badge>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Registration Status:</span>
//                   {family.registrationCompleted ? (
//                     <Badge variant="default">Complete</Badge>
//                   ) : (
//                     <Badge variant="outline">Incomplete</Badge>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Contact Info Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <Phone className="mr-2 h-5 w-5" />
//                   Contact Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex items-start justify-between">
//                   <span className="text-muted-foreground flex items-center">
//                     <Phone className="mr-2 h-4 w-4" />
//                     Primary Phone:
//                   </span>
//                   <span className="font-medium">{family.primaryPhone || "N/A"}</span>
//                 </div>
//                 {family.secondaryPhone && (
//                   <div className="flex items-start justify-between">
//                     <span className="text-muted-foreground flex items-center">
//                       <Phone className="mr-2 h-4 w-4" />
//                       Secondary Phone:
//                     </span>
//                     <span className="font-medium">{family.secondaryPhone}</span>
//                   </div>
//                 )}
//                 {family.email && (
//                   <div className="flex items-start justify-between">
//                     <span className="text-muted-foreground flex items-center">
//                       <Mail className="mr-2 h-4 w-4" />
//                       Email:
//                     </span>
//                     <span className="font-medium">{family.email}</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Location Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <MapPin className="mr-2 h-5 w-5" />
//                   Location
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Region:</span>
//                   <span className="font-medium">{family.region || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Subcity:</span>
//                   <span className="font-medium">{family.subcity || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Woreda:</span>
//                   <span className="font-medium">{family.woreda || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Kebele:</span>
//                   <span className="font-medium">{family.kebele || "N/A"}</span>
//                 </div>
//                 {family.houseNumber && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">House Number:</span>
//                     <span className="font-medium">{family.houseNumber}</span>
//                   </div>
//                 )}
//                 {family.gpsCoordinates && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">GPS:</span>
//                     <span className="font-medium text-xs">{family.gpsCoordinates}</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Status Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <AlertCircle className="mr-2 h-5 w-5" />
//                   Family Status
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-muted-foreground">Urgency Level:</span>
//                   <Badge
//                     variant={
//                       family.urgencyLevel === "high"
//                         ? "destructive"
//                         : family.urgencyLevel === "medium"
//                         ? "secondary"
//                         : "outline"
//                     }
//                     className="capitalize"
//                   >
//                     {family.urgencyLevel || "N/A"}
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-muted-foreground">Verification Status:</span>
//                   <Badge
//                     variant={
//                       family.verificationStatus === "verified"
//                         ? "default"
//                         : family.verificationStatus === "pending"
//                         ? "secondary"
//                         : "destructive"
//                     }
//                     className="capitalize"
//                   >
//                     {family.verificationStatus}
//                   </Badge>
//                 </div>
//                 {family.incomeLevel && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Income Level:</span>
//                     <span className="font-medium capitalize">{family.incomeLevel.replace("_", " ")}</span>
//                   </div>
//                 )}
//                 {family.housingStatus && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Housing Status:</span>
//                     <span className="font-medium capitalize">{family.housingStatus}</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Address Details */}
//           {family.addressDetails && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <Home className="mr-2 h-5 w-5" />
//                   Address Details
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm">{family.addressDetails}</p>
//               </CardContent>
//             </Card>
//           )}

//           {/* Notes */}
//           {family.notes && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <FileText className="mr-2 h-5 w-5" />
//                   Notes
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm whitespace-pre-wrap">{family.notes}</p>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         {/* Tab 2: Family Members */}
//         <TabsContent value="members" className="space-y-4">
//           {/* Age Distribution */}
//           {beneficiaries.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Age Distribution</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-5 gap-4 text-center">
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.infants}</div>
//                     <div className="text-xs text-muted-foreground">0-4 years</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.children}</div>
//                     <div className="text-xs text-muted-foreground">5-12 years</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.teens}</div>
//                     <div className="text-xs text-muted-foreground">13-17 years</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.adults}</div>
//                     <div className="text-xs text-muted-foreground">18-59 years</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.seniors}</div>
//                     <div className="text-xs text-muted-foreground">60+ years</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {loadingMembers ? (
//             <div className="text-center py-8">Loading family members...</div>
//           ) : beneficiaries.length === 0 ? (
//             <Card>
//               <CardContent className="py-12 text-center text-muted-foreground">
//                 <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-lg mb-2">No family members added yet.</p>
//                 <Button 
//                   className="mt-4"
//                   onClick={() => navigate(`/dashboard/families/${id}/add-member`)}
//                 >
//                   <UserPlus className="mr-2 h-4 w-4" />
//                   Add First Member
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid gap-3 md:grid-cols-2">
//               {beneficiaries.map((member) => (
//                 <Card 
//                   key={member.id} 
//                   className="cursor-pointer hover:shadow-md transition-shadow"
//                   onClick={() => navigate(`/dashboard/beneficiaries/${member.id}`)}
//                 >
//                   <CardContent className="pt-6">
//                     <div className="flex justify-between items-start">
//                       <div className="space-y-1 flex-1">
//                         <h4 className="font-semibold text-lg">{member.fullName}</h4>
//                         <div className="text-sm text-muted-foreground space-y-1">
//                           <div>
//                             Age: {member.age || calculateAge(member.dateOfBirth) || "N/A"} | 
//                             Gender: {member.gender || "N/A"}
//                           </div>
//                           <div>
//                             Relationship: {member.relationshipToHead || "N/A"}
//                           </div>
//                           {member.educationLevel && (
//                             <div>Education: {member.educationLevel.replace("_", " ")}</div>
//                           )}
//                           {member.schoolName && (
//                             <div>School: {member.schoolName}</div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-2 items-end">
//                         {member.isOrphan && (
//                           <Badge variant="destructive" className="capitalize">
//                             {member.orphanType || "Orphan"}
//                           </Badge>
//                         )}
//                         <Badge
//                           variant={
//                             member.verificationStatus === "verified"
//                               ? "default"
//                               : "secondary"
//                           }
//                         >
//                           {member.verificationStatus}
//                         </Badge>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         {/* Tab 3: Support History */}
//         <TabsContent value="support" className="space-y-4">
//           {loadingHistory ? (
//             <div className="text-center py-8">Loading support history...</div>
//           ) : supportHistory.length === 0 ? (
//             <Card>
//               <CardContent className="py-12 text-center text-muted-foreground">
//                 <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-lg">No support history found for this family.</p>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="space-y-3">
//               {supportHistory.map((history) => (
//                 <Card key={history.id}>
//                   <CardContent className="pt-6">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h4 className="font-semibold text-lg">{history.supportType}</h4>
//                         <p className="text-sm text-muted-foreground">
//                           {new Date(history.supportDate).toLocaleDateString()}
//                         </p>
//                       </div>
//                       {history.amountValue && (
//                         <Badge variant="default" className="text-base px-3 py-1">
//                           {Number(history.amountValue).toFixed(2)} {history.currency || "ETB"}
//                         </Badge>
//                       )}
//                     </div>
                    
//                     {history.description && (
//                       <p className="text-sm mb-3">{history.description}</p>
//                     )}
                    
//                     {history.itemsProvided && Array.isArray(history.itemsProvided) && (
//                       <div className="mb-3">
//                         <span className="text-sm font-medium text-muted-foreground">Items Provided:</span>
//                         <ul className="mt-1 space-y-1">
//                           {history.itemsProvided.map((item: any, idx: number) => (
//                             <li key={idx} className="text-sm ml-4">
//                               • {item.name}: {item.quantity} {item.unit}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
                    
//                     <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t">
//                       {history.donor && (
//                         <div>
//                           <strong>Donor:</strong> {history.donor.name}
//                         </div>
//                       )}
//                       {history.volunteer && (
//                         <div>
//                           <strong>Volunteer:</strong> {history.volunteer.fullName}
//                         </div>
//                       )}
//                       {history.deliveredBy && (
//                         <div>
//                           <strong>Delivered by:</strong> {history.deliveredBy}
//                         </div>
//                       )}
//                       {history.notes && (
//                         <div className="w-full">
//                           <strong>Notes:</strong> {history.notes}
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         {/* Tab 4: Documents */}
//         <TabsContent value="documents" className="space-y-4">
//           <Card>
//             <CardContent className="py-12 text-center text-muted-foreground">
//               <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
//               <p className="text-lg">Document upload feature coming soon.</p>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Record Support Modal */}
//       <RecordSupportModal
//         open={showRecordSupportModal}
//         onClose={() => setShowRecordSupportModal(false)}
//         targetType="family"
//         targetId={family.id}
//         targetName={family.familyName}
//         onSuccess={() => {
//           fetchSupportHistory();
//           setShowRecordSupportModal(false);
//         }}
//       />
//     </div>
//   );
// };

// export default FamilyProfile;

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { familyApi, supportHistoryApi } from "@/services/api.service";
import RecordSupportModal from "./components/RecordSupportModal";
import type { Family, Beneficiary, SupportHistory } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  UserPlus,
  Heart,
  FileText,
  Home,
  Edit,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RegistrationStatusBadge from "@/components/RegistrationStatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FamilyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Beneficiary[]>([]);
  const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showRecordSupportModal, setShowRecordSupportModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchFamily();
    fetchSupportHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFamily = async () => {
    if (!id) return;

    setLoadingFamily(true);
    try {
      const response = await familyApi.getById(id);
      const fam: Family = response.data;

      setFamily(fam);
      setMembers(fam.beneficiaries || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch family",
        variant: "destructive",
      });
      navigate("/dashboard/families");
    } finally {
      setLoadingFamily(false);
    }
  };

  const fetchSupportHistory = async () => {
    if (!id) return;

    setLoadingHistory(true);
    try {
      const response = await supportHistoryApi.getAll({
        familyId: id,
        limit: 50,
      });
      setSupportHistory(response.data.data);
    } catch (error) {
      console.error("Failed to fetch support history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleVerify = async () => {
    if (!family) return;

    try {
      await familyApi.update(family.id, { isVerified: true });
      toast({
        title: "Success",
        description: "Family verified successfully",
      });
      fetchFamily();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify family",
        variant: "destructive",
      });
    }
  };

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

  if (loadingFamily) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">Loading family details...</div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Family not found</div>
        </div>
      </div>
    );
  }

  const goToEditMembers = () => navigate(`/dashboard/families/${family.id}/edit?focus=members`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/families")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{family.familyName}</h1>
              <RegistrationStatusBadge status={family.registrationStatus} />
            </div>
            <p className="text-muted-foreground">
              Family Code: {family.familyCode} | Registered:{" "}
              {new Date(family.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRecordSupportModal(true)}>
            <Heart className="mr-2 h-4 w-4" />
            Record Support
          </Button>

          {family.registrationStatus !== "verified" && (
            <Button variant="outline" onClick={handleVerify}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Family
            </Button>
          )}

          <Button variant="outline" onClick={() => navigate(`/dashboard/families/${family.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        </div>
      </div>

      {family.registrationStatus === "incomplete" && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Incomplete Registration:</strong> Add at least one member and complete required
              fields.
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/families/${family.id}/edit`)}>
              Complete Registration
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {family.registrationStatus === "pending" && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Pending Verification:</strong> This family is awaiting admin verification.
            </span>
            <Button variant="outline" size="sm" onClick={handleVerify}>
              Verify Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="information" className="w-full">
        <TabsList>
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No family members added yet.</p>
                <Button className="mt-4" onClick={goToEditMembers}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-lg">{member.fullName}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            Age: {member.age || calculateAge(member.dateOfBirth) || "N/A"} | Gender:{" "}
                            {member.gender || "N/A"}
                          </div>
                          <div>Relationship: {member.relationshipToHead || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        {member.isOrphan && (
                          <Badge variant="destructive" className="capitalize">
                            {member.orphanType || "Orphan"}
                          </Badge>
                        )}
                        <Badge variant={member.verificationStatus === "verified" ? "default" : "secondary"}>
                          {member.verificationStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={goToEditMembers}>
                        Manage members
                      </Button>
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No support history found for this family.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {supportHistory.map((history) => (
                <Card key={history.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{history.supportType}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.supportDate).toLocaleDateString()}
                        </p>
                      </div>
                      {history.amountValue && (
                        <Badge variant="default" className="text-base px-3 py-1">
                          {Number(history.amountValue).toFixed(2)} {history.currency || "ETB"}
                        </Badge>
                      )}
                    </div>

                    {history.description && <p className="text-sm mb-3">{history.description}</p>}

                    {history.itemsProvided && Array.isArray(history.itemsProvided) && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Items Provided:</span>
                        <ul className="mt-1 space-y-1">
                          {history.itemsProvided.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm ml-4">
                              • {item.name}: {item.quantity} {item.unit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t">
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
                      {history.notes && (
                        <div className="w-full">
                          <strong>Notes:</strong> {history.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Document upload feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RecordSupportModal
        open={showRecordSupportModal}
        onClose={() => setShowRecordSupportModal(false)}
        targetType="family"
        targetId={family.id}
        targetName={family.familyName}
        onSuccess={() => {
          fetchSupportHistory();
          setShowRecordSupportModal(false);
        }}
      />
    </div>
  );
};

export default FamilyProfile;