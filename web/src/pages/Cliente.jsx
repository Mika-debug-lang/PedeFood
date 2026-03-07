import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import "./Cliente.css";

function Cliente() {

  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {

    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.area !== "cliente") {

      switch (user.area) {

        case "dono":
          navigate("/dono");
          break;

        case "motoboy":
          navigate("/motoboy");
          break;

        case "admin":
          navigate("/admin");
          break;

        default:
          navigate("/login");

      }

    }

  }, [user, loading, navigate]);

  const sair = () => {

    logout();
    navigate("/login");

  };

  if (loading || !user || user.area !== "cliente") return null;

  return (

    <div className="cliente-container">

      <nav className="navbar">

        <div className="logo">
          PedeFood Express
        </div>

        <img
          src="/Images/icone_food.png"
          alt="Logo"
        />

        <ul className="nav-links">

          <li>
            <Link to="">Lojas</Link>
          </li>

          <li>
            <Link to="checkout">Checkout</Link>
          </li>

          <li>
            <Link to="orders">Pedidos</Link>
          </li>

        </ul>

        <div className="perfil-box">

          <span className="nome-user">
            {user.nome ? `Olá, ${user.nome}` : "Usuário"}
          </span>

          <button
            onClick={sair}
            className="logout-btn"
          >
            Sair
          </button>

        </div>

      </nav>

      <main className="conteudo">
        <Outlet />
      </main>

    </div>

  );

}

export default Cliente;