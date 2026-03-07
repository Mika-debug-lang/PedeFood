const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      index: true
    },

    descricao: {
      type: String,
      default: "",
      trim: true
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

/* ================= NORMALIZAÇÃO ================= */

produtoSchema.pre("save", function () {

  if (this.nome) {
    this.nome = this.nome.trim();
  }

  if (this.descricao) {
    this.descricao = this.descricao.trim();
  }

});

/* ================= EXPORT ================= */

module.exports = mongoose.model("Produto", produtoSchema);