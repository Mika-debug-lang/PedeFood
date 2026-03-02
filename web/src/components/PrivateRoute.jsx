import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, allowed }) {
  const { user, loading } = useContext(AuthContext);

  // ⏳ Enquanto verifica login
  if (loading) {
    return null; // pode trocar por spinner
  }

  // 🚫 Não logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Sem tipo definido
  if (!user.tipo) {
    return <Navigate to="/login" replace />;
  }

  // 🔎 Se houver regra de permissão
  if (allowed) {
    const allowedRoles = Array.isArray(allowed)
      ? allowed
      : [allowed];

    if (!allowedRoles.includes(user.tipo)) {
      // 🔁 Redireciona para área correta
      switch (user.tipo) {
        case "cliente":
          return <Navigate to="/cliente" replace />;
        case "dono":
          return <Navigate to="/dono" replace />;
        case "motoboy":
          return <Navigate to="/motoboy" replace />;
        case "admin":
          return <Navigate to="/admin" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
}

export default PrivateRoute;