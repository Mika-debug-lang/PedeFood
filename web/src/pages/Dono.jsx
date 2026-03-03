import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";
import "./Dono.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://pedefood.onrender.com";

function Dono() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const cartContext = useContext(CartContext);

  const orders = cartContext?.orders ?? [];
  const atualizarStatus = cartContext?.atualizarStatus;

  const navigate = useNavigate();
  const [minhaLoja, setMinhaLoja] = useState(null);

  /* ================= LOGOUT ================= */

  const sair = () => {
    logout();
    navigate("/login");
  };

  /* ================= PROTEÇÃO ================= */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.tipo !== "dono") {
      navigate(`/${user.tipo}`);
    }
  }, [user, authLoading, navigate]);

  /* ================= BUSCAR LOJA ================= */

  useEffect(() => {
    if (!user?.token || user.tipo !== "dono") return;

    const buscarLoja = async () => {
      try {
        const response = await fetch(`${API_URL}/lojas/minha`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.status === 404) {
          setMinhaLoja(null);
          return;
        }

        const data = await response.json();

        if (response.ok) {
          setMinhaLoja(data);
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
      }
    };

    buscarLoja();
  }, [user?.token, user?.tipo]);

  /* ================= EXCLUIR LOJA ================= */

  const excluirLoja = async () => {
    if (!minhaLoja) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua loja?"
    );

    if (!confirmar) return;

    try {
      await fetch(`${API_URL}/lojas/${minhaLoja._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setMinhaLoja(null);
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
    }
  };

  if (authLoading || !user || user.tipo !== "dono") return null;

  return (
    <div className="dono-container">

      {/* ================= HEADER ================= */}

      <div className="dono-header">
        <div className="dono-title">
          <img
            src="/Images/dono.png"
            alt="Ícone"
            className="dono-icon"
          />
          <div>
            <h1>Painel do Dono</h1>
            <p>Gerencie sua loja e pedidos</p>
          </div>
        </div>

        <button className="btn-sair" onClick={sair}>
          Sair
        </button>
      </div>

      {/* ================= LOJA ================= */}

      {minhaLoja && (
        <div className="criar-loja-box">

          <h2>{minhaLoja.nome}</h2>

          {/* 🔥 IMAGEM CAPA */}
          {minhaLoja.imagem && (
            <div className="loja-capa-container">
              <img
                src={minhaLoja.imagem}
                alt={minhaLoja.nome}
                className="loja-capa"
              />
            </div>
          )}

          <span className={`status-badge ${minhaLoja.status}`}>
            {minhaLoja.status}
          </span>

          <div className="loja-actions">
            <button
              className="btn-excluir"
              onClick={excluirLoja}
            >
              Excluir Loja
            </button>
          </div>

        </div>
      )}

      {/* ================= PEDIDOS ================= */}

      <div className="pedidos-section">
        <h2>Pedidos Recebidos</h2>

        {orders.length === 0 ? (
          <div className="sem-pedidos">
            <h3>Nenhum pedido disponível</h3>
          </div>
        ) : (
          <div className="dono-grid">
            {orders.map((order, index) => {
              const status = order.status ?? "pendente";
              const id = order._id ?? order.id;

              return (
                <div key={id ?? index} className="dono-card">
                  <div className="pedido-top">
                    <h3>Pedido #{index + 1}</h3>
                    <span className={`status-badge ${status}`}>
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="pedido-actions">

                    {status === "pendente" && atualizarStatus && (
                      <button
                        className="btn-preparo"
                        onClick={() =>
                          atualizarStatus(id, "em_preparo")
                        }
                      >
                        Iniciar Preparo
                      </button>
                    )}

                    {status === "em_preparo" && atualizarStatus && (
                      <button
                        className="btn-entrega"
                        onClick={() =>
                          atualizarStatus(id, "saiu_entrega")
                        }
                      >
                        Saiu para Entrega
                      </button>
                    )}

                    {status === "saiu_entrega" && atualizarStatus && (
                      <button
                        className="btn-confirmar"
                        onClick={() =>
                          atualizarStatus(id, "entregue")
                        }
                      >
                        Confirmar Entrega
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dono;