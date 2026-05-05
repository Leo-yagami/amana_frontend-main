/** Keep `<html dir>` in sync with the active i18n language (RTL for Arabic). */
export function syncDocumentDirection(language: string) {
  const base = (language || "en").split("-")[0];
  document.documentElement.setAttribute("dir", base === "ar" ? "rtl" : "ltr");
}
