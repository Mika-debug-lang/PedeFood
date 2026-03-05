import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://pedefood-2.onrender.com";

function Register() {

  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("cliente");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const validarEmail = (emailValue) => {
    return /\S+@\S+\.\S+/.test(emailValue);
  };

  const validarSenha = (senhaValue) => {
    return senhaValue.length >= 6;
  };

  const cadastrar = async (e) => {

    e.preventDefault();
    setErro("");

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!nomeLimpo || !emailLimpo || !senhaLimpa) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!validarEmail(emailLimpo)) {
      setErro("Digite um email válido.");
      return;
    }

    if (!validarSenha(senhaLimpa)) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (tipo === "admin") {
      setErro("Tipo inválido.");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeLimpo,
          email: emailLimpo,
          senha: senhaLimpa,
          tipo
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErro(data?.erro || "Erro ao registrar.");
        return;
      }

      alert(data?.mensagem || "Conta criada com sucesso!");

      // 🔥 ir direto para login
      navigate("/login");

    } catch (error) {

      console.error("Erro completo:", error);
      setErro("Erro de conexão com o servidor.");

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
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={styles.input}
          required
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

        <p style={styles.link} onClick={() => navigate("/login")}>
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