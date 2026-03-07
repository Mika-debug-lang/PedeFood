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

/* ================= CONTEXT ================= */

import { useContext } from "react";
import AuthContext from "./context/AuthContext";

/* ================= REDIRECIONAMENTO ROOT ================= */

function RootRedirect() {

  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  // usuário não logado
  if (!user || !user.roles) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];

  // prioridade de acesso
  if (roles.includes("admin")) {
    return <Navigate to="/admin" replace />;
  }

  if (roles.includes("dono")) {
    return <Navigate to="/dono" replace />;
  }

  if (roles.includes("motoboy")) {
    return <Navigate to="/motoboy" replace />;
  }

  if (roles.includes("cliente")) {
    return <Navigate to="/cliente" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {

  return (

    <Routes>

      {/* ROOT */}
      <Route path="/" element={<RootRedirect />} />

      {/* ================= ROTAS PÚBLICAS ================= */}

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />

      {/* ================= CLIENTE ================= */}

      <Route
        path="/cliente"
        element={
          <PrivateRoute allowed="cliente">
            <Cliente />
          </PrivateRoute>
        }
      >
        <Route index element={<Lojas />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
      </Route>

      {/* ================= DONO ================= */}

      <Route
        path="/dono"
        element={
          <PrivateRoute allowed="dono">
            <Dono />
          </PrivateRoute>
        }
      />

      <Route
        path="/dono/loja/:id"
        element={
          <PrivateRoute allowed="dono">
            <GerenciarLoja />
          </PrivateRoute>
        }
      />

      <Route
        path="/dono/editar/:id"
        element={
          <PrivateRoute allowed="dono">
            <EditarLoja />
          </PrivateRoute>
        }
      />

      {/* ================= MOTOBOY ================= */}

      <Route
        path="/motoboy"
        element={
          <PrivateRoute allowed="motoboy">
            <Motoboy />
          </PrivateRoute>
        }
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <PrivateRoute allowed="admin">
            <Admin />
          </PrivateRoute>
        }
      />

      {/* ================= 404 ================= */}

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );
}

export default App;