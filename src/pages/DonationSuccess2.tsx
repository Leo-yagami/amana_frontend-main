import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { CheckCircle2, Home, Receipt, FileText, Loader2, AlertCircle, ExternalLink, Heart, TrendingUp } from "lucide-react";
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

  const txRef = searchParams.get("tx_ref") ?? searchParams.get("trx_ref") ?? undefined;

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const heavyRef = useRef<HTMLHeadingElement>(null);
  const lightRef = useRef<HTMLParagraphElement>(null);
  const donateRef = useRef<HTMLParagraphElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);
  const badge3Ref = useRef<HTMLDivElement>(null);
  const badge2Ref = useRef<HTMLDivElement>(null);
  const badge1Ref = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<SVGSVGElement>(null);
  const effectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([heavyRef.current, sparkleRef.current, lightRef.current], { opacity: 1, scale: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(checkRef.current, {
        opacity: 0,
        scale: 0.3,
        rotation: -180,
        duration: 0.7,
        ease: "back.out(1.5)"
      })
      .from(glowRef.current, {
        opacity: 0,
        duration: 0.8
      }, "-=0.4");

      tl.from(
        badge3Ref.current,
        { opacity: 0, scale: 0.6, x: -20, duration: 0.5, ease: "power3.out" }
      ).from(
        badge2Ref.current,
        { opacity: 0, scale: 0.6, x: 20, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      ).from(
        badge1Ref.current,
        { opacity: 0, scale: 0.6, x: -16, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      );

      tl.to(
        checkmarkRef.current,
        { scale: 1.1, rotation: 15, duration: 0.2, ease: "power3.inOut" },
        "+=0.1"
      ).to(
        checkmarkRef.current,
        { scale: 1, rotation: 0, duration: 0.2 },
        "+=0.1"
      );

      tl.from(
        heavyRef.current,
        { opacity: 0, y: 24, duration: 0.5 },
        "-=0.3"
      ).from(
        lightRef.current,
        { opacity: 0, y: 20, duration: 0.4 },
        "-=0.2"
      ).from(
        donateRef.current,
        { opacity: 0, y: 16, duration: 0.4 },
        "-=0.2"
      );

      gsap.to(speedRef.current, {
        rotation: 360,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });

      gsap.to(sparkleRef.current, {
        opacity: 0,
        scale: 1.5,
        duration: 1,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  const handleViewReceipt = () => setReceiptOpen(true);
  const handleGoHome = () => navigate("/");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-background relative overflow-hidden">
      <div
        ref={glowRef}
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 will-change-transform"
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div ref={cardRef} className="bg-card border border-border rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <div className="relative inline-block mb-8">
            <div
              ref={badge3Ref}
              className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-0 -z-10"
            />
            <div
              ref={badge2Ref}
              className="absolute -inset-2 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-lg opacity-0"
            />
            <div
              ref={badge1Ref}
              className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur opacity-0"
            />

            <div
              ref={checkRef}
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 ref={checkmarkRef} className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={2} />
            </div>
          </div>

          <h1
            ref={heavyRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary mb-4"
          >
            Transaction Complete
          </h1>

          <div
            ref={speedRef}
            className="absolute top-10 right-8 opacity-0"
          >
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>

          <div
            ref={sparkleRef}
            className="absolute bottom-8 left-8 opacity-0"
          >
            <Heart className="w-6 h-6 text-accent" />
          </div>

          <div
            ref={lightRef}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto mb-8"
          >
            Your contribution has been received and is now being processed to reach those in need.
          </div>

          <div
            ref={donateRef}
            className="inline-flex items-center gap-6 bg-muted/30 px-6 py-3 rounded-2xl mb-8"
          >
            <span className="text-sm font-medium text-muted-foreground">
              Impact Tracking
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">98%</span>
              <span className="text-xs text-success">Complete</span>
            </div>
          </div>

          <div
            ref={effectRef}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={handleViewReceipt}
              className="group relative w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm sm:text-base hover:shadow-glow transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                View Receipt
              </span>
            </button>

            <button
              type="button"
              onClick={handleGoHome}
              className="group w-full py-4 bg-muted text-foreground rounded-xl font-medium text-sm sm:text-base hover:bg-muted/80 transition-all duration-300"
            >
              <span className="relative flex items-center justify-center gap-2">
                <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                Continue Supporting
              </span>
            </button>
          </div>
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

  const chapaRef = data?.reference || txRef;
  const chapaUrl = chapaRef ? `${CHAPA_RECEIPT_BASE}${encodeURIComponent(chapaRef)}` : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("donationSuccess.receiptTitle", "Transaction Details")}</AlertDialogTitle>
          <AlertDialogDescription>
            A confirmation of your contribution impacting lives.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Unable to load transaction details.</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
              <span className="text-lg font-bold text-primary">{fmt(data.amount, data.currency)}</span>
            </div>

            <div className="space-y-3">
              {[
                [t("donationSuccess.rReference", "Reference"), data.reference || "N/A"],
                [t("donationSuccess.rTxRef", "Transaction ID"), data.txRef || "N/A"],
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
                <div
                  key={k as string}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border/50"
                >
                  <span className="text-sm font-medium text-muted-foreground">{k}</span>
                  <span className="text-sm font-semibold text-foreground break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>{t("common.close", "Close")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDownload} disabled={!data}>
              <FileText className="w-4 h-4 mr-2" />
              {t("donationSuccess.downloadPdf", "View PDF")}
            </AlertDialogAction>
          </div>
          {chapaUrl && (
            <a
              href={chapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View Official Receipt
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DonationSuccess;