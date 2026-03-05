import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, allowed }) {

  const { user, loading } = useContext(AuthContext);

  // ⏳ aguardando autenticação
  if (loading) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }

  // 🚫 não autenticado
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 usuário sem roles
  if (!Array.isArray(user.roles) || user.roles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  // 🔎 verificar permissão
  if (allowed) {

    const allowedRoles = Array.isArray(allowed)
      ? allowed
      : [allowed];

    const possuiPermissao = allowedRoles.some(role =>
      user.roles.includes(role)
    );

    if (!possuiPermissao) {

      // prioridade de redirecionamento
      const prioridade = ["admin", "dono", "motoboy", "cliente"];

      const destino =
        prioridade.find(role => user.roles.includes(role)) ||
        user.roles[0];

      return <Navigate to={`/${destino}`} replace />;
    }
  }

  return children;
}

export default PrivateRoute;