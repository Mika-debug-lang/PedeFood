import { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import "./Cliente.css";

function Orders() {
  const { orders, cancelarPedido } = useContext(CartContext);
  const [cancelando, setCancelando] = useState(null);

  const motivos = [
    "Preço muito alto",
    "Prazo de entrega longo",
    "Erro no endereço",
    "Pedido duplicado",
    "Mudança de ideia",
    "Forma de pagamento incorreta",
    "Problema no cartão",
    "Produto errado",
    "Quantidade incorreta",
    "Não é mais necessário",
    "Problema pessoal",
    "Endereço incompleto",
    "Encontrou mais barato",
    "Problema técnico no app",
    "Entrega muito cara",
    "Demora na confirmação",
    "Outro motivo"
  ];

  return (
    <div className="pagina">
      <h2>📦 Meus Pedidos</h2>

      {orders.length === 0 ? (
        <p>Nenhum pedido realizado.</p>
      ) : (
        <div className="orders-grid">
          {orders
            .sort((a, b) => a.criadoEm - b.criadoEm)
            .map((order, index) => (
              <div key={order.id} className="order-card">
                <h3>Pedido #{index + 1}</h3>

                <p><strong>Cliente:</strong> {order.cliente}</p>
                <p>Status: {order.status}</p>
                <p>Pagamento: {order.pagamento}</p>
                <p>Entrega: {order.entrega}</p>
                <p>Frete: R$ {order.frete.toFixed(2)}</p>
                <p>Total: R$ {order.total.toFixed(2)}</p>

                <p>
                  Tempo:{" "}
                  {Math.floor(
                    (new Date() - new Date(order.criadoEm)) / 1000
                  )} segundos atrás
                </p>

                {order.status === "cancelado" && (
                  <p><strong>Motivo:</strong> {order.motivo}</p>
                )}

                {order.status === "pendente" && (
                  <button
                    className="cancelar-btn"
                    onClick={() => setCancelando(order.id)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {cancelando && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Motivo do Cancelamento</h3>
            {motivos.map((m, i) => (
              <button
                key={i}
                onClick={() => {
                  cancelarPedido(cancelando, m);
                  setCancelando(null);
                }}
              >
                {m}
              </button>
            ))}
            <button
              className="fechar"
              onClick={() => setCancelando(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;