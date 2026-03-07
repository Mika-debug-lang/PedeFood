import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= CARREGAR USUÁRIO ================= */

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
        Array.isArray(parsed.roles)
      ) {

        const roles = parsed.roles.length ? parsed.roles : ["cliente"];

        const areaAtiva =
          parsed.area && roles.includes(parsed.area)
            ? parsed.area
            : roles[0];

        setUser({
          nome: parsed.nome || "",
          email: parsed.email || "",
          token: parsed.token,
          roles,
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

    if (!usuario || !usuario.token) {
      console.error("Login inválido");
      return;
    }

    const roles = Array.isArray(usuario.roles) && usuario.roles.length
      ? usuario.roles
      : ["cliente"];

    const areaAtiva =
      usuario.area && roles.includes(usuario.area)
        ? usuario.area
        : roles[0];

    const userData = {
      nome: usuario.nome || "",
      email: usuario.email || "",
      token: usuario.token,
      roles,
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

  /* ================= SINCRONIZAR ENTRE ABAS ================= */

  useEffect(() => {

    const syncLogout = (event) => {

      if (event.key === "user" && !event.newValue) {
        setUser(null);
      }

    };

    window.addEventListener("storage", syncLogout);

    return () => {
      window.removeEventListener("storage", syncLogout);
    };

  }, []);

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