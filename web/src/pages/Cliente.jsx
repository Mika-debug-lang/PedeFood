import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import "./Cliente.css";

function Cliente() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (user.tipo !== "cliente") {
        // redireciona para a área correta
        switch (user.tipo) {
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
    }
  }, [user, loading, navigate]);

  const sair = () => {
    logout();
    navigate("/login");
  };

  if (loading) return null;
  if (!user || user.tipo !== "cliente") return null;

  return (
    <div className="cliente-container">
      <nav className="navbar">
        <div className="logo">PedeFood Express</div>

        <img
          src="/Images/icone_food.png"
          alt="Logotipo do Site"
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

      <div className="conteudo">
        <Outlet />
      </div>
    </div>
  );
}

export default Cliente;