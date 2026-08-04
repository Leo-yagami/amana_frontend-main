import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { CheckCircle2, Home, Receipt, FileText, Loader2, AlertCircle, ExternalLink, Sparkles, HeartHandshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { donationApi } from "@/services/api.service";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DonationReceipt } from "@/types/api";
import { downloadReceiptPdf } from "@/lib/exportDonationPdf";

const CHAPA_RECEIPT_BASE = "https://checkout.chapa.co/checkout/test-payment-receipt/";

const DonationSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Chapa's return_url sends us tx_ref — this is the only identifier we have
  // until the user opens the receipt (which we then resolve server-side).
  const txRef = searchParams.get("tx_ref") ?? searchParams.get("trx_ref") ?? undefined;

  const [receiptOpen, setReceiptOpen] = useState(false);

  const iconRef = useRef(null);
  const cardRef = useRef(null);
  const echoRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([cardRef.current, iconRef.current], { opacity: 1, y: 0, scale: 1, rotate: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6 }
      ).fromTo(
        iconRef.current,
        { scale: 0, rotate: -45, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "back.out(1.7)" },
        "-=0.25"
      );

      // Continuous echo: a dedicated element that expands and fades on a smooth,
      // symmetric loop. Kept separate from the intro timeline so it never snaps.
      gsap.set(echoRef.current, { scale: 0.85, opacity: 0.5 });
      gsap.to(echoRef.current, {
        scale: 1.6,
        opacity: 0,
        duration: 2.2,
        ease: "sine.out",
        repeat: -1,
        delay: 0.9,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleViewReceipt = () => setReceiptOpen(true);

  const handleGoHome = () => navigate("/");

  return (
    <main className="h-screen overflow-hidden flex items-center justify-center bg-background px-6 py-3">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-10 text-center shadow-sm"
      >
        <div className="relative mx-auto mb-8 w-28 h-28 flex items-center justify-center">
          <div
            ref={echoRef}
            className="absolute w-20 h-20 rounded-full bg-primary/20 will-change-transform"
          />
          <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2
              ref={iconRef}
              className="w-11 h-11 text-primary"
              strokeWidth={2}
            />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
          {t("donationSuccess.title", "Your Donation is Successful")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-10">
          {t(
            "donationSuccess.subtitle",
            "Thank you for your generosity. Your contribution will make a real difference."
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleViewReceipt}
            className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-base hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Receipt className="w-5 h-5" />
            {t("donationSuccess.viewReceipt", "View Receipt")}
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full py-4 bg-muted text-foreground rounded-full font-bold text-base hover:bg-muted/70 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t("donationSuccess.goHome", "Back to Home")}
          </button>
        </div>
      </div>
      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} txRef={txRef} />
    </main>
  );
};

const ReceiptDialog = ({
  open,
  onOpenChange,
  txRef,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  txRef?: string;
}) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["donation-receipt-txref", txRef],
    queryFn: async () => {
      const res = await donationApi.getReceiptByTxRef(txRef as string);
      return res.data.receipt;
    },
    enabled: open && !!txRef,
  });

  const fmt = (amount?: number, currency?: string) =>
    typeof amount === "number"
      ? `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || "ETB"}`
      : "N/A";

  const handleDownload = () => {
    if (!data) return;
    downloadReceiptPdf(data);
  };

  // Opens the REAL Chapa-hosted receipt (chapa.link/payment-receipt/{reference})
  // in a new tab. return_url is blank on Chapa's side, so the receipt persists
  // and never redirects. Uses Chapa's own reference from the verified data.
  const chapaRef = data?.reference || txRef;
  const chapaUrl = chapaRef ? `${CHAPA_RECEIPT_BASE}${encodeURIComponent(chapaRef)}` : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("donationSuccess.receiptTitle", "Donation Receipt")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("donationSuccess.receiptDesc", "Generated from the verified Chapa transaction.")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t("donationSuccess.receiptError", "Could not load receipt details.")}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="rounded-lg border divide-y text-sm">
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

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>{t("common.close", "Close")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDownload} disabled={!data}>
              <FileText className="w-4 h-4 mr-2" />
              {t("donationSuccess.downloadPdf", "Download PDF")}
            </AlertDialogAction>
          </div>
          {chapaUrl && (
            <a
              href={chapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {t("donationSuccess.openChapa", "View official receipt")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DonationSuccess;