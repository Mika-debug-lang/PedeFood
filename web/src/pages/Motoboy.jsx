import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function Motoboy() {
  const [entregas, setEntregas] = useState([]);

  useEffect(() => {
    socket.on("pedidoAtualizado", ({ id, status }) => {
      if (status === "aceito") {
        setEntregas((prev) => [...prev, { id, status }]);
      }
    });

    return () => {
      socket.off("pedidoAtualizado");
    };
  }, []);

  const sairEntrega = async (id) => {
    await fetch(`http://localhost:3000/pedido/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "em entrega" }),
    });
  };

  return (
    <div>
      <h1>🛵 Motoboy</h1>
      {entregas.map((e) => (
        <div key={e.id}>
          Pedido #{e.id}
          <button onClick={() => sairEntrega(e.id)}>
            Saiu para entrega
          </button>
        </div>
      ))}
    </div>
  );
}

export default Motoboy;