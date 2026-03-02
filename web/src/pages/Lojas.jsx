import { useState, useContext, useEffect, useRef } from "react";
import "./Cliente.css";
import CartContext from "../context/CartContext";

function Lojas() {
  const { addToCart } = useContext(CartContext);

  const [lojasBackend, setLojasBackend] = useState([]);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [produtos, setProdutos] = useState([]); // 🔥 NOVO
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  const [notificacoes, setNotificacoes] = useState([]);
  const idRef = useRef(0);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:10000";

  /* ================= BUSCAR LOJAS ATIVAS ================= */

  useEffect(() => {
    const buscarLojas = async () => {
      try {
        const response = await fetch(`${API_URL}/lojas/ativas`);
        const data = await response.json();

        if (response.ok) {
          setLojasBackend(data || []);
        } else {
          setLojasBackend([]);
        }
      } catch (err) {
        console.error("Erro ao buscar lojas:", err);
        setLojasBackend([]);
      }
    };

    buscarLojas();
  }, [API_URL]);

  /* ================= BUSCAR PRODUTOS DA LOJA ================= */

  useEffect(() => {
    if (!lojaSelecionada) return;

    const buscarProdutos = async () => {
      try {
        setLoadingProdutos(true);

        const response = await fetch(
          `${API_URL}/produtos/${lojaSelecionada._id}`
        );

        const data = await response.json();

        if (response.ok) {
          setProdutos(data || []);
        } else {
          setProdutos([]);
        }
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setProdutos([]);
      } finally {
        setLoadingProdutos(false);
      }
    };

    buscarProdutos();
  }, [lojaSelecionada, API_URL]);

  /* ================= NOTIFICAÇÃO ================= */

  const mostrarNotificacao = (nomeProduto) => {
    idRef.current += 1;
    const id = idRef.current;

    const nova = { id, nome: nomeProduto };
    setNotificacoes((prev) => [...prev, nova]);

    setTimeout(() => {
      setNotificacoes((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }, 3000);
  };

  const adicionarProduto = (produto) => {
    if (!lojaSelecionada) return;

    addToCart(produto, lojaSelecionada.nome);
    mostrarNotificacao(produto.nome);
  };

  /* ================= RENDER ================= */

  return (
    <div className="pagina">

      {!lojaSelecionada ? (
        <>
          <div className="lojas-header">
            <h2 className="titulo-lojas">
              Lojas Disponíveis
            </h2>
            <p className="subtitulo-lojas">
              Escolha uma loja para começar seu pedido
            </p>
          </div>

          {lojasBackend.length === 0 ? (
            <div className="admin-empty">
              <h3>Nenhuma loja disponível no momento.</h3>
            </div>
          ) : (
            <div className="categorias-grid">
              {lojasBackend.map((loja) => (
                <div
                  key={loja._id}
                  className="categoria-card"
                  onClick={() => setLojaSelecionada(loja)}
                >
                  <img
                    src={loja.imagem}
                    alt={loja.nome}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                  <div className="categoria-overlay">
                    <h3>{loja.nome}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button
            className="voltar-btn"
            onClick={() => {
              setLojaSelecionada(null);
              setProdutos([]);
            }}
          >
            ← Voltar
          </button>

          <h2 className="titulo-lojas">
            {lojaSelecionada.nome}
          </h2>

          {loadingProdutos ? (
            <div className="admin-empty">
              <p>Carregando produtos...</p>
            </div>
          ) : produtos.length === 0 ? (
            <div className="admin-empty">
              <p>Esta loja ainda não possui produtos.</p>
            </div>
          ) : (
            <div className="produtos-grid">
              {produtos.map((produto) => (
                <div key={produto._id} className="produto-card">

                  <div className="produto-img-scroll">
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                  </div>

                  <div className="produto-info">
                    <h3>{produto.nome}</h3>
                    <p>
                      R$ {Number(produto.preco || 0).toFixed(2)}
                    </p>
                    <button
                      onClick={() => adicionarProduto(produto)}
                    >
                      Adicionar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= POPUPS ================= */}

      <div className="popup-container">
        {notificacoes.map((item) => (
          <div key={item.id} className="popup">
            ✅ {item.nome} adicionado ao carrinho
          </div>
        ))}
      </div>

    </div>
  );
}

export default Lojas;