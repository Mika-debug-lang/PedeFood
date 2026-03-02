import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ================= PÚBLICAS ================= */}

          <Route path="/" element={<Navigate to="/login" />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;