import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Login.css";

function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://pedefood-2.onrender.com";

  const entrar = async (e) => {

    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErro(data?.erro || "Erro ao fazer login");
        return;
      }

      if (!data?.token) {
        setErro("Erro inesperado no login.");
        return;
      }

      const roles = Array.isArray(data.roles) ? data.roles : [];

      const usuario = {
        nome: data.nome || "",
        email: data.email || email,
        roles,
        token: data.token
      };

      login(usuario);

      // 🔥 prioridade de acesso
      const prioridade = ["admin", "dono", "motoboy", "cliente"];

      const destino = prioridade.find(role => roles.includes(role));

      if (destino) {
        navigate(`/${destino}`);
      } else {
        navigate("/");
      }

    } catch (err) {

      console.error("Erro no login:", err);
      setErro("Erro de conexão com o servidor");

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