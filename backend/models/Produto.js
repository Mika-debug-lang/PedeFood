const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    descricao: {
      type: String,
      default: ""
    },
    preco: {
      type: Number,
      required: true,
      min: 0
    },
    imagem: {
      type: String,
      default: ""
    },
    lojaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loja",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Produto", produtoSchema);