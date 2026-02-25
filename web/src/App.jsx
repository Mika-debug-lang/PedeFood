import { BrowserRouter, Routes, Route } from "react-router-dom";

import Cliente from "./pages/Cliente";
import Dono from "./pages/Dono";
import Motoboy from "./pages/Motoboy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Lojas from "./pages/Lojas";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; // ✅ IMPORTANTE

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* ✅ ENVOLVENDO A APLICAÇÃO */}
        <BrowserRouter>
          <Routes>

            {/* ================= LOGIN ================= */}
            <Route path="/" element={<Login />} />
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
              {/* SUB ROTAS CLIENTE */}
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

            {/* ================= MOTOBOY ================= */}
            <Route
              path="/motoboy"
              element={
                <PrivateRoute allowed="motoboy">
                  <Motoboy />
                </PrivateRoute>
              }
            />

            {/* ================= 404 ================= */}
            <Route
              path="*"
              element={<h1 style={{ padding: 40 }}>Página não encontrada</h1>}
            />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;