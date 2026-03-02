require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

const Loja = require("./models/Loja");
const Produto = require("./models/Produto");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: true, credentials: true }));

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

/* ================= MODELS INTERNOS ================= */

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    roles: { type: [String], default: ["cliente"] },
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

    // 🔥 GARANTE ID COMO STRING
    req.usuario = {
      id: decoded.id?.toString(),
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

    if (tipo === "admin")
      return res.status(403).json({ erro: "Tipo inválido" });

    const emailNormalizado = email.trim().toLowerCase();
    let usuario = await Usuario.findOne({ email: emailNormalizado });

    if (usuario) {
      if (usuario.roles.includes(tipo))
        return res
          .status(400)
          .json({ erro: `Usuário já cadastrado como ${tipo}` });

      usuario.roles.push(tipo);
      await usuario.save();
      return res.json({ mensagem: `Permissão '${tipo}' adicionada!` });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email: emailNormalizado,
      senha: senhaHash,
      roles: [tipo],
    });

    res.status(201).json({ mensagem: "Usuário criado!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;

    if (!email || !senha || !tipo)
      return res.status(400).json({ erro: "Campos obrigatórios" });

    const usuario = await Usuario.findOne({
      email: email.toLowerCase(),
    });

    if (!usuario)
      return res.status(400).json({ erro: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida)
      return res.status(401).json({ erro: "Senha incorreta" });

    if (usuario.email === process.env.ADMIN_EMAIL) {
      if (!usuario.roles.includes("admin")) {
        usuario.roles.push("admin");
        await usuario.save();
      }
    }

    if (!usuario.roles.includes(tipo))
      return res
        .status(403)
        .json({ erro: "Acesso negado para essa área" });

    const token = jwt.sign(
      { id: usuario._id.toString(), roles: usuario.roles },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      nome: usuario.nome,
      email: usuario.email,
      tipo,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

/* ================= LOJAS ================= */

app.get("/lojas/ativas", async (req, res) => {
  const lojas = await Loja.find({ status: "aprovada" }).sort({
    createdAt: -1,
  });

  res.json(lojas);
});

app.get(
  "/lojas/minha",
  autenticarToken,
  autorizarRoles(["dono"]),
  async (req, res) => {
    const loja = await Loja.findOne({
      donoId: req.usuario.id,
    });

    res.json(loja || null);
  }
);

app.get("/lojas/:id", async (req, res) => {
  const loja = await Loja.findById(req.params.id);

  if (!loja)
    return res.status(404).json({ erro: "Loja não encontrada" });

  res.json(loja);
});

app.post(
  "/lojas",
  autenticarToken,
  autorizarRoles(["dono"]),
  async (req, res) => {
    const { nome, descricao, imagem, categoria } = req.body;

    if (!nome || !descricao || !imagem || !categoria)
      return res.status(400).json({ erro: "Campos obrigatórios" });

    const novaLoja = await Loja.create({
      nome: nome.trim(),
      descricao: descricao.trim(),
      imagem,
      categoria: categoria.toLowerCase().trim(),
      donoId: req.usuario.id,
      status: "pendente",
    });

    res.status(201).json(novaLoja);
  }
);

/* 🔥 PUT CORRIGIDO E SEGURO */
app.put(
  "/lojas/:id",
  autenticarToken,
  autorizarRoles(["dono"]),
  async (req, res) => {
    const loja = await Loja.findById(req.params.id);

    if (!loja)
      return res.status(404).json({ erro: "Loja não encontrada" });

    if (loja.donoId.toString() !== req.usuario.id)
      return res.status(403).json({ erro: "Não autorizado" });

    const { nome, descricao, categoria, imagem } = req.body;

    if (!nome || !descricao || !categoria)
      return res.status(400).json({ erro: "Campos obrigatórios" });

    loja.nome = nome.trim();
    loja.descricao = descricao.trim();
    loja.categoria = categoria.toLowerCase().trim();
    loja.imagem = imagem || loja.imagem;

    await loja.save();

    res.json(loja);
  }
);

app.delete(
  "/lojas/:id",
  autenticarToken,
  autorizarRoles(["admin", "dono"]),
  async (req, res) => {
    const loja = await Loja.findById(req.params.id);

    if (!loja)
      return res.status(404).json({ erro: "Loja não encontrada" });

    if (
      req.usuario.roles.includes("dono") &&
      loja.donoId.toString() !== req.usuario.id
    )
      return res.status(403).json({ erro: "Não autorizado" });

    await Produto.deleteMany({ lojaId: req.params.id });
    await Loja.findByIdAndDelete(req.params.id);

    res.json({ mensagem: "Loja deletada com sucesso" });
  }
);

/* ================= PRODUTOS ================= */

app.post(
  "/produtos",
  autenticarToken,
  autorizarRoles(["dono"]),
  async (req, res) => {
    const { nome, descricao, preco, imagem, lojaId } = req.body;

    if (!nome || !preco || !lojaId)
      return res.status(400).json({ erro: "Campos obrigatórios" });

    const loja = await Loja.findById(lojaId);

    if (!loja)
      return res.status(404).json({ erro: "Loja não encontrada" });

    if (loja.donoId.toString() !== req.usuario.id)
      return res.status(403).json({ erro: "Não autorizado" });

    const produto = await Produto.create({
      nome: nome.trim(),
      descricao: descricao?.trim() || "",
      preco,
      imagem: imagem || "",
      lojaId,
    });

    res.status(201).json(produto);
  }
);

app.get("/produtos/:lojaId", async (req, res) => {
  const produtos = await Produto.find({
    lojaId: req.params.lojaId,
  }).sort({ createdAt: -1 });

  res.json(produtos);
});

/* ================= START ================= */

app.listen(process.env.PORT || 10000, () =>
  console.log("Servidor rodando")
);