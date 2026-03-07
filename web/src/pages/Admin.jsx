import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Admin.css";

function Admin() {

  const { user, loading: authLoading, trocarArea } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pendentes, setPendentes] = useState([]);
  const [ativas, setAtivas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://pedefood-2.onrender.com";

  /* ================= PROTEÇÃO ================= */

  useEffect(() => {

    if (!authLoading) {

      if (!user) {
        navigate("/login");
        return;
      }

      if (!user.roles?.includes("admin")) {
        navigate("/");
      }

    }

  }, [user, authLoading, navigate]);

  /* ================= BUSCAR LOJAS ================= */

  const buscarLojas = useCallback(async () => {

    if (!user?.token) return;

    try {

      setLoading(true);

      const resp = await fetch(`${API_URL}/lojas`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      const data = await resp.json();

      if (!resp.ok) return;

      setPendentes(
        data.filter(l => l.status?.toLowerCase() === "pendente")
      );

      setAtivas(
        data.filter(l => l.status?.toLowerCase() === "aprovada")
      );

    } catch (err) {

      console.error("Erro ao buscar lojas:", err);

    } finally {

      setLoading(false);

    }

  }, [API_URL, user]);

  useEffect(() => {

    if (user?.roles?.includes("admin")) {
      buscarLojas();
    }

  }, [buscarLojas, user]);

  /* ================= AÇÕES ================= */

  const aprovarLoja = async (id) => {

    try {

      await fetch(`${API_URL}/lojas/${id}/aprovar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      buscarLojas();

    } catch (err) {

      console.error(err);

    }

  };

  const deletarLoja = async (id) => {

    if (!window.confirm("Excluir loja?")) return;

    try {

      await fetch(`${API_URL}/lojas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      buscarLojas();

    } catch (err) {

      console.error(err);

    }

  };

  if (authLoading || !user?.roles?.includes("admin")) return null;

  return (
    <div className={`admin-layout ${menuOpen ? "sidebar-open" : ""}`}>

      {/* BOTÃO MENU MOBILE */}

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* ================= CONTEÚDO ================= */}

      <div className="admin-content-area">

        <h1>Painel Administrativo</h1>

        {loading && <p>Carregando...</p>}

        {!loading && (

          <>

            {/* ================= PENDENTES ================= */}

            <section>

              <h2>Lojas Pendentes ({pendentes.length})</h2>

              <div className="admin-grid">

                {pendentes.map((loja) => (

                  <div key={loja._id} className="admin-card">

                    <img
                      src={loja.imagem || "/placeholder.png"}
                      alt={loja.nome}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />

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

            {/* ================= ATIVAS ================= */}

            <section>

              <h2>Lojas Ativas ({ativas.length})</h2>

              <div className="admin-grid">

                {ativas.map((loja) => (

                  <div key={loja._id} className="admin-card">

                    <img
                      src={loja.imagem || "/placeholder.png"}
                      alt={loja.nome}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />

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

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <h3>Acessos</h3>

        <button
          onClick={() => {
            trocarArea("cliente");
            navigate("/cliente");
            setMenuOpen(false);
          }}
        >
          Área Cliente
        </button>

        <button
          onClick={() => {
            trocarArea("dono");
            navigate("/dono");
            setMenuOpen(false);
          }}
        >
          Área Dono
        </button>

        <button
          onClick={() => {
            trocarArea("motoboy");
            navigate("/motoboy");
            setMenuOpen(false);
          }}
        >
          Área Motoboy
        </button>

      </aside>

    </div>
  );

}

export default Admin;