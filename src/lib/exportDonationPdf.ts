import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (amount: number, currency = "ETB"): string => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
};

const formatDate = (date?: string): string =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

const formatDateTime = (date?: string): string =>
  date ? new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

// Canonical donation reference, mirroring the backend's generation rule
// (models/Donations -> `DON-${_id.slice(4,11)}`). Always returns the full
// reference, never a truncated value, so the exported PDF is trustworthy.
export const toDonationReference = (d: any): string => {
  if (d.donationReference && String(d.donationReference).trim()) {
    return String(d.donationReference).trim();
  }
  if (d._id) {
    return `DON-${String(d._id).slice(4, 11)}`;
  }
  return "N/A";
};

export interface NormalizedDonation {
  reference: string;
  date: string;
  donor: string;
  type: string;
  amount: string;
  original: string;
  status: string;
  allocation: string;
  notes: string;
}

// Works for both the flattened list object (from Donations.tsx: donorName,
// family.familyName, event.title, beneficiary.fullName) and the nested
// donor.donations object (from DonorProfile.tsx: donor.name, family.familyName, …).
export const normalizeDonation = (d: any): NormalizedDonation => {
  const donorName = d.donorName || d.donor?.name || "Anonymous";
  const amount = Number(d.amount || 0); // always ETB in the data model
  const amountStr = formatCurrency(amount, "ETB");

  const origCurrency = d.originalCurrency ?? d.currency ?? "ETB";
  const original =
    origCurrency && origCurrency !== "ETB"
      ? `${formatCurrency(Number((d.originalAmount ?? d.amount) || 0), origCurrency)} (${origCurrency})`
      : "—";

  const allocation = [
    d.family?.familyName || d.familyName,
    d.event?.title || d.eventTitle,
    d.beneficiary?.fullName || d.beneficiaryName,
  ]
    .filter(Boolean)
    .join(", ") || "General";

  const notes = d.description || d.usageNote || d.notes || "Not specified";

  return {
    reference: toDonationReference(d),
    date: formatDate(d.receivedAt),
    donor: donorName,
    type:
      d.donationType === "in_kind"
        ? "In-kind"
        : d.donationType === "monetary"
          ? "Monetary"
          : d.donationType || "Not specified",
    amount: amountStr,
    original,
    status: d.status || "Not specified",
    allocation,
    notes,
  };
};

const HEADER_FILL: [number, number, number] = [30, 64, 124];
const ACCENT: [number, number, number] = [37, 99, 235];

export interface ExportMeta {
  title?: string;
  subtitle?: string;
  filters?: string[];
  dateRange?: { start?: string; end?: string };
  summary?: string[];
  fileName?: string;
}

const buildDoc = (meta: ExportMeta) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...HEADER_FILL);
  doc.text(meta.title || "Donations Report", 14, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  let cursorY = 42;
  if (meta.subtitle) {
    doc.text(meta.subtitle, 14, cursorY);
    cursorY += 14;
  }

  const metaLine: string[] = [];
  if (meta.dateRange?.start || meta.dateRange?.end) {
    const start = meta.dateRange.start ? formatDate(meta.dateRange.start) : "…";
    const end = meta.dateRange.end ? formatDate(meta.dateRange.end) : "…";
    metaLine.push(`Period: ${start} – ${end}`);
  }
  if (meta.filters?.length) {
    metaLine.push(`Filters: ${meta.filters.join(", ")}`);
  }
  if (metaLine.length) {
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(metaLine.join("     |     "), 14, cursorY);
    cursorY += 14;
  }

  if (meta.summary?.length) {
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(meta.summary.join("     |     "), 14, cursorY);
    cursorY += 14;
  }

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.5);
  doc.line(14, cursorY, pageWidth - 14, cursorY);

  return { doc, tableStartY: cursorY + 16 };
};

const drawFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const stamp = formatDateTime(new Date().toISOString());
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(130);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Generated on ${stamp}`, 14, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, {
      align: "right",
    });
  }
};

const sharedTableStyles = {
  styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak" as const, valign: "middle" as const },
  headStyles: { fillColor: HEADER_FILL, textColor: 255, fontStyle: "bold" as const },
  alternateRowStyles: { fillColor: [244, 247, 252] },
};

// ── Full donations list (Donations.tsx) ─────────────────────────────────────
export const exportDonationsPdf = (donations: any[], meta: ExportMeta = {}) => {
  const total = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const { doc, tableStartY } = buildDoc({
    title: meta.title || "Donations Report",
    subtitle: meta.subtitle || "All donations matching the selected filters",
    dateRange: meta.dateRange,
    filters: meta.filters,
    summary: meta.summary ?? [
      `Total donations: ${donations.length}`,
      `Total amount (ETB): ${formatCurrency(total, "ETB")}`,
    ],
  });

  const rows = donations.map(normalizeDonation);
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 14, right: 14, top: 14 },
    ...sharedTableStyles,
    columnStyles: { 4: { hAlign: "right" } },
    head: [["Ref", "Date", "Donor", "Type", "Amount (ETB)", "Original", "Status", "Allocated to", "Notes"]],
    body: rows.map((r) => [
      r.reference,
      r.date,
      r.donor,
      r.type,
      r.amount,
      r.original,
      r.status,
      r.allocation,
      r.notes,
    ]),
  });

  drawFooter(doc);
  doc.save(meta.fileName || `donations-${new Date().toISOString().split("T")[0]}.pdf`);
};

// ── Single-donor history (DonorProfile.tsx) ─────────────────────────────────
export const exportDonorDonationsPdf = (
  donor: any,
  donations: any[],
  meta: ExportMeta = {},
) => {
  const total = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const { doc, tableStartY } = buildDoc({
    title: meta.title || "Donor Donation History",
    subtitle:
      meta.subtitle || (donor ? `${donor.name} (${donor.donorCode || "—"})` : "Donation history"),
    dateRange: meta.dateRange,
    filters: meta.filters,
    summary: meta.summary ?? [
      `Total donations: ${donations.length}`,
      `Total amount (ETB): ${formatCurrency(total, "ETB")}`,
    ],
  });

  const rows = donations.map(normalizeDonation);
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 14, right: 14, top: 14 },
    ...sharedTableStyles,
    columnStyles: { 3: { hAlign: "right" } },
    head: [["Ref", "Date", "Type", "Amount (ETB)", "Original", "Status", "Allocated to", "Notes"]],
    body: rows.map((r) => [
      r.reference,
      r.date,
      r.type,
      r.amount,
      r.original,
      r.status,
      r.allocation,
      r.notes,
    ]),
  });

  drawFooter(doc);
  const code = donor?.donorCode || donor?.name || "donor";
  doc.save(meta.fileName || `donor-${code}-donations-${new Date().toISOString().split("T")[0]}.pdf`);
};

export interface ReceiptData {
  reference?: string;
  txRef?: string;
  donorName?: string;
  donorEmail?: string;
  amount?: number;
  currency?: string;
  originalAmount?: number | null;
  originalCurrency?: string | null;
  paymentMethod?: string;
  eventName?: string | null;
  status?: string;
  date?: string;
}

// Downloads a single-donation receipt as a real PDF file (no print dialog).
export const downloadReceiptPdf = (receipt: ReceiptData): void => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...HEADER_FILL);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Amana Donation Receipt", 40, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Official record of an online (Chapa) donation", 40, 52);

  const currency = receipt.currency || "ETB";
  const rows: [string, string][] = [
    ["Reference", receipt.reference || "N/A"],
    ["Transaction Ref", receipt.txRef || "N/A"],
    ["Donor", receipt.donorName || "Anonymous"],
    ["Email", receipt.donorEmail || "N/A"],
    ["Amount", formatCurrency(Number(receipt.amount || 0), currency)],
  ];
  if (
    receipt.originalAmount &&
    receipt.originalCurrency &&
    receipt.originalCurrency !== currency
  ) {
    rows.push([
      "Original Amount",
      formatCurrency(Number(receipt.originalAmount), receipt.originalCurrency),
    ]);
  }
  rows.push(
    ["Payment Method", receipt.paymentMethod || "Chapa"],
    ["Event", receipt.eventName || "General"],
    ["Status", receipt.status || "received"],
    ["Date", receipt.date ? new Date(receipt.date).toLocaleString() : "N/A"],
  );

  autoTable(doc, {
    startY: 100,
    margin: { left: 40, right: 40 },
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 8 },
    columnStyles: {
      0: { cellWidth: 160, textColor: [90, 90, 90] },
      1: { fontStyle: "bold" },
    },
    body: rows,
  });

  const endY = (doc as any).lastAutoTable?.finalY || 120;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for your generosity.", pageWidth / 2, endY + 30, { align: "center" });

  const safeRef = (receipt.reference || "receipt").replace(/[^\w-]/g, "_");
  doc.save(`donation-receipt-${safeRef}.pdf`);
};
