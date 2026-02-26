import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://delivery-backend.onrender.com";
// 🔥 IMPORTANTE: use 127.0.0.1 para evitar conflito localhost/ipv6

function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("cliente");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const validarEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const cadastrar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("Digite um email válido.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha, tipo })
      });

      // 🔥 PROTEÇÃO EXTRA
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setErro(errorData?.erro || "Erro ao registrar.");
        return;
      }

      alert("Conta criada com sucesso!");
      navigate("/");

    } catch (error) {
      console.error("ERRO COMPLETO:", error);
      setErro("Servidor indisponível. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={cadastrar}>
        <h2>Criar Conta</h2>

        {erro && <p style={styles.error}>{erro}</p>}

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={styles.input}
        />

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

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={styles.input}
        >
          <option value="cliente">Cliente</option>
          <option value="dono">Dono</option>
          <option value="motoboy">Motoboy</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>

        <p style={styles.link} onClick={() => navigate("/")}>
          Já tem conta? Entrar
        </p>
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
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2c7be5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold"
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px"
  },
  link: {
    marginTop: "15px",
    color: "#2c7be5",
    cursor: "pointer",
    fontSize: "14px"
  }
};

export default Register;