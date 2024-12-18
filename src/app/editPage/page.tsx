import GrapesEditor from "../components/grapesEditor"; 

export default function EditPage({ params }: { params: { id: string } }) {
    // Exemplo: Buscando o layout inicial da API ou CMS
    const pageContent = `
    <div class="page">
      <header>
        <h1>Bem-vindo ao Blog</h1>
      </header>
      <main>
        <p>Este é o conteúdo do blog. Edite aqui.</p>
      </main>
      <footer>
        <p>© 2024 Blog de Notícias</p>
      </footer>
    </div>
  `;

    return (
        <div>
            <h1>Editando Página do Blog</h1>
            <GrapesEditor content={pageContent} />
        </div>
    );
}