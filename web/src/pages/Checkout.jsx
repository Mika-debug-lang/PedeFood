import { useContext, useState } from "react";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Cliente.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    removeFromCart,
    subtotal,
    finalizarPedido
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);

  const [pagamento, setPagamento] = useState("pix");
  const [entrega, setEntrega] = useState("retirada");

  const frete = entrega === "motoboy" ? 8 : 0;
  const total = subtotal + frete;

  const confirmarPedido = () => {
    if (!user) {
      alert("Você precisa estar logado.");
      return;
    }

    if (cart.length === 0) {
      alert("Carrinho vazio.");
      return;
    }

    finalizarPedido(pagamento, entrega, user);

    navigate("/cliente/orders");
  };

  return (
    <div className="pagina">
      <div className="checkout-box">

        <h2>Checkout</h2>

        {cart.length === 0 ? (
          <p>Carrinho vazio</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="checkout-item">
                <span>
                  {item.nome} (x{item.quantidade})
                </span>

                <span>
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </span>

                <button
                  className="remover-btn"
                  onClick={() =>
                    removeFromCart(item.id, item.loja)
                  }
                >
                  -
                </button>
              </div>
            ))}

            <div className="resumo">
              <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
              <p>Frete: R$ {frete.toFixed(2)}</p>
              <h3>Total: R$ {total.toFixed(2)}</h3>
            </div>

            <div className="opcoes">
              <label>Forma de Pagamento:</label>
              <select
                value={pagamento}
                onChange={(e) => setPagamento(e.target.value)}
              >
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
              </select>

              <label>Tipo de Entrega:</label>
              <select
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
              >
                <option value="retirada">
                  Retirar no estabelecimento
                </option>
                <option value="motoboy">
                  Motoboy (+R$ 8)
                </option>
              </select>
            </div>

            <button
              className="finalizar-btn"
              onClick={confirmarPedido}
            >
              Confirmar Pedido
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default Checkout;