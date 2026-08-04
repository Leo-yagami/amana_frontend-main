import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";
import { FileText, Home, Loader2, AlertCircle, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { donationApi } from "@/services/api.service";
import { downloadReceiptPdf } from "@/lib/exportDonationPdf";

const Receipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { txRef } = useParams();

  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["donation-receipt-txref", txRef],
    queryFn: async () => {
      const res = await donationApi.getReceiptByTxRef(txRef as string);
      return res.data.receipt;
    },
    enabled: !!txRef,
  });

  const fmt = (amount?: number, currency?: string) =>
    typeof amount === "number"
      ? `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || "ETB"}`
      : "N/A";

  const handleDownload = () => {
    if (data) downloadReceiptPdf(data);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-10 text-center shadow-sm"
      >
        <div className="relative mx-auto mb-8 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-10 h-10 text-primary" strokeWidth={2} />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
          {t("donationSuccess.receiptTitle", "Donation Receipt")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-8">
          {t("donationSuccess.receiptDesc", "Generated from the verified Chapa transaction.")}
        </p>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 justify-center text-destructive mb-8">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{t("donationSuccess.receiptError", "Could not load receipt details.")}</span>
          </div>
        )}

        {data && (
          <div className="rounded-lg border divide-y text-sm text-left mb-8">
            {[
              [t("donationSuccess.rReference", "Reference"), data.reference || "N/A"],
              [t("donationSuccess.rTxRef", "Transaction Ref"), data.txRef || "N/A"],
              [t("donationSuccess.rDonor", "Donor"), data.donorName || "Anonymous"],
              [t("donationSuccess.rAmount", "Amount"), fmt(data.amount, data.currency)],
              ...(data.originalAmount && data.originalCurrency && data.originalCurrency !== data.currency
                ? [[t("donationSuccess.rOriginal", "Original"), fmt(data.originalAmount, data.originalCurrency)]]
                : []),
              [t("donationSuccess.rMethod", "Payment Method"), data.paymentMethod || "Chapa"],
              [t("donationSuccess.rEvent", "Event"), data.eventName || "General"],
              [t("donationSuccess.rStatus", "Status"), data.status || "received"],
              [t("donationSuccess.rDate", "Date"), data.date ? new Date(data.date).toLocaleString() : "N/A"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground text-right break-all">{v}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!data}
            className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-base hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            {t("donationSuccess.downloadPdf", "Download PDF")}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-4 bg-muted text-foreground rounded-full font-bold text-base hover:bg-muted/70 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            {t("donationSuccess.goHome", "Back to Home")}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Receipt;
