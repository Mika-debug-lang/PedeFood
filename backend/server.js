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
/* CORS CONFIGURADO CORRETAMENTE */
/* ============================= */

const allowedOrigins = [
  "https://pede-food.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origin (ex: Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Não permitido pelo CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ============================= */
/* VERIFICA VARIÁVEIS IMPORTANTES */
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
    console.error("❌ Erro ao conectar no MongoDB:", err.message);
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
    status: {
      type: String,
      default: "pendente",
    },
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);
const Pedido = mongoose.model("Pedido", pedidoSchema);

/* ============================= */
/* MIDDLEWARE DE AUTENTICAÇÃO */
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
  } catch (error) {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}

/* ============================= */
/* ROTAS */
/* ============================= */

app.get("/", (req, res) => {
  res.json({ mensagem: "API do Delivery funcionando 🚀" });
});

/* ============================= */
/* REGISTER */
/* ============================= */

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
      mensagem: "Usuário criado com sucesso!",
      id: novoUsuario._id,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/* ============================= */
/* LOGIN */
/* ============================= */

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
      tipo: usuario.tipo,
      nome: usuario.nome,
      email: usuario.email,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/* ============================= */
/* PEDIDOS (PROTEGIDO) */
/* ============================= */

app.post("/pedido", autenticarToken, async (req, res) => {
  try {
    const { cliente, produto } = req.body;

    if (!cliente || !produto) {
      return res.status(400).json({
        erro: "Cliente e produto são obrigatórios",
      });
    }

    const novoPedido = await Pedido.create({
      cliente,
      produto,
    });

    res.status(201).json(novoPedido);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get("/pedidos", autenticarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.put("/pedido/:id", autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ erro: "Status é obrigatório" });
    }

    await Pedido.findByIdAndUpdate(id, { status });

    res.json({ mensagem: "Status atualizado" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.delete("/pedido/:id", autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;

    await Pedido.findByIdAndDelete(id);

    res.json({ mensagem: "Pedido removido" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/* ============================= */
/* INICIAR SERVIDOR */
/* ============================= */

const PORT = process.env.PORT || 10000;

conectarMongo().then(() => {
  app.listen(PORT, () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
  });
});

module.exports = app;