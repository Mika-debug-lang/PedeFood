import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, allowed }) {
  const { user, loading } = useContext(AuthContext);

  // 🔄 Enquanto estiver carregando o user do localStorage
  if (loading) {
    return null; // ou pode colocar um spinner
  }

  // 🚫 Não logado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🚫 Sem tipo definido
  if (!user.tipo) {
    return <Navigate to="/" replace />;
  }

  // 🚫 Tipo diferente do permitido
  if (allowed && user.tipo !== allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;