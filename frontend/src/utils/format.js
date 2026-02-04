export const formatDate = (dateString, language = "en") => {
  const locale = language === "ar" ? "ar-SA" : "en-US";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(locale, options);
};

export const formatCurrency = (amount, language = "en") => {
  const locale = language === "ar" ? "ar-SA" : "en-US";
  const currency = language === "ar" ? "SAR" : "USD";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};
