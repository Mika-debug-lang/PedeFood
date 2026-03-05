import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

import Cliente from "./pages/Cliente";
import Dono from "./pages/Dono";
import Motoboy from "./pages/Motoboy";
import Admin from "./pages/Admin";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

/* ================= SUBPÁGINAS CLIENTE ================= */
import Lojas from "./pages/Lojas";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

/* ================= SUBPÁGINAS DONO ================= */
import GerenciarLoja from "./pages/GerenciarLoja";
import EditarLoja from "./pages/EditarLoja";

/* ================= REDIRECIONAMENTO INTELIGENTE ================= */

import { useContext } from "react";
import AuthContext from "./context/AuthContext";

function RootRedirect() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) return <Navigate to="/Login" replace />;

  // 🔥 Vai para a ROLE ATIVA atual
  if (user.tipo && user.roles?.includes(user.tipo)) {
    return <Navigate to={`/${user.tipo}`} replace />;
  }

  // fallback: vai para primeira role disponível
  if (user.roles?.length > 0) {
    return <Navigate to={`/${user.roles[0]}`} replace />;
  }

  return <Navigate to="/Login" replace />;
}

function App() {
  return (
    <Routes>

      {/* ================= ROOT ================= */}
      <Route path="/" element={<RootRedirect />} />

      {/* ================= PÚBLICAS ================= */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* ================= CLIENTE ================= */}
      <Route
        path="/Cliente"
        element={
          <PrivateRoute allowed="Cliente">
            <Cliente />
          </PrivateRoute>
        }
      >
        <Route index element={<Lojas />} />
        <Route path="Checkout" element={<Checkout />} />
        <Route path="Orders" element={<Orders />} />
      </Route>

      {/* ================= DONO ================= */}
      <Route
        path="/Dono"
        element={
          <PrivateRoute allowed="Dono">
            <Dono />
          </PrivateRoute>
        }
      />

      <Route
        path="/Dono/loja/:id"
        element={
          <PrivateRoute allowed="Dono">
            <GerenciarLoja />
          </PrivateRoute>
        }
      />

      <Route
        path="/Dono/editar/:id"
        element={
          <PrivateRoute allowed="Dono">
            <EditarLoja />
          </PrivateRoute>
        }
      />

      {/* ================= MOTOBOY ================= */}
      <Route
        path="/Motoboy"
        element={
          <PrivateRoute allowed="Motoboy">
            <Motoboy />
          </PrivateRoute>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/Admin"
        element={
          <PrivateRoute allowed="Admin">
            <Admin />
          </PrivateRoute>
        }
      />

      {/* ================= 404 ================= */}
      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h1>404</h1>
            <p>Página não encontrada</p>
          </div>
        }
      />

    </Routes>
  );
}

export default App;