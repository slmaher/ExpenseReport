import { createContext, useContext, useEffect } from "react";
import i18n from "../i18n/i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);

    if (lng === "ar") {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    changeLanguage(savedLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
