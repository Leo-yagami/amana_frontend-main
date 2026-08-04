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

// import { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { familyApi, supportHistoryApi } from "@/services/api.service";
// import RecordSupportModal from "./components/RecordSupportModal";
// import type { Family, Beneficiary, SupportHistory } from "@/types/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
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
//   const [members, setMembers] = useState<Beneficiary[]>([]);
//   const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
//   const [loadingFamily, setLoadingFamily] = useState(true);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [showRecordSupportModal, setShowRecordSupportModal] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     fetchFamily();
//     fetchSupportHistory();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const fetchFamily = async () => {
//     if (!id) return;

//     setLoadingFamily(true);
//     try {
//       const response = await familyApi.getById(id);
//       const fam: Family = response.data;

//       setFamily(fam);
//       setMembers(fam.members || []);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to fetch family",
//         variant: "destructive",
//       });
//       navigate("/dashboard/families");
//     } finally {
//       setLoadingFamily(false);
//     }
//   };

//   const fetchSupportHistory = async () => {
//     if (!id) return;

//     setLoadingHistory(true);
//     try {
//       const response = await supportHistoryApi.getAll({
//         familyId: id,
//         limit: 50,
//       });
//       console.log("response motherfucker",response)
//       setSupportHistory(response.data);
//     } catch (error) {
//       console.error("Failed to fetch support history", error);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   const handleVerify = async () => {
//     if (!family) return;

//     try {
//       await familyApi.update(family._id, { isVerified: true });
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

//   const ageDistribution = useMemo(() => {
//     return members.reduce(
//       (acc, m) => {
//         const ageGroup = m.ageGroup;
//         if (ageGroup === null || ageGroup === undefined) return acc;

//         if (ageGroup === "child") acc.children++;
//         else if (ageGroup === "teen") acc.teens++;
//         else acc.adults++;

//         return acc;
//       },
//       {children: 0, teens: 0, adults: 0}
//     );
//   }, [members]);

//   if (loadingFamily) {
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

//   const goToEditMembers = () => navigate(`/dashboard/families/${family._id}/edit?focus=members`);

//   return (
//     <div className="space-y-6">
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
//               Family Code: {family.familyCode} | Registered:{" "}
//               {new Date(family.createdAt).toLocaleDateString()}
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

//           <Button variant="outline" onClick={() => navigate(`/dashboard/families/${family._id}/edit`)}>
//             <Edit className="mr-2 h-4 w-4" />
//             Edit Details
//           </Button>
//         </div>
//       </div>

//       {family.registrationStatus === "incomplete" && (
//         <Alert variant="destructive">
//           <AlertDescription className="flex items-center justify-between">
//             <span>
//               <strong>Incomplete Registration:</strong> Add at least one member and complete required
//               fields.
//             </span>
//             <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/families/${family.id}/edit`)}>
//               Complete Registration
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}

//       {family.registrationStatus === "pending" && (
//         <Alert>
//           <AlertDescription className="flex items-center justify-between">
//             <span>
//               <strong>Pending Verification:</strong> This family is awaiting admin verification.
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
//           <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
//           <TabsTrigger value="support">Support History</TabsTrigger>
//           <TabsTrigger value="documents">Documents</TabsTrigger>
//         </TabsList>

//         <TabsContent value="information" className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-2">
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
//                   <span className="font-medium">{family.familyHead || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Number of Members:</span>
//                   <Badge variant="secondary">{members.length || 0}</Badge>
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

//             { false && (<Card>
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
//             </Card>)}
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
//                           ? "secondary"
//                           : "outline"
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
//                       family.registrationStatus === "verified"
//                         ? "default"
//                         : family.registrationStatus === "pending"
//                           ? "secondary"
//                           : "destructive"
//                     }
//                     className="capitalize"
//                   >
//                     {family.verificationStatus}
//                   </Badge>
//                 </div>
//               </CardContent>
//             </Card>
//             {/*notes replacing forth card which was the location and region information */}
//             {family.notes && (
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
//             )}
//           </div>

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
//         </TabsContent>

//         <TabsContent value="members" className="space-y-4">
//           {members.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Age Distribution</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   {false && (<div>
//                       <div className="text-2xl font-bold">{ageDistribution.infants}</div>
//                       <div className="text-xs text-muted-foreground">0-4 years</div>
//                     </div>
//                   )}
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.children}</div>
//                     <div className="text-xs text-muted-foreground">0-12 years</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.teens}</div>
//                     <div className="text-xs text-muted-foreground">13-18 years</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold">{ageDistribution.adults}</div>
//                     <div className="text-xs text-muted-foreground">19+ years</div>
//                   </div>
//                   {false  && (<div>
//                     <div className="text-2xl font-bold">{ageDistribution.seniors}</div>
//                     <div className="text-xs text-muted-foreground">60+ years</div>
//                   </div>)}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {members.length === 0 ? (
//             <Card>
//               <CardContent className="py-12 text-center text-muted-foreground">
//                 <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-lg mb-2">No family members added yet.</p>
//                 <Button className="mt-4" onClick={goToEditMembers}>
//                   <UserPlus className="mr-2 h-4 w-4" />
//                   Add First Member
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid gap-3 md:grid-cols-2">
//               {members.map((member) => (
//                 <Card key={member.id}>
//                   <CardContent className="pt-6">
//                     <div className="flex justify-between items-start">
//                       <div className="space-y-1 flex-1">
//                         <h4 className="font-semibold text-lg">{member.fullName}</h4>
//                         <div className="text-sm text-muted-foreground space-y-1">
//                           <div>
//                             Age Group: {member.ageGroup || calculateAge(member.dateOfBirth) || "N/A"}
//                           </div>
//                           <div>
//                             Gender:{" "}{member.gender || "N/A"}
//                           </div>
//                           {false && (<div>Relationship: {member.relationshipToHead || "N/A"}</div>)}
//                         </div>
//                       </div>

//                       <div className="flex flex-col gap-2 items-end">
//                         {member.isOrphan && (
//                           <Badge variant="destructive" className="capitalize">
//                             {member.orphanType || "Orphan"}
//                           </Badge>
//                         )}
//                         <Badge variant={member.verificationStatus === "verified" ? "default" : "secondary"}>
//                           {member.verificationStatus}
//                         </Badge>
//                       </div>
//                     </div>

//                     <div className="mt-4">
//                       <Button variant="outline" size="sm" onClick={goToEditMembers}>
//                         Manage members
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>

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

//                     {history.description && <p className="text-sm mb-3">{history.description}</p>}

//                     {history.itemsProvided && Array.isArray(history.itemsProvided) && (
//                       <div className="mb-3">
//                         <span className="text-sm font-medium text-muted-foreground">Items Provided:</span>
//                         <ul className="mt-1 space-y-1">
//                           {history.itemsProvided.map((item: any, idx: number) => (
//                             <>
//                             <li key={idx} className="text-md ml-4">
//                               • {item.name}
//                               <ul className="pl-4 text-sm">
//                                 <li>Quantity: {item.quantity}</li>
//                                 <li>Unit: {item.unit}</li>
//                               </ul>
//                             </li>
//                             </>
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

//         <TabsContent value="documents" className="space-y-4">
//           <Card>
//             <CardContent className="py-12 text-center text-muted-foreground">
//               <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
//               <p className="text-lg">Document upload feature coming soon.</p>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       <RecordSupportModal
//         open={showRecordSupportModal}
//         onClose={() => setShowRecordSupportModal(false)}
//         targetType="family"
//         targetId={family._id}
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


import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { familyApi, supportHistoryApi, beneficiaryApi } from "@/services/api.service";
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
  ExternalLink,
  User,
  Baby,
  Accessibility,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RegistrationStatusBadge from "@/components/RegistrationStatusBadge";
import FamilyClassificationBadge from "@/components/FamilyClassificationBadge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useTranslation } from "react-i18next";
const FamilyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Beneficiary[]>([]);
  const [supportHistory, setSupportHistory] = useState<SupportHistory[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showRecordSupportModal, setShowRecordSupportModal] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState<string[]>([]);
  const [classificationMemberIds, setClassificationMemberIds] = useState<Record<string, string[]>>({});

  const getEffectiveClassification = useCallback(() => {
    if (family?.familyClassification && family.familyClassification.length > 0) {
      return family.familyClassification;
    }
    const memberClasses = new Set(
      (members || []).map((m) => (m as any).memberClassification).filter(Boolean)
    );
    return memberClasses.size > 0 ? Array.from(memberClasses) : [];
  }, [family?.familyClassification, members]);

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
      setMembers(fam.members || []);
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
      console.log("response motherfucker", response);
      setSupportHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch support history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleVerify = async () => {
    if (!family) return;
    const existingClasses = getEffectiveClassification();
    const initialMemberClassMap: Record<string, string[]> = {};
    (family.members || []).forEach((m: any, idx: number) => {
      const cls = m.memberClassification;
      if (cls) {
        if (!initialMemberClassMap[cls]) initialMemberClassMap[cls] = [];
        initialMemberClassMap[cls].push(m._id || m.id || `__idx_${idx}`);
      }
    });
    setSelectedClassification(existingClasses);
    setClassificationMemberIds(initialMemberClassMap);
    setVerifyDialogOpen(true);
  };

  const handleVerifyWithClassification = async () => {
    if (!family) return;
    try {
      const memberClassMap: Record<string, string> = {};
      Object.entries(classificationMemberIds).forEach(([cls, ids]) => {
        ids.forEach((id) => { memberClassMap[id] = cls; });
      });

      const membersPayload = (members || []).map((m: any, idx: number) => {
        const memberId = m._id || m.id || `__idx_${idx}`;
        return {
          fullName: m.fullName,
          gender: m.gender || undefined,
          ageGroup: m.ageGroup,
          beneficiaryType: m.beneficiaryType || (m.ageGroup === "adult" ? "adult" : "child"),
          photoUrl: m.photoUrl || undefined,
          isOrphan: m.isOrphan || false,
          orphanType: m.orphanType || "none",
          memberClassification: memberClassMap[memberId] !== undefined ? memberClassMap[memberId] : null,
        };
      });

      await familyApi.update(family._id, {
        isVerified: true,
        familyClassification: selectedClassification.length > 0 ? selectedClassification : [],
        members: membersPayload,
      });

      toast({
        title: "Success",
        description: "Family verified successfully",
      });
      setVerifyDialogOpen(false);
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
        const ageGroup = m.ageGroup;
        if (!ageGroup) return acc;

        if (ageGroup === "child") acc.children++;
        else if (ageGroup === "teen") acc.teens++;
        else acc.adults++;

        return acc;
      },
      { children: 0, teens: 0, adults: 0 }
    );
  }, [members]);

  if (loadingFamily) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">{t("familyProfile.loadingFamilyDetails")}</div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">{t("familyProfile.familyNotFound")}</div>
        </div>
      </div>
    );
  }

  const goToEditMembers = () =>
    navigate(`/dashboard/families/${family._id}/edit?focus=members`);

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden w-full">
      {/* HEADER (responsive stacking) */}
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"> */}
      {false && (<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full min-w-0 overflow-hidden">
        {/* <div className="flex items-start gap-4"> */}
        {/* <div className="flex items-start gap-4 min-w-0 w-full"> */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/families")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* <div className="min-w-0"> */}
          <div className="min-w-0 w-full">
            <div className="flex flex-col items-start sm:items-center sm:flex-row gap-2 sm:gap-3 sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold truncate max-w-full">
                {family.familyName}
              </h1>
              <RegistrationStatusBadge status={family.registrationStatus} />
            </div>

            <p className="text-sm sm:text-base text-muted-foreground truncate max-w-full">
              Family Code: {family.familyCode} | Registered:{" "}
              {new Date(family.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2"> */}
        {/* <div className="flex flex-wrap gap-2 justify-start lg:justify-end max-w-full"> */}
        <div className="flex flex-wrap gap-2 justify-start lg:justify-end min-w-0 shrink-0">
          <Button
            variant="outline"
            onClick={() => setShowRecordSupportModal(true)}
            className="text-xs sm:text-sm"
          >
            <Heart className="mr-2 h-4 w-4" />
            {t("familyProfile.recordSupport")}
          </Button>

          {family.registrationStatus !== "verified" && (
            <Button variant="outline" onClick={handleVerify} className="text-xs sm:text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("familyProfile.verifyFamily")}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/families/${family._id}/edit`)}
            className="text-xs sm:text-sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("familyProfile.editDetails")}
          </Button>
        </div>
      </div>)}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start lg:items-center gap-4 w-full overflow-hidden">
    
        {/* LEFT SIDE */}
        <div className="flex items-start gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/families")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">
                {family.familyName}
              </h1>
              <RegistrationStatusBadge status={family.registrationStatus} />
              {family.familyClassification && family.familyClassification.length > 0 && (
                <FamilyClassificationBadge classification={family.familyClassification} t={t} />
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground ">
              Family Code: {family.familyCode} |
              <br className="block sm:hidden">
              </br>
               Registered:{" "}
              {new Date(family.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        {/* <div className="flex flex-wrap gap-1 justify-stretch lg:justify-end"> */}
        <div className="grid grid-cols-2 gap-1 justify-stretch  lg:justify-end">
          <Button className="gap-1 sm:gap-2" variant="outline" onClick={() => setShowRecordSupportModal(true)}>
            <Heart className="mr-1 sm:mr-2 h-4 w-4" />
            {t("familyProfile.recordSupport")}
          </Button>

          {family.registrationStatus !== "verified" && (
            <Button variant="outline" 
             onClick={handleVerify}
             className="gap-1 sm:gap-2"
             >
              <CheckCircle className="mr:1 sm:mr-2 h-4 w-4" />
              {t("familyProfile.verifyFamily")}
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-1 sm:gap-2"
            onClick={() => navigate(`/dashboard/families/${family._id}/edit`)}
          >
            <Edit className="mr-1 sm:mr-2 h-4 w-4" />
            {t("familyProfile.editDetails")}
          </Button>
        </div>

      </div>

      {/* ALERTS */}
      {family.registrationStatus === "incomplete" && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              <strong>{t("familyProfile.incompleteAlertTitle")}</strong> {t("familyProfile.incompleteAlertDesc")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/dashboard/families/${family.id}/edit`)
              }
            >
              {t("familyProfile.completeRegistration")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {family.registrationStatus === "pending" && (
        <Alert>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              <strong>{t("familyProfile.pendingAlertTitle")}</strong> {t("familyProfile.pendingAlertDesc")}
            </span>
            <Button variant="outline" size="sm" onClick={handleVerify}>
              {t("familyProfile.verifyNow")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* TABS (responsive scroll on mobile) */}
      <Tabs defaultValue="information" className="w-full">
        <div className="overflow-x-hidden w-full ">
          {/* <TabsList className="flex sm:w-auto min-w-0"> */}
          <TabsList className="grid grid-cols-2 sm:grid-cols-4  w-full h-auto ">
            <TabsTrigger value="information">{t("familyProfile.information")}</TabsTrigger>
            <TabsTrigger value="members">{t("familyProfile.members")} ({members.length})</TabsTrigger>
            <TabsTrigger value="support">{t("familyProfile.supportHistory")}</TabsTrigger>
            <TabsTrigger value="documents">{t("familyProfile.documents")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="information" className="space-y-4">
          {/* GRID RESPONSIVENESS ONLY */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 min-w-0 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  {t("familyProfile.basicInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.familyName")}:</span>
                  <span className="font-medium truncate">{family.familyName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.familyCode")}:</span>
                  <span className="font-medium">{family.familyCode}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.headOfFamily")}:</span>
                  <span className="font-medium truncate">
                    {family.familyHead || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.numberOfMembers")}:</span>
                  <Badge variant="secondary">{members.length || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  {t("familyProfile.contactInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.primaryPhone")}:</span>
                  <span className="font-medium">{family.primaryPhone || "N/A"}</span>
                </div>
                {family.secondaryPhone && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{t("familyProfile.secondary")}:</span>
                    <span className="font-medium">{family.secondaryPhone}</span>
                  </div>
                )}
                {family.email && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{t("familyProfile.emailLabel")}:</span>
                    <span className="font-medium truncate">{family.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  {t("familyProfile.familyStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.urgencyLevel")}</span>
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
                    {family.urgencyLevel ? t(`common.${family.urgencyLevel}`) : "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.statusLabel")}</span>
                  <Badge className="capitalize">
                    {t(`dashboard.registrationStatus.${family.registrationStatus}`)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">{t("familyProfile.classificationLabel")}</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {getEffectiveClassification().length > 0
                      ? getEffectiveClassification().map((c: string) => (
                          <FamilyClassificationBadge key={c} classification={c} t={t} />
                        ))
                      : <span className="text-xs text-muted-foreground">{t("familyProfile.noClassification")}</span>
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {family.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="mr-2 h-5 w-5" />
                    {t("familyProfile.notes")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{family.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* MEMBERS (responsive grid only) */}
        <TabsContent value="members" className="space-y-4">
          {members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("familyProfile.ageDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center min-w-0 w-full">
                  <div>
                    <div className="text-2xl font-bold">{ageDistribution.children}</div>
                    <div className="text-xs text-muted-foreground">{t("familyProfile.ageChild")}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{ageDistribution.teens}</div>
                    <div className="text-xs text-muted-foreground">{t("familyProfile.ageTeen")}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{ageDistribution.adults}</div>
                    <div className="text-xs text-muted-foreground">{t("familyProfile.ageAdult")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {members.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">{t("familyProfile.noMembersYet")}</p>
                <Button className="mt-4" onClick={goToEditMembers}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("familyProfile.addFirstMember")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0 w-full">
              {members.map((member) => (
                <Card key={member.id} className="relative overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-semibold text-lg truncate max-w-full">
                          {member.fullName}
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{t("familyProfile.ageGroupLabel")} {member.ageGroup || "N/A"}</div>
                          <div>{t("familyProfile.genderLabel")} {member.gender || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        {member.memberClassification && (
                          <FamilyClassificationBadge classification={member.memberClassification} t={t} />
                        )}
                        {member.isOrphan && (
                          <Badge variant="destructive" className="capitalize text-xs">
                            {member.orphanType === "mother" ? t("familyProfile.lostMother") : member.orphanType === "father" ? t("familyProfile.lostFather") : member.orphanType === "both" ? t("familyProfile.lostBoth") : t("familyProfile.orphan")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToEditMembers}
                      >
                        {t("familyProfile.manageMembers")}
                      </Button>
                    </div>
                  </CardContent>

                  {member.photoUrl ? (
                    <div className="absolute bottom-2 right-2 w-16 h-16 rounded-full overflow-hidden border-2 border-background shadow-md">
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-md">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SUPPORT (no content change, only spacing) */}
        <TabsContent value="support" className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-8">{t("familyProfile.loadingSupportHistory")}</div>
          ) : supportHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t("familyProfile.noSupportHistory")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {supportHistory.map((history) => (
                <Card key={history.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-row justify-between items-start sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {history.supportType}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.supportDate).toLocaleDateString()}
                        </p>
                      </div>
                      {history.amountValue && (
                        <Badge variant="default" className="text-sm sm:text-base md:text-lg px-3 py-1">
                          {Number(history.amountValue).toFixed(2)} {history.currency || "ETB"}
                        </Badge>
                      )}
                    </div>
                    {history.description && <p className="text-sm mb-3">{history.description}</p>}
                    {/* <p className="text-sm mb-3">{history.description}</p> */}
                     {history.itemsProvided && Array.isArray(history.itemsProvided) && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-muted-foreground">{t("familyProfile.itemsProvided")}</span>
                        <ul className="mt-1 space-y-1">
                          {history.itemsProvided.map((item: any, idx: number) => (
                            <>
                            <li key={idx} className="text-md ml-4">
                              • {item.name}
                              <ul className="pl-4 text-sm">
                                <li>{t("familyProfile.quantity")} {item.quantity}</li>
                                <li>{t("familyProfile.unit")} {item.unit}</li>
                              </ul>
                            </li>
                            </>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t">
                      {history.donor && (
                        <div>
                          <strong>{t("familyProfile.donorLabel")}</strong> {history.donor.name}
                        </div>
                      )}
                      {history.volunteer && (
                        <div>
                          <strong>{t("familyProfile.volunteerLabel")}</strong> {history.volunteer.fullName}
                        </div>
                      )}
                      {history.deliveredBy && (
                        <div>
                          <strong>{t("familyProfile.deliveredByLabel")}</strong> {history.deliveredBy}
                        </div>
                      )}
                      {history.notes && (
                        <div className="w-full">
                          <strong>{t("familyProfile.notesLabel")}</strong> {history.notes}
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
          {family.documents && family.documents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
              {family.documents.map((doc, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold truncate">{doc.title}</h4>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all inline items-center gap-1"
                        >
                          {doc.url}
                          <ExternalLink className="h-3 w-3 shrink-0 inline" />
                        </a>
                        {doc.uploadedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("familyProfile.uploadedLabel")} {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t("familyProfile.noDocumentsYet")}</p>
                <p className="text-sm mt-1">
                  {t("familyProfile.documentsHint")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <RecordSupportModal
        open={showRecordSupportModal}
        onClose={() => setShowRecordSupportModal(false)}
        targetType="family"
        targetId={family._id}
        targetName={family.familyName}
        onSuccess={() => {
          fetchSupportHistory();
          setShowRecordSupportModal(false);
        }}
      />

      {/* Verify Classification Dialog (multi-select with member assignment) */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.classifications.selectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.classifications.selectDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto" data-lenis-prevent>
            {[
              { value: "orphan", label: t("dashboard.classifications.orphan"), icon: <Baby className="h-5 w-5 text-blue-500" />, desc: t("dashboard.classifications.orphanDesc") },
              { value: "disabled_disease", label: t("dashboard.classifications.disabled_disease"), icon: <Heart className="h-5 w-5 text-pink-500" />, desc: t("dashboard.classifications.disabledDiseaseDesc") },
              { value: "old_age", label: t("dashboard.classifications.old_age"), icon: <Accessibility className="h-5 w-5 text-purple-500" />, desc: t("dashboard.classifications.oldAgeDesc") },
              { value: "single_mother", label: t("dashboard.classifications.single_mother"), icon: <Home className="h-5 w-5 text-amber-500" />, desc: t("dashboard.classifications.singleMotherDesc") },
            ].map(({ value, label, icon, desc }) => {
              const isSelected = selectedClassification.includes(value);
              return (
                <div key={value} className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className={`flex items-start gap-3 p-3 w-full text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedClassification((prev) => prev.filter((v) => v !== value));
                        setClassificationMemberIds((prev) => {
                          const { [value]: _, ...rest } = prev;
                          return rest;
                        });
                      } else {
                        setSelectedClassification((prev) => [...prev, value]);
                      }
                    }}
                  >
                    <div className="mt-0.5">{icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                    <CheckCircle className={`h-5 w-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </button>
                  {isSelected && (
                    <div className="px-4 pb-3 space-y-1.5 border-t pt-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        {value === "orphan"
                          ? t("familyProfile.assignToOrphan")
                          : t("familyProfile.assignToMembers")}
                      </p>
                      {members.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">{t("familyProfile.noMembersToAssign")}</p>
                      ) : (
                        (() => {
                          const eligible = members.filter(
                            (member) =>
                              (value !== "orphan" || member.ageGroup === "child" || member.ageGroup === "teen") &&
                              (value !== "single_mother" || member.ageGroup === "adult") &&
                              (value !== "old_age" || member.ageGroup === "adult")
                          );
                          const alreadyAssignedIds = new Set(
                            Object.entries(classificationMemberIds)
                              .filter(([cls]) => cls !== value)
                              .flatMap(([, ids]) => ids)
                          );
                          const filtered = eligible.filter(
                            (member) => {
                              const mId = (member as any)._id || member.id || `__idx_${members.indexOf(member)}`;
                              return !alreadyAssignedIds.has(mId);
                            }
                          );
                          return filtered.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">{t("familyProfile.noEligibleMembers")}</p>
                          ) : (
                            filtered.map((member) => {
                              const memberId = (member as any)._id || member.id || `__idx_${members.indexOf(member)}`;
                              return (
                                <div key={memberId} className="flex items-center gap-2 text-sm py-0.5">
                                  <Checkbox
                                    checked={classificationMemberIds[value]?.includes(memberId) || false}
                                    onCheckedChange={(checked) => {
                                      setClassificationMemberIds((prev) => {
                                        const current = prev[value] || [];
                                        return {
                                          ...prev,
                                          [value]: checked
                                            ? [...current, memberId]
                                            : current.filter((id) => id !== memberId),
                                        };
                                      });
                                    }}
                                  />
                                  <span className="truncate">{member.fullName}</span>
                                  <span className="text-xs text-muted-foreground shrink-0">({member.ageGroup})</span>
                                </div>
                              );
                            })
                          );
                        })()
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setVerifyDialogOpen(false); }}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleVerifyWithClassification()}>
              {selectedClassification.length > 0 ? t("dashboard.classifications.verifyWithClass") : t("dashboard.classifications.verify")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FamilyProfile;