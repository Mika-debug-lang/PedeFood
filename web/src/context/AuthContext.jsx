import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= CARREGAR DO LOCALSTORAGE ================= */

  useEffect(() => {

    try {

      const saved = localStorage.getItem("user");

      if (!saved) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.token &&
        Array.isArray(parsed.roles) &&
        parsed.roles.length > 0
      ) {

        const areaAtiva =
          parsed.area && parsed.roles.includes(parsed.area)
            ? parsed.area
            : parsed.roles[0] || "cliente";

        setUser({
          nome: parsed.nome,
          email: parsed.email,
          token: parsed.token,
          roles: parsed.roles,
          area: areaAtiva
        });

      } else {

        localStorage.removeItem("user");

      }

    } catch (error) {

      console.error("Erro ao ler localStorage:", error);
      localStorage.removeItem("user");

    } finally {

      setLoading(false);

    }

  }, []);

  /* ================= LOGIN ================= */

  const login = (usuario) => {

    if (
      !usuario ||
      !usuario.token ||
      !Array.isArray(usuario.roles) ||
      usuario.roles.length === 0
    ) {
      console.error("Tentativa de login inválida");
      return;
    }

    const areaAtiva =
      usuario.area && usuario.roles.includes(usuario.area)
        ? usuario.area
        : usuario.roles[0] || "cliente";

    const userData = {
      nome: usuario.nome || "",
      email: usuario.email || "",
      token: usuario.token,
      roles: usuario.roles,
      area: areaAtiva
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

  };

  /* ================= TROCAR ÁREA ================= */

  const trocarArea = (novaArea) => {

    if (!user) return;

    if (!user.roles.includes(novaArea)) return;

    const atualizado = {
      ...user,
      area: novaArea
    };

    setUser(atualizado);
    localStorage.setItem("user", JSON.stringify(atualizado));

  };

  /* ================= LOGOUT ================= */

  const logout = () => {

    setUser(null);
    localStorage.removeItem("user");

  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        trocarArea
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export default AuthContext;