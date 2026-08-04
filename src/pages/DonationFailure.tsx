import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { XCircle, Home, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

const DonationFailed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Same idea as the success screen — adjust to whatever Chapa/your backend
  // actually sends back on a failed/cancelled transaction
  const reason = searchParams.get("reason") ?? searchParams.get("status");

  const iconRef = useRef(null);
  const cardRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          ringRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
          "-=0.35"
        )
        .fromTo(
          iconRef.current,
          { scale: 0, rotate: 45, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" },
          "-=0.25"
        )
        // subtle shake instead of the success screen's pulsing ring —
        // reads as "something's wrong" rather than "celebrate"
        .to(iconRef.current, {
          x: -4,
          duration: 0.08,
          repeat: 5,
          yoyo: true,
          ease: "power1.inOut",
        });
    });

    return () => ctx.revert();
  }, []);

  const handleRetry = () => {
    navigate("/payment");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-10 text-center shadow-sm"
      >
        <div className="relative mx-auto mb-8 w-28 h-28 flex items-center justify-center">
          <div
            ref={ringRef}
            className="absolute inset-0 rounded-full bg-destructive/15"
          />
          <div className="relative w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle
              ref={iconRef}
              className="w-11 h-11 text-destructive"
              strokeWidth={2}
            />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
          {t("donationFailed.title", "Your Donation Didn't Go Through")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-2">
          {t(
            "donationFailed.subtitle",
            "Something interrupted the payment before it could complete. You haven't been charged."
          )}
        </p>
        {reason && (
          <p className="text-xs text-muted-foreground/70 mb-8">
            {t("donationFailed.reasonPrefix", "Reason")}: {reason}
          </p>
        )}
        {!reason && <div className="mb-8" />}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-base hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t("donationFailed.retry", "Try Again")}
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full py-4 bg-muted text-foreground rounded-full font-bold text-base hover:bg-muted/70 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            {t("donationFailed.goHome", "Back to Home")}
          </button>
        </div>
      </div>
    </main>
  );
};

export default DonationFailed;