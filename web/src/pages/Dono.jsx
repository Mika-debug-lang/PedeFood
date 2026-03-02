import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";
import "./Dono.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:10000";

function Dono() {
  const { user } = useContext(AuthContext);
  const { orders = [], atualizarStatus } = useContext(CartContext) || {};
  const navigate = useNavigate();

  const [minhaLoja, setMinhaLoja] = useState(null);
  const [nomeLoja, setNomeLoja] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");
  const [preview, setPreview] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fileInputRef = useRef();

  /* ================= PROTEÇÃO ================= */

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (!user.tipo || user.tipo !== "dono") {
      navigate("/cliente");
      return;
    }

    setCheckingAuth(false);
  }, [user, navigate]);

  /* ================= BUSCAR LOJA ================= */

  const buscarMinhaLoja = useCallback(async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${API_URL}/lojas/minha`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 404) {
        setMinhaLoja(null);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMinhaLoja(data);
      }

    } catch (err) {
      console.error("Erro ao buscar loja:", err);
    }
  }, [user]);

  useEffect(() => {
    buscarMinhaLoja();
  }, [buscarMinhaLoja]);

  /* ================= ATUALIZAR STATUS MANUAL ================= */

  const atualizarStatusLoja = async () => {
    await buscarMinhaLoja();
  };

  /* ================= UPLOAD IMAGEM ================= */

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagem(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /* ================= CRIAR LOJA ================= */

  const criarLoja = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (!nomeLoja || !descricao || !imagem || !categoria) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/lojas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          nome: nomeLoja,
          descricao,
          imagem,
          categoria,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.erro || "Erro ao criar loja.");
        return;
      }

      setMensagem("Loja enviada para aprovação!");
      setMinhaLoja(data);

      setNomeLoja("");
      setDescricao("");
      setCategoria("");
      setImagem("");
      setPreview(null);

    } catch (error) {
      console.error(error);
      setMensagem("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXCLUIR LOJA ================= */

  const excluirLoja = async () => {
    if (!window.confirm("Tem certeza que deseja excluir sua loja?")) return;

    try {
      const response = await fetch(`${API_URL}/lojas/${minhaLoja._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        setMensagem("Erro ao excluir loja.");
        return;
      }

      setMinhaLoja(null);
      setMensagem("Loja excluída com sucesso.");

    } catch (err) {
      console.error(err);
      setMensagem("Erro ao excluir loja.");
    }
  };

  if (checkingAuth) return null;

  return (
    <div className="dono-container">
      <div className="dono-header">
        <div className="dono-title">
          <img
            src="/Images/dono.png"
            alt="Ícone da Loja"
            className="dono-icon"
          />
          <h1>Painel do Dono</h1>
        </div>
        <p>Gerencie sua loja, produtos e pedidos</p>
      </div>

      {minhaLoja ? (
        <div className="criar-loja-box">
          <h2>Sua Loja</h2>

          <div style={{ marginBottom: 25 }}>
            <img
              src={minhaLoja.imagem}
              alt={minhaLoja.nome}
              style={{
                width: 220,
                borderRadius: 16,
                marginBottom: 15,
              }}
            />

            <h3>{minhaLoja.nome}</h3>
            <p>{minhaLoja.descricao}</p>

            <span className={`status-badge ${minhaLoja.status}`}>
              Status: {minhaLoja.status}
            </span>

            {minhaLoja.status === "pendente" && (
              <p style={{ color: "orange", marginTop: 10 }}>
                Sua loja está aguardando aprovação do administrador.
              </p>
            )}

            <button className="button_atualizar"
              onClick={atualizarStatusLoja}
              style={{ marginTop: 10 }}
            >
              Atualizar Status
            </button>
          </div>

          <div className="loja-actions">
            <button
              className="btn-gerenciar"
              onClick={() =>
                navigate(`/dono/loja/${minhaLoja._id}`)
              }
            >
              Gerenciar Produtos
            </button>

            <button
              className="btn-editar"
              onClick={() =>
                navigate(`/dono/editar/${minhaLoja._id}`)
              }
            >
              Editar Informações
            </button>

            <button
              className="btn-excluir"
              onClick={excluirLoja}
            >
              Excluir Loja
            </button>
          </div>
        </div>
      ) : (
        <div className="criar-loja-box">
          <h2>Cadastrar Nova Loja</h2>

          {mensagem && (
            <p className="mensagem-loja">{mensagem}</p>
          )}

          <form onSubmit={criarLoja} className="form-loja">
            <input
              type="text"
              placeholder="Nome da Loja"
              value={nomeLoja}
              onChange={(e) =>
                setNomeLoja(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Categoria"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value)
              }
            />

            <div
              className="upload-card"
              onClick={() =>
                fileInputRef.current.click()
              }
            >
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <p>Clique para selecionar imagem</p>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) =>
                handleFile(e.target.files[0])
              }
            />

            <textarea
              placeholder="Descrição da loja"
              value={descricao}
              onChange={(e) =>
                setDescricao(e.target.value)
              }
            />

            <button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Cadastrar Loja"}
            </button>
          </form>
        </div>
      )}

      {/* ================= PEDIDOS ================= */}

      <div style={{ marginTop: 60 }}>
        <h2>Pedidos Recebidos</h2>

        {orders.length === 0 ? (
          <div className="sem-pedidos">
            <h3>Nenhum pedido disponível</h3>
          </div>
        ) : (
          <div className="dono-grid">
            {orders.map((order, index) => {
              const status = order.status || "pendente";
              const id = order._id || order.id;

              return (
                <div
                  key={id || index}
                  className="dono-card"
                >
                  <div className="pedido-top">
                    <h3>Pedido #{index + 1}</h3>
                    <span className={`status-badge ${status}`}>
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="pedido-actions">
                    {status === "pendente" && (
                      <button
                        className="btn-preparo"
                        onClick={() =>
                          atualizarStatus(id, "em_preparo")
                        }
                      >
                        Iniciar Preparo
                      </button>
                    )}

                    {status === "em_preparo" && (
                      <button
                        className="btn-entrega"
                        onClick={() =>
                          atualizarStatus(id, "saiu_entrega")
                        }
                      >
                        Saiu para Entrega
                      </button>
                    )}

                    {status === "saiu_entrega" && (
                      <button
                        className="btn-confirmar"
                        onClick={() =>
                          atualizarStatus(id, "entregue")
                        }
                      >
                        Confirmar Entrega
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dono;