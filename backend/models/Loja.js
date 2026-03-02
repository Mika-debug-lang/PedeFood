const mongoose = require("mongoose");

/* ================= LOJA ================= */

const lojaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    descricao: {
      type: String,
      required: true,
      trim: true,
    },

    imagem: {
      type: String,
      required: true,
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    donoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pendente", "aprovada", "rejeitada"],
      default: "pendente",
    },
  },
  {
    timestamps: true,
  }
);

/* ================= NORMALIZAR STATUS ================= */
/* 🔥 SEM next(), versão moderna */

lojaSchema.pre("save", function () {
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
});

module.exports = mongoose.model("Loja", lojaSchema);