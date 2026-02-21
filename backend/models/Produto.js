const mongoose = require("mongoose")

const produtoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  descricao: String,
  criadoEm: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Produto", produtoSchema)