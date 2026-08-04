import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  Lock,
  HelpCircle,
  ShieldCheck,
  HeartHandshake,
  Loader2,
  Globe2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Baby,
  Heart,
  Accessibility,
  Home,
} from "lucide-react";

// form validation libraries
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPaymentSchema } from "./paymentSchema";
import api from "@/lib/api";
import { eventApi } from "@/services/api.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

const PRESET_AMOUNTS = [10, 25, 50, 100];

const FALLBACK_EVENTS = [
  { _id: "general", titleKey: "payment.events.general", icon: Globe2 },
  { _id: "water", titleKey: "payment.events.water", icon: Sparkles },
  { _id: "education", titleKey: "payment.events.education", icon: Sparkles },
  { _id: "emergency", titleKey: "payment.events.emergency", icon: Sparkles },
];

// Family classifications a donor can earmark their gift for.
// Mirrors the classification model used on the Families dashboard page.
const CAUSE_CLASSIFICATIONS = [
  {
    value: "orphan",
    label: "dashboard.classifications.orphan",
    icon: Baby,
    descKey: "dashboard.classifications.orphanDesc",
    accent: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500",
    dot: "bg-blue-500",
  },
  {
    value: "disabled_disease",
    label: "dashboard.classifications.disabled_disease",
    icon: Heart,
    descKey: "dashboard.classifications.disabledDiseaseDesc",
    accent: "text-pink-600 dark:text-pink-400",
    ring: "ring-pink-500",
    dot: "bg-pink-500",
  },
  {
    value: "old_age",
    label: "dashboard.classifications.old_age",
    icon: Accessibility,
    descKey: "dashboard.classifications.oldAgeDesc",
    accent: "text-purple-600 dark:text-purple-400",
    ring: "ring-purple-500",
    dot: "bg-purple-500",
  },
  {
    value: "single_mother",
    label: "dashboard.classifications.single_mother",
    icon: Home,
    descKey: "dashboard.classifications.singleMotherDesc",
    accent: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    dot: "bg-amber-500",
  },
] as const;

// Pill colors in the summary, keyed to each classification's icon.
const CLASSIFICATION_PILL: Record<string, string> = {
  orphan: "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300",
  disabled_disease: "bg-pink-100 text-pink-700 dark:bg-pink-900/70 dark:text-pink-300",
  old_age: "bg-purple-100 text-purple-700 dark:bg-purple-900/70 dark:text-purple-300",
  single_mother: "bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300",
};

const Payment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const paymentSchema = useMemo(() => createPaymentSchema(t), [t, i18n.language]);

  const [isLoading, setIsLoading] = useState(false);
  // Transition state shown while the Chapa checkout runs in its own tab and we
  // poll for confirmation. `stage` drives the honest status line.
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<"waiting" | "confirming" | "finalizing">("waiting");
  const checkoutTabRef = useRef<Window | null>(null);
  const pollActiveRef = useRef(false);
  const lastCheckoutUrlRef = useRef<string | null>(null);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const slideTrackRef = useRef<HTMLDivElement>(null);
  const cardFormRef = useRef<HTMLDivElement>(null);
  const telebirrFormRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstRender = useRef(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      selectedAmount: 25,
      customAmount: undefined as number | undefined,
      paymentMethod: "card",
      telebirrPhone: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      eventId: "general",
      familyClassification: null as string | null,
    },
  });

  // Auto-fill telebirr phone from user profile. `user` loads asynchronously
  // (AuthContext fetches the current user on mount), so this effect re-runs once
  // it arrives. Only prefill when the field is still empty, so we never clobber
  // what the donor is typing, and format it consistently.
  useEffect(() => {
    if (user?.phoneNumber && !watch("telebirrPhone")) {
      setValue("telebirrPhone", normalizeEthiopianPhone(user.phoneNumber), {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phoneNumber, setValue]);

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const params: any = { page: 1, limit: 10 };
      params.status = 'ongoing';
      const response = await eventApi.getAll(params);
      return response?.data[0];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events = useMemo(() => {
    const raw = eventsData;
    const paginated = Array.isArray(raw) ? raw[0] : raw;
    const apiEvents = (paginated?.data ?? []).filter(
      (e: any) => e.isActive !== false && ["upcoming", "ongoing"].includes(e.status)
    );
    if (apiEvents.length > 0) {
      return [
        FALLBACK_EVENTS[0],
        ...apiEvents.map((e: any) => ({ _id: e._id, title: e.title, icon: Sparkles }))
      ];
    }
    return FALLBACK_EVENTS;
  }, [eventsData]);

  const selectedEvent = events.find((e) => e._id === watch("eventId")) || events[0];

  const selectedEventTitle = selectedEvent?.titleKey
    ? t(selectedEvent.titleKey, selectedEvent._id === "general" ? "General Fund (Where Most Needed)" : selectedEvent._id)
    : selectedEvent?.title;

  // Close event dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAmount = watch("selectedAmount");
  const customAmount = watch("customAmount");
  const watchedPaymentMethod = watch("paymentMethod");
  const watchedClassification = watch("familyClassification");

  useEffect(() => {
    if (!slideContainerRef.current || !slideTrackRef.current || !cardFormRef.current || !telebirrFormRef.current) return;

    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    const isCard = watchedPaymentMethod === "card";
    const targetForm = isCard ? cardFormRef.current : telebirrFormRef.current;
    const targetX = isCard ? "0%" : "-100%";
    const targetHeight = targetForm.offsetHeight;

    if (isFirstRender.current) {
      gsap.set(slideContainerRef.current, { height: targetHeight });
      gsap.set(slideTrackRef.current, { x: "0%" });
      isFirstRender.current = false;
      return;
    }

    const tl = gsap.timeline();
    tl.to(slideTrackRef.current, {
      x: targetX,
      duration: 0.45,
      ease: "power3.inOut",
    }, 0);
    tl.to(slideContainerRef.current, {
      height: targetHeight,
      duration: 0.45,
      ease: "power3.inOut",
    }, 0);

    tlRef.current = tl;

    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
    };
  }, [watchedPaymentMethod]);

  const displayAmount = useMemo(() => {
    if (customAmount !== undefined && customAmount > 0) return customAmount;
    return selectedAmount || 0;
  }, [customAmount, selectedAmount]);

  const isAmountValid = (customAmount !== undefined && customAmount > 0) || selectedAmount > 0;

  const processingFee = useMemo(() => +(displayAmount * 0.03).toFixed(2), [displayAmount]);
  const totalAmount = useMemo(() => +(displayAmount + processingFee).toFixed(2), [displayAmount, processingFee]);

  // Normalize any Ethiopian phone shape (+2519..., 2519..., 09..., spaced) into
  // the schema-valid `09XXXXXXXX` form (no spaces, no country code).
  const normalizeEthiopianPhone = (value: string): string => {
    let digits = (value || "").replace(/\D/g, "");
    if (digits.startsWith("251")) digits = digits.slice(3);
    if (digits.startsWith("9") && digits.length === 9) digits = "0" + digits;
    return digits.slice(0, 10);
  };

  const telebirrPhoneRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/initialize', data);
      const result = response.data;

      if (result.message === "ok" && result.checkout_url) {
        const txRef = result.tx_ref;
        lastCheckoutUrlRef.current = result.checkout_url;

        // Open Chapa checkout in a NEW tab. return_url is blank on Chapa's
        // side, so that tab shows the receipt and persists (no redirect).
        checkoutTabRef.current = window.open(result.checkout_url, "_blank");

        // Enter the transition state on THIS tab.
        setProcessing(true);
        setStage("waiting");
        setIsLoading(false);

        if (!txRef) return;

        // Poll our backend for completion, then navigate THIS tab to success.
        pollActiveRef.current = true;
        let attempts = 0;

        const poll = async () => {
          if (!pollActiveRef.current) return;
          attempts += 1;
          // Advance the honest status line as time passes.
          if (attempts >= 6) setStage("finalizing");
          else if (attempts >= 2) setStage("confirming");

          try {
            const statusRes = await api.get(`/transactions/${txRef}/status`);
            const status = statusRes.data?.status;
            if (status === "success") {
              pollActiveRef.current = false;
              navigate(`/donation-success?tx_ref=${encodeURIComponent(txRef)}`);
              return;
            }
            if (status === "failed") {
              pollActiveRef.current = false;
              navigate(`/donation-failure?tx_ref=${encodeURIComponent(txRef)}&reason=payment_failed`);
              return;
            }
          } catch {
            // transient error — keep polling
          }
          setTimeout(poll, 2500);
        };
        poll();
      } else {
        console.error("Initialization failed without a checkout URL:", result);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      setIsLoading(false);
    }
  };

  const reopenCheckoutTab = () => {
    if (lastCheckoutUrlRef.current) {
      checkoutTabRef.current = window.open(lastCheckoutUrlRef.current, "_blank");
    }
  };

  const cancelProcessing = () => {
    pollActiveRef.current = false;
    setProcessing(false);
    setStage("waiting");
  };

  useEffect(() => {
    return () => {
      pollActiveRef.current = false;
    };
  }, []);

  const selectedCauseLabel = selectedEventTitle || t("payment.generalCause", "Where Most Needed");
  const classificationLabel = watchedClassification
    ? t(`dashboard.classifications.${watchedClassification}`)
    : null;

  const STAGE_COPY: Record<typeof stage, { title: string; line: string }> = {
    waiting: {
      title: t("payment.processing.waitingTitle", "Complete your payment"),
      line: t("payment.processing.waitingLine", "Finish the payment in the tab that just opened. We'll pick it up here the moment it's done."),
    },
    confirming: {
      title: t("payment.processing.confirmingTitle", "Confirming your gift"),
      line: t("payment.processing.confirmingLine", "Checking with your bank. This usually takes a few seconds."),
    },
    finalizing: {
      title: t("payment.processing.finalizingTitle", "Almost there"),
      line: t("payment.processing.finalizingLine", "Finalizing your receipt. Keep this tab open."),
    },
  };

  const stageOrder: Array<typeof stage> = ["waiting", "confirming", "finalizing"];

  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 relative overflow-hidden">
      {processing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-6"
          role="status"
          aria-live="polite"
        >
          <style>{`
            @keyframes amana-echo {
              0%   { transform: scale(0.7); opacity: 0.55; }
              100% { transform: scale(2.1); opacity: 0; }
            }
            @keyframes amana-core {
              0%, 100% { transform: scale(1); }
              50%      { transform: scale(1.06); }
            }
            .amana-echo, .amana-core { will-change: transform, opacity; }
            @media (prefers-reduced-motion: reduce) {
              .amana-echo { animation: none !important; opacity: 0 !important; }
              .amana-core { animation: none !important; }
            }
          `}</style>

          <div className="w-full max-w-sm text-center">
            <div className="relative mx-auto mb-10 h-32 w-32 flex items-center justify-center">
              <span className="amana-echo absolute h-20 w-20 rounded-full bg-primary/25" style={{ animation: "amana-echo 2.8s ease-out infinite" }} />
              <span className="amana-echo absolute h-20 w-20 rounded-full bg-primary/25" style={{ animation: "amana-echo 2.8s ease-out infinite", animationDelay: "1.4s" }} />
              <span className="amana-core relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10" style={{ animation: "amana-core 2.8s ease-in-out infinite" }}>
                <HeartHandshake className="h-9 w-9 text-primary" strokeWidth={1.75} />
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">
              {STAGE_COPY[stage].title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-8">
              {STAGE_COPY[stage].line}
            </p>

            <div className="mb-10 flex items-center justify-center gap-2" aria-hidden="true">
              {stageOrder.map((s) => {
                const activeIdx = stageOrder.indexOf(stage);
                const idx = stageOrder.indexOf(s);
                const done = idx < activeIdx;
                const current = idx === activeIdx;
                return (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      current ? "w-8 bg-primary" : done ? "w-4 bg-primary/60" : "w-4 bg-border"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={reopenCheckoutTab}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t("payment.processing.reopen", "Reopen payment tab")}
              </button>
              <button
                type="button"
                onClick={cancelProcessing}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("payment.processing.cancel", "Cancel and return to form")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-[30rem] h-[30rem] bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 group inline-flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-primary transition-colors duration-500"
        >
          <div className="relative flex items-center">
            <span className="block h-px w-5 sm:w-6 bg-current transition-all duration-500 ease-out group-hover:w-2 sm:group-hover:w-3 origin-right" />
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 absolute -left-0.5 transition-transform duration-500 ease-out group-hover:-translate-x-1" />
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em]">
            Back
          </span>
        </button>
        
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <HeartHandshake className="w-4 h-4" />
            <span>Make an Impact</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            {t("payment.title", "Secure Your Donation")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
            {t("payment.subtitle", "Your contribution directly empowers our mission. Choose a cause, select an amount, and help us drive positive change across the globe.")}
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Main Column - Form Sections */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* 1. Cause / Event Selection */}
            <section className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">{t("payment.selectCause", "Select a Cause")}</h2>
              </div>

              <div className="relative" ref={eventDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                  className="w-full flex items-center justify-between bg-background border-2 border-border/80 hover:border-primary/50 transition-colors rounded-2xl px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                   <div className="flex items-center gap-3">
                     {selectedEvent?.icon && <selectedEvent.icon className="w-5 h-5 text-primary" />}
                     <span className="font-semibold text-foreground text-sm sm:text-base md:text-lg">{selectedEventTitle}</span>
                   </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isEventDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isEventDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1" data-lenis-prevent>
                      {events.map((event) => {
                        const isSelected = watch("eventId") === event._id;
                        return (
                          <button
                            key={event._id}
                            type="button"
                            onClick={() => {
                              setValue("eventId", event._id);
                              setIsEventDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                              isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                            }`}
                          >
                             <div className="flex items-center gap-3">
                               <span className="font-medium">{event.titleKey ? t(event.titleKey, event._id) : event.title}</span>
                             </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Family Classification Selection */}
            <section className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">{t("payment.selectClassification", "Choose Who to Help")}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {t("payment.selectCauseDesc", "Earmark your gift for a family group, or leave it general so we direct it where it's needed most.")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* General / Where Most Needed */}
                <button
                  type="button"
                  onClick={() => setValue("familyClassification", null, { shouldValidate: true })}
                  className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    !watchedClassification
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                      : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${!watchedClassification ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{t("payment.generalCause", "Where Most Needed")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("payment.generalCauseDesc", "Directed to the highest-priority families")}</div>
                  </div>
                  <CheckCircle2 className={`absolute top-3 right-3 w-5 h-5 pointer-events-none transition-opacity ${!watchedClassification ? "text-primary opacity-100" : "opacity-0"}`} />
                </button>

                {CAUSE_CLASSIFICATIONS.map((c) => {
                  const Icon = c.icon;
                  const active = watchedClassification === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setValue("familyClassification", c.value as string, { shouldValidate: true })}
                      className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${active ? `${c.dot} text-white` : "bg-muted " + c.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">{t(c.label)}</div>
                         <div className="text-xs text-muted-foreground mt-0.5">{t(c.descKey, c.desc)}</div>
                      </div>
                      <CheckCircle2 className={`absolute top-3 right-3 w-5 h-5 pointer-events-none transition-opacity ${active ? "text-primary opacity-100" : "opacity-0"}`} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Donation Amount */}
            <section className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">{t("payment.selectAmount", "Donation Amount")}</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRESET_AMOUNTS.map((amount) => {
                  const active = customAmount === undefined && selectedAmount === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setValue("customAmount", undefined);
                        setValue("selectedAmount", amount, { shouldValidate: true });
                      }}
                      className={`relative group overflow-hidden py-6 px-4 rounded-2xl border-2 transition-all duration-300 text-center ${
                        active 
                          ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.15)]" 
                          : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                      )}
                      <div className={`relative z-10 text-xl sm:text-2xl md:text-3xl font-extrabold mb-1 transition-colors ${active ? "text-primary" : "text-foreground"}`}>
                        ${amount}
                      </div>
                      <div className={`relative z-10 text-xs font-medium transition-colors ${active ? "text-primary/80" : "text-muted-foreground"}`}>
                        {amount === 10 ? t("payment.amountSimple", "Simple Gift")
                          : amount === 25 ? t("payment.amountImpact", "Impactful")
                          : amount === 50 ? t("payment.amountGenerous", "Generous")
                          : t("payment.amountTransformative", "Transformative")}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  {t("payment.customAmountLabel", "Or enter a custom amount")}
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</div>
                  <input
                    type="number"
                    disabled={isLoading}
                    min="1"
                    step="1"
                    placeholder={t("payment.customPlaceholder", "0.00")}
                    value={customAmount === undefined ? "" : customAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setValue("selectedAmount", 0);
                      setValue("customAmount", value === 0 ? undefined : value, { shouldValidate: true });
                    }}
                    className={`w-full pl-10 pr-5 py-5 rounded-2xl border-2 bg-background text-xl sm:text-2xl font-bold transition-all focus:outline-none focus:ring-0 ${
                      customAmount !== undefined && customAmount > 0 
                        ? "border-primary text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                        : "border-border/60 text-foreground hover:border-border"
                    }`}
                  />
                </div>
                {errors.customAmount && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{String(errors.customAmount.message)}</p>
                )}
              </div>
            </section>

            {/* 4. Payment Method */}
            <section className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">{t("payment.paymentMethod", "Payment Method")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setValue("paymentMethod", "card");
                  }}
                  className={`relative p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 border-2 text-left ${
                    watchedPaymentMethod === "card"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-background hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${watchedPaymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-base">{t("payment.cardTitle", "Credit Card")}</div>
                    <div className="text-sm text-muted-foreground">{t("payment.cardSubtitle", "Secure checkout")}</div>
                  </div>
                  {watchedPaymentMethod === "card" && (
                    <div className="absolute top-4 right-4 text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue("paymentMethod", "telebirr");
                  }}
                  className={`relative p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 border-2 text-left ${
                    watchedPaymentMethod === "telebirr"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-background hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${watchedPaymentMethod === "telebirr" ? "bg-[#1C8D46] text-white" : "bg-muted text-muted-foreground"}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-base">{t("payment.telebirrTitle", "Telebirr")}</div>
                    <div className="text-sm text-muted-foreground">{t("payment.telebirrSubtitle", "Mobile money")}</div>
                  </div>
                  {watchedPaymentMethod === "telebirr" && (
                    <div className="absolute top-4 right-4 text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </button>
              </div>

              <input type="hidden" {...register("paymentMethod")} />

              <div className="pt-6 border-t border-border/60">
                <div ref={slideContainerRef} className="overflow-hidden relative">
                  <div ref={slideTrackRef} className="flex items-start">
                    <div ref={cardFormRef} className="w-full shrink-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-1 px-1">
                        <div className="sm:col-span-2 space-y-3">
                          <label className="text-sm font-semibold text-foreground">{t("payment.cardNumber", "Card Number")}</label>
                          <div className="relative">
                            <input
                              type="text"
                              disabled={isLoading}
                              placeholder={t("payment.cardPlaceholder", "0000 0000 0000 0000")}
                              {...register("cardNumber")}
                              className="w-full px-5 py-4 rounded-xl border-2 border-border/60 bg-background focus:border-primary focus:ring-0 transition-colors"
                            />
                            <Lock className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          {errors.cardNumber && <p className="text-red-500 text-sm font-medium">{String(errors.cardNumber.message)}</p>}
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-foreground">{t("payment.expiry", "Expiry Date")}</label>
                          <input
                            type="text"
                            disabled={isLoading}
                            placeholder={t("payment.expiryPlaceholder", "MM / YY")}
                            {...register("expiryDate")}
                            className="w-full px-5 py-4 rounded-xl border-2 border-border/60 bg-background focus:border-primary focus:ring-0 transition-colors"
                          />
                          {errors.expiryDate && <p className="text-red-500 text-sm font-medium">{String(errors.expiryDate.message)}</p>}
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-foreground">{t("payment.cvv", "CVV")}</label>
                          <div className="relative">
                            <input
                              type="password"
                              disabled={isLoading}
                              placeholder={t("payment.cvvPlaceholder", "***")}
                              {...register("cvv")}
                              className="w-full px-5 py-4 rounded-xl border-2 border-border/60 bg-background focus:border-primary focus:ring-0 transition-colors"
                            />
                            <HelpCircle className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          {errors.cvv && <p className="text-red-500 text-sm font-medium">{String(errors.cvv.message)}</p>}
                        </div>
                      </div>
                    </div>

                    <div ref={telebirrFormRef} className="w-full shrink-0">
                      <div className="space-y-3 pb-1 px-1">
                        <label className="text-sm font-semibold text-foreground">{t("payment.telebirrPhone", "Telebirr Phone Number")}</label>
                        <Controller
                          name="telebirrPhone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              ref={telebirrPhoneRef}
                              type="tel"
                              disabled={isLoading}
                              placeholder="09XXXXXXXX"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(normalizeEthiopianPhone(e.target.value))}
                              className="w-full px-5 py-4 rounded-xl border-2 border-border/60 bg-background focus:border-primary focus:ring-0 transition-colors"
                            />
                          )}
                        />
                        {errors.telebirrPhone && (
                          <p className="text-red-500 text-sm font-medium">{String(errors.telebirrPhone.message)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Summary */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-lg shadow-black/5">
              <div className="bg-muted/30 p-6 sm:p-8 border-b border-border/60">
                <h3 className="text-lg sm:text-xl font-bold">{t("payment.summaryTitle", "Donation Summary")}</h3>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="space-y-5 mb-8">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">{t("payment.donationLine", "Donation to")}</span>
                      <span className="text-xs font-semibold text-primary">{selectedCauseLabel}</span>
                      {classificationLabel && (
                        <span className={`mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CLASSIFICATION_PILL[watchedClassification!] ?? "bg-primary/10 text-primary"}`}>
                          {classificationLabel}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-base sm:text-lg">${displayAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("payment.processingFee", "Processing Fee (3%)")}</span>
                    <span className="font-medium text-muted-foreground">${processingFee.toFixed(2)}</span>
                  </div>

                  <div className="pt-5 mt-2 border-t border-dashed border-border flex justify-between items-end">
                    <span className="text-base font-semibold">{t("payment.total", "Total Amount")}</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full px-6 sm:px-8 py-6 sm:py-7 bg-primary text-primary-foreground rounded-2xl font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                  disabled={!isAmountValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {t("payment.complete", "Complete Donation")}
                      <HeartHandshake className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                
                <p className="mt-6 text-xs text-center text-muted-foreground leading-relaxed px-2">
                  {t("payment.legal", "By completing this donation, you agree to our Terms of Service and Privacy Policy.")}
                </p>
              </div>
            </div>

            <div className="mt-6 p-5 border border-border/60 rounded-3xl flex items-center gap-4 bg-card shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">{t("payment.secureTitle", "Secure Transaction")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("payment.secureDesc", "256-bit SSL encryption protects your data.")}</p>
              </div>
            </div>
          </aside>
          
        </form>
      </div>
    </main>
  );
};

export default Payment;