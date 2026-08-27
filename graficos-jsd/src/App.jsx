
import { useEffect, useState } from "react";

function App() {
  const [perfil, setPerfil] = useState(null);
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const usuario = "rayanevitoriajsd-byte";

    fetch(`https://api.github.com/users/rayanevitoriajsd-byte`)
      .then(res => res.json())
      .then(data => setPerfil(data));

    fetch(`https://api.github.com/users/rayanevitoriajsd-byte/repos`)
      .then(res => res.json())
      .then(data => setRepos(data));
  }, []);

  if (!perfil) {
    return <h2>Carregando...</h2>;
  }

  return (
    <div className="app">

      {/* FOTO */}
      <img
        src={perfil.avatar_url}
        alt="Foto de perfil"
      />

      {/* NOME */}
      <h1>{perfil.name || perfil.login}</h1>

      {/* USUÁRIO */}
      <p>@{perfil.login}</p>

      {/* INFORMAÇÕES */}
      <div className="info">

        <div>
          <strong>{perfil.followers}</strong>
          <span>Seguidores</span>
        </div>

        <div>
          <strong>{perfil.public_repos}</strong>
          <span>Repositórios</span>
        </div>

      </div>

      {/* LINK DO GITHUB */}
      <a
        href={perfil.html_url}
        target="_blank"
        rel="noreferrer"
      >
        Acessar meu GitHub
      </a>

      {/* PROJETOS */}
      <h2>Meus Projetos</h2>

      <div className="projetos">

        {repos.map(repo => (
          <div className="card" key={repo.id}>

            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
            >
              {repo.name}
            </a>

            <p>
              {repo.description || "Sem descrição"}
            </p>

          </div>
        ))}

      </div>

      {/* CSS */}
      <style>{`

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
        }

        .app {
          text-align: center;
          padding: 40px 20px;
        }

        .app img {
          width: 140px;
          height: 140px;
          border-radius: 50%;
        }

        .app h1 {
          margin-bottom: 5px;
        }

        .app p {
          color: #666;
        }

        .info {
          display: flex;
          justify-content: center;
          gap: 50px;
          margin: 25px;
        }

        .info div {
          display: flex;
          flex-direction: column;
        }

        .info strong {
          font-size: 24px;
        }

        .app > a {
          display: inline-block;
          padding: 10px 20px;
          background: #24292f;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        }

        .projetos {
          max-width: 800px;
          margin: 30px auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: left;
        }

        .card a {
          color: #0969da;
          font-weight: bold;
          text-decoration: none;
        }

      `}</style>

    </div>
  );
}

export default App;