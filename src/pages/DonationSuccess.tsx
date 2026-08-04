import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import {
  CheckCircle2,
  Home,
  Receipt,
  FileText,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import type { DonationReceipt } from "@/types/api";
import { downloadReceiptPdf } from "@/lib/exportDonationPdf";

const CHAPA_RECEIPT_BASE = "https://checkout.chapa.co/checkout/test-payment-receipt/";

const DonationSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Chapa's return_url sends us tx_ref — the only identifier available
  // until the receipt is opened and resolved server-side.
  const txRef = searchParams.get("tx_ref") ?? searchParams.get("trx_ref") ?? undefined;

  const [receiptOpen, setReceiptOpen] = useState(false);

  const wrapperRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([cardRef.current, titleRef.current, subtitleRef.current, sealRef.current, actionsRef.current, iconRef.current], { opacity: 1, y: 0, scale: 1 });
        gsap.set(ringRefs.current, { opacity: 0, attr: { r: 92 } });
        return;
      }

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Card rises in like a sheet of paper placed on the table.
      intro
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: 0.7 }
        )
        // Three concentric ripples announce the moment — a single, contained celebration.
        .fromTo(
          ringRefs.current,
          { attr: { r: 10 }, opacity: 0 },
          { attr: { r: 72 }, opacity: 0.18, duration: 0.9, stagger: 0.12, ease: "power2.out" },
          "-=0.45"
        )
        // The checkmark drops in with a small overshoot, like a seal being pressed.
        .fromTo(
          iconRef.current,
          { scale: 0, rotate: -45, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "back.out(1.7)" },
          "-=0.55"
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.25"
        )
        .fromTo(
          [subtitleRef.current, sealRef.current],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          "-=0.35"
        )
        .fromTo(
          actionsRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.25"
        )
          .to(ringRefs.current, {
    opacity: 0,
    duration: 0.5,
    ease: "sine.in",
  }, "+=0.3");
        

      // Quiet ambient pulse — the gift keeps moving outward.
      // ringRefs.current.forEach((ring, i) => {
      //   if (!ring) return;
      //   gsap.to(ring, {
      //     attr: { r: 92 },
      //     opacity: 0,
      //     duration: 2.8 + i * 0.35,
      //     ease: "sine.out",
      //     repeat: -1,
      //     delay: 1.2 + i * 0.25,
      //   });
      // });
      // Ambient ripple loop — same visual journey the intro used, but self-contained
// so `repeat` cycles through the *whole* r:10→92 range every time, not just
// wherever the intro happened to leave off.
// const ripple = gsap.timeline({ repeat: -1 });
// ringRefs.current.forEach((ring, i) => {
//   if (!ring) return;
//   ripple.fromTo(
//     ring,
//     { attr: { r: 10 }, opacity: 0.22 },
//     { attr: { r: 92 }, opacity: 0, duration: 2.6, ease: "sine.out" },
//     i * 0.5 // stagger start times on one shared clock, not independent delays
//   );
// });

// Ambient ripple loop — same visual journey the intro used, but
// self-contained so `repeat` cycles through the *whole* r:10→92 range
// every time, not just wherever the intro happened to leave off.
// Starts 2s after the intro timeline actually finishes (rather than a
// flat delay from mount) so it stays correct if intro durations change.
const ripple = gsap.timeline({ repeat: -1, delay: intro.duration() + 0 });
ringRefs.current.forEach((ring, i) => {
  if (!ring) return;
  ripple.fromTo(
    ring,
    { attr: { r: 10 }, opacity: 0.22 },
    { attr: { r: 92 }, opacity: 0, duration: 2.6, ease: "sine.inOut" },
    i * 0.5 // stagger start times on one shared clock, not independent delays
  );
});
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const handleViewReceipt = () => setReceiptOpen(true);
  const handleGoHome = () => navigate("/");

  return (
    <main
      ref={wrapperRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-6 py-0"
    >
      {/* A soft paper grain, because charity still lives in the physical world. */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
        aria-hidden="true"
      >
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      {/* Very faint ink wash from the brand palette. */}
      <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-1/4 right-0 h-[60vh] w-[60vh] rounded-full bg-accent/[0.04] blur-3xl" />

      <section className="relative z-10 w-full max-w-lg">
        <div
          ref={cardRef}
          className="relative rounded-[2rem] border border-border bg-card/80 p-8 shadow-lg backdrop-blur-sm md:px-12 md:pb-12 md:pt-8"
        >
          {/* Signature "Heartprint" ripple — generosity expanding outward. */}
          <div className="relative mx-auto mb-4 flex h-32 w-32 items-center justify-center sm:mb-10 md:mb-3 sm:h-40 sm:w-40">
            <svg
              className="absolute inset-0 h-full w-full overflow-visible text-primary"
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  ref={(el) => (ringRefs.current[i] = el)}
                  cx="50%"
                  cy="50%"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="opacity-0"
                />
              ))}
            </svg>

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-card shadow-md sm:h-24 sm:w-24">
              <CheckCircle2
                ref={iconRef}
                className="h-10 w-10 text-primary sm:h-12 sm:w-12"
                strokeWidth={1.75}
              />
            </div>
          </div>

          {/* Typography as the emotional anchor. */}
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              {t("donationSuccess.eyebrow", "Donation received")}
            </span>

            <h1
              ref={titleRef}
              className="font-display text-[2rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
            >
              {t("donationSuccess.title", "Your gift is in motion.")}
            </h1>

            <p
              ref={subtitleRef}
              className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              {t(
                "donationSuccess.subtitle",
                "Thank you for giving through Amana. Your contribution is recorded, directed, and will reach those it is meant for."
              )}
            </p>
          </div>

          {/* A single quiet credential so the moment feels official, not salesy. */}
          <div
            ref={sealRef}
            className="mb-10 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              {t("donationSuccess.verified", "Verified via Chapa")}
            </span>
            {txRef && (
              <span className="hidden sm:inline text-muted-foreground/70">
                · {txRef.slice(-12)}
              </span>
            )}
          </div>

          {/* The only two paths a donor needs from here. */}
          <div ref={actionsRef} className="space-y-3">
            <Button
              type="button"
              size="xl"
              onClick={handleViewReceipt}
              className="group w-full rounded-full shadow-glow transition-all duration-300 hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
            >
              <Receipt className="h-7 w-7 transition-transform duration-300 " />
              {t("donationSuccess.viewReceipt", "View receipt")}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="xl"
              onClick={handleGoHome}
              className="group w-full rounded-full transition-all duration-300 hover:bg-muted/80 active:scale-[0.98]"
            >
              <Home className="h-7 w-7 text-muted-foreground transition-transform duration-300 " />
              {t("donationSuccess.goHome", "Back to home")}
            </Button>
          </div>
        </div>
      </section>

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
      <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card p-0 shadow-xl sm:max-w-lg">
        {/* Receipt "tear" at the top gives the dialog a real-world job. */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

        <AlertDialogHeader className="px-6 pb-4 pt-6 text-left">
          <AlertDialogTitle className="font-display text-xl font-bold text-foreground">
            {t("donationSuccess.receiptTitle", "Donation receipt")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "donationSuccess.receiptDesc",
              "A record of your contribution, pulled from the verified Chapa transaction."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="border-t border-dashed border-border px-6 py-5">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="sr-only">{t("common.loading", "Loading")}</span>
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t(
                  "donationSuccess.receiptError",
                  "We couldn't load receipt details. Share this reference with support and we'll find it."
                )}
                {txRef && (
                  <span className="mt-2 block break-all rounded bg-destructive/10 px-2 py-1 text-xs font-mono">
                    {txRef}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {data && (
            <div className="space-y-5">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("donationSuccess.rAmount", "Amount")}
                </span>
                <span className="font-display text-2xl font-bold text-primary">
                  {fmt(data.amount, data.currency)}
                </span>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border bg-muted/40 text-sm">
                {[
                  [t("donationSuccess.rReference", "Reference"), data.reference || "N/A"],
                  [t("donationSuccess.rTxRef", "Transaction ref"), data.txRef || "N/A"],
                  [t("donationSuccess.rDonor", "Donor"), data.donorName || "Anonymous"],
                  ...(data.originalAmount &&
                  data.originalCurrency &&
                  data.originalCurrency !== data.currency
                    ? [
                        [
                          t("donationSuccess.rOriginal", "Original"),
                          fmt(data.originalAmount, data.originalCurrency),
                        ],
                      ]
                    : []),
                  [t("donationSuccess.rMethod", "Payment method"), data.paymentMethod || "Chapa"],
                  [t("donationSuccess.rEvent", "Event"), data.eventName || "General"],
                  [
                    t("donationSuccess.rStatus", "Status"),
                    <StatusBadge key="status" status={data.status || "received"} />,
                  ],
                  [
                    t("donationSuccess.rDate", "Date"),
                    data.date ? new Date(data.date).toLocaleString() : "N/A",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right font-medium text-foreground break-all">
                      {value as React.ReactNode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-col gap-3 px-6 pb-6 pt-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" className="rounded-full">
                {t("common.close", "Close")}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={!data}
                className="rounded-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("donationSuccess.downloadPdf", "Download PDF")}
              </Button>
            </AlertDialogAction>
          </div>
          {chapaUrl && (
            <a
              href={chapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              {t("donationSuccess.openChapa", "View official receipt")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status.toLowerCase();
  const isFinal = ["received", "success", "successful", "completed"].includes(normalized);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isFinal
          ? "bg-success/15 text-success"
          : "bg-warning/15 text-warning"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isFinal ? "bg-success" : "bg-warning"}`} />
      {status}
    </span>
  );
};

export default DonationSuccess;