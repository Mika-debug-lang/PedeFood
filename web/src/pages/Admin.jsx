import { useEffect, useState, useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import "./Admin.css";

function Admin() {
  const { user } = useContext(AuthContext);

  const [pendentes, setPendentes] = useState([]);
  const [ativas, setAtivas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://pedefood.onrender.com";

  /* ================= FUNÇÃO PRINCIPAL ================= */

  const buscarLojas = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(true);

      const resp = await fetch(`${API_URL}/lojas`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro ao buscar lojas");
        return;
      }

      const lojasPendentes = data.filter(
        (l) =>
          l.status &&
          l.status.toLowerCase() === "pendente"
      );

      const lojasAtivas = data.filter(
        (l) =>
          l.status &&
          l.status.toLowerCase() === "aprovada"
      );

      setPendentes(lojasPendentes);
      setAtivas(lojasAtivas);

    } catch (err) {
      console.error("Erro ao buscar lojas:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, user]);

  useEffect(() => {
    buscarLojas();
  }, [buscarLojas]);

  /* ================= APROVAR ================= */

  const aprovarLoja = async (id) => {
    try {
      await fetch(`${API_URL}/lojas/${id}/aprovar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      await buscarLojas();

    } catch (err) {
      console.error("Erro ao aprovar loja:", err);
    }
  };

  /* ================= DELETAR ================= */

  const deletarLoja = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta loja?")) return;

    try {
      await fetch(`${API_URL}/lojas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      await buscarLojas();

    } catch (err) {
      console.error("Erro ao excluir loja:", err);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
      </div>

      {loading && (
        <div className="admin-empty">
          <p>Carregando lojas...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ================= PENDENTES ================= */}
          <section className="admin-section">
            <h2>
              Lojas Pendentes
              <span className="admin-count">
                {pendentes.length}
              </span>
            </h2>

            {pendentes.length === 0 ? (
              <div className="admin-empty">
                <p>Nenhuma loja aguardando aprovação.</p>
              </div>
            ) : (
              <div className="admin-grid">
                {pendentes.map((loja) => (
                  <div key={loja._id} className="admin-card">
                    <div className="admin-image-wrapper">
                      <img
                        src={loja.imagem}
                        alt={loja.nome}
                        className="admin-img"
                      />
                      <span className="admin-badge pendente">
                        Pendente
                      </span>
                    </div>

                    <div className="admin-content">
                      <h3>{loja.nome}</h3>
                      <p>{loja.descricao}</p>

                      <div className="admin-actions">
                        <button
                          className="btn-approve"
                          onClick={() => aprovarLoja(loja._id)}
                        >
                          ✔ Aprovar
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => deletarLoja(loja._id)}
                        >
                          ✖ Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ================= ATIVAS ================= */}
          <section className="admin-section">
            <h2>
              Lojas Ativas
              <span className="admin-count active-count">
                {ativas.length}
              </span>
            </h2>

            {ativas.length === 0 ? (
              <div className="admin-empty">
                <p>Nenhuma loja ativa no sistema.</p>
              </div>
            ) : (
              <div className="admin-grid">
                {ativas.map((loja) => (
                  <div key={loja._id} className="admin-card active-card">
                    <div className="admin-image-wrapper">
                      <img
                        src={loja.imagem}
                        alt={loja.nome}
                        className="admin-img"
                      />
                      <span className="admin-badge ativa">
                        Ativa
                      </span>
                    </div>

                    <div className="admin-content">
                      <h3>{loja.nome}</h3>
                      <p>{loja.descricao}</p>

                      <div className="admin-actions">
                        <button
                          className="btn-delete danger"
                          onClick={() => deletarLoja(loja._id)}
                        >
                          🗑 Excluir Loja
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Admin;