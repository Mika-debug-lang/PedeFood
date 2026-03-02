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

  if (!user) return <Navigate to="/login" replace />;

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

function App() {
  return (
    <Routes>

      {/* ================= ROOT ================= */}
      <Route path="/" element={<RootRedirect />} />

      {/* ================= PÚBLICAS ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />

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