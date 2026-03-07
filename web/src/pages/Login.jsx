import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Login.css";

function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [area, setArea] = useState("cliente");

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://pedefood-2.onrender.com";

  const entrar = async (e) => {

    e.preventDefault();
    setErro("");

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setErro("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailLimpo,
          senha: senhaLimpa
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setErro(data?.erro || "Erro ao fazer login");
        return;
      }

      if (!data?.token) {
        setErro("Erro inesperado no login.");
        return;
      }

      /* ================= NORMALIZAR ROLES ================= */

      const roles =
        Array.isArray(data.roles) && data.roles.length > 0
          ? data.roles
          : ["cliente"];

      /* ================= VERIFICAR SE PODE ENTRAR NA ÁREA ================= */

      if (!roles.includes(area)) {
        setErro(`Você não possui acesso como ${area}`);
        return;
      }

      /* ================= USUÁRIO ================= */

      const usuario = {
        nome: data.nome || "",
        email: data.email || emailLimpo,
        roles,
        areaAtual: area, // 🔥 área escolhida
        token: data.token
      };

      login(usuario);

      navigate(`/${area}`);

    } catch (err) {

      console.error("Erro no login:", err);

      if (err.name === "AbortError") {
        setErro("Servidor demorou para responder.");
      } else {
        setErro("Erro de conexão com o servidor");
      }

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="login-container">

      <div className="login-card">

        <h2 className="login-title">Bem-vindo</h2>

        <p className="login-subtitle">
          Faça login para continuar
        </p>

        {erro && <div className="login-error">{erro}</div>}

        <form onSubmit={entrar} className="login-form">

          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {/* SELEÇÃO DE ÁREA */}

          <select
              className="login-select"
              value={area}
              onChange={(e) => setArea(e.target.value)}
           >

            <option value="cliente">
              Entrar como Cliente
            </option>

            <option value="dono">
              Entrar como Dono
            </option>

            <option value="motoboy">
              Entrar como Motoboy
            </option>

          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <div className="login-links">

          <span onClick={() => navigate("/register")}>
            Criar conta
          </span>

          <span onClick={() => navigate("/forgotpassword")}>
            Esqueceu a senha?
          </span>

        </div>

      </div>

    </div>
  );
}

export default Login;