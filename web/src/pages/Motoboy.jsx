import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import AuthContext from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function Motoboy() {
  const { user } = useContext(AuthContext);
  const [entregas, setEntregas] = useState([]);

  useEffect(() => {
    if (!API_URL) return;

    const socket = io(API_URL);

    socket.on("pedidoAtualizado", ({ id, status }) => {
      if (status === "saiu_entrega") {
        setEntregas((prev) => [...prev, { id, status }]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const confirmarEntrega = async (id) => {
    try {
      await fetch(`${API_URL}/pedido/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: "entregue" }),
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🛵 Painel do Motoboy</h1>

      {entregas.length === 0 && <p>Nenhuma entrega disponível.</p>}

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