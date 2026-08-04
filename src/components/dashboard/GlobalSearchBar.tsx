// src/components/dashboard/GlobalSearchBar.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, Loader2, SearchX, Users, HandHeart, DollarSign, Megaphone } from "lucide-react";
import { familyApi, donorApi, eventApi, donationApi } from "@/services/api.service";
import type { Family, Donor, Event, Donation } from "@/types/api";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CategoryKey = "families" | "donors" | "events" | "donations";

interface NormalizedResult {
  id: string;
  category: CategoryKey;
  title: string;
  subtitle: string;
  route: string;
}

type CategorizedResults = Record<CategoryKey, NormalizedResult[]>;

// ---------------------------------------------------------------------------
// Tunables — the knobs that control how much load this puts on the API
// ---------------------------------------------------------------------------
const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;
const RESULTS_PER_CATEGORY = 5;
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 50;

// Adjust to match your actual router paths
const ROUTE_BUILDERS: Record<CategoryKey, (id: string) => string> = {
  families: (id) => `/dashboard/families/${id}`,
  donors: (id) => `/dashboard/donors/${id}`,
  events: (id) => `/dashboard/events/${id}`,
  donations: (id) => `/dashboard/donations/${id}`,
};

const EMPTY_RESULTS: CategorizedResults = {
  families: [],
  donors: [],
  events: [],
  donations: [],
};

// ---------------------------------------------------------------------------
// Module-level cache — survives remounts, doesn't trigger re-renders itself.
// TTL + size cap, oldest entry evicted first.
// ---------------------------------------------------------------------------
const searchCache = new Map<string, { data: CategorizedResults; timestamp: number }>();

function getCached(key: string): CategorizedResults | null {
  const hit = searchCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return hit.data;
}

function setCached(key: string, data: CategorizedResults) {
  if (searchCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// Small debounce hook
// ---------------------------------------------------------------------------
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ---------------------------------------------------------------------------
// One typed place to handle "does this record use `id` or `_id`" instead of
// casting to `any` per call site. Family/Donor/Donation types only declare
// `id`, but Mongo's default is `_id` — this covers whichever actually shows
// up without losing type safety everywhere else on the object.
// ---------------------------------------------------------------------------
function extractId(record: { id?: string; _id?: string }): string {
  return record._id ?? record.id ?? "";
}

// ---------------------------------------------------------------------------
// Normalizes both response shapes your backend actually sends: a raw array
// (what /families, /donors, /donations currently return) or { data: [...] }
// (what the types claim). The nested-array case is unverified — I haven't
// seen a route return [{ data, pagination }] anywhere; keeping it since it
// may be covering something real, but worth confirming.
// ---------------------------------------------------------------------------
function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) {
    if (raw.length === 1 && raw[0] && typeof raw[0] === "object" && "data" in raw[0] && Array.isArray((raw[0] as any).data)) {
      return (raw[0] as any).data;
    }
    return raw as T[];
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as any).data)) {
    return (raw as any).data;
  }
  return [];
}

function formatCurrency(amount: number | undefined, currency = "ETB"): string {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

// ---------------------------------------------------------------------------
// Per-category normalizers
// ---------------------------------------------------------------------------
function mapFamily(f: Family): NormalizedResult {
  const id = extractId(f);
  return {
    id,
    category: "families",
    title: f.familyName || "",
    subtitle: [f.familyCode, f.region].filter(Boolean).join(" · "),
    route: ROUTE_BUILDERS.families(id),
  };
}

function mapDonor(d: Donor): NormalizedResult {
  const id = extractId(d);
  return {
    id,
    category: "donors",
    title: d.isAnonymous ? "Anonymous donor" : d.name || "",
    subtitle: [d.donorType, d.totalDonated ? formatCurrency(d.totalDonated) : null]
      .filter(Boolean)
      .join(" · "),
    route: ROUTE_BUILDERS.donors(id),
  };
}

function mapEvent(e: Event): NormalizedResult {
  const id = extractId(e);
  return {
    id,
    category: "events",
    title: e.title,
    subtitle: [e.eventType?.replace(/_/g, " "), e.status].filter(Boolean).join(" · "),
    route: ROUTE_BUILDERS.events(id),
  };
}

function mapDonation(don: Donation): NormalizedResult {
  // Backend stores/searches a flat `donorName` on the Donation document
  // itself; the TS interface only declares a nested `donor?: Donor`.
  const donorName = (don as any).donorName || don.donor?.name || "Unknown donor";
  const id = extractId(don);
  return {
    id,
    category: "donations",
    title: `${donorName} — ${formatCurrency(don.amount, don.currency)}`,
    subtitle: [don.status, don.receivedAt ? new Date(don.receivedAt).toLocaleDateString() : null]
      .filter(Boolean)
      .join(" · "),
    route: ROUTE_BUILDERS.donations(id),
  };
}

const CATEGORY_META: Record<
  CategoryKey,
  { labelKey: string; fallbackLabel: string; icon: typeof Users; iconColor: string; iconBg: string }
> = {
  families: { labelKey: "dashboard.search.families", fallbackLabel: "Families", icon: Users, iconColor: "text-primary", iconBg: "bg-primary/10" },
  donors: { labelKey: "dashboard.search.donors", fallbackLabel: "Donors", icon: HandHeart, iconColor: "text-success", iconBg: "bg-success/10" },
  events: { labelKey: "dashboard.search.events", fallbackLabel: "Events", icon: Megaphone, iconColor: "text-info", iconBg: "bg-info/10" },
  donations: { labelKey: "dashboard.search.donations", fallbackLabel: "Donations", icon: DollarSign, iconColor: "text-warning", iconBg: "bg-warning/10" },
};

const CATEGORY_ORDER: CategoryKey[] = ["families", "donors", "events", "donations"];

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (text == null) return null;
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared results list — rendered by both the desktop dropdown and the
// mobile full-screen sheet so the two surfaces can't drift apart.
// ---------------------------------------------------------------------------
interface SearchResultsListProps {
  results: CategorizedResults;
  flatResults: NormalizedResult[];
  activeIndex: number;
  onHoverIndex: (index: number) => void;
  onSelect: (result: NormalizedResult) => void;
  query: string;
  isLoading: boolean;
  showHint: boolean;
  showEmpty: boolean;
  dense?: boolean;
}

function SearchResultsList({
  results,
  flatResults,
  activeIndex,
  onHoverIndex,
  onSelect,
  query,
  isLoading,
  showHint,
  showEmpty,
  dense = false,
}: SearchResultsListProps) {
  const { t } = useTranslation();
  const rowPadding = dense ? "py-2.5" : "py-3";

  if (showHint) {
    return (
      <p className="px-3 py-4 text-sm text-muted-foreground text-center">
        {t("dashboard.search.minChars", `Keep typing (${MIN_QUERY_LENGTH}+ characters)...`)}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="px-3 py-6 text-center">
        <SearchX className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {t("dashboard.search.noResults", `No results for "${query}"`)}
        </p>
      </div>
    );
  }

  return (
    <>
      {CATEGORY_ORDER.map((cat) => {
        const items = results[cat];
        if (items.length === 0) return null;
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;

        return (
          <div key={cat}>
            <div className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(meta.labelKey, meta.fallbackLabel)}
            </div>
            {items.map((item) => {
              const flatIdx = flatResults.findIndex((r) => r.id === item.id && r.category === item.category);
              const isActive = flatIdx === activeIndex;
              return (
                <button
                  key={`${item.category}-${item.id}`}
                  id={`search-option-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => onHoverIndex(flatIdx)}
                  onClick={() => onSelect(item)}
                  className={`w-full flex items-start gap-3 px-3 ${rowPadding} text-left transition-colors ${
                    isActive ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
                    <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      <HighlightedText text={item.title} query={query} />
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface GlobalSearchBarProps {
  className?: string;
}

const GlobalSearchBar = ({ className = "" }: GlobalSearchBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CategorizedResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);

  const flatResults = useMemo(
    () => CATEGORY_ORDER.flatMap((cat) => results[cat]),
    [results]
  );

  // --- Fetch orchestration ---------------------------------------------
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults(EMPTY_RESULTS);
      setIsLoading(false);
      return;
    }

    const cached = getCached(debouncedQuery);
    if (cached) {
      setResults(cached);
      setIsLoading(false);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const thisRequestId = ++requestIdRef.current;

    setIsLoading(true);

    const params = { search: debouncedQuery, limit: RESULTS_PER_CATEGORY };

    Promise.allSettled([
      familyApi.getAll(params as any),
      donorApi.getAll(params as any),
      eventApi.getAll(params as any),
      donationApi.getAll(params as any), // requires `search` added to DonationFilters
    ]).then(([familiesRes, donorsRes, eventsRes, donationsRes]) => {
      if (thisRequestId !== requestIdRef.current) return; // stale response guard

      const next: CategorizedResults = {
        families: familiesRes.status === "fulfilled" ? unwrapList<Family>(familiesRes.value.data).map(mapFamily) : [],
        donors: donorsRes.status === "fulfilled" ? unwrapList<Donor>(donorsRes.value.data).map(mapDonor) : [],
        events: eventsRes.status === "fulfilled" ? unwrapList<Event>(eventsRes.value.data).map(mapEvent) : [],
        donations: donationsRes.status === "fulfilled" ? unwrapList<Donation>(donationsRes.value.data).map(mapDonation) : [],
      };

      setCached(debouncedQuery, next);
      setResults(next);
      setIsLoading(false);
      setActiveIndex(0);
    });

    return () => controller.abort();
  }, [debouncedQuery]);

  // --- Outside click closes the desktop dropdown only; the mobile sheet
  // is full-bleed so there's no "outside" — it closes via its own X/Escape.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Cmd/Ctrl+K focuses the desktop input from anywhere ---------------
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  // --- Lock body scroll while the mobile sheet is open -------------------
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setMobileOpen(false);
    inputRef.current?.blur();
    mobileInputRef.current?.blur();
  }, []);

  const handleSelect = useCallback(
    (result: NormalizedResult) => {
      navigate(result.route);
      setQuery("");
      closeSearch();
    },
    [navigate, closeSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const searchActive = isOpen || mobileOpen;
    if (!searchActive || flatResults.length === 0) {
      if (e.key === "Escape") closeSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatResults[activeIndex];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      closeSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults(EMPTY_RESULTS);
    inputRef.current?.focus();
  };

  const showHint = query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH;
  const showEmpty = !isLoading && !showHint && debouncedQuery.length >= MIN_QUERY_LENGTH && flatResults.length === 0;
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  const activeDescendant = flatResults[activeIndex] ? `search-option-${flatResults[activeIndex].id}` : undefined;

  return (
    <>
      {/* Desktop dropdown */}
      <div ref={containerRef} className={`relative hidden md:flex items-center flex-1 max-w-md ${className}`}>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-full transition-shadow focus-within:ring-2 focus-within:ring-ring">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="global-search-listbox"
            aria-activedescendant={activeDescendant}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t("dashboard.header.searchPlaceholder", "Search families, donors, events...")}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />}
          {!isLoading && query && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={t("dashboard.search.clear", "Clear search")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!isLoading && !query && (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground flex-shrink-0">
              {isMac ? "⌘" : "Ctrl"}K
            </kbd>
          )}
        </div>

        <div
          id="global-search-listbox"
          role="listbox"
          className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-xl transition-all duration-150 ease-out motion-reduce:transition-none ${
            isOpen && query.trim().length > 0
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-1 invisible pointer-events-none"
          }`}
        >
          <SearchResultsList
            results={results}
            flatResults={flatResults}
            activeIndex={activeIndex}
            onHoverIndex={setActiveIndex}
            onSelect={handleSelect}
            query={debouncedQuery}
            isLoading={isLoading}
            showHint={showHint}
            showEmpty={showEmpty}
            dense
          />
        </div>
      </div>

      {/* Mobile trigger + full-screen sheet */}
      {/* <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => {
            setMobileOpen(true);
            requestAnimationFrame(() => mobileInputRef.current?.focus());
          }}
          aria-label={t("dashboard.search.open", "Search")}
        >
          <Search className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button> */}
        {/* <div className="md:hidden">
          <button
            onClick={() => {
              setMobileOpen(true);
              requestAnimationFrame(() => mobileInputRef.current?.focus());
            }}
            aria-label={t("dashboard.search.open", "Search")}
            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="w-4 h-4" />
          </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={mobileOpen}
                  aria-controls="global-search-listbox-mobile"
                  aria-activedescendant={activeDescendant}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("dashboard.header.searchPlaceholder", "Search families, donors, events...")}
                  className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
                />
                {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />}
              </div>
              <button
                onClick={closeSearch}
                className="flex-shrink-0 p-2 rounded-full hover:bg-muted text-muted-foreground"
                aria-label={t("dashboard.search.close", "Close search")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="global-search-listbox-mobile" className="flex-1 overflow-y-auto" role="listbox">
              <SearchResultsList
                results={results}
                flatResults={flatResults}
                activeIndex={activeIndex}
                onHoverIndex={setActiveIndex}
                onSelect={handleSelect}
                query={debouncedQuery}
                isLoading={isLoading}
                showHint={showHint}
                showEmpty={showEmpty}
              />
            </div>
          </div>
        )}
      </div> */}

      {/* Mobile trigger + full-screen sheet */}
<div className="md:hidden">
  <button
    onClick={() => {
      setMobileOpen(true);
      requestAnimationFrame(() => mobileInputRef.current?.focus());
    }}
    aria-label={t("dashboard.search.open", "Search")}
    className="flex items-center gap-2 bg-muted rounded-lg px-3 h-10 w-28 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    <span className="text-sm text-muted-foreground truncate">
      {t("dashboard.search.mobileTrigger", "Search")}
    </span>
  </button>

  {mobileOpen && (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={mobileInputRef}
            type="text"
            role="combobox"
            aria-expanded={mobileOpen}
            aria-controls="global-search-listbox-mobile"
            aria-activedescendant={activeDescendant}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("dashboard.header.searchPlaceholder", "Search families, donors, events...")}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />}
        </div>
        <button
          onClick={closeSearch}
          className="flex-shrink-0 p-2 rounded-full hover:bg-muted text-muted-foreground"
          aria-label={t("dashboard.search.close", "Close search")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div id="global-search-listbox-mobile" className="flex-1 overflow-y-auto" role="listbox">
        <SearchResultsList
          results={results}
          flatResults={flatResults}
          activeIndex={activeIndex}
          onHoverIndex={setActiveIndex}
          onSelect={handleSelect}
          query={debouncedQuery}
          isLoading={isLoading}
          showHint={showHint}
          showEmpty={showEmpty}
        />
      </div>
    </div>
  )}
</div>
    </>
  );
};

export default GlobalSearchBar;