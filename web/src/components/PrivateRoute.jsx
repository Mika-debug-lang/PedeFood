import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PrivateRoute({ children, allowed }) {
  const { user, loading } = useContext(AuthContext);

  // ⏳ Esperando autenticação
  if (loading) return null;

  // 🚫 Não logado
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Sem roles definidas
  if (!user.roles || user.roles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  // 🔎 Se houver restrição de acesso
  if (allowed) {
    const allowedRoles = Array.isArray(allowed)
      ? allowed
      : [allowed];

    const possuiPermissao = allowedRoles.some((role) =>
      user.roles.includes(role)
    );

    if (!possuiPermissao) {
      // 🔁 Redireciona para primeira role válida do usuário
      const prioridade = ["admin", "dono", "motoboy", "cliente"];

      const roleDestino = prioridade.find((role) =>
        user.roles.includes(role)
      );

      if (roleDestino) {
        return <Navigate to={`/${roleDestino}`} replace />;
      }

      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default PrivateRoute;