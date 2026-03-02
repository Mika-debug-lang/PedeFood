import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./EditarLoja.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:10000";

function EditarLoja() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  /* ================= BUSCAR LOJA ================= */

  useEffect(() => {
    if (!user?.token) return;

    const buscarLoja = async () => {
      try {
        const response = await fetch(`${API_URL}/lojas/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const erro = await response.json().catch(() => null);
          setMensagem(erro?.erro || "Erro ao carregar loja.");
          return;
        }

        const data = await response.json();

        setLoja({
          nome: data.nome || "",
          categoria: data.categoria || "",
          descricao: data.descricao || "",
          imagem: data.imagem || "",
        });

      } catch (err) {
        console.error(err);
        setMensagem("Erro de conexão.");
      } finally {
        setLoading(false);
      }
    };

    buscarLoja();
  }, [id, user?.token]);

  /* ================= ALTERAR IMAGEM ================= */

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLoja((prev) => ({
        ...prev,
        imagem: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  /* ================= SALVAR ================= */

  const salvarAlteracoes = async () => {
    if (!loja?.nome || !loja?.descricao || !loja?.categoria) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    try {
      setSaving(true);
      setMensagem("");

      const response = await fetch(`${API_URL}/lojas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          nome: loja.nome,
          descricao: loja.descricao,
          categoria: loja.categoria.toLowerCase().trim(),
          imagem: loja.imagem,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.log("Erro backend:", data);
        setMensagem(data?.erro || "Erro ao salvar alterações.");
        return;
      }

      setMensagem("Loja atualizada com sucesso!");

      setTimeout(() => {
        navigate("/dono");
      }, 1000);

    } catch (err) {
      console.error(err);
      setMensagem("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  if (loading)
    return (
      <div className="editar-loading">
        Carregando...
      </div>
    );

  if (!loja)
    return (
      <div className="editar-loading">
        Loja não encontrada.
      </div>
    );

  return (
    <div className="editar-container">
      <div className="editar-card">

        <button
          className="btn-voltar"
          onClick={() => navigate("/dono")}
        >
          ← Voltar
        </button>

        <h1>Editar Informações da Loja</h1>

        {mensagem && (
          <div className="editar-mensagem">
            {mensagem}
          </div>
        )}

        <div className="editar-preview">
          <img
            src={loja.imagem}
            alt={loja.nome}
            onError={(e) => {
              e.target.src = "/images/placeholder.png";
            }}
          />
        </div>

        <input
          type="text"
          value={loja.nome}
          onChange={(e) =>
            setLoja({
              ...loja,
              nome: e.target.value,
            })
          }
          placeholder="Nome da Loja"
        />

        <input
          type="text"
          value={loja.categoria}
          onChange={(e) =>
            setLoja({
              ...loja,
              categoria: e.target.value,
            })
          }
          placeholder="Categoria"
        />

        <textarea
          value={loja.descricao}
          onChange={(e) =>
            setLoja({
              ...loja,
              descricao: e.target.value,
            })
          }
          placeholder="Descrição"
        />

        <div
          className="editar-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          Alterar Imagem
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) =>
            handleFile(e.target.files[0])
          }
        />

        <button
          className="btn-salvar"
          onClick={salvarAlteracoes}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>

      </div>
    </div>
  );
}

export default EditarLoja;