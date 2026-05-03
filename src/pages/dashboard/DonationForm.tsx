// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams, useParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import { donorApi, donationApi, familyApi, eventApi, beneficiaryApi } from "@/services/api.service";
// import { Loader2, ArrowLeft, Save, DollarSign, Check, ChevronsUpDown, Upload, FileText, X } from "lucide-react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { cn } from "@/lib/utils";

// const DonationForm = () => {
//   const { id } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [loading, setLoading] = useState(false);
  
//   const isEditMode = !!id;
//   const donorIdFromUrl = searchParams.get("donor");
  
//   const [donorOpen, setDonorOpen] = useState(false);
//   const [familyOpen, setFamilyOpen] = useState(false);
//   const [eventOpen, setEventOpen] = useState(false);
//   const [beneficiaryOpen, setBeneficiaryOpen] = useState(false);
//   const [selectedReceipt, setSelectedReceipt] = useState<File | null>(null);
  
//   const [formData, setFormData] = useState({
//     donorId: donorIdFromUrl || "",
//     donationType: "monetary",
//     amount: "",
//     currency: "ETB",
//     status: "received",
//     paymentMethod: "",
//     donationReference: "",
//     receivedAt: new Date().toISOString().split('T')[0],
//     familyId: "",
//     eventId: "",
//     beneficiaryId: "",
//     description: "",
//     usageNote: "",
//   });

//   // Fetch donation data if editing
//   const { data: donationData, isLoading: isLoadingDonation } = useQuery({
//     queryKey: ['donation', id],
//     queryFn: async () => {
//       if (!id) return null;
//       const response = await donationApi.getById(id);
//       return response.data;
//     },
//     enabled: isEditMode,
//   });

//   // Fetch all donors for selection
//   const { data: donorsData } = useQuery({
//     queryKey: ['donors', 'all'],
//     queryFn: async () => {
//       const response = await donorApi.getAll({ page: 1, limit: 100 });
//       return response.data;
//     },
//   });

//   // Fetch donor details if pre-selected
//   const { data: donorData } = useQuery({
//     queryKey: ['donor', donorIdFromUrl],
//     queryFn: async () => {
//       if (!donorIdFromUrl) return null;
//       const response = await donorApi.getById(donorIdFromUrl);
//       return response.data;
//     },
//     enabled: !!donorIdFromUrl && !isEditMode,
//   });

//   // Fetch families for allocation
//   const { data: familiesData } = useQuery({
//     queryKey: ['families', 'all'],
//     queryFn: async () => {
//       const response = await familyApi.getAll({ page: 1, limit: 100 });
//       return response.data;
//     },
//   });

//   // Fetch events for allocation
//   const { data: eventsData } = useQuery({
//     queryKey: ['events', 'all'],
//     queryFn: async () => {
//       const response = await eventApi.getAll({ page: 1, limit: 100 });
//       return response.data;
//     },
//   });

//   // Fetch beneficiaries for allocation
//   const { data: beneficiariesData } = useQuery({
//     queryKey: ['beneficiaries', 'all'],
//     queryFn: async () => {
//       const response = await beneficiaryApi.getAll({ page: 1, limit: 100 });
//       return response.data;
//     },
//   });

//   useEffect(() => {
//     if (donorIdFromUrl && !isEditMode) {
//       setFormData(prev => ({ ...prev, donorId: donorIdFromUrl }));
//     }
//   }, [donorIdFromUrl, isEditMode]);

//   useEffect(() => {
//     if (donationData) {
//       setFormData({
//         donorId: donationData.donorId || "",
//         donationType: donationData.donationType || "monetary",
//         amount: donationData.amount?.toString() || "",
//         currency: donationData.currency || "USD",
//         status: donationData.status || "received",
//         paymentMethod: donationData.paymentMethod || "",
//         donationReference: donationData.donationReference || "",
//         receivedAt: donationData.receivedAt ? new Date(donationData.receivedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
//         familyId: donationData.familyId || "",
//         eventId: donationData.eventId || "",
//         beneficiaryId: donationData.beneficiaryId || "",
//         description: donationData.description || "",
//         usageNote: donationData.usageNote || "",
//       });
//     }
//   }, [donationData]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.donorId) {
//       toast({
//         title: "Validation Error",
//         description: "Please select a donor",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (formData.donationType === "monetary" && !formData.amount) {
//       toast({
//         title: "Validation Error",
//         description: "Amount is required for money donations",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (formData.donationType === "in_kind" && !formData.description) {
//       toast({
//         title: "Validation Error",
//         description: "Description is required for in-kind donations",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare donation data
//       const donationData: any = {
//         donorId: formData.donorId,
//         donationType: formData.donationType,
//         status: formData.status,
//         receivedAt: new Date(formData.receivedAt).toISOString(),
//       };

//       // Add monetary fields if applicable
//       if (formData.donationType === "monetary" && formData.amount) {
//         donationData.amount = parseFloat(formData.amount);
//         donationData.currency = formData.currency;
//       }

//       // Add optional fields
//       if (formData.paymentMethod) donationData.paymentMethod = formData.paymentMethod;
//       if (formData.donationReference) donationData.donationReference = formData.donationReference;
//       if (formData.familyId && formData.familyId !== "none" && formData.familyId !== "") donationData.familyId = formData.familyId;
//       if (formData.eventId && formData.eventId !== "none" && formData.eventId !== "") donationData.eventId = formData.eventId;
//       if (formData.beneficiaryId && formData.beneficiaryId !== "none" && formData.beneficiaryId !== "") donationData.beneficiaryId = formData.beneficiaryId;
//       if (formData.description) donationData.description = formData.description;
//       if (formData.usageNote) donationData.usageNote = formData.usageNote;

//       let savedDonationId = id;

//       if (isEditMode && id) {
//         const response = await donationApi.update(id, donationData);
//         savedDonationId = response.data.id;
//         toast({
//           title: "Success",
//           description: "Donation updated successfully",
//         });
//       } else {
//         const response = await donationApi.create(donationData);
//         savedDonationId = response.data.id;
//         toast({
//           title: "Success",
//           description: "Donation recorded successfully",
//         });
//       }

//       // Upload receipt if provided (staff) - only for received donations
//       if (selectedReceipt && savedDonationId && formData.status === "received") {
//         try {
//           await donationApi.uploadReceipt(savedDonationId, selectedReceipt);
//           toast({
//             title: "Receipt Uploaded",
//             description: "Receipt uploaded successfully",
//           });
//         } catch (error) {
//           console.error("Receipt upload failed:", error);
//           toast({
//             title: "Warning",
//             description: "Donation saved but receipt upload failed",
//             variant: "destructive",
//           });
//         }
//       }

//       // Invalidate relevant queries
//       queryClient.invalidateQueries({ queryKey: ['donations'] });
//       queryClient.invalidateQueries({ queryKey: ['donor', donorIdFromUrl] });
//       queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
//       // Navigate back to donor profile or donations list
//       if (donorIdFromUrl) {
//         navigate(`/dashboard/donors/${donorIdFromUrl}`);
//       } else {
//         navigate("/dashboard/finances");
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to record donation",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isLoadingDonation) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-8 h-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   const getBackUrl = () => {
//     if (isEditMode && id) return `/dashboard/donations/${id}`;
//     if (donorIdFromUrl) return `/dashboard/donors/${donorIdFromUrl}`;
//     return "/dashboard/donations";
//   };

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => navigate(getBackUrl())}
//         >
//           <ArrowLeft className="w-5 h-5" />
//         </Button>
//         <div>
//           <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
//             {isEditMode ? "Edit Donation" : "Record Donation"}
//           </h1>
//           <p className="text-muted-foreground">
//             {isEditMode 
//               ? "Update donation information"
//               : donorData 
//                 ? `Recording donation from ${donorData.name}` 
//                 : "Enter donation details"}
//           </p>
//         </div>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit}>
//         <div className="grid gap-6 max-w-4xl">
//           {/* Donor Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Donor Information</CardTitle>
//               <CardDescription>
//                 Select the donor making this contribution
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {donorIdFromUrl && (donorData || (isEditMode && donationData?.donor)) ? (
//                 <div className="p-4 bg-muted rounded-lg">
//                   <p className="text-sm text-muted-foreground mb-1">Donor</p>
//                   <p className="font-semibold text-foreground">
//                     {donorData?.name || donationData?.donor?.name}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {donorData?.donorCode || donationData?.donor?.donorCode}
//                   </p>
//                 </div>
//               ) : (
//                 <div>
//                   <Label>
//                     Select Donor <span className="text-destructive">*</span>
//                   </Label>
//                   <Popover open={donorOpen} onOpenChange={setDonorOpen}>
//                     <PopoverTrigger asChild>
//                       <Button
//                         variant="outline"
//                         role="combobox"
//                         aria-expanded={donorOpen}
//                         className="w-full justify-between"
//                       >
//                         {formData.donorId
//                           ? donorsData?.data?.find((donor: any) => donor.id === formData.donorId)?.name
//                           : "Select donor..."}
//                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-[400px] p-0">
//                       <Command>
//                         <CommandInput placeholder="Search donors..." />
//                         <CommandList>
//                           <CommandEmpty>No donor found.</CommandEmpty>
//                           <CommandGroup>
//                             {donorsData?.data?.map((donor: any) => (
//                               <CommandItem
//                                 key={donor.id}
//                                 value={donor.name}
//                                 onSelect={() => {
//                                   setFormData({ ...formData, donorId: donor.id });
//                                   setDonorOpen(false);
//                                 }}
//                               >
//                                 <Check
//                                   className={cn(
//                                     "mr-2 h-4 w-4",
//                                     formData.donorId === donor.id ? "opacity-100" : "opacity-0"
//                                   )}
//                                 />
//                                 <div>
//                                   <p className="font-medium">{donor.name}</p>
//                                   <p className="text-xs text-muted-foreground">
//                                     {donor.donorCode} {donor.email && `• ${donor.email}`}
//                                   </p>
//                                 </div>
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </CommandList>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                   <p className="text-sm text-muted-foreground mt-1">
//                     Search and select the donor for this donation
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Donation Details */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Donation Details</CardTitle>
//               <CardDescription>
//                 Information about the contribution
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Donation Type */}
//                 <div>
//                   <Label htmlFor="donationType">
//                     Donation Type <span className="text-destructive">*</span>
//                   </Label>
//                   <Select
//                     value={formData.donationType}
//                     onValueChange={(value) => {
//                       // Clear payment fields when switching to in-kind
//                       if (value === "in_kind") {
//                         setFormData({ 
//                           ...formData, 
//                           donationType: value,
//                           amount: "",
//                           paymentMethod: "",
//                           donationReference: "",
//                         });
//                       } else {
//                         setFormData({ ...formData, donationType: value });
//                       }
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="monetary">Money</SelectItem>
//                       <SelectItem value="in_kind">In-Kind</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Status */}
//                 <div>
//                   <Label htmlFor="status">Status</Label>
//                   <Select
//                     value={formData.status}
//                     onValueChange={(value) => {
//                       // Clear payment fields when switching to promised
//                       if (value === "pledged") {
//                         setFormData({ 
//                           ...formData, 
//                           status: value,
//                           paymentMethod: "",
//                           donationReference: "",
//                         });
//                       } else {
//                         setFormData({ ...formData, status: value });
//                       }
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="received">Received</SelectItem>
//                       <SelectItem value="pledged">Promised</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Amount */}
//                 {formData.donationType === "monetary" && (
//                   <>
//                     <div>
//                       <Label htmlFor="amount">
//                         Amount <span className="text-destructive">*</span>
//                       </Label>
//                       <div className="relative">
//                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                         <Input
//                           id="amount"
//                           type="number"
//                           step="0.01"
//                           value={formData.amount}
//                           onChange={(e) =>
//                             setFormData({ ...formData, amount: e.target.value })
//                           }
//                           placeholder="0.00"
//                           className="pl-10"
//                           required={formData.donationType === "monetary"}
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <Label htmlFor="currency">Currency</Label>
//                       <Select
//                         value={formData.currency}
//                         onValueChange={(value) =>
//                           setFormData({ ...formData, currency: value })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
//                           <SelectItem value="USD">USD - US Dollar</SelectItem>
//                           <SelectItem value="EUR">EUR - Euro</SelectItem>
//                           <SelectItem value="GBP">GBP - British Pound</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </>
//                 )}

//                 {/* Payment Method - Only for received monetary donations */}
//                 {formData.donationType === "monetary" && formData.status === "received" && (
//                   <>
//                     <div>
//                       <Label htmlFor="paymentMethod">Payment Method</Label>
//                       <Select
//                         value={formData.paymentMethod}
//                         onValueChange={(value) =>
//                           setFormData({ ...formData, paymentMethod: value })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select method" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="cash">Cash</SelectItem>
//                           <SelectItem value="bank_transfer">Transfer</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     {/* Reference Number */}
//                     <div>
//                       <Label htmlFor="donationReference">Reference Number</Label>
//                       <Input
//                         id="donationReference"
//                         value={formData.donationReference}
//                         onChange={(e) =>
//                           setFormData({ ...formData, donationReference: e.target.value })
//                         }
//                         placeholder="Transaction reference"
//                       />
//                     </div>
//                   </>
//                 )}

//                 {/* Received Date - Only for received status */}
//                 {formData.status === "received" && (
//                   <div className="col-span-2">
//                     <Label htmlFor="receivedAt">Date Received</Label>
//                     <Input
//                       id="receivedAt"
//                       type="date"
//                       value={formData.receivedAt}
//                       onChange={(e) =>
//                         setFormData({ ...formData, receivedAt: e.target.value })
//                       }
//                     />
//                   </div>
//                 )}

//                 {/* Promise Date - Only for promised status */}
//                 {formData.status === "pledged" && (
//                   <div className="col-span-2">
//                     <Label htmlFor="receivedAt">Promise Date</Label>
//                     <Input
//                       id="receivedAt"
//                       type="date"
//                       value={formData.receivedAt}
//                       onChange={(e) =>
//                         setFormData({ ...formData, receivedAt: e.target.value })
//                       }
//                     />
//                     <p className="text-xs text-muted-foreground mt-1">
//                       Date when the promise was made
//                     </p>
//                   </div>
//                 )}

//                 {/* Receipt Upload - Only for received status */}
//                 {formData.status === "received" && (
//                   <div className="col-span-2">
//                     <Label htmlFor="receipt">Receipt (Optional)</Label>
//                     {!selectedReceipt ? (
//                       <div
//                         className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
//                         onClick={() => document.getElementById('receipt-input')?.click()}
//                       >
//                         <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
//                         <p className="text-sm font-medium text-foreground">Upload Receipt</p>
//                         <p className="text-xs text-muted-foreground">
//                           Click to upload image or PDF (max 10MB)
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="border rounded-lg p-4 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <FileText className="w-8 h-8 text-primary" />
//                           <div>
//                             <p className="text-sm font-medium text-foreground">{selectedReceipt.name}</p>
//                             <p className="text-xs text-muted-foreground">
//                               {(selectedReceipt.size / 1024 / 1024).toFixed(2)} MB
//                             </p>
//                           </div>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => setSelectedReceipt(null)}
//                         >
//                           <X className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     )}
//                     <input
//                       id="receipt-input"
//                       type="file"
//                       accept="image/jpeg,image/jpg,image/png,application/pdf"
//                       className="hidden"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) {
//                           if (file.size > 10 * 1024 * 1024) {
//                             toast({
//                               title: "File Too Large",
//                               description: "Please upload a file smaller than 10MB",
//                               variant: "destructive",
//                             });
//                             return;
//                           }
//                           setSelectedReceipt(file);
//                         }
//                       }}
//                     />
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Allocation (Optional) */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Allocation (Optional)</CardTitle>
//               <CardDescription>
//                 Designate this donation to a specific cause
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Family */}
//                 <div>
//                   <Label>Family</Label>
//                   <Popover open={familyOpen} onOpenChange={setFamilyOpen}>
//                     <PopoverTrigger asChild>
//                       <Button
//                         variant="outline"
//                         role="combobox"
//                         aria-expanded={familyOpen}
//                         className="w-full justify-between"
//                       >
//                         {formData.familyId
//                           ? familiesData?.data?.find((family: any) => family.id === formData.familyId)?.familyName
//                           : "Select family..."}
//                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-[300px] p-0">
//                       <Command>
//                         <CommandInput placeholder="Search families..." />
//                         <CommandList>
//                           <CommandEmpty>No family found.</CommandEmpty>
//                           <CommandGroup>
//                             <CommandItem
//                               value=""
//                               onSelect={() => {
//                                 setFormData({ ...formData, familyId: "" });
//                                 setFamilyOpen(false);
//                               }}
//                             >
//                               <Check
//                                 className={cn(
//                                   "mr-2 h-4 w-4",
//                                   formData.familyId === "" ? "opacity-100" : "opacity-0"
//                                 )}
//                               />
//                               None
//                             </CommandItem>
//                             {familiesData?.data?.map((family: any) => (
//                               <CommandItem
//                                 key={family.id}
//                                 value={family.familyName}
//                                 onSelect={() => {
//                                   setFormData({ ...formData, familyId: family.id });
//                                   setFamilyOpen(false);
//                                 }}
//                               >
//                                 <Check
//                                   className={cn(
//                                     "mr-2 h-4 w-4",
//                                     formData.familyId === family.id ? "opacity-100" : "opacity-0"
//                                   )}
//                                 />
//                                 <div>
//                                   <p className="font-medium">{family.familyName}</p>
//                                   <p className="text-xs text-muted-foreground">{family.familyCode}</p>
//                                 </div>
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </CommandList>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 {/* Event */}
//                 <div>
//                   <Label>Event</Label>
//                   <Popover open={eventOpen} onOpenChange={setEventOpen}>
//                     <PopoverTrigger asChild>
//                       <Button
//                         variant="outline"
//                         role="combobox"
//                         aria-expanded={eventOpen}
//                         className="w-full justify-between"
//                       >
//                         {formData.eventId
//                           ? eventsData?.data?.find((event: any) => event.id === formData.eventId)?.title
//                           : "Select event..."}
//                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-[300px] p-0">
//                       <Command>
//                         <CommandInput placeholder="Search events..." />
//                         <CommandList>
//                           <CommandEmpty>No event found.</CommandEmpty>
//                           <CommandGroup>
//                             <CommandItem
//                               value=""
//                               onSelect={() => {
//                                 setFormData({ ...formData, eventId: "" });
//                                 setEventOpen(false);
//                               }}
//                             >
//                               <Check
//                                 className={cn(
//                                   "mr-2 h-4 w-4",
//                                   formData.eventId === "" ? "opacity-100" : "opacity-0"
//                                 )}
//                               />
//                               None
//                             </CommandItem>
//                             {eventsData?.data?.map((event: any) => (
//                               <CommandItem
//                                 key={event.id}
//                                 value={event.title}
//                                 onSelect={() => {
//                                   setFormData({ ...formData, eventId: event.id });
//                                   setEventOpen(false);
//                                 }}
//                               >
//                                 <Check
//                                   className={cn(
//                                     "mr-2 h-4 w-4",
//                                     formData.eventId === event.id ? "opacity-100" : "opacity-0"
//                                   )}
//                                 />
//                                 <div>
//                                   <p className="font-medium">{event.title}</p>
//                                   <p className="text-xs text-muted-foreground">
//                                     {new Date(event.startDate).toLocaleDateString()}
//                                   </p>
//                                 </div>
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </CommandList>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 {/* Beneficiary */}
//                 <div>
//                   <Label>Beneficiary</Label>
//                   <Popover open={beneficiaryOpen} onOpenChange={setBeneficiaryOpen}>
//                     <PopoverTrigger asChild>
//                       <Button
//                         variant="outline"
//                         role="combobox"
//                         aria-expanded={beneficiaryOpen}
//                         className="w-full justify-between"
//                       >
//                         {formData.beneficiaryId
//                           ? beneficiariesData?.data?.find((ben: any) => ben.id === formData.beneficiaryId)?.fullName
//                           : "Select beneficiary..."}
//                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-[300px] p-0">
//                       <Command>
//                         <CommandInput placeholder="Search beneficiaries..." />
//                         <CommandList>
//                           <CommandEmpty>No beneficiary found.</CommandEmpty>
//                           <CommandGroup>
//                             <CommandItem
//                               value=""
//                               onSelect={() => {
//                                 setFormData({ ...formData, beneficiaryId: "" });
//                                 setBeneficiaryOpen(false);
//                               }}
//                             >
//                               <Check
//                                 className={cn(
//                                   "mr-2 h-4 w-4",
//                                   formData.beneficiaryId === "" ? "opacity-100" : "opacity-0"
//                                 )}
//                               />
//                               None
//                             </CommandItem>
//                             {beneficiariesData?.data?.map((beneficiary: any) => (
//                               <CommandItem
//                                 key={beneficiary.id}
//                                 value={beneficiary.fullName}
//                                 onSelect={() => {
//                                   setFormData({ ...formData, beneficiaryId: beneficiary.id });
//                                   setBeneficiaryOpen(false);
//                                 }}
//                               >
//                                 <Check
//                                   className={cn(
//                                     "mr-2 h-4 w-4",
//                                     formData.beneficiaryId === beneficiary.id ? "opacity-100" : "opacity-0"
//                                   )}
//                                 />
//                                 <div>
//                                   <p className="font-medium">{beneficiary.fullName}</p>
//                                   <p className="text-xs text-muted-foreground">
//                                     {beneficiary.beneficiaryCode}
//                                   </p>
//                                 </div>
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </CommandList>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Additional Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Additional Information</CardTitle>
//               <CardDescription>
//                 Notes and usage details
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label htmlFor="description">
//                   Description
//                   {formData.donationType === "in_kind" && <span className="text-destructive"> *</span>}
//                 </Label>
//                 <Textarea
//                   id="description"
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   placeholder={
//                     formData.donationType === "in_kind"
//                       ? "Describe the items or goods donated (required)"
//                       : "Additional details about this donation"
//                   }
//                   rows={3}
//                   required={formData.donationType === "in_kind"}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="usageNote">Usage Note</Label>
//                 <Textarea
//                   id="usageNote"
//                   value={formData.usageNote}
//                   onChange={(e) =>
//                     setFormData({ ...formData, usageNote: e.target.value })
//                   }
//                   placeholder="How will this donation be used?"
//                   rows={3}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Actions */}
//           <div className="flex justify-end gap-3">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => navigate(getBackUrl())}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               <Save className="w-4 h-4 mr-2" />
//               {isEditMode ? "Update Donation" : "Record Donation"}
//             </Button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default DonationForm;

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { donorApi, donationApi, familyApi, eventApi } from "@/services/api.service";
import { Loader2, ArrowLeft, Save, DollarSign, Check, ChevronsUpDown, Upload, FileText, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const DonationForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!id;
  const donorIdFromUrl = searchParams.get("donor");

  const [donorOpen, setDonorOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    donorId: donorIdFromUrl || "",
    donorName: "",
    donationType: "monetary",
    amount: "",
    currency: "ETB",
    status: "received",
    paymentMethod: "",
    donationReference: "",
    receivedAt: new Date().toISOString().split("T")[0],
    familyId: "",
    eventId: "",
    description: "",
    usageNote: "",
  });

  const { data: donationData, isLoading: isLoadingDonation } = useQuery({
    queryKey: ["donation", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await donationApi.getById(id);
      return response.data;
    },
    enabled: isEditMode,
  });

  const { data: donorsData } = useQuery({
    queryKey: ["donors", "all"],
    queryFn: async () => {
      const response = await donorApi.getAll({ page: 1, limit: 100 });
      return response;
    },
  });

  const { data: donorData } = useQuery({
    queryKey: ["donor", donorIdFromUrl],
    queryFn: async () => {
      if (!donorIdFromUrl) return null;
      const response = await donorApi.getById(donorIdFromUrl);
      console.log("DONOR DATA", response)
      return response.data;
    },
    enabled: !!donorIdFromUrl && !isEditMode,
  });

  const { data: familiesData } = useQuery({
    queryKey: ["families", "all"],
    queryFn: async () => {
      const response = await familyApi.getAll({ page: 1, limit: 100 });
      return response.data;
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const response = await eventApi.getAll({ page: 1, limit: 100 });
      return response.data;
    },
  });

  useEffect(() => {
    if (donorIdFromUrl && !isEditMode) {
      setFormData((prev) => ({ ...prev, donorId: donorIdFromUrl }));
    }
  }, [donorIdFromUrl, isEditMode]);

  useEffect(() => {
    if (donorData) {
      setFormData((prev) => ({
        ...prev,
        donorId: donorData._id,
        donorName: donorData.name,
      }));
    }
  }, [donorData]);

  useEffect(() => {
    if (donationData) {
      setFormData({
        donorId: donationData.donorId || "",
        donorName: donationData.donorName || "",
        donationType: donationData.donationType || "monetary",
        amount: donationData.amount?.toString() || "",
        currency: donationData.currency || "USD",
        status: donationData.status || "received",
        paymentMethod: donationData.paymentMethod || "",
        donationReference: donationData.donationReference || "",
        receivedAt: donationData.receivedAt
          ? new Date(donationData.receivedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        familyId: donationData.familyId || "",
        eventId: donationData.eventId || "",
        description: donationData.description || "",
        usageNote: donationData.usageNote || "",
      });
    }
  }, [donationData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.donorId) {
      toast({
        title: "Validation Error",
        description: "Please select a donor",
        variant: "destructive",
      });
      return;
    }

    if (formData.donationType === "monetary" && !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Amount is required for money donations",
        variant: "destructive",
      });
      return;
    }

    if (formData.donationType === "in_kind" && !formData.description) {
      toast({
        title: "Validation Error",
        description: "Description is required for in-kind donations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        donorId: formData.donorId,
        donorName: formData.donorName,
        donationType: formData.donationType,
        status: formData.status,
        receivedAt: new Date(formData.receivedAt).toISOString(),
      };

      if (formData.donationType === "monetary" && formData.amount) {
        payload.amount = parseFloat(formData.amount);
        payload.currency = formData.currency;
      }

      if (formData.paymentMethod) payload.paymentMethod = formData.paymentMethod;
      if (formData.donationReference) payload.donationReference = formData.donationReference;
      if (formData.familyId) payload.familyId = formData.familyId;
      if (formData.eventId) payload.eventId = formData.eventId;
      if (formData.description) payload.description = formData.description;
      if (formData.usageNote) payload.usageNote = formData.usageNote;

      let savedDonationId = id;

      if (isEditMode && id) {
        const response = await donationApi.update(id, payload);
        savedDonationId = response.data.id;
        toast({ title: "Success", description: "Donation updated successfully" });
      } else {
        const response = await donationApi.create(payload);
        savedDonationId = response.id;
        toast({ title: "Success", description: "Donation recorded successfully" });
      }

      if (selectedReceipt && savedDonationId && formData.status === "received") {
        try {
          await donationApi.uploadReceipt(savedDonationId, selectedReceipt);
          toast({ title: "Receipt Uploaded", description: "Receipt uploaded successfully" });
        } catch {
          toast({
            title: "Warning",
            description: "Donation saved but receipt upload failed",
            variant: "destructive",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["donor", donorIdFromUrl] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      if (donorIdFromUrl) navigate(`/dashboard/donors/${donorIdFromUrl}`);
      else navigate("/dashboard/donations");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record donation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingDonation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getBackUrl = () => {
    if (isEditMode && id) return `/dashboard/donations/${id}`;
    if (donorIdFromUrl) return `/dashboard/donors/${donorIdFromUrl}`;
    return "/dashboard/donations";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(getBackUrl())}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Donation" : "Record Donation"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update donation information"
              : donorData
                ? `Recording donation from ${donorData.name}`
                : "Enter donation details"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Donor Information</CardTitle>
              <CardDescription>Select the donor making this contribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {donorIdFromUrl && (donorData || (isEditMode && donationData?.donor)) ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Donor</p>
                  <p className="font-semibold text-foreground">
                    {donorData?.name || donationData?.donor?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {donorData?.donorCode || donationData?.donor?.donorCode}
                  </p>
                </div>
              ) : (
                <div>
                  <Label>
                    Select Donor <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={donorOpen} onOpenChange={setDonorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={donorOpen}
                        className="w-full justify-between"
                      >
                        {formData.donorId
                          ? donorsData?.data?.find((donor: any) => donor._id === formData.donorId)?.name
                          : "Select donor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search donors..." />
                        <CommandList>
                          <CommandEmpty>No donor found.</CommandEmpty>
                          <CommandGroup>
                            {donorsData?.data?.map((donor: any) => (
                              <CommandItem
                                key={donor._id}
                                value={donor.name}
                                onSelect={() => {
                                  setFormData({ ...formData, donorId: donor._id, donorName: donor.name });
                                  setDonorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.donorId === donor._id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div>
                                  <p className="font-medium">{donor.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {donor.donorCode} 
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground mt-1">
                    Search and select the donor for this donation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
              <CardDescription>Information about the contribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donationType">
                    Donation Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.donationType}
                    onValueChange={(value) => {
                      if (value === "in_kind") {
                        setFormData({
                          ...formData,
                          donationType: value,
                          amount: "",
                          paymentMethod: "",
                          donationReference: "",
                        });
                      } else {
                        setFormData({ ...formData, donationType: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monetary">Money</SelectItem>
                      <SelectItem value="in_kind">In-Kind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => {
                      if (value === "pledged") {
                        setFormData({
                          ...formData,
                          status: value,
                          paymentMethod: "",
                          donationReference: "",
                        });
                      } else {
                        setFormData({ ...formData, status: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="pledged">Promised</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.donationType === "monetary" && (
                  <>
                    <div>
                      <Label htmlFor="amount">
                        Amount <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="0.00"
                          className="pl-10"
                          required={formData.donationType === "monetary"}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {formData.donationType === "monetary" && formData.status === "received" && (
                  <>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="donationReference">Reference Number</Label>
                      <Input
                        id="donationReference"
                        value={formData.donationReference}
                        onChange={(e) => setFormData({ ...formData, donationReference: e.target.value })}
                        placeholder="Transaction reference"
                      />
                    </div>
                  </>
                )}

                {formData.status === "received" && (
                  <div className="col-span-2">
                    <Label htmlFor="receivedAt">Date Received</Label>
                    <Input
                      id="receivedAt"
                      type="date"
                      value={formData.receivedAt}
                      onChange={(e) => setFormData({ ...formData, receivedAt: e.target.value })}
                    />
                  </div>
                )}

                {formData.status === "pledged" && (
                  <div className="col-span-2">
                    <Label htmlFor="receivedAt">Promise Date</Label>
                    <Input
                      id="receivedAt"
                      type="date"
                      value={formData.receivedAt}
                      onChange={(e) => setFormData({ ...formData, receivedAt: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Date when the promise was made</p>
                  </div>
                )}

                {formData.status === "received" && (
                  <div className="col-span-2">
                    <Label htmlFor="receipt">Receipt (Optional)</Label>
                    {!selectedReceipt ? (
                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById("receipt-input")?.click()}
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Upload Receipt</p>
                        <p className="text-xs text-muted-foreground">
                          Click to upload image or PDF (max 10MB)
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{selectedReceipt.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedReceipt.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <input
                      id="receipt-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          toast({
                            title: "File Too Large",
                            description: "Please upload a file smaller than 10MB",
                            variant: "destructive",
                          });
                          return;
                        }
                        setSelectedReceipt(file);
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allocation (Optional)</CardTitle>
              <CardDescription>Designate this donation to a specific cause</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Family</Label>
                  <Popover open={familyOpen} onOpenChange={setFamilyOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={familyOpen} className="w-full justify-between">
                        {formData.familyId
                          ? familiesData?.find((family: any) => family._id === formData.familyId)?.familyName
                          : "Select family..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search families..." />
                        <CommandList>
                          <CommandEmpty>No family found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value=""
                              onSelect={() => {
                                setFormData({ ...formData, familyId: "" });
                                setFamilyOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.familyId === "" ? "opacity-100" : "opacity-0")} />
                              None
                            </CommandItem>
                            {familiesData?.map((family: any) => (
                              <CommandItem
                                key={family._id}
                                value={family.familyName}
                                onSelect={() => {
                                  setFormData({ ...formData, familyId: family._id });
                                  setFamilyOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", formData.familyId === family.id ? "opacity-100" : "opacity-0")} />
                                <div>
                                  <p className="font-medium">{family.familyName}</p>
                                  <p className="text-xs text-muted-foreground">{family.familyCode}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Event</Label>
                  <Popover open={eventOpen} onOpenChange={setEventOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={eventOpen} className="w-full justify-between">
                        {formData.eventId
                          ? eventsData?.find((event: any) => event._id === formData.eventId)?.title
                          : "Select event..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search events..." />
                        <CommandList>
                          <CommandEmpty>No event found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value=""
                              onSelect={() => {
                                setFormData({ ...formData, eventId: "" });
                                setEventOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.eventId === "" ? "opacity-100" : "opacity-0")} />
                              None
                            </CommandItem>
                            {eventsData?.map((event: any) => (
                              <CommandItem
                                key={event._id}
                                value={event.title}
                                onSelect={() => {
                                  setFormData({ ...formData, eventId: event._id });
                                  setEventOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", formData.eventId === event.id ? "opacity-100" : "opacity-0")} />
                                <div>
                                  <p className="font-medium">{event.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(event.startDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Notes and usage details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">
                  Description
                  {formData.donationType === "in_kind" && <span className="text-destructive"> *</span>}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    formData.donationType === "in_kind"
                      ? "Describe the items or goods donated (required)"
                      : "Additional details about this donation"
                  }
                  rows={3}
                  required={formData.donationType === "in_kind"}
                />
              </div>

              <div>
                <Label htmlFor="usageNote">Usage Note</Label>
                <Textarea
                  id="usageNote"
                  value={formData.usageNote}
                  onChange={(e) => setFormData({ ...formData, usageNote: e.target.value })}
                  placeholder="How will this donation be used?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(getBackUrl())}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? "Update Donation" : "Record Donation"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;