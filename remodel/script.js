/**
 * Configurações do Sistema Multiplica
 */
const WEBHOOK_URL = 'https://agentes-n8n.cb16s5.easypanel.host/webhook/f0a13c97-f520-44c9-a76e-547e5c883a38';

const searchForm = document.getElementById('search-form');
const chatContainer = document.getElementById('chat-container');
const onlineTag = document.getElementById('status-online');
const offlineTag = document.getElementById('status-offline');

/**
 * 1. Monitoramento de Status
 */
async function checkStatus() {
    try {
        await fetch(WEBHOOK_URL, { method: 'HEAD', mode: 'no-cors' });
        onlineTag.style.display = 'inline';
        offlineTag.style.display = 'none';
    } catch (error) {
        onlineTag.style.display = 'none';
        offlineTag.style.display = 'inline';
    }
}

/**
 * 2. Função para adicionar mensagens ao Chat (Corrigida para interpretar HTML)
 */
function addMessage(sender, text, type = 'ia', id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    if (id) msgDiv.id = id;

    // Apenas adiciona o rótulo do remetente se não for um card individual
    if (type !== 'ia-card') {
        const label = document.createElement('strong');
        label.textContent = `${sender}: `;
        msgDiv.appendChild(label);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // CORREÇÃO: Verifica se o texto é um bloco de HTML (Candidate Card)
    if (text.trim().startsWith('<div')) {
        contentDiv.innerHTML = text; // Interpreta as tags HTML
    } else if (type === 'ia' && typeof marked !== 'undefined' && id !== 'typing-indicator') {
        contentDiv.innerHTML = marked.parse(text); // Renderiza Markdown se disponível
    } else {
        const p = document.createElement('p');
        p.textContent = text;
        contentDiv.appendChild(p);
    }

    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * 3. Indicador de Processamento
 */
function showTypingIndicator() {
    const typingId = 'typing-indicator';
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ia');
    typingDiv.id = typingId;
    typingDiv.innerHTML = `<p><strong>Multiplica IA:</strong> <span class="typing-dots">Analisando candidatos<span>.</span><span>.</span><span>.</span></span></p>`;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingId;
}

/**
 * 4. Lógica de Envio e Resposta Síncrona (Timeout de 5min)
 */
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(searchForm);
    const payload = {
        search_query: formData.get('cargo'),
        location: formData.get('location'),
        job_description: formData.get('description')
    };

    addMessage('Você', `Iniciando análise para ${payload.search_query}...`, 'user');
    const typingId = showTypingIndicator();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutos

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Erro no servidor');

        const result = await response.json();
        
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();

        if (Array.isArray(result)) {
            addMessage('Multiplica IA', 'Aqui estão os perfis selecionados para a vaga:');
            
            result.forEach(item => {
                try {
                    // Tenta converter a string 'output' em objeto JSON
                    const candidateData = typeof item.output === 'string' ? JSON.parse(item.output) : item.output;
                    renderCandidateCard(candidateData);
                } catch (e) {
                    addMessage('Multiplica IA', item.output || "Erro ao processar candidato.");
                }
            });
        }
    } catch (error) {
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();

        if (error.name === 'AbortError') {
            addMessage('Sistema', 'A busca excedeu 5 minutos. Tente reduzir o número de candidatos.', 'ia');
        } else {
            addMessage('Sistema', 'Ocorreu um erro na comunicação com a IA.', 'ia');
        }
    }
});

/**
 * 5. Renderização do Card de Candidato
 */
function renderCandidateCard(c) {
    const cardHtml = `
        <div class="candidate-card">
            <div class="card-header">
                <strong>${c.candidateName}</strong>
                <span class="badge-rating">${c.overallRating}</span>
            </div>
            <div class="card-body">
                <p><strong>Cargo:</strong> ${c.role}</p>
                <p><strong>Recomendação:</strong> ${c.recommendation}</p>
                <p class="summary">${c.summaryReason}</p>
            </div>
            <div class="card-footer">
                <a href="${c.linkedin_profile}" target="_blank" class="linkedin-link">Ver LinkedIn</a>
            </div>
        </div>
    `;
    
    // Usa o tipo 'ia-card' para evitar repetição do rótulo "Multiplica IA"
    addMessage('IA', cardHtml, 'ia-card');
}

checkStatus();
window.onload = () => addMessage('Multiplica IA', 'Pronto para analisar novos perfis.');