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

      // 🔎 Validação segura
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.token &&
        Array.isArray(parsed.roles) &&
        parsed.roles.length > 0
      ) {
        setUser(parsed);
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
      !Array.isArray(usuario.roles)
    ) {
      console.error("Tentativa de login inválida");
      return;
    }

    // 🔥 Se não vier tipo, define o primeiro role como ativo
    const tipoAtivo =
      usuario.tipo && usuario.roles.includes(usuario.tipo)
        ? usuario.tipo
        : usuario.roles[0];

    const userData = {
      nome: usuario.nome,
      email: usuario.email,
      token: usuario.token,
      roles: usuario.roles,
      tipo: tipoAtivo, // área atual ativa
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /* ================= TROCAR ROLE ATIVA ================= */

  const trocarTipo = (novoTipo) => {
    if (!user || !user.roles.includes(novoTipo)) return;

    const atualizado = { ...user, tipo: novoTipo };
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
        trocarTipo, // 🔥 novo recurso
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;