// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { useToast } from "@/hooks/use-toast";
// import { Plus, Trash2, User, Save, Edit2, Loader2 } from "lucide-react";
// import { familyApi } from "@/services/api.service";
// import { useNavigate } from "react-router-dom";
// import ImageUpload from "@/components/ImageUpload";
// import { Family, Beneficiary } from "@/types/api";

// interface ComprehensiveFamilyEditFormProps {
//   familyId: string;
// }

// interface BeneficiaryFormData {
//   id?: string;
//   tempId: string;
//   fullName: string;
//   age: string;
//   gender: string;
//   beneficiaryType: string;
//   relationshipToHead: string;
//   isOrphan: boolean;
//   orphanType: string;
//   occupation: string;
//   monthlyIncome: string;
//   educationStatus: string;
//   healthStatus: string;
//   photoUrl: string;
//   isFamilyHead: boolean;
//   notes: string;
//   isNew?: boolean;
//   isEdited?: boolean;
//   isDeleted?: boolean;
// }

// export default function ComprehensiveFamilyEditForm({ familyId }: ComprehensiveFamilyEditFormProps) {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);

//   // Family data
//   const [familyData, setFamilyData] = useState({
//     familyName: "",
//     region: "",
//     subRegion: "",
//     address: "",
//     exactLocation: "",
//     description: "",
//     urgencyLevel: "medium",
//     monthlyIncome: "",
//     monthlyRentAmount: "",
//     notes: "",
//   });

//   // Beneficiaries list
//   const [beneficiaries, setBeneficiaries] = useState<BeneficiaryFormData[]>([]);
//   const [editingBeneficiary, setEditingBeneficiary] = useState<string | null>(null);

//   // Current beneficiary being added/edited
//   const [currentBeneficiary, setCurrentBeneficiary] = useState<BeneficiaryFormData>({
//     tempId: "",
//     fullName: "",
//     age: "",
//     gender: "",
//     beneficiaryType: "child",
//     relationshipToHead: "",
//     isOrphan: false,
//     orphanType: "none",
//     occupation: "",
//     monthlyIncome: "",
//     educationStatus: "",
//     healthStatus: "",
//     photoUrl: "",
//     isFamilyHead: false,
//     notes: "",
//     isNew: true,
//   });

//   // Fetch family and beneficiaries
//   useEffect(() => {
//     fetchFamilyData();
//   }, [familyId]);

//   const fetchFamilyData = async () => {
//     setFetching(true);
//     try {
//       const response = await familyApi.getById(familyId);
//       const family: Family = response.data;

//       setFamilyData({
//         familyName: family.familyName,
//         region: family.region || "",
//         subRegion: family.subRegion || "",
//         address: family.address || "",
//         exactLocation: family.exactLocation || "",
//         description: family.description || "",
//         urgencyLevel: family.urgencyLevel || "medium",
//         monthlyIncome: family.monthlyIncome?.toString() || "",
//         monthlyRentAmount: family.monthlyRentAmount?.toString() || "",
//         notes: family.notes || "",
//       });

//       // Convert beneficiaries to form data
//       if (family.beneficiaries) {
//         const benList = family.beneficiaries.map((ben: Beneficiary) => ({
//           id: ben.id,
//           tempId: ben.id,
//           fullName: ben.fullName,
//           age: ben.age?.toString() || "",
//           gender: ben.gender || "",
//           beneficiaryType: ben.beneficiaryType || "child",
//           relationshipToHead: ben.relationshipToHead || "",
//           isOrphan: ben.isOrphan || false,
//           orphanType: ben.orphanType || "none",
//           occupation: ben.occupation || "",
//           monthlyIncome: ben.monthlyIncome?.toString() || "",
//           educationStatus: ben.educationStatus || "",
//           healthStatus: ben.healthStatus || "",
//           photoUrl: ben.photoUrl || "",
//           isFamilyHead: ben.isFamilyHead || false,
//           notes: ben.notes || "",
//           isNew: false,
//           isEdited: false,
//           isDeleted: false,
//         }));
//         setBeneficiaries(benList);
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to fetch family data",
//         variant: "destructive",
//       });
//       navigate("/dashboard/families");
//     } finally {
//       setFetching(false);
//     }
//   };

//   // Age to DOB conversion
//   const ageToDateOfBirth = (age: number): string => {
//     if (!age || age < 0) return "";
//     const currentYear = new Date().getFullYear();
//     const birthYear = currentYear - age;
//     return `${birthYear}-01-01T00:00:00.000Z`;
//   };

//   // Handle age change
//   const handleAgeChange = (age: string) => {
//     const ageNum = parseInt(age);
//     const type = ageNum >= 18 ? "adult" : "child";
//     setCurrentBeneficiary({
//       ...currentBeneficiary,
//       age,
//       beneficiaryType: type,
//       isOrphan: type === "adult" ? false : currentBeneficiary.isOrphan,
//       orphanType: type === "adult" ? "none" : currentBeneficiary.orphanType,
//     });
//   };

//   // Calculate family income
//   const calculateFamilyIncome = (benList: BeneficiaryFormData[]) => {
//     return benList
//       .filter(b => !b.isDeleted && b.monthlyIncome && parseFloat(b.monthlyIncome) > 0)
//       .reduce((sum, b) => sum + parseFloat(b.monthlyIncome), 0);
//   };

//   // Add beneficiary
//   const addBeneficiary = () => {
//     if (!currentBeneficiary.fullName || !currentBeneficiary.age) {
//       toast({
//         title: "Validation Error",
//         description: "Name and age are required",
//         variant: "destructive",
//       });
//       return;
//     }

//     // If marking as head, unmark others
//     if (currentBeneficiary.isFamilyHead) {
//       setBeneficiaries(beneficiaries.map(b => ({ ...b, isFamilyHead: false, isEdited: !b.isNew ? true : b.isEdited })));
//     }

//     const beneficiaryToAdd = {
//       ...currentBeneficiary,
//       tempId: Date.now().toString(),
//       isNew: true,
//     };

//     const updatedBeneficiaries = [...beneficiaries, beneficiaryToAdd];
//     setBeneficiaries(updatedBeneficiaries);

//     // Auto-calculate family income
//     const totalIncome = calculateFamilyIncome(updatedBeneficiaries);
//     if (totalIncome > 0) {
//       setFamilyData({ ...familyData, monthlyIncome: totalIncome.toString() });
//     }

//     // Reset form
//     resetCurrentBeneficiary();

//     toast({
//       title: "Success",
//       description: "Beneficiary added to the list",
//     });
//   };

//   // Edit beneficiary
//   const startEditBeneficiary = (tempId: string) => {
//     const ben = beneficiaries.find(b => b.tempId === tempId);
//     if (ben) {
//       setCurrentBeneficiary({ ...ben });
//       setEditingBeneficiary(tempId);
//     }
//   };

//   // Update beneficiary
//   const updateBeneficiary = () => {
//     if (!currentBeneficiary.fullName || !currentBeneficiary.age) {
//       toast({
//         title: "Validation Error",
//         description: "Name and age are required",
//         variant: "destructive",
//       });
//       return;
//     }

//     const updatedBeneficiaries = beneficiaries.map(b => {
//       if (b.tempId === editingBeneficiary) {
//         return {
//           ...currentBeneficiary,
//           isEdited: !b.isNew ? true : false,
//         };
//       }
//       // If marking current as head, unmark others
//       if (currentBeneficiary.isFamilyHead && b.tempId !== editingBeneficiary) {
//         return { ...b, isFamilyHead: false, isEdited: !b.isNew ? true : b.isEdited };
//       }
//       return b;
//     });

//     setBeneficiaries(updatedBeneficiaries);

//     // Recalculate income
//     const totalIncome = calculateFamilyIncome(updatedBeneficiaries);
//     setFamilyData({ ...familyData, monthlyIncome: totalIncome > 0 ? totalIncome.toString() : "" });

//     resetCurrentBeneficiary();
//     setEditingBeneficiary(null);

//     toast({
//       title: "Success",
//       description: "Beneficiary updated",
//     });
//   };

//   // Mark for deletion
//   const markBeneficiaryForDeletion = (tempId: string) => {
//     const updatedBeneficiaries = beneficiaries.map(b =>
//       b.tempId === tempId ? { ...b, isDeleted: true } : b
//     );
//     setBeneficiaries(updatedBeneficiaries);

//     // Recalculate income
//     const totalIncome = calculateFamilyIncome(updatedBeneficiaries);
//     setFamilyData({ ...familyData, monthlyIncome: totalIncome > 0 ? totalIncome.toString() : "" });
//   };

//   // Restore deleted beneficiary
//   const restoreBeneficiary = (tempId: string) => {
//     const updatedBeneficiaries = beneficiaries.map(b =>
//       b.tempId === tempId ? { ...b, isDeleted: false } : b
//     );
//     setBeneficiaries(updatedBeneficiaries);

//     // Recalculate income
//     const totalIncome = calculateFamilyIncome(updatedBeneficiaries);
//     setFamilyData({ ...familyData, monthlyIncome: totalIncome.toString() });
//   };

//   // Reset form
//   const resetCurrentBeneficiary = () => {
//     setCurrentBeneficiary({
//       tempId: "",
//       fullName: "",
//       age: "",
//       gender: "",
//       beneficiaryType: "child",
//       relationshipToHead: "",
//       isOrphan: false,
//       orphanType: "none",
//       occupation: "",
//       monthlyIncome: "",
//       educationStatus: "",
//       healthStatus: "",
//       photoUrl: "",
//       isFamilyHead: false,
//       notes: "",
//       isNew: true,
//     });
//   };

//   // Submit all changes
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setLoading(true);

//     try {
//       // Track the head beneficiary ID
//       let headBeneficiaryId: string | null = null;

//       // Process beneficiaries first to get IDs
//       // Create new beneficiaries
//       const newBeneficiaries = beneficiaries.filter(b => b.isNew && !b.isDeleted);
//       for (const ben of newBeneficiaries) {
//         const data = {
//           familyId,
//           fullName: ben.fullName,
//           age: parseInt(ben.age),
//           dateOfBirth: ageToDateOfBirth(parseInt(ben.age)),
//           gender: ben.gender || undefined,
//           beneficiaryType: ben.beneficiaryType,
//           relationshipToHead: ben.relationshipToHead || undefined,
//           isOrphan: ben.isOrphan,
//           orphanType: ben.orphanType,
//           occupation: ben.occupation || undefined,
//           monthlyIncome: ben.monthlyIncome ? parseFloat(ben.monthlyIncome) : undefined,
//           educationStatus: ben.educationStatus || undefined,
//           healthStatus: ben.healthStatus || undefined,
//           photoUrl: ben.photoUrl || undefined,
//           isFamilyHead: ben.isFamilyHead,
//           verificationStatus: "pending",
//           notes: ben.notes || undefined,
//         };
//         const created = await beneficiaryApi.create(data);
        
//         // If this is marked as head, save its ID
//         if (ben.isFamilyHead) {
//           headBeneficiaryId = created.data.id;
//         }
//       }

//       // Update edited beneficiaries
//       const editedBeneficiaries = beneficiaries.filter(b => !b.isNew && b.isEdited && !b.isDeleted);
//       for (const ben of editedBeneficiaries) {
//         const data = {
//           fullName: ben.fullName,
//           age: parseInt(ben.age),
//           dateOfBirth: ageToDateOfBirth(parseInt(ben.age)),
//           gender: ben.gender || undefined,
//           beneficiaryType: ben.beneficiaryType,
//           relationshipToHead: ben.relationshipToHead || undefined,
//           isOrphan: ben.isOrphan,
//           orphanType: ben.orphanType,
//           occupation: ben.occupation || undefined,
//           monthlyIncome: ben.monthlyIncome ? parseFloat(ben.monthlyIncome) : undefined,
//           educationStatus: ben.educationStatus || undefined,
//           healthStatus: ben.healthStatus || undefined,
//           photoUrl: ben.photoUrl || undefined,
//           isFamilyHead: ben.isFamilyHead,
//           notes: ben.notes || undefined,
//         };
//         await beneficiaryApi.update(ben.id!, data);
        
//         // If this is marked as head, save its ID
//         if (ben.isFamilyHead) {
//           headBeneficiaryId = ben.id!;
//         }
//       }

//       // Check if any existing non-edited beneficiary is marked as head
//       const existingHead = beneficiaries.find(b => !b.isNew && !b.isEdited && !b.isDeleted && b.isFamilyHead);
//       if (existingHead) {
//         headBeneficiaryId = existingHead.id!;
//       }

//       // Delete marked beneficiaries
//       const deletedBeneficiaries = beneficiaries.filter(b => !b.isNew && b.isDeleted);
//       for (const ben of deletedBeneficiaries) {
//         await beneficiaryApi.delete(ben.id!);
//       }

//       // Update family with head beneficiary ID
//       const familyUpdateData: any = {
//         ...familyData,
//         monthlyIncome: familyData.monthlyIncome ? parseFloat(familyData.monthlyIncome) : undefined,
//         monthlyRentAmount: familyData.monthlyRentAmount ? parseFloat(familyData.monthlyRentAmount) : undefined,
//         familySize: beneficiaries.filter(b => !b.isDeleted).length,
//         childrenCount: beneficiaries.filter(b => !b.isDeleted && b.beneficiaryType === "child").length,
//       };

//       // Set or clear head beneficiary ID
//       if (headBeneficiaryId) {
//         familyUpdateData.headBeneficiaryId = headBeneficiaryId;
//       } else {
//         familyUpdateData.headBeneficiaryId = null;
//       }

//       await familyApi.update(familyId, familyUpdateData);

//       toast({
//         title: "Success",
//         description: "Family updated successfully",
//       });

//       navigate(`/dashboard/families/${familyId}`);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to update family",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) {
//     return (
//       <div className="flex items-center justify-center p-12">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   const activeBeneficiaries = beneficiaries.filter(b => !b.isDeleted);
//   const workingMembers = activeBeneficiaries.filter(b => b.monthlyIncome && parseFloat(b.monthlyIncome) > 0).length;

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Family Information - Same as ComprehensiveFamilyForm but with current data */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Family Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="familyName">Family Name *</Label>
//             <Input
//               id="familyName"
//               value={familyData.familyName}
//               onChange={(e) => setFamilyData({ ...familyData, familyName: e.target.value })}
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="region">Region</Label>
//               <Input
//                 id="region"
//                 value={familyData.region}
//                 onChange={(e) => setFamilyData({ ...familyData, region: e.target.value })}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="subRegion">Sub Region</Label>
//               <Input
//                 id="subRegion"
//                 value={familyData.subRegion}
//                 onChange={(e) => setFamilyData({ ...familyData, subRegion: e.target.value })}
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="monthlyIncome">Family Monthly Income (ETB)</Label>
//               <Input
//                 id="monthlyIncome"
//                 type="number"
//                 value={familyData.monthlyIncome}
//                 onChange={(e) => setFamilyData({ ...familyData, monthlyIncome: e.target.value })}
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 disabled={loading}
//               />
//               <p className="text-xs text-muted-foreground">
//                 {workingMembers > 0
//                   ? `Auto-calculated from ${workingMembers} working member(s)`
//                   : "No working members with income"}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="monthlyRentAmount">Monthly Rent (ETB)</Label>
//               <Input
//                 id="monthlyRentAmount"
//                 type="number"
//                 value={familyData.monthlyRentAmount}
//                 onChange={(e) => setFamilyData({ ...familyData, monthlyRentAmount: e.target.value })}
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="urgencyLevel">Urgency Level</Label>
//             <Select
//               value={familyData.urgencyLevel}
//               onValueChange={(value) => setFamilyData({ ...familyData, urgencyLevel: value })}
//               disabled={loading}
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="low">Low</SelectItem>
//                 <SelectItem value="medium">Medium</SelectItem>
//                 <SelectItem value="high">High</SelectItem>
//                 <SelectItem value="critical">Critical</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Add/Edit Beneficiary Form - Similar to ComprehensiveFamilyForm */}
//       <Card>
//         <CardHeader>
//           <CardTitle>{editingBeneficiary ? "Edit Family Member" : "Add Family Member"}</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Same beneficiary form fields as ComprehensiveFamilyForm... */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="benFullName">Full Name *</Label>
//               <Input
//                 id="benFullName"
//                 value={currentBeneficiary.fullName}
//                 onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, fullName: e.target.value })}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="benAge">Age *</Label>
//               <Input
//                 id="benAge"
//                 type="number"
//                 value={currentBeneficiary.age}
//                 onChange={(e) => handleAgeChange(e.target.value)}
//                 min="0"
//                 max="150"
//                 disabled={loading}
//               />
//               {currentBeneficiary.age && (
//                 <p className="text-xs text-muted-foreground">
//                   Type: {currentBeneficiary.beneficiaryType === "adult" ? "Adult (18+)" : "Child (Under 18)"}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="benGender">Gender</Label>
//               <Select
//                 value={currentBeneficiary.gender}
//                 onValueChange={(value) => setCurrentBeneficiary({ ...currentBeneficiary, gender: value })}
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select gender" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="male">Male</SelectItem>
//                   <SelectItem value="female">Female</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="benRelationship">Relationship to Head</Label>
//               <Input
//                 id="benRelationship"
//                 value={currentBeneficiary.relationshipToHead}
//                 onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, relationshipToHead: e.target.value })}
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="benEducation">Education Status</Label>
//               <Select
//                 value={currentBeneficiary.educationStatus}
//                 onValueChange={(value) => setCurrentBeneficiary({ ...currentBeneficiary, educationStatus: value })}
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select education" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="not_enrolled">Not Enrolled</SelectItem>
//                   <SelectItem value="preschool">Preschool</SelectItem>
//                   <SelectItem value="primary">Primary School</SelectItem>
//                   <SelectItem value="secondary">Secondary School</SelectItem>
//                   <SelectItem value="high_school">High School</SelectItem>
//                   <SelectItem value="college">College/University</SelectItem>
//                   <SelectItem value="graduated">Graduated</SelectItem>
//                   <SelectItem value="illiterate">Illiterate</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="benHealth">Health Status</Label>
//               <Select
//                 value={currentBeneficiary.healthStatus}
//                 onValueChange={(value) => setCurrentBeneficiary({ ...currentBeneficiary, healthStatus: value })}
//                 disabled={loading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select health" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="good">Good</SelectItem>
//                   <SelectItem value="fair">Fair</SelectItem>
//                   <SelectItem value="poor">Poor</SelectItem>
//                   <SelectItem value="chronic_illness">Chronic Illness</SelectItem>
//                   <SelectItem value="disability">Disability</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <ImageUpload
//             label="Beneficiary Photo"
//             value={currentBeneficiary.photoUrl}
//             onChange={(url) => setCurrentBeneficiary({ ...currentBeneficiary, photoUrl: url })}
//             disabled={loading}
//           />

//           {currentBeneficiary.beneficiaryType === "adult" && (
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="benOccupation">Occupation</Label>
//                 <Input
//                   id="benOccupation"
//                   value={currentBeneficiary.occupation}
//                   onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, occupation: e.target.value })}
//                   disabled={loading}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="benIncome">Monthly Income (ETB)</Label>
//                 <Input
//                   id="benIncome"
//                   type="number"
//                   value={currentBeneficiary.monthlyIncome}
//                   onChange={(e) => setCurrentBeneficiary({ ...currentBeneficiary, monthlyIncome: e.target.value })}
//                   placeholder="0.00"
//                   min="0"
//                   step="0.01"
//                   disabled={loading}
//                 />
//               </div>
//             </div>
//           )}

//           {currentBeneficiary.beneficiaryType === "child" && (
//             <div className="space-y-4">
//               <div className="flex items-center space-x-2">
//                 <Switch
//                   id="benOrphan"
//                   checked={currentBeneficiary.isOrphan}
//                   onCheckedChange={(checked) => setCurrentBeneficiary({
//                     ...currentBeneficiary,
//                     isOrphan: checked,
//                     orphanType: checked ? currentBeneficiary.orphanType : "none"
//                   })}
//                   disabled={loading}
//                 />
//                 <Label htmlFor="benOrphan">This child is an orphan</Label>
//               </div>

//               {currentBeneficiary.isOrphan && (
//                 <div className="space-y-2">
//                   <Label htmlFor="benOrphanType">Orphan Type</Label>
//                   <Select
//                     value={currentBeneficiary.orphanType}
//                     onValueChange={(value) => setCurrentBeneficiary({ ...currentBeneficiary, orphanType: value })}
//                     disabled={loading}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select orphan type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="mother">Lost Mother</SelectItem>
//                       <SelectItem value="father">Lost Father</SelectItem>
//                       <SelectItem value="both">Lost Both Parents</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="flex gap-2">
//             {editingBeneficiary ? (
//               <>
//                 <Button type="button" onClick={updateBeneficiary} disabled={loading} className="flex-1">
//                   <Save className="h-4 w-4 mr-2" />
//                   Update Member
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     resetCurrentBeneficiary();
//                     setEditingBeneficiary(null);
//                   }}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </Button>
//               </>
//             ) : (
//               <Button type="button" onClick={addBeneficiary} disabled={loading} className="w-full">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add to Family
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Select Head of Family */}
//       {activeBeneficiaries.filter(b => b.beneficiaryType === "adult").length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Head of Family</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               <Label htmlFor="selectHead">Select Head of Family</Label>
//               <Select
//                 value={beneficiaries.find(b => b.isFamilyHead && !b.isDeleted)?.tempId || "none"}
//                 onValueChange={(tempId) => {
//                   setBeneficiaries(beneficiaries.map(b => ({
//                     ...b,
//                     isFamilyHead: b.tempId === tempId,
//                     isEdited: !b.isNew && b.tempId === tempId ? true : b.isEdited
//                   })));
//                 }}
//                 disabled={loading}
//               >
//                 <SelectTrigger id="selectHead">
//                   <SelectValue placeholder="Select an adult as head of family" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="none">No Head Selected</SelectItem>
//                   {activeBeneficiaries
//                     .filter(b => b.beneficiaryType === "adult")
//                     .map((ben) => (
//                       <SelectItem key={ben.tempId} value={ben.tempId}>
//                         {ben.fullName} ({ben.age} years old)
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//               <p className="text-xs text-muted-foreground">
//                 The head of family should be an adult member. This is required to complete registration.
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Beneficiaries List with Edit/Delete */}
//       {activeBeneficiaries.length > 0 && (
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>Family Members ({activeBeneficiaries.length})</CardTitle>
//               <div className="text-sm text-muted-foreground">
//                 {activeBeneficiaries.filter(b => b.beneficiaryType === "adult").length} Adults •
//                 {activeBeneficiaries.filter(b => b.beneficiaryType === "child").length} Children
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {beneficiaries.map((ben) => (
//                 <div
//                   key={ben.tempId}
//                   className={`flex items-center justify-between p-4 border rounded-lg ${ben.isDeleted ? "opacity-50 bg-muted" : ""
//                     }`}
//                 >
//                   <div className="flex items-center gap-4">
//                     {ben.photoUrl ? (
//                       <div className="w-12 h-12 rounded-full overflow-hidden border-2">
//                         <img src={ben.photoUrl} alt={ben.fullName} className="w-full h-full object-cover" />
//                       </div>
//                     ) : (
//                       <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
//                         <User className="h-6 w-6" />
//                       </div>
//                     )}
//                     <div>
//                       <p className="font-medium">
//                         {ben.fullName} {ben.isFamilyHead && "(Head)"}
//                         {ben.isNew && " (New)"}
//                         {ben.isEdited && " (Edited)"}
//                         {ben.isDeleted && " (Deleted)"}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {ben.age} years • {ben.gender} • {ben.beneficiaryType}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     {!ben.isDeleted && (
//                       <>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => startEditBeneficiary(ben.tempId)}
//                           disabled={loading || editingBeneficiary !== null}
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => markBeneficiaryForDeletion(ben.tempId)}
//                           disabled={loading}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </>
//                     )}
//                     {ben.isDeleted && (
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => restoreBeneficiary(ben.tempId)}
//                         disabled={loading}
//                       >
//                         Restore
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Submit Button */}
//       <div className="flex justify-end gap-4">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => navigate(`/dashboard/families/${familyId}`)}
//           disabled={loading}
//         >
//           Cancel
//         </Button>
//         <Button type="submit" disabled={loading}>
//           {loading ? (
//             <>
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             <>
//               <Save className="h-4 w-4 mr-2" />
//               Save All Changes
//             </>
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, User, Save, Loader2, Baby, Heart, Accessibility, Home } from "lucide-react";
import { familyApi } from "@/services/api.service";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";
import DocumentUpload from "@/components/DocumentUpload";
import type { DocumentItem } from "@/components/DocumentUpload";

interface ComprehensiveFamilyEditFormProps {
  familyId: string;
}

interface MemberFormData {
  tempId: string;
  fullName: string;
  ageGroup: "child" | "teen" | "adult" | "";
  gender: string;
  photoUrl: string;
  isOrphan: boolean;
  orphanType: string;
  isFamilyHead: boolean;
  memberClassification: string;
}

export default function ComprehensiveFamilyEditForm({
  familyId,
}: ComprehensiveFamilyEditFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
      if (cleaned.startsWith('+251')) {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length <= 3) return cleaned;
        const after = digits.slice(3);
        if (after.length <= 2) return `+251 ${after}`;
        if (after.length <= 5) return `+251 ${after.slice(0, 2)} ${after.slice(2)}`;
        return `+251 ${after.slice(0, 2)} ${after.slice(2, 5)} ${after.slice(5, 9)}`;
      }
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length <= 4) return cleaned;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }

    const digits = cleaned.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };
  const phoneRef = useRef<HTMLInputElement>(null);

  const [familyData, setFamilyData] = useState({
    familyName: "",
    primaryPhone: "",
    urgencyLevel: "medium",
    notes: "",
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [members, setMembers] = useState<MemberFormData[]>([]);

  const [currentMember, setCurrentMember] = useState<MemberFormData>({
    tempId: "",
    fullName: "",
    ageGroup: "",
    gender: "",
    photoUrl: "",
    isOrphan: false,
    orphanType: "none",
    isFamilyHead: false,
    memberClassification: "",
  });

  useEffect(() => {
    fetchFamily();
  }, [familyId]);

  const fetchFamily = async () => {
    setFetching(true);
    try {
      const response = await familyApi.getById(familyId);
      const family = response.data;

      setFamilyData({
        familyName: family.familyName || "",
        primaryPhone: formatPhoneNumber(family.primaryPhone || ""),
        urgencyLevel: family.urgencyLevel || "medium",
        notes: family.notes || "",
      });

      setDocuments(family.documents || []);

      const mappedMembers: MemberFormData[] = (family.members || []).map(
        (m: any, index: number) => ({
          tempId: `${m._id || index}-${Date.now()}`,
          fullName: m.fullName || "",
          ageGroup: m.ageGroup || "",
          gender: m.gender || "",
          photoUrl: m.photoUrl || "",
          isOrphan: m.isOrphan || false,
          orphanType: m.orphanType || "none",
          isFamilyHead: family.familyHead
            ? family.familyHead === m.fullName
            : false,
          memberClassification: m.memberClassification || "",
        })
      );

      setMembers(mappedMembers);
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.response?.data?.message || t("familyForm.fetchError"),
        variant: "destructive",
      });
      navigate("/dashboard/families");
    } finally {
      setFetching(false);
    }
  };

  const handleAgeGroupChange = (ageGroup: "child" | "teen" | "adult") => {
    setCurrentMember((prev) => ({
      ...prev,
      ageGroup,
      isOrphan: ageGroup === "adult" ? false : prev.isOrphan,
      orphanType: ageGroup === "adult" ? "none" : prev.orphanType,
      memberClassification: ageGroup === "adult" ? "" : (prev.isOrphan ? "orphan" : ""),
    }));
  };

  const addMember = () => {
    if (!currentMember.fullName.trim() || !currentMember.ageGroup) {
      toast({
        title: t("familyForm.validationNameAndAgeRequired"),
        description: t("familyForm.validationNameAndAgeRequired"),
        variant: "destructive",
      });
      return;
    }

    const memberToAdd: MemberFormData = {
      ...currentMember,
      tempId: Date.now().toString(),
      fullName: currentMember.fullName.trim(),
    };

    setMembers((prev) => {
      const updated = [...prev, memberToAdd];
      const adults = updated.filter(m => m.ageGroup === "adult");
      if (adults.length === 1) {
        return updated.map(m => ({
          ...m,
          isFamilyHead: m.ageGroup === "adult"
        }));
      }
      return updated;
    });

    setCurrentMember({
      tempId: "",
      fullName: "",
      ageGroup: "",
      gender: "",
      photoUrl: "",
      isOrphan: false,
      orphanType: "none",
      isFamilyHead: false,
      memberClassification: "",
    });

    toast({
      title: t("common.success"),
      description: t("familyForm.memberAdded"),
    });
  };

  const removeMember = (tempId: string) => {
    setMembers((prev) => {
      const filtered = prev.filter((m) => m.tempId !== tempId);
      const adults = filtered.filter(m => m.ageGroup === "adult");
      if (adults.length === 1) {
        return filtered.map(m => ({
          ...m,
          isFamilyHead: m.ageGroup === "adult"
        }));
      }
      return filtered;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!familyData.familyName.trim()) {
      toast({
        title: t("familyForm.validationNameRequired"),
        description: t("familyForm.validationNameRequired"),
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = familyData.primaryPhone.replace(/\s+/g, '');

    if (!cleanPhone) {
      toast({
        title: t("familyForm.validationPhoneRequired"),
        description: t("familyForm.validationPhoneRequired"),
        variant: "destructive",
      });
      return;
    }

    const phoneOk = /^(?:\+251|0)(?:9|7)\d{8}$/.test(cleanPhone);

    if (!phoneOk) {
      toast({
        title: t("familyForm.validationPhoneRequired"),
        description: t("familyForm.validationPhoneFormat"),
        variant: "destructive",
      });
      return;
    }

    if (members.length === 0) {
      toast({
        title: t("familyForm.validationMemberRequired"),
        description: t("familyForm.validationMemberRequired"),
        variant: "destructive",
      });
      return;
    }

    const head = members.find((m) => m.isFamilyHead);
    if (!head) {
      toast({
        title: t("familyForm.validationHeadRequired"),
        description: t("familyForm.validationHeadRequired"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const membersPayload = members.map((m) => {
        const isAdult = m.ageGroup === "adult";

        return {
          fullName: m.fullName.trim(),
          gender: m.gender || undefined,
          ageGroup: m.ageGroup,
          beneficiaryType: isAdult ? "adult" : "child",
          photoUrl: m.photoUrl || undefined,
          isOrphan: !isAdult ? m.isOrphan : false,
          orphanType: !isAdult && m.isOrphan ? m.orphanType : "none",
          memberClassification: m.memberClassification || undefined,
        };
      });

      const payload = {
        familyName: familyData.familyName.trim(),
        primaryPhone: cleanPhone,
        urgencyLevel: familyData.urgencyLevel,
        notes: familyData.notes || "",
        familyHead: head.fullName,
        members: membersPayload,
        documents: documents.length > 0 ? documents : undefined,
        registrationCompleted: true,
        registrationType: "complete",
        registrationStatus: "pending",
      };

      await familyApi.update(familyId, payload);

      toast({
        title: t("common.success"),
        description: t("familyForm.updateSuccess"),
      });

      navigate(`/dashboard/families/${familyId}`);
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.response?.data?.message || t("familyForm.updateError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Family Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("familyForm.editFamilyInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">{t("familyForm.familyName")}</Label>
            <Input
              id="familyName"
              className="text-sm sm:text-base"
              value={familyData.familyName}
              onChange={(e) =>
                setFamilyData({ ...familyData, familyName: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryPhone">{t("familyForm.phoneNumber")}</Label>
            <Input
              id="primaryPhone"
              ref={phoneRef}
              className="text-sm sm:text-base"
              value={familyData.primaryPhone}
              onChange={(e) => {
                const input = e.target;
                const cursorPos = input.selectionStart ?? 0;
                const rawBefore = (input.value.slice(0, cursorPos).match(/[\d+]/g) || []).length;
                const formatted = formatPhoneNumber(input.value);
                setFamilyData({ ...familyData, primaryPhone: formatted });
                if (formatted !== input.value) {
                  queueMicrotask(() => {
                    let newPos = 0;
                    let digitCount = 0;
                    for (let i = 0; i < formatted.length; i++) {
                      if (/[\d+]/.test(formatted[i])) digitCount++;
                      if (digitCount >= rawBefore) { newPos = i + 1; break; }
                    }
                    if (rawBefore === 0) newPos = 0;
                    if (digitCount < rawBefore) newPos = formatted.length;
                    input.setSelectionRange(newPos, newPos);
                  });
                }
              }}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">{t("familyForm.urgencyLevel")}</Label>
            <Select
              value={familyData.urgencyLevel}
              onValueChange={(value) =>
                setFamilyData({ ...familyData, urgencyLevel: value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("common.low")}</SelectItem>
                <SelectItem value="medium">{t("common.medium")}</SelectItem>
                <SelectItem value="high">{t("common.high")}</SelectItem>
                <SelectItem value="critical">{t("common.critical")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("familyForm.notes")}</Label>
            <Textarea
              id="notes"
              className="text-sm sm:text-base"
              value={familyData.notes}
              onChange={(e) =>
                setFamilyData({ ...familyData, notes: e.target.value })
              }
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("familyForm.supportingDocuments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload
            documents={documents}
            onChange={setDocuments}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Add Member */}
      <Card>
        <CardHeader>
          <CardTitle>{t("familyForm.addFamilyMember")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberFullName">{t("familyForm.fullName")}</Label>
              <Input
                id="memberFullName"
                className="text-sm sm:text-base"
                value={currentMember.fullName}
                onChange={(e) =>
                  setCurrentMember({
                    ...currentMember,
                    fullName: e.target.value,
                  })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberAgeGroup">{t("familyForm.ageGroup")}</Label>
              <Select
                value={currentMember.ageGroup}
                onValueChange={(value) =>
                  handleAgeGroupChange(value as "child" | "teen" | "adult")
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("familyForm.agePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">{t("familyForm.ageChild")}</SelectItem>
                  <SelectItem value="teen">{t("familyForm.ageTeen")}</SelectItem>
                  <SelectItem value="adult">{t("familyForm.ageAdult")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberGender">{t("familyForm.gender")}</Label>
            <Select
              value={currentMember.gender}
              onValueChange={(value) =>
                setCurrentMember({ ...currentMember, gender: value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("familyForm.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("common.male")}</SelectItem>
                <SelectItem value="female">{t("common.female")}</SelectItem>
                <SelectItem value="other">{t("common.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUpload
            label={t("familyForm.memberPhoto")}
            value={currentMember.photoUrl}
            onChange={(url) =>
              setCurrentMember({ ...currentMember, photoUrl: url })
            }
            disabled={loading}
          />

          {currentMember.ageGroup && currentMember.ageGroup !== "adult" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="memberOrphan"
                  checked={currentMember.isOrphan}
                  onCheckedChange={(checked) =>
                    setCurrentMember({
                      ...currentMember,
                      isOrphan: checked,
                      orphanType: checked ? currentMember.orphanType : "none",
                      memberClassification: checked ? "orphan" : "",
                    })
                  }
                  disabled={loading}
                />
                <Label htmlFor="memberOrphan">{t("familyForm.orphanToggle")}</Label>
              </div>

              {currentMember.isOrphan && (
                <div className="space-y-2">
                  <Label htmlFor="memberOrphanType">{t("familyForm.orphanType")}</Label>
                  <Select
                    value={currentMember.orphanType}
                    onValueChange={(value) =>
                      setCurrentMember({
                        ...currentMember,
                        orphanType: value,
                        memberClassification: "orphan",
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("familyForm.orphanTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">{t("familyForm.lostMother")}</SelectItem>
                      <SelectItem value="father">{t("familyForm.lostFather")}</SelectItem>
                      <SelectItem value="both">{t("familyForm.lostBoth")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

{currentMember.ageGroup && currentMember.ageGroup === "adult" && (
  <div className="space-y-2">
    <Label htmlFor="editMemberClassification">{t("familyForm.classification")}</Label>
    <Select
      value={currentMember.memberClassification}
      onValueChange={(value) =>
        setCurrentMember({ ...currentMember, memberClassification: value })
      }
      disabled={loading}
    >
      <SelectTrigger id="editMemberClassification">
        <SelectValue placeholder={t("familyForm.classificationPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{t("familyForm.classificationNone")}</SelectItem>
        <SelectItem value="disabled_disease">
          <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-pink-500" /> {t("familyForm.classificationDisabled")}</span>
        </SelectItem>
        <SelectItem value="old_age">
          <span className="flex items-center gap-2"><Accessibility className="h-4 w-4 text-purple-500" /> {t("familyForm.classificationOldAge")}</span>
        </SelectItem>
        <SelectItem value="single_mother">
          <span className="flex items-center gap-2"><Home className="h-4 w-4 text-amber-500" /> {t("familyForm.classificationSingleMother")}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

          <Button
            type="button"
            onClick={addMember}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("familyForm.addToFamily")}
          </Button>
        </CardContent>
      </Card>

      {/* Select Head */}
      {members.filter((m) => m.ageGroup === "adult").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("familyForm.headOfFamily")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{t("familyForm.selectHead")}</Label>
              <Select
                value={members.find((m) => m.isFamilyHead)?.tempId || "none"}
                onValueChange={(tempId) => {
                  setMembers((prev) =>
                    prev.map((m) => ({
                      ...m,
                      isFamilyHead: m.tempId === tempId,
                    }))
                  );
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("familyForm.selectAdultPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("familyForm.noHeadSelected")}</SelectItem>
                  {members
                    .filter((m) => m.ageGroup === "adult")
                    .map((m) => (
                      <SelectItem key={m.tempId} value={m.tempId}>
                        {m.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("familyForm.familyMembers", { count: members.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.tempId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {m.photoUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2">
                        <img
                          src={m.photoUrl}
                          alt={m.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                    )}

                    <div>
                      <p className="font-medium">
                        {m.fullName} {m.isFamilyHead && t("familyForm.headLabel")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {m.ageGroup ? t(`familyForm.age${m.ageGroup.charAt(0).toUpperCase() + m.ageGroup.slice(1)}`) : ""} • {m.gender ? t(`common.${m.gender}`) : ""}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(m.tempId)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <Button
                className="w-full sm:w-auto sm:justify-self-start"
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/families")}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button
              className="w-full sm:w-auto sm:justify-self-end"
              type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("familyForm.saveChanges")}
                  </>
                )}
              </Button>
            </div>
      {/* <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/dashboard/families/${familyId}`)}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div> */}
    </form>
  );
}