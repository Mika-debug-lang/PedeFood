const mongoose = require("mongoose");

/* ================= LOJA ================= */

const lojaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    descricao: {
      type: String,
      required: true,
      trim: true
    },

    imagem: {
      type: String,
      default: ""
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },

    donoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["pendente", "aprovada", "rejeitada"],
      default: "pendente",
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* ================= NORMALIZAÇÃO ================= */

lojaSchema.pre("save", function () {

  if (this.status && typeof this.status === "string") {
    this.status = this.status.toLowerCase().trim();
  }

  if (this.categoria && typeof this.categoria === "string") {
    this.categoria = this.categoria.toLowerCase().trim();
  }

});

/* ================= EXPORT ================= */

module.exports = mongoose.model("Loja", lojaSchema);