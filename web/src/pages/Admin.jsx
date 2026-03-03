import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Admin.css";

function Admin() {
  const { user, loading: authLoading, trocarTipo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pendentes, setPendentes] = useState([]);
  const [ativas, setAtivas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://pedefood.onrender.com";

  /* ================= PROTEÇÃO ================= */

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!user.roles?.includes("admin")) navigate("/");
    }
  }, [user, authLoading, navigate]);

  /* ================= BUSCAR LOJAS ================= */

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
      if (!resp.ok) return;

      setPendentes(data.filter(l => l.status?.toLowerCase() === "pendente"));
      setAtivas(data.filter(l => l.status?.toLowerCase() === "aprovada"));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, user]);

  useEffect(() => {
    if (user?.roles?.includes("admin")) buscarLojas();
  }, [buscarLojas, user]);

  const aprovarLoja = async (id) => {
    await fetch(`${API_URL}/lojas/${id}/aprovar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    buscarLojas();
  };

  const deletarLoja = async (id) => {
    if (!window.confirm("Excluir loja?")) return;

    await fetch(`${API_URL}/lojas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });

    buscarLojas();
  };

  if (authLoading || !user?.roles?.includes("admin")) return null;

  return (
    <div className="admin-layout">

      {/* ================= CONTEÚDO ================= */}
      <div className="admin-content-area">
        <h1>Painel Administrativo</h1>

        {loading && <p>Carregando...</p>}

        {!loading && (
          <>
            <section>
              <h2>Lojas Pendentes ({pendentes.length})</h2>
              <div className="admin-grid">
                {pendentes.map((loja) => (
                  <div key={loja._id} className="admin-card">
                    <img src={loja.imagem} alt={loja.nome} />
                    <h3>{loja.nome}</h3>
                    <p>{loja.descricao}</p>
                    <div className="admin-actions">
                      <button onClick={() => aprovarLoja(loja._id)}>
                        Aprovar
                      </button>
                      <button
                        className="danger"
                        onClick={() => deletarLoja(loja._id)}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>Lojas Ativas ({ativas.length})</h2>
              <div className="admin-grid">
                {ativas.map((loja) => (
                  <div key={loja._id} className="admin-card">
                    <img src={loja.imagem} alt={loja.nome} />
                    <h3>{loja.nome}</h3>
                    <p>{loja.descricao}</p>
                    <button
                      className="danger"
                      onClick={() => deletarLoja(loja._id)}
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* ================= MENU LATERAL ================= */}
      <aside className="admin-sidebar">
        <h3>Acessos</h3>

        {user.roles.includes("cliente") && (
          <button
            onClick={() => {
              trocarTipo("cliente");
              navigate("/cliente");
            }}
          >
            Área Cliente
          </button>
        )}

        {user.roles.includes("dono") && (
          <button
            onClick={() => {
              trocarTipo("dono");
              navigate("/dono");
            }}
          >
            Área Dono
          </button>
        )}

        {user.roles.includes("motoboy") && (
          <button
            onClick={() => {
              trocarTipo("motoboy");
              navigate("/motoboy");
            }}
          >
            Área Motoboy
          </button>
        )}
      </aside>

    </div>
  );
}

export default Admin;