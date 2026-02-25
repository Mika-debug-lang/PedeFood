import { createContext, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

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

  const finalizarPedido = (pagamento, entrega, user) => {
    const frete = entrega === "motoboy" ? 8 : 0;
    const total = subtotal + frete;

    const novoPedido = {
      id: Date.now(),
      cliente: user?.nome,
      email: user?.email,
      itens: cart,
      pagamento,
      entrega,
      frete,
      total,
      status: "pendente",
      criadoEm: new Date()
    };

    setOrders((prev) => [...prev, novoPedido]);
    setCart([]);
  };

  const cancelarPedido = (id, motivo) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "cancelado", motivo } : o
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal,
        finalizarPedido,
        cancelarPedido
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;