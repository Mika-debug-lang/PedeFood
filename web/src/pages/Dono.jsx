import { useContext } from "react";
import CartContext from "../context/CartContext";
import "./Cliente.css";

function Dono() {
  const { distribuicao, total } = useContext(CartContext);

  return (
    <div className="pagina">
      <h1>🏪 Painel do Dono</h1>

      <div className="dono-grid">
        {distribuicao.map((item, index) => (
          <div key={index} className="dono-card">
            <h3>{item.loja}</h3>
            <p>Receita: R$ {item.valor}</p>
          </div>
        ))}
      </div>

      <h2 className="total-geral">Total Geral: R$ {total}</h2>
    </div>
  );
}

export default Dono;