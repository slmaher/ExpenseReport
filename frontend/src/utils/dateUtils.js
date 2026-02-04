// src/utils/dateUtils.js

/**
 * Extracts unique months from reports and formats them for dropdowns.
 * @param {Array} reports - Array of report objects with a 'date' field (YYYY-MM-DD).
 * @param {string} language - i18n language code (e.g., 'ar-EG', 'en-US').
 * @returns {Array<{value: string, label: string}>}
 */
export function getMonthOptions(reports, language) {
  const monthsSet = new Set(reports.map((r) => r.date.slice(0, 7)));
  const monthsArr = Array.from(monthsSet).sort();
  let locale = "en-US";
  if (language.startsWith("ar")) {
    locale = "ar-EG";
  }
  return monthsArr.map((monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    const label = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      calendar: "gregory",
    }).format(date);
    return { value: monthStr, label };
  });
}
