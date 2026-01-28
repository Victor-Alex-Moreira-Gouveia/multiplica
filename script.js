/**
 * Configurações do Sistema Multiplica
 */
const WEBHOOK_URL = 'https://agentes-n8n.cb16s5.easypanel.host/webhook/f0a13c97-f520-44c9-a76e-547e5c883a38';

const searchForm = document.getElementById('search-form');
const chatContainer = document.getElementById('chat-container');
const submitButton = searchForm.querySelector('button[type="submit"]');
const container = document.getElementById('chat-container');
container.scrollTop = container.scrollHeight;

/**
 * 1. Função para adicionar mensagens ao Chat
 * Melhoria: Adicionado efeito de scroll suave e suporte a fragmentos
 */
function addMessage(sender, text, type = 'ia', id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    if (id) msgDiv.id = id;

    if (type !== 'ia-card') {
        const label = document.createElement('strong');
        label.textContent = `${sender}: `;
        msgDiv.appendChild(label);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (text.trim().startsWith('<div')) {
        contentDiv.innerHTML = text;
    } else if (type === 'ia' && typeof marked !== 'undefined' && id !== 'typing-indicator') {
        contentDiv.innerHTML = marked.parse(text);
    } else {
        const p = document.createElement('p');
        p.textContent = text;
        contentDiv.appendChild(p);
    }

    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);
    
    // Scroll Suave para a nova mensagem
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * 2. Indicador de Processamento Otimizado
 */
function showTypingIndicator() {
    const typingId = 'typing-indicator';
    if (document.getElementById(typingId)) return typingId; // Evita duplicatas

    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ia');
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
        <div class="message-content">
            <p><i class="fas fa-robot"></i> <strong>Multiplica IA:</strong> 
            <span class="typing-dots">Analisando perfis<span>.</span><span>.</span><span>.</span></span></p>
        </div>`;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingId;
}

/**
 * 3. Lógica de Envio com Bloqueio de Botão (Prevenção de Spam)
 */
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(searchForm);
    
    // CORREÇÃO AQUI: Extraindo o valor do input "cargo"
    const cargo = formData.get('cargo');
    const localizacao = formData.get('location');
    const descricao = formData.get('description');

    // Validação básica para não enviar busca vazia
    if (!cargo) {
        alert("Por favor, digite o cargo desejado.");
        return;
    }

    const payload = {
        search_query: cargo, // Agora envia o texto, não o objeto
        location: localizacao,
        job_description: descricao
    };

    // Bloqueio do botão para evitar múltiplos envios
    const originalBtnText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

    addMessage('Você', `Busca para: ${cargo}`, 'user');
    const typingId = showTypingIndicator();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); 

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();

        if (!response.ok) throw new Error('Erro no servidor');

        const result = await response.json();
        
        if (Array.isArray(result) && result.length > 0) {
            addMessage('Multiplica IA', `Encontrei **${result.length}** candidatos potenciais:`);
            
            result.forEach(item => {
                try {
                    const candidateData = typeof item.output === 'string' ? JSON.parse(item.output) : item.output;
                    renderCandidateCard(candidateData);
                } catch (e) {
                    addMessage('Multiplica IA', item.output || "Dados do candidato em formato inválido.");
                }
            });
            searchForm.reset();
        } else {
            addMessage('Multiplica IA', 'Não encontrei candidatos com esses critérios específicos.');
        }

    } catch (error) {
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();

        let errorMsg = 'Ocorreu um erro na comunicação com a IA.';
        if (error.name === 'AbortError') errorMsg = 'A busca demorou demais. Tente ser mais específico.';
        
        addMessage('Sistema', errorMsg, 'ia');
        console.error("Erro na requisição:", error);
    } finally {
        // Reativa o botão e volta o texto original
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnText;
    }
});

/**
 * 4. Renderização do Card de Candidato (Melhorado com Ícones)
 */
function renderCandidateCard(c) {
    // Fallback para campos vazios
    const name = c.candidateName || 'Candidato Confidencial';
    const rating = c.overallRating || 'N/A';
    
    const cardHtml = `
        <div class="candidate-card">
            <div class="card-header">
                <strong><i class="fas fa-user-tie"></i> ${name}</strong>
                <span class="badge-rating"><i class="fas fa-star"></i> ${rating}</span>
            </div>
            <div class="card-body">
                <p><strong><i class="fas fa-briefcase"></i> Cargo:</strong> ${c.role || 'Não informado'}</p>
                <p><strong><i class="fas fa-thumbs-up"></i> Recomendação:</strong> ${c.recommendation || 'Ver detalhes'}</p>
                <p class="summary">"${c.summaryReason || 'Sem resumo disponível.'}"</p>
            </div>
            <div class="card-footer">
                <a href="${c.linkedin_profile}" target="_blank" class="linkedin-link">
                    <i class="fab fa-linkedin"></i> Abrir Perfil Profissional
                </a>
            </div>
        </div>
    `;
    
    addMessage('IA', cardHtml, 'ia-card');
}

// Inicialização
window.onload = () => {
    addMessage('Multiplica IA', 'Olá! Sou o assistente do Grupo Multiplica. Preencha os campos ao lado para iniciarmos a triagem de talentos.');
};