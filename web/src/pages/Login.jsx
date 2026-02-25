import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 URL da API (produção ou local)
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  const validarEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const entrar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("Digite um email válido.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      // 🔥 Evita erro se backend não responder JSON válido
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Resposta inválida do servidor.");
      }

      if (!response.ok) {
        setErro(data?.erro || "Erro ao fazer login.");
        return;
      }

      if (!data?.token) {
        setErro("Token não recebido do servidor.");
        return;
      }

      const usuarioFormatado = {
        id: data.id || null,
        nome: data.nome || "",
        email: data.email || email,
        tipo: data.tipo || "cliente",
        token: data.token
      };

      login(usuarioFormatado);

      // 🔥 Redirecionamento por tipo
      switch (data.tipo) {
        case "cliente":
          navigate("/cliente");
          break;
        case "dono":
          navigate("/dono");
          break;
        case "motoboy":
          navigate("/motoboy");
          break;
        default:
          navigate("/");
      }

    } catch (err) {
      console.error("Erro no login:", err);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={entrar}>
        <h2 style={styles.title}>Entrar na sua conta</h2>

        {erro && <p style={styles.error}>{erro}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={styles.input}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div style={styles.links}>
          <span onClick={() => navigate("/register")}>
            Criar conta
          </span>

          <span onClick={() => navigate("/forgot")}>
            Esqueceu a senha?
          </span>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f9"
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#e60023",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    transition: "0.2s"
  },
  links: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#e60023",
    cursor: "pointer"
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px"
  }
};

export default Login;