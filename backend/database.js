const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./delivery.db");

db.serialize(() => {
  /* ============================= */
  /* TABELA PEDIDOS */
  /* ============================= */
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT,
      produto TEXT,
      status TEXT
    )
  `);

  /* ============================= */
  /* TABELA USUÁRIOS */
  /* ============================= */
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      senha TEXT,
      tipo TEXT
    )
  `);
});

module.exports = db;