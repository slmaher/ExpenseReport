import { createContext, useContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    const token = cookies.authToken;

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [cookies]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setCookie("authToken", userData.token, { path: "/" });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    removeCookie("authToken", { path: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token: cookies.authToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
