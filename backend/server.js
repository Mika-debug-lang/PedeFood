require("dotenv").config()

const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()

app.use(express.json())
app.use(cors())

/* ============================= */
/* VERIFICA VARIÁVEIS IMPORTANTES */
/* ============================= */

if (!process.env.MONGO_URL) {
  console.error("MONGO_URL não definida")
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não definida")
  process.exit(1)
}

/* ============================= */
/* CONEXÃO MONGODB */
/* ============================= */

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado 🚀"))
  .catch(err => {
    console.error("Erro ao conectar no MongoDB:", err)
    process.exit(1)
  })

/* ============================= */
/* MODELS */
/* ============================= */

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
  tipo: { type: String, required: true }
})

const pedidoSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  produto: { type: String, required: true },
  status: {
    type: String,
    default: "pendente"
  }
})

const Usuario = mongoose.model("Usuario", usuarioSchema)
const Pedido = mongoose.model("Pedido", pedidoSchema)

/* ============================= */
/* ROTA TESTE */
/* ============================= */

app.get("/", (req, res) => {
  res.json({ mensagem: "API do Delivery funcionando 🚀" })
})

/* ============================= */
/* REGISTER */
/* ============================= */

app.post("/register", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ erro: "Body não enviado" })
    }

    const { nome, email, senha, tipo } = req.body

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ erro: "Preencha todos os campos" })
    }

    const usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Email já cadastrado" })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      tipo
    })

    res.json({ mensagem: "Usuário criado com sucesso!" })

  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

/* ============================= */
/* LOGIN */
/* ============================= */

app.post("/login", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ erro: "Body não enviado" })
    }

    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" })
    }

    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado" })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta" })
    }

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({
      token,
      tipo: usuario.tipo,
      nome: usuario.nome,
    })

  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

/* ============================= */
/* PEDIDOS */
/* ============================= */

app.post("/pedido", async (req, res) => {
  try {
    const { cliente, produto } = req.body

    if (!cliente || !produto) {
      return res.status(400).json({
        erro: "Cliente e produto são obrigatórios",
      })
    }

    const novoPedido = await Pedido.create({
      cliente,
      produto
    })

    res.status(201).json(novoPedido)

  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

app.get("/pedidos", async (req, res) => {
  try {
    const pedidos = await Pedido.find()
    res.json(pedidos)
  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

app.put("/pedido/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    await Pedido.findByIdAndUpdate(id, { status })

    res.json({ mensagem: "Status atualizado" })

  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

app.delete("/pedido/:id", async (req, res) => {
  try {
    const { id } = req.params

    await Pedido.findByIdAndDelete(id)

    res.json({ mensagem: "Pedido removido" })

  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

/* ============================= */
/* INICIAR SERVIDOR */
/* ============================= */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})

module.exports = app