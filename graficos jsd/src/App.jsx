import { useState, useEffect } from 'react';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function buscarDados() {
      try {
        // CORREÇÃO AQUI: Garanta que o link comece estritamente com https://api.github.com
        const resposta = await fetch('https://api.github.com/users/LorhanaSandraah');
        
        if (!resposta.ok) {
          throw new Error('Não foi possível encontrar o usuário');
        }

        const resultado = await resposta.json();
        setUsuario(resultado);
      } catch (err) {
        console.error('Erro na requisição:', err);
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    
    buscarDados(); 
  }, []);

  if (carregando) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Carregando dados...</h2>;
  }

  if (erro || !usuario) {
    return <h2 style={{ textAlign: 'center', color: 'red', marginTop: '50px', fontFamily: 'sans-serif' }}>Erro: {erro || 'Dados inválidos'}</h2>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1>Perfil de {usuario.login}</h1>
      
      <div style={{ margin: '20px auto', maxWidth: '300px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* Agora que a API vai responder certo, o link da foto vai funcionar */}
        <img 
          src={usuario.avatar_url} 
          alt="Foto de Perfil" 
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 15px', border: '3px solid #6e5494' }} 
        />

        <p><strong>ID:</strong> {usuario.id}</p>
        <p><strong>Repositórios Públicos:</strong> {usuario.public_repos}</p>
        <p><strong>Seguidores:</strong> {usuario.followers}</p>
        
        <a 
          href={usuario.html_url} 
          target="_blank" 
          rel="noreferrer"
          style={{ display: 'inline-block', marginTop: '15px', padding: '10px 20px', backgroundColor: '#24292e', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          Ver no GitHub
        </a>
      </div>
    </div>
  );
}

export default App;
