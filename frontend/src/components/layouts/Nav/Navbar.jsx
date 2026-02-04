import { useTheme } from "../../../context/ThemeContext";
import { useLanguage } from "../../../context/LanguageContext";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import styles from "./Navbar.module.css";
import { useAuth } from "../../../context/AuthContext";

function Navbar({ onUserInfoClick }) {
    const { theme, toggleTheme } = useTheme();
    const { changeLanguage } = useLanguage();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const { user } = useAuth();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const tooltipRef = useRef(null);

    const getInitials = (name) => {
        if (!name) return "U";
        const names = name.split(" ");
        return names.length >= 2
            ? names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
            : name.charAt(0).toUpperCase();
    };

    return (
        <nav
            className="navbar navbar-expand shadow-sm sticky-top"
            style={{ backgroundColor: "var(--bg-color)", zIndex: 1030, padding: "5px 10%" }}
        >
            <div className="container-fluid">
                {!user ? (
                    <span className="fw-bold highlight fs-3">{t("navbar.welcome")}</span>
                ) : (
                    <div className={styles.avatarContainer}>
                        <div
                            ref={tooltipRef}
                            className={styles.avatarWrapper}
                            onClick={onUserInfoClick}
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title={t("navbar.userInfo")}
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt="User Avatar" className={styles.avatar} />
                            ) : (
                                <div className={styles.avatarInitials}>
                                    {getInitials(user.first_name || user.name || user.username)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <ul className={`navbar-nav d-flex align-items-center gap-2 ${isArabic ? "me-0" : "ms-auto"}`}>
                    <li className="nav-item">
                        <button onClick={toggleTheme} className={styles.themeBtn}>
                            {theme === "light" ? "🌙" : "☀️"}
                        </button>
                    </li>

                    <li className="nav-item dropdown" ref={dropdownRef}>
                        <button
                            className={`btn btn-outline-secondary dropdown-toggle ${styles.langBtn}`}
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                        >
                            {i18n.language === "ar" ? "عربي" : "EN"}
                        </button>
                        <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}
                            style={{
                                position: "absolute",
                                right: isArabic ? "auto" : "0",
                                left: isArabic ? "0" : "auto"
                            }}>
                            <li><button className="dropdown-item" onClick={() => {
                                changeLanguage("en");
                                setIsDropdownOpen(false);
                            }}>EN</button></li>
                            <li><button className="dropdown-item" onClick={() => {
                                changeLanguage("ar");
                                setIsDropdownOpen(false);
                            }}>عربي</button></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;