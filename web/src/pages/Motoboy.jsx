import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import AuthContext from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function Motoboy() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);

  /* ================= PROTEÇÃO DE ROTA ================= */

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (user.tipo !== "motoboy") {
        switch (user.tipo) {
          case "cliente":
            navigate("/cliente");
            break;
          case "dono":
            navigate("/dono");
            break;
          case "admin":
            navigate("/admin");
            break;
          default:
            navigate("/login");
        }
      }
    }
  }, [user, authLoading, navigate]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!API_URL || !user || user.tipo !== "motoboy") return;

    const socket = io(API_URL, {
      auth: {
        token: user.token,
      },
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
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: "entregue" }),
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

  /* ================= BLOQUEIO DE RENDER ================= */

  if (authLoading || !user || user.tipo !== "motoboy") return null;

  /* ================= RENDER ================= */

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      {entregas.map((e) => (
        <div key={e.id} style={{ marginBottom: 20 }}>
          Pedido #{e.id}
          <button
            onClick={() => confirmarEntrega(e.id)}
            style={{ marginLeft: 10 }}
          >
            Confirmar Entrega
          </button>
        </div>
      ))}
    </div>
  );
}

export default Motoboy;