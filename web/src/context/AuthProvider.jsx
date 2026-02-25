import { useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem("userType");
  });

  const login = (type) => {
    localStorage.setItem("userType", type);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem("userType");
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;