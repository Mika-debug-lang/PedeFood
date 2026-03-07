import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, allowed }) {

  const { user, loading } = useContext(AuthContext);

  /* ================= AGUARDANDO AUTENTICAÇÃO ================= */

  if (loading) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }

  /* ================= NÃO AUTENTICADO ================= */

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  /* ================= VALIDAR ROLES ================= */

  const roles = Array.isArray(user.roles) ? user.roles : [];

  if (roles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  /* ================= VERIFICAR PERMISSÃO ================= */

  if (allowed) {

    const allowedRoles = Array.isArray(allowed)
      ? allowed
      : [allowed];

    const possuiPermissao = allowedRoles.some(role =>
      roles.includes(role)
    );

    if (!possuiPermissao) {

      /* ================= REDIRECIONAMENTO SEGURO ================= */

      const prioridade = ["admin", "dono", "motoboy", "cliente"];

      const destino =
        prioridade.find(role => roles.includes(role)) ||
        "cliente";

      return <Navigate to={`/${destino}`} replace />;
    }
  }

  /* ================= ACESSO LIBERADO ================= */

  return children;
}

export default PrivateRoute;