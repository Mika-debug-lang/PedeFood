import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./GerenciarLoja.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://pedefood-2.onrender.com";

function GerenciarLoja() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const fileInputRef = useRef();

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: ""
  });

  /* ================= BUSCAR LOJA ================= */

  useEffect(() => {
    if (!user?.token) return;

    const carregarDados = async () => {
      try {
        const resLoja = await fetch(`${API_URL}/lojas/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!resLoja.ok) {
          setErro("Erro ao carregar loja.");
          setLoading(false);
          return;
        }

        const lojaData = await resLoja.json();
        setLoja(lojaData);

        const resProdutos = await fetch(`${API_URL}/produtos/${id}`);
        const produtosData = await resProdutos.json();
        setProdutos(produtosData);

      } catch {
        setErro("Erro de conexão.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id, user?.token]);

  /* ================= IMAGEM PRODUTO ================= */

  const handleImagemProduto = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNovoProduto(prev => ({
        ...prev,
        imagem: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  /* ================= ATUALIZAR LOJA ================= */

  const atualizarLoja = async () => {
    try {
      const response = await fetch(`${API_URL}/lojas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(loja)
      });

      if (!response.ok) {
        alert("Erro ao atualizar loja.");
        return;
      }

      alert("Loja atualizada com sucesso!");

    } catch {
      alert("Erro de conexão.");
    }
  };

  /* ================= CRIAR PRODUTO ================= */

  const criarProduto = async () => {
    if (!novoProduto.nome || !novoProduto.preco) {
      alert("Preencha nome e preço.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/produtos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...novoProduto,
          preco: Number(novoProduto.preco),
          lojaId: id
        })
      });

      if (!response.ok) {
        alert("Erro ao criar produto.");
        return;
      }

      const produtoCriado = await response.json();
      setProdutos([...produtos, produtoCriado]);

      setNovoProduto({
        nome: "",
        descricao: "",
        preco: "",
        imagem: ""
      });

    } catch {
      alert("Erro de conexão.");
    }
  };

  /* ================= EXCLUIR PRODUTO ================= */

  const excluirProduto = async (produtoId) => {
    if (!window.confirm("Excluir produto?")) return;

    try {
      const response = await fetch(`${API_URL}/produtos/${produtoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        alert("Erro ao excluir.");
        return;
      }

      setProdutos(produtos.filter(p => p._id !== produtoId));

    } catch {
      alert("Erro de conexão.");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;
  if (!loja) return <p>Loja não encontrada.</p>;

  return (
    <div className="gerenciar-container">

      <button
        className="btn-voltar-gerenciar"
        onClick={() => navigate("/dono")}
      >
        ← Voltar
      </button>

      <div className="gerenciar-card">

        <h1>Gerenciar Loja</h1>

        <div className="secao-loja">
          <h2>Informações da Loja</h2>

          <input
            value={loja.nome}
            onChange={(e) =>
              setLoja({ ...loja, nome: e.target.value })
            }
            placeholder="Nome"
          />

          <textarea
            value={loja.descricao}
            onChange={(e) =>
              setLoja({ ...loja, descricao: e.target.value })
            }
            placeholder="Descrição"
          />

          <button
            className="btn-salvar-loja"
            onClick={atualizarLoja}
          >
            Salvar Loja
          </button>
        </div>

        <hr />

        <div className="secao-produtos">
          <h2>Produtos</h2>

          <div className="produtos-grid">
            {produtos.map((p) => (
              <div key={p._id} className="produto-card">
                {p.imagem && (
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    className="produto-imagem"
                  />
                )}
                <h3>{p.nome}</h3>
                <p className="produto-preco">
                  R$ {p.preco.toFixed(2)}
                </p>

                <button
                  className="btn-excluir-produto"
                  onClick={() => excluirProduto(p._id)}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr />

        <div className="secao-novo-produto">
          <h3>Adicionar Novo Produto</h3>

          <input
            placeholder="Nome"
            value={novoProduto.nome}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, nome: e.target.value })
            }
          />

          <input
            placeholder="Descrição"
            value={novoProduto.descricao}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, descricao: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Preço"
            value={novoProduto.preco}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, preco: e.target.value })
            }
          />

          <div
            className="upload-imagem"
            onClick={() => fileInputRef.current.click()}
          >
            {novoProduto.imagem
              ? "Imagem selecionada ✓"
              : "Clique para adicionar imagem"}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) =>
              handleImagemProduto(e.target.files[0])
            }
          />

          {novoProduto.imagem && (
            <img
              src={novoProduto.imagem}
              alt="Preview"
              className="preview-imagem"
            />
          )}

          <button
            className="btn-criar-produto"
            onClick={criarProduto}
          >
            Criar Produto
          </button>
        </div>

      </div>
    </div>
  );
}

export default GerenciarLoja;