const API_URL = 'http://localhost:3000/';

document.getElementById('fetchBtn').addEventListener('click', fetchData);
document.getElementById('clearBtn').addEventListener('click', clearResults);

async function fetchData() {
    const fetchBtn = document.getElementById('fetchBtn');
    const status = document.getElementById('status');
    const results = document.getElementById('results');

    // Mostrar loading
    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Carregando...';
    status.innerHTML = '<div class="loading">Buscando dados...</div>';
    results.innerHTML = '';

    try {
        const response = await fetch("http://localhost:3000/");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Mostrar sucesso
        status.innerHTML = '<div class="success">Dados carregados com sucesso!</div>';

        // Exibir os dados
        displayData(data);

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        status.innerHTML = `<div class="error">Erro ao buscar dados: ${error.message}</div>`;
    } finally {
        // Restaurar botão
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Buscar Dados da API';
    }
}

function displayData(data) {
    const results = document.getElementById('results');

    if (!data || data.length === 0) {
        results.innerHTML = '<div class="data-container">Nenhum dado encontrado.</div>';
        return;
    }

    let html = '<div class="data-container">';
    html += '<h2>Dados Recebidos:</h2>';

    data.forEach(person => {
        html += `
            <div class="person-card">
                <h3>Pessoa #${person.id}</h3>
                <div class="person-info">
                    <span class="label">Nome:</span> ${person.nome}
                </div>
                <div class="person-info">
                    <span class="label">Idade:</span> ${person.idade} anos
                </div>
                <div class="person-info">
                    <span class="label">Profissão:</span> ${person.profissao}
                </div>
            </div>
        `;
    });

    html += '<h3>Dados Raw (JSON):</h3>';
    html += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    html += '</div>';

    results.innerHTML = html;
}

function clearResults() {
    document.getElementById('status').innerHTML = '';
    document.getElementById('results').innerHTML = '';
}

window.addEventListener('load', () => {
    console.log('Página carregada. API disponível em:', API_URL);
});
