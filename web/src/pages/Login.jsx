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
    import.meta.env.VITE_API_URL || "http://localhost:10000";

  const entrar = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          senha,
          tipo: area
        })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Resposta inválida do servidor");
      }

      if (!response.ok) {
        setErro(data?.erro || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      if (!data.tipo) {
        setErro("Tipo de usuário não retornado pelo servidor.");
        setLoading(false);
        return;
      }

      // 🔐 salva usuário autenticado
      login({
        nome: data.nome,
        email: data.email,
        tipo: data.tipo,
        token: data.token
      });

      // 🚀 redireciona baseado no tipo REAL vindo do backend
      navigate(`/${data.tipo}`);

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
          Escolha a área e faça login
        </p>

        {erro && <div className="login-error">{erro}</div>}

        <form onSubmit={entrar} className="login-form">

          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />

          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="login-select"
          >
            <option value="cliente">Área do Cliente</option>
            <option value="dono">Área do Dono</option>
            <option value="motoboy">Área do Motoboy</option>

            {/* 🔥 ADMIN PARA TESTE */}
            <option value="admin">Área Administrativa</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <div className="login-links">
          <span onClick={() => navigate("/register")}>
            Criar conta
          </span>

          <span onClick={() => navigate("/forgot")}>
            Esqueceu a senha?
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;