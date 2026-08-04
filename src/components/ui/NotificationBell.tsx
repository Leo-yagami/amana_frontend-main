import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Bell, X, CheckCheck, Film, ShieldCheck, Megaphone, Clock, HeartHandshake, type LucideProps } from "lucide-react";
import { notificationApi } from "@/services/api.service";

type NotificationType = "release" | "approved" | "announcement" | "promised" | "donation" | "received";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  date: Date;
  read: boolean;
  donationId?: string;
}

interface ToastData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  duration: number;
}

export interface NotificationBellHandle {
  pushNotification: (opts: { type?: NotificationType; title: string; body?: string; toastDuration?: number }) => void;
  addNotification: (opts: { type?: NotificationType; title: string; body?: string }) => void;
}

const TYPE_META: Record<NotificationType, { Icon: ComponentType<LucideProps>; tint: string; bg: string }> = {
  release: { Icon: Film, tint: "hsl(var(--warning))", bg: "hsl(var(--warning) / 0.1)" },
  approved: { Icon: ShieldCheck, tint: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)" },
  announcement: { Icon: Megaphone, tint: "hsl(var(--info))", bg: "hsl(var(--info) / 0.1)" },
  promised: { Icon: Clock, tint: "hsl(var(--warning))", bg: "hsl(var(--warning) / 0.1)" },
  donation: { Icon: HeartHandshake, tint: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)" },
  received: { Icon: ShieldCheck, tint: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)" },
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return "just now";
  const units: [string, number][] = [
    ["y", 31536000], ["mo", 2592000], ["d", 86400], ["h", 3600], ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "just now";
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/* ── Toast ──────────────────────────────────────────────────────────── */

function Toast({ toast, onDismiss, reducedMotion }: { toast: ToastData; onDismiss: (id: string) => void; reducedMotion: boolean }) {
  const wrapRef = useRef<HTMLLIElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const remaining = useRef(toast.duration);
  const startedAt = useRef<number | null>(null);
  const rafId = useRef(0);
  const dismissedRef = useRef(false);

  const meta = TYPE_META[toast.type] || TYPE_META.announcement;

  const runExit = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    cancelAnimationFrame(rafId.current);

    if (!reducedMotion) {
      const tl = gsap.timeline({ onComplete: () => onDismiss(toast.id) });
      tl.to(cardRef.current, { x: 40, opacity: 0, duration: 0.28, ease: "power2.in" })
        .to(wrapRef.current, { height: 0, marginTop: 0, duration: 0.24, ease: "power2.inOut" }, "-=0.1");
    } else {
      onDismiss(toast.id);
    }
  }, [reducedMotion, onDismiss, toast.id]);

  const runTick = useCallback((now: number) => {
    if (startedAt.current === null) startedAt.current = now;
    const elapsed = now - startedAt.current;
    const pct = Math.max(0, 1 - elapsed / remaining.current);
    gsap.set(railRef.current, { scaleX: pct });
    if (pct <= 0) { runExit(); return; }
    rafId.current = requestAnimationFrame(runTick);
  }, [runExit]);

  useEffect(() => {
    const el = cardRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const fullHeight = el.scrollHeight;

    if (!reducedMotion) {
      gsap.set(wrap, { height: 0 });
      gsap.fromTo(el, { opacity: 0, y: 22, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.6)" });
      gsap.to(wrap, { height: fullHeight, duration: 0.4, ease: "power3.out" });
    }

    rafId.current = requestAnimationFrame(runTick);
    return () => cancelAnimationFrame(rafId.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = () => {
    cancelAnimationFrame(rafId.current);
    if (startedAt.current !== null) {
      const remainingFraction = Number(gsap.getProperty(railRef.current, "scaleX"));
      remaining.current = remaining.current * remainingFraction;
    }
    startedAt.current = null;
  };

  const resume = () => {
    rafId.current = requestAnimationFrame(runTick);
  };

  return (
    <li ref={wrapRef} style={{ overflow: "hidden", marginTop: 10 }} className="pointer-events-auto">
      <div
        ref={cardRef}
        role="status"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        tabIndex={0}
        className="relative w-80 max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden focus:outline-none bg-card border border-border"
      >
        <div className="flex items-start gap-3 p-4 pr-3">
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 34, height: 34, background: meta.bg, color: meta.tint }}
          >
            <meta.Icon size={17} strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold leading-snug truncate text-foreground">{toast.title}</p>
            {toast.body && (
              <p className="text-xs mt-0.5 leading-snug line-clamp-2 text-muted-foreground">{toast.body}</p>
            )}
          </div>
          <button
            onClick={runExit}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-full p-1 -mt-1 -mr-1 transition-colors text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X size={15} />
          </button>
        </div>
        <div className="h-[3px] w-full bg-border">
          <div ref={railRef} className="h-full origin-left" style={{ background: meta.tint, transform: "scaleX(1)" }} />
        </div>
      </div>
    </li>
  );
}

/* ── Toast Stack ────────────────────────────────────────────────────── */

function ToastStack({ toasts, onDismiss, reducedMotion }: { toasts: ToastData[]; onDismiss: (id: string) => void; reducedMotion: boolean }) {
  return (
    <div aria-live="polite" aria-atomic="false" className="fixed bottom-5 right-5 z-[80] flex flex-col items-end pointer-events-none">
      <ul className="flex flex-col items-end list-none m-0 p-0">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} reducedMotion={reducedMotion} />
        ))}
      </ul>
    </div>
  );
}

/* ── Notification Item ──────────────────────────────────────────────── */

const NotificationItem = forwardRef<HTMLLIElement, { 
  item: Notification; 
  onSelect: (item: Notification) => void; 
  itemIndex: number; 
  activeIndex: number 
}>(
  function NotificationItem({ item, onSelect, itemIndex, activeIndex }, ref) {
    const meta = TYPE_META[item.type] || TYPE_META.announcement;
    const isActive = itemIndex === activeIndex;

    return (
      <li ref={ref} role="none">
        <button
          role="menuitem"
          tabIndex={isActive ? 0 : -1}
          onClick={() => onSelect(item)}
          className={`w-full text-left flex gap-3 px-4 py-3 transition-colors duration-150 focus:outline-none hover:bg-muted${
            isActive ? " " : ""
          }`}
          style={{
            borderLeft: `3px solid ${item.read ? "transparent" : meta.tint}`,
          }}
        >
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 32, height: 32, background: meta.bg, color: meta.tint }}
          >
            <meta.Icon size={16} strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm leading-snug flex-1 truncate text-foreground" style={{ fontWeight: item.read ? 500 : 700 }}>
                {item.title}
              </p>
              {!item.read && (
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full shrink-0 bg-accent" />
              )}
            </div>
            <p className="text-xs mt-0.5 leading-snug line-clamp-2 text-muted-foreground">{item.body}</p>
            <p className="text-[11px] mt-1 text-muted-foreground/60">{timeAgo(item.date)}</p>
          </div>
        </button>
      </li>
    );
  }
);

/* ── Notification Panel ─────────────────────────────────────────────── */

function NotificationPanel({
  open, align, notifications, onSelect, onMarkAllRead, onRequestClose, reducedMotion, anchorRef, panelId,
}: {
  open: boolean; align: "left" | "right"; notifications: Notification[];
  onSelect: (item: Notification) => void; onMarkAllRead: () => void; onRequestClose: () => void;
  reducedMotion: boolean; anchorRef: React.RefObject<HTMLButtonElement | null>; panelId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (reducedMotion) {
      panel.style.visibility = open ? "visible" : "hidden";
      panel.style.pointerEvents = open ? "auto" : "none";
      panel.style.opacity = open ? "1" : "0";
      return;
    }

    if (open) {
      const tl = gsap.timeline();
      tl.set(panel, { visibility: "visible", pointerEvents: "auto" })
        .fromTo(panel, { opacity: 0, scale: 0.92, y: -10 }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: "power4.out" }, 0);
      const items = itemRefs.current.filter(Boolean);
      if (items.length) {
        tl.fromTo(items, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power3.out" }, 0.08);
      }
      setActiveIndex(0);
    } else {
      gsap.to(panel, {
        opacity: 0, scale: 0.94, y: -8, duration: 0.2, ease: "power2.in",
        onComplete: () => { gsap.set(panel, { visibility: "hidden", pointerEvents: "none" }); },
      });
      setActiveIndex(-1);
    }
  }, [open, reducedMotion]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    const count = notifications.length;
    if (e.key === "Escape") { e.preventDefault(); onRequestClose(); anchorRef.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => (count ? (i + 1) % count : -1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => (count ? (i - 1 + count) % count : -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIndex(count ? 0 : -1); }
    else if (e.key === "End") { e.preventDefault(); setActiveIndex(count ? count - 1 : -1); }
    else if (e.key === "Tab") { onRequestClose(); }
  };

  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.querySelector("button")?.focus();
    }
  }, [activeIndex]);

  return (
    <div
    data-lenis-prevent
      ref={panelRef}
      id={panelId}
      role="menu"
      aria-label="Notifications"
      onKeyDown={handleKeyDown}
      className={`z-[70] rounded-2xl overflow-hidden bg-card border border-border shadow-xl fixed left-2 right-2 top-16 w-auto mt-0 sm:absolute sm:top-full sm:w-[22rem] sm:max-w-[92vw] sm:mt-3 ${
        align === "left" ? "sm:right-auto sm:left-0" : "sm:left-auto sm:right-0"
      }`}
      style={{
        transformOrigin: align === "left" ? "top left" : "top right",
        visibility: "hidden",
        opacity: 0,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-bold text-foreground">Notifications</h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 transition-colors text-accent hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      <ul className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {notifications.length === 0 ? (
          <li className="px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: "hsl(var(--muted))" }}>
              <Bell size={19} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">You&apos;re all caught up</p>
            <p className="text-xs mt-1 text-muted-foreground">New activity will show up here.</p>
          </li>
        ) : (
          notifications.map((item, i) => (
            <NotificationItem
              key={item.id}
              ref={(el) => { itemRefs.current[i] = el; }}
              item={item}
              itemIndex={i}
              activeIndex={activeIndex}
              onSelect={onSelect}
            />
          ))
        )}
      </ul>
    </div>
  );
}

/* ── Notification Bell ──────────────────────────────────────────────── */

const NotificationBell = forwardRef<NotificationBellHandle, {
  initialNotifications?: Notification[];
  align?: "left" | "right";
  onOpenChange?: (open: boolean) => void;
  className?: string;
  pollInterval?: number;
}>(function NotificationBell({
  initialNotifications, align = "right", onOpenChange, className = "", pollInterval = 30000,
}, ref) {
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
  const [open, setOpen] = useState(false);
  const [toastList, setToastList] = useState<ToastData[]>([]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const panelId = useRef(`notif-panel-${Math.random().toString(36).slice(2, 9)}`).current;
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const isAuthenticated = useRef(!!localStorage.getItem('token'));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const closePanel = useCallback(() => { setOpen(false); onOpenChange?.(false); }, [onOpenChange]);
  const togglePanel = useCallback(() => { setOpen((prev) => { const next = !prev; onOpenChange?.(next); return next; }); }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closePanel();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closePanel(); buttonRef.current?.focus(); }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, closePanel]);

  const handleHoverIn = () => {
    if (reducedMotion) return;
    gsap.killTweensOf(iconRef.current);
    gsap.to(iconRef.current, { rotation: 14, duration: 0.16, ease: "power2.out", transformOrigin: "50% 0%" });
  };

  const handleHoverOut = () => {
    if (reducedMotion) return;
    gsap.to(iconRef.current, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)", transformOrigin: "50% 0%" });
  };

  const handlePressIn = () => {
    if (reducedMotion) return;
    gsap.killTweensOf(buttonRef.current);
    gsap.to(buttonRef.current, { scale: 0.86, duration: 0.1, ease: "power2.out" });
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    gsap.to(buttonRef.current, { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.35)" });
  };

  const handleClick = () => { togglePanel(); };

  const ringBell = useCallback(() => {
    if (reducedMotion) return;
    gsap.killTweensOf(iconRef.current);
    gsap.fromTo(iconRef.current, { rotation: -22 }, { rotation: 0, duration: 1.1, ease: "elastic.out(1, 0.28)", transformOrigin: "50% 0%" });
    if (rippleRef.current) {
      gsap.fromTo(rippleRef.current, { scale: 0.4, opacity: 0.55 }, { scale: 2.4, opacity: 0, duration: 0.75, ease: "power2.out" });
    }
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current, { scale: 0 }, { scale: 1, duration: 0.55, ease: "back.out(2.6)", delay: 0.05 });
    }
  }, [reducedMotion]);

  const wiggleBell = useCallback(() => {
    if (reducedMotion) return;
    gsap.killTweensOf(iconRef.current);
    gsap.fromTo(iconRef.current, { rotation: -15 }, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.4)", transformOrigin: "50% 0%" });
    if (rippleRef.current) {
      gsap.fromTo(rippleRef.current, { scale: 0.4, opacity: 0.35 }, { scale: 1.8, opacity: 0, duration: 0.5, ease: "power2.out" });
    }
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current, { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2)", delay: 0.03 });
    }
  }, [reducedMotion]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationApi.markAllRead();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleSelect = async (item: Notification) => {
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    
    if (item.donationId) {
      navigate(`/dashboard/donations/${item.donationId}`);
    }
    
    try {
      await notificationApi.markRead(item.id);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const dismissToast = useCallback((id: string) => { setToastList((prev) => prev.filter((t) => t.id !== id)); }, []);

  const pushNotification = useCallback(({ type = "announcement", title, body, toastDuration = 5000, showToast = true }: {
    type?: NotificationType; title: string; body?: string; toastDuration?: number; showToast?: boolean;
  }) => {
    const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const entry: Notification = { id, type, title, body: body || "", date: new Date(), read: false };
    setNotifications((prev) => [entry, ...prev]);
    seenNotificationIds.current.add(id);
    if (showToast) {
      setToastList((prev) => [...prev, { id, type, title, body: body || "", duration: toastDuration }]);
      ringBell();
    } else {
      wiggleBell();
    }
  }, [ringBell, wiggleBell]);

  const addNotification = useCallback(({ type = "announcement", title, body }: {
    type?: NotificationType; title: string; body?: string;
  }) => {
    pushNotification({ type, title, body, showToast: false });
  }, [pushNotification]);

  useImperativeHandle(ref, () => ({ pushNotification, addNotification }), [pushNotification, addNotification]);

  /* ── Backend Polling ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!isAuthenticated.current) return;

    const fetchNotifications = async () => {
      try {
        const res = await notificationApi.getAll();
        const apiNotifs = Array.isArray(res.data) ? res.data : [];
        const mapped: Notification[] = apiNotifs.map((n: { _id: string; type: string; title: string; body: string; donationId?: string; read: boolean; createdAt: string }) => ({
          id: n._id,
          type: n.type as NotificationType,
          title: n.title,
          body: n.body || "",
          donationId: n.donationId,
          date: new Date(n.createdAt),
          read: n.read,
        }));

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const knownIds = new Set([...existingIds, ...seenNotificationIds.current]);
          const merged = [...prev];
          for (const n of mapped) {
            if (!existingIds.has(n.id)) {
              merged.push(n);
              if (!knownIds.has(n.id) && !n.read) {
                if (n.type === "donation" || n.type === "received") {
                  wiggleBell();
                } else {
                  setToastList((tl) => [...tl, { id: n.id, type: n.type, title: n.title, body: n.body, duration: 5000 }]);
                  ringBell();
                }
              }
              knownIds.add(n.id);
            }
          }
          seenNotificationIds.current = knownIds;
          merged.sort((a, b) => b.date.getTime() - a.date.getTime());
          return merged;
        });
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    const checkDuePromised = async () => {
      try {
        const res = await notificationApi.checkDuePromised();
        const newNotifs = Array.isArray(res.data) ? res.data : [];
        if (newNotifs.length === 0) return;
        const mapped: Notification[] = newNotifs.map((n: { _id: string; title: string; body: string; donationId?: string; createdAt: string }) => ({
          id: n._id,
          type: "promised" as NotificationType,
          title: n.title,
          body: n.body || "",
          donationId: n.donationId,
          date: new Date(n.createdAt),
          read: false,
        }));

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const merged = [...prev];
          for (const n of mapped) {
            if (!existingIds.has(n.id)) {
              merged.push(n);
              seenNotificationIds.current.add(n.id);
              setToastList((tl) => [...tl, { id: n.id, type: n.type, title: n.title, body: n.body, duration: 7000 }]);
              ringBell();
            }
          }
          merged.sort((a, b) => b.date.getTime() - a.date.getTime());
          return merged;
        });
      } catch (err) {
        console.error("Failed to check due promised donations:", err);
      }
    };

    fetchNotifications();
    checkDuePromised();

    const interval = setInterval(() => {
      fetchNotifications();
      checkDuePromised();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, ringBell, wiggleBell]);

  return (
    <>
      <div ref={wrapRef} className={`relative inline-block ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          onClick={handleClick}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
          onMouseDown={handlePressIn}
          onMouseUp={handlePressOut}
          onTouchStart={handlePressIn}
          onTouchEnd={handlePressOut}
          className="relative flex items-center justify-center rounded-full h-10 w-10 text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span
            ref={rippleRef}
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{ width: 26, height: 26, background: "hsl(var(--warning))", opacity: 0 }}
          />
          <span ref={iconRef} className="relative flex" style={{ willChange: "transform" }}>
            <Bell size={22} strokeWidth={2} />
          </span>
          {unreadCount > 0 && (
            <span
              ref={badgeRef}
              aria-hidden="true"
              className="absolute flex items-center justify-center rounded-full text-[10px] font-bold bg-accent text-accent-foreground shadow-sm"
              style={{ top: 2, right: 2, minWidth: 16, height: 16, padding: "0 3px" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <NotificationPanel
          open={open}
          align={align}
          notifications={notifications}
          onSelect={handleSelect}
          onMarkAllRead={markAllRead}
          onRequestClose={closePanel}
          reducedMotion={reducedMotion}
          anchorRef={buttonRef}
          panelId={panelId}
        />
      </div>

      <ToastStack toasts={toastList} onDismiss={dismissToast} reducedMotion={reducedMotion} />
    </>
  );
});

export { NotificationBell };
export default NotificationBell;