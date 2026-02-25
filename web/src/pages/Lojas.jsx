import { useState, useContext, useRef } from "react";
import "./Cliente.css";
import CartContext from "../context/CartContext";

function Lojas() {
  const { addToCart } = useContext(CartContext);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);

  // 🔥 contador seguro para IDs
  const idRef = useRef(0);

  const categorias = [
    {
      id: 1,
      nome: "Bebidas",
      imagem: "/Images/bebidas.png",
      produtos: [
        {
          id: 1,
          nome: "Refrigerante 2L",
          preco: 9.99,
          img: "/Images/refrigerante.png",
        },
        {
          id: 2,
          nome: "Suco 1L",
          preco: 6.5,
          img: "/Images/suco.png",
        },
              {
          id: 3,
          nome: "Água 1L mineral",
          preco: 6.0,
          img: "/Images/agua.png",
        },
      ],
    },
    {
      id: 2,
      nome: "Mercado",
      imagem: "/Images/mercado.png",
      produtos: [
        {
          id: 4,
          nome: "Arroz 5kg",
          preco: 25.9,
          img: "/Images/arroz.png",
        },
        {
          id: 5,
          nome: "Feijão 1kg",
          preco: 8.5,
          img: "/Images/feijao.png",
        },
      ],
    },
        {
      id: 3,
      nome: "Fast Food",
      imagem: "/Images/fastfood.png",
      produtos: [
        {
          id: 6,
          nome: "Hamburguer",
          preco: 30.0,
          img: "/Images/hamburguer.png",
        },
        {
          id: 7,
          nome: "Pizza",
          preco: 50.0,
          img: "/Images/pizza.png",
        },
              {
          id: 8,
          nome: "Hot Dog completo",
          preco: 15.0,
          img: "/Images/hotdog.png",
        },
      ],
    },
  ];

  const mostrarNotificacao = (nomeProduto) => {
    idRef.current += 1;
    const id = idRef.current;

    const nova = { id, nome: nomeProduto };

    setNotificacoes((prev) => [...prev, nova]);

    setTimeout(() => {
      setNotificacoes((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }, 4000);
  };

  const adicionarProduto = (produto) => {
    addToCart(produto, categoriaSelecionada.nome);
    mostrarNotificacao(produto.nome);
  };

  return (
    <div className="pagina">
      {!categoriaSelecionada ? (
        <>
          <h2 className="titulo-lojas">🏬 Escolha uma Loja</h2>

          <div className="categorias-grid">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="categoria-card"
                onClick={() => setCategoriaSelecionada(cat)}
              >
                <img
                  src={cat.imagem}
                  alt={cat.nome}
                  onError={(e) => {
                    e.target.src = "/images/placeholder.png";
                  }}
                />
                <div className="categoria-overlay">
                  <h3>{cat.nome}</h3>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            className="voltar-btn"
            onClick={() => setCategoriaSelecionada(null)}
          >
            ← Voltar
          </button>

          <h2 className="titulo-lojas">
            {categoriaSelecionada.nome}
          </h2>

          <div className="produtos-grid">
            {categoriaSelecionada.produtos.map((produto) => (
              <div key={produto.id} className="produto-card">
                
                {/* 🔥 IMAGEM COM SCROLL */}
                <div className="produto-img-scroll">
                  <img
                    src={produto.img}
                    alt={produto.nome}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                </div>

                <div className="produto-info">
                  <h3>{produto.nome}</h3>
                  <p>R$ {produto.preco.toFixed(2)}</p>
                  <button
                    onClick={() => adicionarProduto(produto)}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* POPUPS */}
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