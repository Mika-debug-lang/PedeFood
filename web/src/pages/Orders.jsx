import { useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import CartContext from "../context/CartContext";
import "./Cliente.css";

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
  const {
    orders,
    cancelarPedido,
    notificacao,
    limparFinalizados
  } = useContext(CartContext);

  const [cancelando, setCancelando] = useState(null);
  const socketRef = useRef(null);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!API_URL) return;

    socketRef.current = io(API_URL);

    socketRef.current.on("pedidoAtualizado", (pedidoAtualizado) => {
      console.log("Pedido atualizado:", pedidoAtualizado);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  /* ================= FORMATAR STATUS ================= */

  const formatarStatus = (status) =>
    status.replaceAll("_", " ");

  /* ================= FILTRO PARA LIMPAR ================= */

  const temFinalizados = orders.some(
    (o) => o.status === "cancelado" || o.status === "entregue"
  );

  return (
    <div className="pagina">

      {/* NOTIFICAÇÃO */}
      {notificacao && (
        <div className="popup-container">
          <div className="popup">{notificacao}</div>
        </div>
      )}

      {/* TÍTULO */}
      <div className="titulo-container">
        <img
          src="/Images/caixa.png"
          alt="Pedidos"
          className="titulo-img"
        />
        <h2 className="titulo-pedidos">
          Meus Pedidos
        </h2>
      </div>

      {/* BOTÃO LIMPAR FINALIZADOS */}
      {temFinalizados && (
        <div className="limpar-container">
          <button
            className="limpar-finalizados-btn"
            onClick={limparFinalizados}
          >
            🧹 Limpar pedidos finalizados
          </button>
        </div>
      )}

      {/* SEM PEDIDOS */}
      {orders.length === 0 ? (
        <p className="sem-pedidos">Nenhum pedido realizado.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order, index) => (
            <div key={order.id} className="order-card">

              {/* HEADER */}
              <div className="order-top">
                <h3>Pedido #{index + 1}</h3>
                <span className={`status-badge ${order.status}`}>
                  {formatarStatus(order.status)}
                </span>
              </div>

              {/* TOTAL */}
              <div className="order-body">
                <p className="total-geral">
                  Total: R$ {order.total.toFixed(2)}
                </p>
              </div>

              {/* TIMELINE */}
              <div className="timeline">

                <div className={`step ${
                  order.status !== "cancelado" ? "active" : ""
                }`}>
                  Pedido feito
                </div>

                <div className={`step ${
                  ["em_preparo","saiu_entrega","entregue"].includes(order.status)
                    ? "active"
                    : ""
                }`}>
                  Em preparo
                </div>

                <div className={`step ${
                  ["saiu_entrega","entregue"].includes(order.status)
                    ? "active"
                    : ""
                }`}>
                  Saiu
                </div>

                <div className={`step ${
                  order.status === "entregue"
                    ? "active"
                    : ""
                }`}>
                  Entregue
                </div>

              </div>

              {/* CANCELAMENTO */}
              {order.status === "pendente" && (
                <div className="cancelamento-area">
                  {cancelando !== order.id ? (
                    <button
                      className="cancelar-btn"
                      onClick={() => setCancelando(order.id)}
                    >
                      Cancelar Pedido
                    </button>
                  ) : (
                    <button
                      className="confirmar-cancelamento"
                      onClick={() => {
                        cancelarPedido(order.id, "Cancelado pelo cliente");
                        setCancelando(null);
                      }}
                    >
                      Confirmar Cancelamento
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;