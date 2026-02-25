import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowed }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/" />;

  if (user.tipo !== allowed) return <Navigate to="/" />;

  return children;
}

export default PrivateRoute;