import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { CheckCircle2, Home, Receipt, FileText, Loader2, AlertCircle, ExternalLink, Leaf, Droplet } from "lucide-react";
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

  const organicRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<SVGSVGElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLSpanElement>(null);
  const earthRef = useRef<HTMLSpanElement>(null);
  const worldRef = useRef<HTMLSpanElement>(null);
  const flowsRef = useRef<HTMLParagraphElement>(null);
  const lifeRef = useRef<HTMLParagraphElement>(null);
  const breatheRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<SVGSVGElement>(null);
  const ripple3Ref = useRef<HTMLDivElement>(null);
  const ripple2Ref = useRef<HTMLDivElement>(null);
  const ripple1Ref = useRef<HTMLDivElement>(null);
  const floRef = useRef<HTMLHeadingElement>(null);
  const excelRef = useRef<HTMLDivElement>(null);
  const flutterEffectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(
          [floRef.current, earthRef.current, worldRef.current, flowsRef.current, lifeRef.current, excelRef.current, flutterEffectRef.current, ripple1Ref.current, ripple2Ref.current, ripple3Ref.current],
          { opacity: 1, y: 0, scale: 1 }
        );
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 }
      });

      timeline
        .from(ripple1Ref.current, { opacity: 0, scale: 0.6, duration: 1.2, ease: "elastic.out(1, 0.5)" }, 0)
        .from(ripple2Ref.current, { opacity: 0, scale: 0.6, duration: 1, ease: "elastic.out(1, 0.4)" }, 0.1)
        .from(ripple3Ref.current, { opacity: 0, scale: 0.6, duration: 0.9, ease: "elastic.out(1, 0.3)" }, 0.2)
        .from(floRef.current, { opacity: 0, y: 24, duration: 0.6 }, 0.3)
        .from(waterRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.4)
        .from(earthRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.5)
        .from(worldRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.6)
        .from(excelRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.7)
        .from(flutterEffectRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.8);

      gsap.to(breatheRef.current, {
        y: -6,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      gsap.to(floatRef.current, {
        rotation: 360,
        transformOrigin: "50% 50%",
        duration: 14,
        repeat: -1,
        ease: "none"
      });

      gsap.to(ripple1Ref.current, {
        scale: 1.08,
        opacity: 0.7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, organicRef);

    return () => ctx.revert();
  }, []);

  const handleViewReceipt = () => setReceiptOpen(true);
  const handleGoHome = () => navigate("/");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-background relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="fluidGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="42%" fill="url(#fluidGradient)" />
        <circle cx="30%" cy="62%" r="30%" fill="url(#fluidGradient)" />
        <circle cx="72%" cy="38%" r="34%" fill="url(#fluidGradient)" />
      </svg>

      <div
        ref={organicRef}
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        <div
          ref={rippleRef}
          className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 text-center shadow-lg"
        >
          <div className="relative inline-block mb-8">
            <div
              ref={ripple1Ref}
              className="absolute -inset-8 rounded-full bg-primary/15 blur-2xl opacity-0"
            />
            <div
              ref={ripple2Ref}
              className="absolute -inset-5 rounded-full bg-accent/15 blur-xl opacity-0"
            />
            <div
              ref={ripple3Ref}
              className="absolute -inset-3 rounded-full bg-primary/20 blur-lg opacity-0"
            />

            <div
              ref={breatheRef}
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow"
            >
              <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" strokeWidth={1.5} />
            </div>

            <svg
              ref={floatRef}
              className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 opacity-60 pointer-events-none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <path d="M20,50 Q35,35 50,50 T80,50" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M15,55 Q30,40 50,55 T85,55" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M25,60 Q45,45 55,60 T80,60" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <h1
            ref={floRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] mb-4 text-foreground"
          >
            <span ref={waterRef} className="block text-primary">
              {t("donationSuccess.title", "Your")}
            </span>
            <span ref={earthRef} className="block text-accent">
              {t("donationSuccess.titleMiddle", "contribution")}
            </span>
            <span ref={worldRef} className="block text-primary mt-5">
              {t("donationSuccess.titleHighlight", "has taken root")}
            </span>
          </h1>

          <div ref={excelRef} className="space-y-6 mb-8">
            <p
              ref={flowsRef}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto"
            >
              {t(
                "donationSuccess.subtitle",
                "Like water finding the roots that need it, your generosity now flows toward real lives and real change."
              )}
            </p>

            <p
              ref={lifeRef}
              className="inline-flex items-center gap-4 px-6 py-3 bg-muted rounded-full text-sm font-medium text-foreground"
            >
              <Droplet className="w-4 h-4 text-primary" />
              <span>{t("donationSuccess.impact", "Growth in motion")}</span>
              <Leaf className="w-4 h-4 text-accent" />
            </p>
          </div>

          <div ref={flutterEffectRef} className="space-y-4 opacity-0">
            <button
              type="button"
              onClick={handleViewReceipt}
              className="group relative w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:shadow-glow transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative flex items-center justify-center gap-2">
                <Receipt className="w-5 h-5 transition-transform group-hover:scale-110" />
                {t("donationSuccess.viewReceipt", "View Receipt")}
              </span>
            </button>

            <button
              type="button"
              onClick={handleGoHome}
              className="group w-full py-4 bg-muted text-foreground rounded-2xl font-medium text-base hover:bg-muted/70 transition-all duration-500"
            >
              <span className="relative flex items-center justify-center gap-2">
                <Leaf className="w-5 h-5 text-primary transition-transform group-hover:-rotate-45 group-hover:scale-110" />
                {t("donationSuccess.goHome", "Nourish More Lives")}
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
          <AlertDialogTitle className="text-foreground">
            {t("donationSuccess.receiptTitle", "Your Donation Receipt")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("donationSuccess.receiptDesc", "A record of your contribution to change lives.")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t("donationSuccess.receiptError", "Could not load receipt details.")}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2 pb-6 border-b border-border">
              <Leaf className="w-6 h-6 text-primary mx-auto opacity-70" />
              <h3 className="text-xl font-bold text-primary">Thank You for Your Generosity</h3>
              <p className="text-sm text-muted-foreground">
                {fmt(data.amount, data.currency)} given in {data.paymentMethod || "Chapa"}
              </p>
            </div>

            <div className="space-y-3">
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
                <div
                  key={k as string}
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-muted/50"
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
              {t("donationSuccess.openChapa", "Official Chapa Receipt")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DonationSuccess;