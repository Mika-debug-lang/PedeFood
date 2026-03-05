require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

const Loja = require("./models/Loja");
const Produto = require("./models/Produto");

const app = express();

/* ================= CONFIG ================= */

const ROLES_PUBLICAS = ["cliente", "dono", "motoboy"];
const TODAS_ROLES = ["cliente", "dono", "motoboy", "admin"];

/* ================= CORS ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pede-food.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

/* ================= VALIDAÇÕES ENV ================= */

["MONGO_URL", "JWT_SECRET", "ADMIN_EMAIL"].forEach((env) => {
  if (!process.env[env]) {
    console.error(`${env} não definida`);
    process.exit(1);
  }
});

/* ================= CONEXÃO ================= */

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch((err) => {
    console.error("Erro Mongo:", err);
    process.exit(1);
  });

/* ================= MODEL USUÁRIO ================= */

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    roles: {
      type: [String],
      enum: TODAS_ROLES,
      default: ["cliente"],
    },
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

/* ================= MIDDLEWARE ================= */

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ erro: "Token não fornecido" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id: decoded.id,
      roles: decoded.roles || [],
    };

    next();
  } catch {
    return res.status(403).json({ erro: "Token inválido" });
  }
}

function autorizarRoles(rolesPermitidas) {
  return (req, res, next) => {
    const permitido = rolesPermitidas.some((role) =>
      req.usuario.roles.includes(role)
    );

    if (!permitido)
      return res.status(403).json({ erro: "Acesso negado" });

    next();
  };
}

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo)
      return res.status(400).json({ erro: "Preencha todos os campos" });

    if (!ROLES_PUBLICAS.includes(tipo))
      return res.status(400).json({ erro: "Tipo inválido" });

    const emailNormalizado = email.trim().toLowerCase();

    let usuario = await Usuario.findOne({ email: emailNormalizado });

    if (usuario) {

      if (usuario.roles.includes(tipo))
        return res
          .status(400)
          .json({ erro: `Usuário já possui '${tipo}'` });

      usuario.roles.push(tipo);
      await usuario.save();

      return res.json({
        mensagem: `Permissão '${tipo}' adicionada com sucesso`,
        roles: usuario.roles,
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email: emailNormalizado,
      senha: senhaHash,
      roles: [tipo],
    });

    res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      roles: novoUsuario.roles,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  try {

    const { email, senha } = req.body;

    if (!email || !senha)
      return res.status(400).json({ erro: "Campos obrigatórios" });

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!usuario)
      return res.status(400).json({ erro: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida)
      return res.status(401).json({ erro: "Senha incorreta" });

    // ADMIN AUTOMÁTICO
    if (usuario.email === process.env.ADMIN_EMAIL) {
      if (!usuario.roles.includes("admin")) {
        usuario.roles.push("admin");
        await usuario.save();
      }
    }

    const token = jwt.sign(
      {
        id: usuario._id.toString(),
        roles: usuario.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      nome: usuario.nome,
      email: usuario.email,
      roles: usuario.roles,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* ================= PRODUTOS ================= */

app.get("/produtos/:lojaId", async (req, res) => {
  const produtos = await Produto.find({
    lojaId: req.params.lojaId,
  }).sort({ createdAt: -1 });

  res.json(produtos);
});

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

/* ================= START ================= */

app.listen(process.env.PORT || 10000, () =>
  console.log("Servidor rodando 🚀")
);