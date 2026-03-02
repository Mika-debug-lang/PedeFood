import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");

      if (!saved) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(saved);

      // ✅ Validação mais segura
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.token &&
        parsed.tipo &&
        parsed.nome
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

  // 🔐 Login
  const login = (usuario) => {
    if (!usuario || !usuario.token || !usuario.tipo) {
      console.error("Tentativa de login inválida");
      return;
    }

    setUser(usuario);
    localStorage.setItem("user", JSON.stringify(usuario));
  };

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;