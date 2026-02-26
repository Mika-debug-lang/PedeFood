require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ============================= */
/* CONFIGURAÇÕES INICIAIS */
/* ============================= */

app.use(express.json());

/* ============================= */
/* CORS ESTÁVEL */
/* ============================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ============================= */
/* VARIÁVEIS OBRIGATÓRIAS */
/* ============================= */

if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL não definida");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET não definida");
  process.exit(1);
}

/* ============================= */
/* CONEXÃO MONGODB */
/* ============================= */

async function conectarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  }
}

/* ============================= */
/* MODELS */
/* ============================= */

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    senha: { type: String, required: true },
    tipo: { type: String, required: true },
  },
  { timestamps: true }
);

const pedidoSchema = new mongoose.Schema(
  {
    cliente: { type: String, required: true },
    produto: { type: String, required: true },
    status: { type: String, default: "pendente" },
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);
const Pedido = mongoose.model("Pedido", pedidoSchema);

/* ============================= */
/* MIDDLEWARE TOKEN */
/* ============================= */

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}

/* ============================= */
/* ROTAS */
/* ============================= */

app.get("/", (req, res) => {
  res.json({
    status: "online",
    mensagem: "API funcionando 🚀",
  });
});

/* REGISTER */

app.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ erro: "Preencha todos os campos" });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      tipo,
    });

    res.status(201).json({
      mensagem: "Usuário criado",
      id: novoUsuario._id,
    });
  } catch (err) {
    console.error("Erro register:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* LOGIN */

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      nome: usuario.nome,
      tipo: usuario.tipo,
    });
  } catch (err) {
    console.error("Erro login:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* PEDIDOS */

app.post("/pedido", autenticarToken, async (req, res) => {
  try {
    const { cliente, produto } = req.body;

    if (!cliente || !produto) {
      return res.status(400).json({ erro: "Dados obrigatórios" });
    }

    const pedido = await Pedido.create({ cliente, produto });
    res.status(201).json(pedido);
  } catch (err) {
    console.error("Erro pedido:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

app.get("/pedidos", autenticarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    console.error("Erro pedidos:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* ============================= */
/* 404 */
/* ============================= */

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

/* ============================= */
/* INICIAR SERVIDOR */
/* ============================= */

const PORT = process.env.PORT || 10000;

async function startServer() {
  await conectarMongo();
  app.listen(PORT, () => {
    console.log("🚀 Servidor rodando na porta", PORT);
  });
}

startServer();

module.exports = app;