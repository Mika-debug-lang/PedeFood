import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import AuthContext from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://pedefood-2.onrender.com";

function Motoboy() {

  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [entregas, setEntregas] = useState([]);

  /* ================= PROTEÇÃO ================= */

  useEffect(() => {

    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.area !== "motoboy") {
      navigate(`/${user.area}`);
    }

  }, [user, authLoading, navigate]);

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!API_URL || !user || user.area !== "motoboy") return;

    const socket = io(API_URL, {
      auth: {
        token: user.token
      }
    });

    socket.on("pedidoAtualizado", ({ id, status }) => {

      if (status === "saiu_entrega") {

        setEntregas((prev) => {

          if (prev.some((e) => e.id === id)) return prev;

          return [...prev, { id, status }];

        });

      }

      if (status === "entregue") {

        setEntregas((prev) =>
          prev.filter((e) => e.id !== id)
        );

      }

    });

    return () => {
      socket.disconnect();
    };

  }, [user]);

  /* ================= CONFIRMAR ENTREGA ================= */

  const confirmarEntrega = async (id) => {

    try {

      await fetch(`${API_URL}/pedido/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          status: "entregue"
        })
      });

    } catch (err) {

      console.error("Erro ao atualizar status:", err);

    }

  };

  /* ================= LOGOUT ================= */

  const sair = () => {

    logout();
    navigate("/login");

  };

  /* ================= BLOQUEIO ================= */

  if (authLoading || !user || user.area !== "motoboy") return null;

  /* ================= RENDER ================= */

  return (

    <div style={{ padding: 30 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <h1>🛵 Painel do Motoboy</h1>

        <button
          onClick={sair}
          style={{
            padding: "8px 14px",
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Sair
        </button>

      </div>

      {entregas.length === 0 && (
        <p>Nenhuma entrega disponível.</p>
      )}

      {entregas.map((entrega) => (

        <div
          key={entrega.id}
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 10,
            background: "#f3f3f3",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <span>Pedido #{entrega.id}</span>

          <button
            onClick={() => confirmarEntrega(entrega.id)}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              background: "#2ecc71",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Confirmar Entrega
          </button>

        </div>

      ))}

    </div>

  );

}

export default Motoboy;