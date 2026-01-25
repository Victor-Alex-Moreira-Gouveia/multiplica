/**
 * Configurações do Sistema Multiplica
 */
const WEBHOOK_URL = 'https://agentes-n8n.cb16s5.easypanel.host/webhook/f0a13c97-f520-44c9-a76e-547e5c883a38'; // Substitua pela URL do seu Webhook do n8n

// Seleção de Elementos do DOM
const searchForm = document.getElementById('search-form');
const chatContainer = document.getElementById('chat-container');
const onlineTag = document.getElementById('status-online');
const offlineTag = document.getElementById('status-offline');

/**
 * 1. Monitoramento de Status (Health Check)
 * Tenta realizar um ping no Webhook para verificar disponibilidade
 */
async function checkStatus() {
    try {
        // Usamos mode: 'no-cors' para evitar bloqueios de segurança em testes de "ping"
        await fetch(WEBHOOK_URL, { method: 'HEAD', mode: 'no-cors' });
        
        onlineTag.style.display = 'inline';
        offlineTag.style.display = 'none';
    } catch (error) {
        onlineTag.style.display = 'none';
        offlineTag.style.display = 'inline';
        console.warn("Webhook parece estar offline ou inacessível.");
    }
}

/**
 * 2. Função para adicionar mensagens ao Chat
 */
function addMessage(sender, text, type = 'ia', id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    if (id) msgDiv.id = id;

    // Se for mensagem da IA, processamos o Markdown
    // Se for do Usuário ou Sistema, tratamos como texto simples por segurança
    let content = text;
    if (type === 'ia' && typeof marked !== 'undefined' && id !== 'typing-indicator') {
        content = marked.parse(text); // Transforma Markdown em HTML
    } else {
        content = `<p>${text}</p>`;
    }

    msgDiv.innerHTML = `<strong>${sender}:</strong> ${content}`;
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * 3. Animação de "IA Digitando..."
 */
function showTypingIndicator() {
    const typingId = 'typing-indicator';
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ia');
    typingDiv.id = typingId;
    typingDiv.innerHTML = `<p><strong>Multiplica IA:</strong> <span class="typing-dots">Digitando<span>.</span><span>.</span><span>.</span></span></p>`;
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingId;
}

/**
 * 4. Lógica de Envio do Formulário
 */
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Captura os dados do formulário
    const formData = new FormData(searchForm);
    const payload = Object.fromEntries(formData);

    // Feedback visual imediato
    addMessage('Você', `Busca iniciada para o cargo: ${payload.cargo}`, 'user'); // 'user' se você quiser estilizar diferente
    const typingId = showTypingIndicator();

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro na resposta do servidor');

        const result = await response.json();

        // Remove o indicador de digitando
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();

        // Mapeia a resposta do n8n (ajuste conforme o nome do campo no seu n8n)
        const aiResponse = result.output || result.response || result.text || "Processamento concluído com sucesso.";
        
        addMessage('Multiplica IA', aiResponse);

    } catch (error) {
        // Remove o indicador e mostra o erro
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();

        addMessage('Sistema', 'Ocorreu um erro ao processar sua solicitação. Verifique sua conexão ou se o servidor n8n está ativo.', 'ia');
        console.error('Erro no Fetch:', error);
    }
});

/**
 * Inicialização
 */
// Verifica status ao carregar e a cada 60 segundos
checkStatus();
setInterval(checkStatus, 60000);

// Mensagem de boas-vindas
window.onload = () => {
    addMessage('Multiplica IA', 'Olá! Preencha o formulário ao lado para iniciarmos a análise de candidatos.');
};