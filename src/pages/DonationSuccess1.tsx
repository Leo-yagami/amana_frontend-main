import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { CheckCircle2, Receipt, FileText, Loader2, AlertCircle, ExternalLink, Sparkles, HeartHandshake } from "lucide-react";
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

const CHAPA_RECEIPT_BASE = "https://checkout.tchapa.co/checkout/test-payment-receipt/";

const DonationSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const txRef = searchParams.get("tx_ref") ?? searchParams.get("trx_ref") ?? undefined;

  const [receiptOpen, setReceiptOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const heavyRef = useRef<HTMLHeadingElement>(null);
  const lightRef = useRef<HTMLParagraphElement>(null);
  const donateRef = useRef<HTMLParagraphElement>(null);
  const glitterRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const amountRef = useRef<HTMLSpanElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(
          [heroRef.current, heavyRef.current, lightRef.current, donateRef.current, glitterRef.current, text1Ref.current, text2Ref.current, amountRef.current],
          { opacity: 1, y: 0, scale: 1 }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        glowRef.current,
        { scale: 0.5, opacity: 0.6 },
        { scale: 1.5, opacity: 0.3, duration: 1.8, ease: "sine.out", repeat: -1, yoyo: true }
      ).fromTo(
        sparkleRef.current,
        { rotation: 0, opacity: 0.8 },
        { rotation: 360, opacity: 0, duration: 2, repeat: -1, ease: "power2.inOut" },
        "-=1.6"
      );

      tl.fromTo(
        heroRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8 }
      );

      tl.fromTo(
        lightRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7 }
      ).fromTo(
        heavyRef.current,
        { fee: undefined, opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.6 },
        "-=0.5"
      );

      tl.fromTo(
        donateRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.1 }
      ).to(
        glitterRef.current,
        { duration: 0.3, opacity: 1 },
        "-=0.1"
      );

      gsap.to(iconRef.current, {
        y: -8,
        rotation: 2,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(text1Ref.current, { opacity: 1, duration: 0.5, delay: 0.4 })
        .to(text2Ref.current, { opacity: 1, duration: 0.5 }, "-=0.3")
        .to(amountRef.current, { opacity: 1, scale: 1.05, duration: 0.4 }, "-=0.2");
    });

    return () => ctx.revert();
  }, []);

  const handleViewReceipt = () => setReceiptOpen(true);
  const handleGoHome = () => navigate("/");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-background relative overflow-hidden">
      <div
        ref={glowRef}
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 will-change-transform"
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div ref={heroRef} className="text-center space-y-10 mb-16">
          <div className="relative inline-block mx-auto mb-8">
            <div
              ref={sparkleRef}
              className="absolute inset-0 flex items-center justify-center will-change-transform"
            >
              <Sparkles className="w-12 h-12 text-primary opacity-80 relative" />
            </div>
            <div
              ref={iconRef}
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center"
            >
              <CheckCircle2 className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <h1 ref={heavyRef} className="leading-[1.08] space-y-3">
            <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary">
              <span ref={text1Ref} className="block opacity-0">
                {t("donationSuccess.title", "Your")}
              </span>
              <span ref={text2Ref} className="block opacity-0 text-accent">
                {t("donationSuccess.titleMiddle", "contribution")}
              </span>
              <span
                ref={amountRef}
                className="block text-5xl sm:text-6xl lg:text-7xl mt-4 opacity-0"
              >
                {t("donationSuccess.titleHighlight", "has arrived")}
              </span>
            </p>
          </h1>

          <div ref={glitterRef} className="space-y-6 opacity-0">
            <p
              ref={lightRef}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto"
            >
              {t(
                "donationSuccess.subtitle",
                "We've recorded your generosity. Every gift, no matter how large or small, changes lives forward."
              )}
            </p>

            <p
              ref={donateRef}
              className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground"
            >
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              {t("donationSuccess.impact", "Real lives, real change")}
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </p>
          </div>
        </div>

        <div ref={actionRef} className="space-y-4">
          <button
            type="button"
            onClick={handleViewReceipt}
            className="group relative w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-base hover:shadow-glow transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <span className="relative flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
              {t("donationSuccess.viewReceipt", "View Receipt")}
            </span>
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="group w-full py-4 bg-muted text-foreground rounded-full font-medium text-base hover:bg-muted/80 transition-all duration-500"
          >
            <span className="relative flex items-center justify-center gap-2">
              <HeartHandshake className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              {t("donationSuccess.goHome", "Support More Causes")}
            </span>
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

  const chapaRef = data?.reference || txRef;
  const chapaUrl = chapaRef ? `${CHAPA_RECEIPT_BASE}${encodeURIComponent(chapaRef)}` : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("donationSuccess.receiptTitle", "Your Donation Receipt")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("donationSuccess.receiptDesc", "A record of your contribution to change lives.")}
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
            <AlertDescription>{t("donationSuccess.receiptError", "Could not load receipt details.")}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 space-y-6">
            <div className="text-center space-y-2 pb-6 border-b border-border">
              <Sparkles className="w-6 h-6 text-primary mx-auto opacity-70" />
              <h3 className="text-xl font-bold text-primary">Thank You for Your Generosity</h3>
              <p className="text-sm text-muted-foreground">
                {fmt(data.amount, data.currency)} given in {data.paymentMethod || "Chapa"}
              </p>
            </div>

            <div className="pt-6 space-y-3">
              {[
                [t("donationSuccess.rReference", "Transaction ID"), data.reference || "N/A"],
                [t("donationSuccess.rTxRef", "Reference"), data.txRef || "N/A"],
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
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-background/50"
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