import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
    const { user, token } = useAuth();

    if (user && token) {
        return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/"} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
