const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const db = require("./database");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 3000;
const SECRET = "segredo_super_delivery";

app.use(express.json());
app.use(cors());

/* ============================= */
/* SOCKET CONNECTION */
/* ============================= */
io.on("connection", (socket) => {
  console.log("🔌 Novo usuário conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Usuário desconectado:", socket.id);
  });
});

/* ============================= */
/* REGISTER */
/* ============================= */
app.post("/register", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  db.run(
    "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
    [nome, email, senhaHash, tipo],
    function (err) {
      if (err) {
        return res.status(400).json({ erro: "Email já cadastrado" });
      }

      res.json({ mensagem: "Usuário criado com sucesso!" });
    }
  );
});

/* ============================= */
/* LOGIN */
/* ============================= */
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, usuario) => {
      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: usuario.id, tipo: usuario.tipo },
        SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        tipo: usuario.tipo,
        nome: usuario.nome,
      });
    }
  );
});

/* ============================= */
/* PEDIDOS (SEU SISTEMA ORIGINAL) */
/* ============================= */
app.post("/pedido", (req, res) => {
  const { cliente, produto } = req.body;

  if (!cliente || !produto) {
    return res.status(400).json({
      erro: "Cliente e produto são obrigatórios",
    });
  }

  const status = "pendente";

  db.run(
    "INSERT INTO pedidos (cliente, produto, status) VALUES (?, ?, ?)",
    [cliente, produto, status],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      const novoPedido = {
        id: this.lastID,
        cliente,
        produto,
        status,
      };

      io.emit("novoPedido", novoPedido);

      res.status(201).json(novoPedido);
    }
  );
});

app.get("/pedidos", (req, res) => {
  db.all("SELECT * FROM pedidos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(rows);
  });
});

app.put("/pedido/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    "UPDATE pedidos SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      io.emit("pedidoAtualizado", { id, status });

      res.json({ mensagem: "Status atualizado" });
    }
  );
});

app.delete("/pedido/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM pedidos WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    io.emit("pedidoRemovido", { id });

    res.json({ mensagem: "Pedido removido" });
  });
});

/* ============================= */
/* START SERVER */
/* ============================= */
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});