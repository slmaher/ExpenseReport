import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./UserInfo.module.css";

function UserInfo({ onClose }) {
    const { t } = useTranslation();
    const [userInfo, setUserInfo] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setUserInfo(user);
    }, [user]);

    const getInitials = (name) => {
        if (!name) return "U";
        const names = name.split(" ");
        return names.length >= 2
            ? names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
            : name.charAt(0).toUpperCase();
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate("/login");
    };

    if (!userInfo) return null;

    const fullName = `${userInfo.first_name || userInfo.firstName || ""} ${userInfo.last_name || userInfo.lastName || ""}`.trim();
    const avatar = userInfo.avatar;

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal}`}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{t("userInfo.title")}</h3>
                    <button className={styles.closeBtn} onClick={handleClose}>×</button>
                </div>

                <div className={styles.content}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarLarge}>
                            {avatar ? (
                                <img src={avatar} alt="User Avatar" className={styles.avatarImage} />
                            ) : (
                                <div className={styles.avatarInitialsLarge}>
                                    {getInitials(fullName || userInfo.username || userInfo.name)}
                                </div>
                            )}
                        </div>
                        <h4 className={styles.userName}>
                            {fullName || userInfo.username || userInfo.name || t("userInfo.unknownUser")}
                        </h4>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>{t("userInfo.firstName")}</div>
                            <div className={styles.infoValue}>{userInfo.first_name || userInfo.firstName || t("userInfo.notAvailable")}</div>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>{t("userInfo.lastName")}</div>
                            <div className={styles.infoValue}>{userInfo.last_name || userInfo.lastName || t("userInfo.notAvailable")}</div>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>{t("userInfo.username")}</div>
                            <div className={styles.infoValue}>{userInfo.username || userInfo.user_name || t("userInfo.notAvailable")}</div>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>{t("userInfo.email")}</div>
                            <div className={styles.infoValue}>{userInfo.email || t("userInfo.notAvailable")}</div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.editBtn}
                            onClick={() => {
                                handleClose(); 
                                navigate("/auth");
                            }}
                        >
                            {t("userInfo.editProfile")}
                        </button>

                        <button className={styles.logoutBtn} onClick={handleLogout}>{t("userInfo.logout")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserInfo;