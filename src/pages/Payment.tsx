// import { useMemo, useState } from "react";
// import {
//   CreditCard,
//   Wallet,
//   Building2,
//   Lock,
//   HelpCircle,
//   ShieldCheck,
//   HeartHandshake,
// } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// const PRESET_AMOUNTS = [10, 25, 50];

// const Payment = () => {
//   const [selectedAmount, setSelectedAmount] = useState<number>(25);
//   const [customAmount, setCustomAmount] = useState<string>("");
//   const [paymentMethod, setPaymentMethod] = useState<"card" | "telebirr">("card");
//   const [telebirrPhone, setTelebirrPhone] = useState<string>("");

//   const displayAmount = useMemo(() => {
//     const custom = Number(customAmount);
//     if (!Number.isNaN(custom) && custom > 0) return custom;
//     return selectedAmount;
//   }, [customAmount, selectedAmount]);

//   const processingFee = useMemo(() => +(displayAmount * 0.03).toFixed(2), [displayAmount]);
//   const totalAmount = useMemo(() => +(displayAmount + processingFee).toFixed(2), [displayAmount, processingFee]);

//   const handleCompleteDonation = () => {
//     if (paymentMethod === "telebirr" && !telebirrPhone.trim()) {
//       alert("Please enter your Telebirr phone number.");
//       return;
//     }

//     const apiOrigin = import.meta.env.VITE_API_URL || "http://localhost:3000";
//     window.location.assign(`${apiOrigin}/initialize`);
//   };

//   return (
//     <main className="py-20 px-6 max-w-7xl mx-auto">
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
//         {/* Main Column */}
//         <div className="lg:col-span-8 space-y-10">
//           <header>
//             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Complete Your Donation</h1>
//             <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
//               Your contribution empowers our mission to drive positive change and support vital causes in communities
//               across the globe.
//             </p>
//           </header>

//           {/* Donation Amount */}
//           <section className="space-y-6">
//             <div className="flex items-center gap-2">
//               <Wallet className="w-5 h-5 text-primary" />
//               <h2 className="text-xl font-bold">Select Donation Amount</h2>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {PRESET_AMOUNTS.map((amount) => {
//                 const active = !customAmount && selectedAmount === amount;
//                 return (
//                   <button
//                     key={amount}
//                     type="button"
//                     onClick={() => {
//                       setCustomAmount("");
//                       setSelectedAmount(amount);
//                     }}
//                     className={`py-6 px-4 rounded-xl border-2 transition-all text-center ${
//                       active ? "border-primary bg-primary/10" : "border-transparent bg-card hover:border-primary/40"
//                     }`}
//                   >
//                     <div className={`text-2xl font-bold ${active ? "text-primary" : "text-foreground"}`}>${amount}</div>
//                     <div className="text-xs text-muted-foreground">
//                       {amount === 10 ? "Simple Gift" : amount === 25 ? "Impactful" : "Generous"}
//                     </div>
//                   </button>
//                 );
//               })}

//               <input
//                 type="number"
//                 min="1"
//                 step="0.01"
//                 placeholder="Custom"
//                 value={customAmount}
//                 onChange={(e) => setCustomAmount(e.target.value)}
//                 className="w-full py-6 px-4 rounded-xl border-2 border-border bg-card text-center text-xl font-bold"
//               />
//             </div>
//           </section>

//           {/* Payment Method */}
//           <section className="space-y-6">
//             <div className="flex items-center gap-2">
//               <CreditCard className="w-5 h-5 text-primary" />
//               <h2 className="text-xl font-bold">Payment Method</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div
//                 role="button"
//                 tabIndex={0}
//                 onClick={() => setPaymentMethod("card")}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") setPaymentMethod("card");
//                 }}
//                 className={`p-5 rounded-xl cursor-pointer flex items-center gap-4 transition-all border ${
//                   paymentMethod === "card"
//                     ? "border-primary bg-primary/5"
//                     : "border-border bg-card hover:bg-muted/40"
//                 }`}
//               >
//                 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <CreditCard className="w-5 h-5 text-primary" />
//                 </div>
//                 <div>
//                   <div className="font-bold text-sm">Credit/Debit Card</div>
//                   <div className="text-xs text-muted-foreground">Secure checkout</div>
//                 </div>
//               </div>

//               <div
//                 role="button"
//                 tabIndex={0}
//                 onClick={() => setPaymentMethod("telebirr")}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") setPaymentMethod("telebirr");
//                 }}
//                 className={`p-5 rounded-xl cursor-pointer flex items-center gap-4 transition-all border ${
//                   paymentMethod === "telebirr"
//                     ? "border-primary bg-primary/5"
//                     : "border-border bg-card hover:bg-muted/40"
//                 }`}
//               >
//                 <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
//                   <Building2 className="w-5 h-5 text-muted-foreground" />
//                 </div>
//                 <div>
//                   <div className="font-bold text-sm">Telebirr</div>
//                   <div className="text-xs text-muted-foreground">Mobile payment</div>
//                 </div>
//               </div>
//             </div>

//             {paymentMethod === "telebirr" && (
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-muted-foreground">Telebirr Phone Number</label>
//                 <input
//                   type="tel"
//                   placeholder="09XXXXXXXX"
//                   value={telebirrPhone}
//                   onChange={(e) => setTelebirrPhone(e.target.value)}
//                   className="w-full px-5 py-4 rounded-xl border border-border bg-background"
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Enter the phone number registered with your Telebirr wallet.
//                 </p>
//               </div>
//             )}
//           </section>

//           {/* Card Details Form (only for card method) */}
//           {paymentMethod === "card" && (
//             <section className="bg-muted/40 p-8 rounded-2xl space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="md:col-span-2 space-y-2">
//                   <label className="text-sm font-semibold text-muted-foreground">Card Number</label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       placeholder="0000 0000 0000 0000"
//                       className="w-full px-5 py-4 rounded-xl border border-border bg-background"
//                     />
//                     <Lock className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-muted-foreground">Expiry Date</label>
//                   <input
//                     type="text"
//                     placeholder="MM / YY"
//                     className="w-full px-5 py-4 rounded-xl border border-border bg-background"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-muted-foreground">CVV Code</label>
//                   <div className="relative">
//                     <input
//                       type="password"
//                       placeholder="***"
//                       className="w-full px-5 py-4 rounded-xl border border-border bg-background"
//                     />
//                     <HelpCircle className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                   </div>
//                 </div>
//               </div>
//             </section>
//           )}
//         </div>

//         {/* Sidebar */}
//         <aside className="lg:col-span-4 sticky top-10">
//           <div className="bg-card rounded-2xl border border-border overflow-hidden">
//             <div className="p-8">
//               <h3 className="text-xl font-bold mb-6">Donation Summary</h3>

//               <div className="space-y-4 mb-8">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Donation for Clean Water</span>
//                   <span className="font-semibold">${displayAmount.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Processing Fee</span>
//                   <span className="font-semibold">${processingFee.toFixed(2)}</span>
//                 </div>
//                 <div className="pt-4 mt-4 border-t border-border flex justify-between items-end">
//                   <span className="text-sm font-medium">Total Amount</span>
//                   <span className="text-3xl font-extrabold text-primary">${totalAmount.toFixed(2)}</span>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleCompleteDonation}
//                 className="w-full py-5 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-3"
//               >
//                 Complete Donation
//                 <HeartHandshake className="w-5 h-5" />
//               </button>

//               <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed px-4">
//                 By clicking &quot;Complete Donation&quot;, you agree to our Terms of Service and Privacy Policy.
//               </p>
//             </div>
//           </div>

//           <div className="mt-6 p-4 border border-border rounded-xl flex items-center gap-4 bg-muted/30">
//             <ShieldCheck className="w-8 h-8 text-primary" />
//             <div>
//               <p className="text-xs font-bold uppercase tracking-wider">Secure Transaction</p>
//               <p className="text-[10px] text-muted-foreground">256-bit SSL encryption protects your data.</p>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </main>
//   );
// };

// export default Payment;

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Wallet,
  Building2,
  Lock,
  HelpCircle,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

//form validation libraries
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPaymentSchema } from "./paymentSchema";
import api from "@/lib/api";

const PRESET_AMOUNTS = [10, 25, 50];

const Payment = () => {
  const { t, i18n } = useTranslation();
  const paymentSchema = useMemo(() => createPaymentSchema(t), [t, i18n.language]);

  // const [selectedAmount, setSelectedAmount] = useState(0);
  // const [customAmount, setCustomAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      selectedAmount: 0,
      customAmount: undefined,
      paymentMethod: "card",
      telebirrPhone: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const selectedAmount = watch("selectedAmount")
  const customAmount = watch("customAmount");
  // const watchedCustomAmount = watch("customAmount");
  const watchedPaymentMethod = watch("paymentMethod");

  // const displayAmount = useMemo(() => {
  //   const custom = Number(customAmount);
  //   if (!Number.isNaN(custom) && custom > 0) return custom;
  //   return selectedAmount;
  // }, [customAmount, selectedAmount]);

//   const displayAmount = useMemo(() => {
//   const custom = Number(customAmount || undefined);
//   return custom > 0 ? custom : Number(selectedAmount || 0);
// }, [customAmount, selectedAmount]);

const displayAmount = useMemo(() => {
  if (customAmount !== undefined && customAmount > 0) return customAmount;
  return selectedAmount || 0;
}, [customAmount, selectedAmount]);

const isAmountValid =
  (customAmount !== null && customAmount > 0) ||
  selectedAmount > 0;

  const processingFee = useMemo(() => +(displayAmount * 0.03).toFixed(2), [displayAmount]);
  const totalAmount = useMemo(() => +(displayAmount + processingFee).toFixed(2), [displayAmount, processingFee]);

  const onSubmit = async (data) => {
    try {
      console.log("Validated form data:", data);
      
      // Use the configured api instance from "@/lib/api" instead of fetch
      // This ensures the Authorization Bearer token is properly attached
      const response = await api.post('/initialize', data);
      const result = response.data;
      
      console.log('POST Result', result);
      
      // The backend returns the Chapa checkout_url on success
      if(result.message === "ok" && result.checkout_url){
        window.location.assign(result.checkout_url);
      } else {
        console.error("Initialization failed without a checkout URL:", result);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
    }
  };

  return (
    <main className="py-20 px-6 max-w-7xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10">
            <header>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t("payment.title")}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                {t("payment.subtitle")}
              </p>
            </header>

            {/* Donation Amount */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">{t("payment.selectAmount")}</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRESET_AMOUNTS.map((amount) => {
                  // const active = !watchedCustomAmount && (selectedAmount === amount || customAmount === 0);
                  const active = customAmount === undefined && selectedAmount === amount;
                  
                  return (
                    <button
                    key={amount}
                    type="button"
                    onClick={() => {
                        // setCustomAmount(0);
                        // setSelectedAmount(amount);
                        

                        setValue("customAmount", undefined);
                        setValue("selectedAmount", amount, {shouldValidate: true});
                      }}
                      className={`py-6 px-4 rounded-xl border-2 transition-all text-center ${
                        active ? "border-primary bg-primary/10" : "border-transparent bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className={`text-2xl font-bold ${active ? "text-primary" : "text-foreground"}`}>
                        ${amount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {amount === 10
                          ? t("payment.amountSimple")
                          : amount === 25
                          ? t("payment.amountImpact")
                          : t("payment.amountGenerous")}
                      </div>
                    </button>
                  );
                })}

                <div>
                {(() => {
                const customActive = Number(customAmount) > 0
                return(

                  <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder={t("payment.customPlaceholder")}
                  value={customAmount === undefined ? "" : customAmount}
                  // onChange={(e) => {
                  //   setCustomAmount(e.target.value);
                  //   setValue("customAmount", e.target.value);
                  // }}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    // setCustomAmount(value);
                    setValue("selectedAmount", 0)
                    setValue("customAmount", value === 0 ? undefined : Number(value), {shouldValidate: true});
                  }}
                  className={`focus:outline-none focus:ring-0 focus:ring-offset-0 w-full py-6 px-4 rounded-xl border-2 border-border bg-card text-center text-xl font-bold transition-all ${
                    customActive? "border-primary bg-primary/10 text-primary" : "border-border"
                  }`}
                  />
                )
              })()}
              {errors.customAmount && (
                <p className="text-red-500 text-xs mt-2">{String(errors.customAmount.message)}</p>
              )}
                </div>
              </div>
            </section>
              
            {/* Payment Method */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">{t("payment.paymentMethod")}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setPaymentMethod("card");
                    setValue("paymentMethod", "card");
                  }}
                  className={`p-5 rounded-xl cursor-pointer flex items-center gap-4 transition-all border ${
                    watchedPaymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t("payment.cardTitle")}</div>
                    <div className="text-xs text-muted-foreground">{t("payment.cardSubtitle")}</div>
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setPaymentMethod("telebirr");
                    setValue("paymentMethod", "telebirr");
                  }}
                  className={`p-5 rounded-xl cursor-pointer flex items-center gap-4 transition-all border ${
                    watchedPaymentMethod === "telebirr"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t("payment.telebirrTitle")}</div>
                    <div className="text-xs text-muted-foreground">{t("payment.telebirrSubtitle")}</div>
                  </div>
                </div>
              </div>
              
                <input type="hidden" {...register("paymentMethod")} />

                {watchedPaymentMethod === "telebirr" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">{t("payment.telebirrPhone")}</label>
                    <input
                      type="tel"
                      placeholder="09XXXXXXXX"
                      {...register("telebirrPhone")}
                      className="w-full px-5 py-4 rounded-xl border border-border bg-background"
                    />
                    {errors.telebirrPhone && (
                      <p className="text-red-500 text-xs">{errors.telebirrPhone.message}</p>
                    )}
                  </div>
                )}
              </section>

              {/* Card Details Form */}
              {watchedPaymentMethod === "card" && (
                <section className="bg-muted/40 p-8 rounded-2xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">{t("payment.cardNumber")}</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("payment.cardPlaceholder")}
                          {...register("cardNumber")}
                          className="w-full px-5 py-4 rounded-xl border border-border bg-background"
                        />
                        <Lock className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-xs">{errors.cardNumber.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">{t("payment.expiry")}</label>
                      <input
                        type="text"
                        placeholder={t("payment.expiryPlaceholder")}
                        {...register("expiryDate")}
                        className="w-full px-5 py-4 rounded-xl border border-border bg-background"
                      />
                      {errors.expiryDate && <p className="text-red-500 text-xs">{errors.expiryDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">{t("payment.cvv")}</label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder={t("payment.cvvPlaceholder")}
                          {...register("cvv")}
                          className="w-full px-5 py-4 rounded-xl border border-border bg-background"
                        />
                        <HelpCircle className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      {errors.cvv && <p className="text-red-500 text-xs">{errors.cvv.message}</p>}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 sticky top-10">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-6">{t("payment.summaryTitle")}</h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("payment.donationLine")}</span>
                      <span className="font-semibold">${displayAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("payment.processingFee")}</span>
                      <span className="font-semibold">${processingFee.toFixed(2)}</span>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border flex justify-between items-end">
                      <span className="text-sm font-medium">{t("payment.total")}</span>
                      <span className="text-3xl font-extrabold text-primary">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isAmountValid}
                    className="w-full py-5 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-3"
                  >
                    {t("payment.complete")}
                    <HeartHandshake className="w-5 h-5" />
                  </button>

                  <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                    {t("payment.legal")}
                  </p>
                </div>
              </div>

            <div className="mt-6 p-4 border border-border rounded-xl flex items-center gap-4 bg-muted/30">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">{t("payment.secureTitle")}</p>
                <p className="text-[10px] text-muted-foreground">{t("payment.secureDesc")}</p>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
};

export default Payment;