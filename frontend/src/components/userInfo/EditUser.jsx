import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import styles from "./UserInfo.module.css";
import api from "../../../axiosServer";

function EditUser() {
    const { t } = useTranslation();
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                username: user.username || "",
                email: user.email || "",
                avatar: user.avatar || null,
            });
            setAvatarPreview(user.avatar || null);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, avatar: file }));
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = new FormData();
            payload.append("first_name", formData.first_name);
            payload.append("last_name", formData.last_name);
            payload.append("username", formData.username);
            payload.append("email", formData.email);
            if (formData.avatar instanceof File) {
                payload.append("avatar", formData.avatar);
            }

            const response = await api.put("/auth/", payload);

            login({ ...response.data, token: user.token });
            navigate("/");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Something went wrong!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{t("userInfo.editProfile")}</h3>
                    <button className={styles.closeBtn} onClick={() => navigate(-1)}>
                        ×
                    </button>
                </div>

                <form className={styles.content} onSubmit={handleSubmit}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarLarge}>
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div className={styles.avatarInitialsLarge}>
                                    {formData.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </div>

                    <div className={styles.infoGrid}>
                        {["firstName", "lastName", "username", "email"].map((field) => (
                            <div key={field} className={styles.infoCard}>
                                <label className={styles.infoLabel}>
                                    {t(`userInfo.${field}`)}
                                </label>
                                <input
                                    type={field === "email" ? "email" : "text"}
                                    name={field}
                                    value={
                                        field === "firstName"
                                            ? formData.first_name
                                            : field === "lastName"
                                                ? formData.last_name
                                                : formData[field]
                                    }
                                    onChange={handleChange}
                                    className={styles.inputField}
                                    disabled={isSubmitting}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.editBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : t("userInfo.save")}
                        </button>
                        <button
                            type="button"
                            className={styles.logoutBtn}
                            onClick={() => navigate(-1)}
                        >
                            {t("userInfo.cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
