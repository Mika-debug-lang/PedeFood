import { Link, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

import "./Cliente.css";

function Cliente() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="cliente-container">

      <nav className="navbar">
        <div className="logo">PedeFood Express</div>
        <img src="/Images/icone_food.png" alt="Logotipo do Site" />

        <ul className="nav-links">
          <li><Link to="/cliente">Lojas</Link></li>
          <li><Link to="/cliente/checkout">Checkout</Link></li>
          <li><Link to="/cliente/orders">Orders</Link></li>
        </ul>

        <div className="perfil-box">
          <span className="nome-user">
            {user?.nome || "Usuário"}
          </span>

          <button onClick={logout} className="logout-btn">
            Sair
          </button>
        </div>
      </nav>

      <Outlet />

    </div>
  );
}

export default Cliente;