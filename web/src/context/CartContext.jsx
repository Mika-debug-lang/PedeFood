import { createContext, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notificacao, setNotificacao] = useState(null);

  /* =========================
     CARRINHO
  ========================== */

  const addToCart = (produto, loja) => {
    setCart((prev) => {
      const existente = prev.find(
        (item) => item.id === produto.id && item.loja === loja
      );

      if (existente) {
        return prev.map((item) =>
          item.id === produto.id && item.loja === loja
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...prev, { ...produto, loja, quantidade: 1 }];
    });
  };

  const removeFromCart = (id, loja) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.loja === loja
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  /* =========================
     FINALIZAR PEDIDO
  ========================== */

  const finalizarPedido = (pagamento, entrega, user) => {
    if (cart.length === 0) return;

    const frete = entrega === "motoboy" ? 8 : 0;
    const total = subtotal + frete;

    const novoPedido = {
      id: crypto.randomUUID(),
      cliente: user?.nome,
      email: user?.email,
      itens: cart,
      pagamento,
      entrega,
      frete,
      total,
      status: "pendente",
      historicoStatus: [
        { status: "pendente", data: new Date() }
      ],
      criadoEm: new Date()
    };

    setOrders((prev) => [...prev, novoPedido]);
    setCart([]);

    mostrarNotificacao("Pedido realizado com sucesso!");
  };

  /* =========================
     ATUALIZAR STATUS
  ========================== */

  const atualizarStatus = (id, novoStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          return {
            ...order,
            status: novoStatus,
            historicoStatus: [
              ...order.historicoStatus,
              { status: novoStatus, data: new Date() }
            ]
          };
        }
        return order;
      })
    );

    mostrarNotificacao(
      `Seu pedido está agora: ${novoStatus.replaceAll("_", " ")}`
    );
  };

  /* =========================
     CANCELAR PEDIDO
  ========================== */

  const cancelarPedido = (id, motivo) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          return {
            ...order,
            status: "cancelado",
            motivo,
            historicoStatus: [
              ...order.historicoStatus,
              { status: "cancelado", data: new Date() }
            ]
          };
        }
        return order;
      })
    );

    mostrarNotificacao("Pedido cancelado.");
  };

  /* =========================
     LIMPAR FINALIZADOS
  ========================== */

  const limparFinalizados = () => {
    setOrders((prev) =>
      prev.filter(
        (order) =>
          order.status !== "cancelado" &&
          order.status !== "entregue"
      )
    );

    mostrarNotificacao("Pedidos finalizados removidos.");
  };

  /* =========================
     NOTIFICAÇÃO
  ========================== */

  const mostrarNotificacao = (msg) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 3000);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        notificacao,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal,
        finalizarPedido,
        cancelarPedido,
        atualizarStatus,
        limparFinalizados
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;