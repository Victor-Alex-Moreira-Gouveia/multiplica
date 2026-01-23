const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const typingIndicator = document.getElementById('typingIndicator');

// URL do seu Webhook (ajustada para o link fornecido)
const N8N_WEBHOOK_URL = "https://agentes-n8n.cb16s5.easypanel.host/webhook/f0a13c97-f520-44c9-a76e-547e5c883a38";

// FUNÇÃO DE OUTPUT (Mantendo sua estrutura original)
function appendMessage(content, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = content; 
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// FUNÇÃO PARA CHAMAR O N8N
async function fetchAIResponse(userText) {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userText,
                origin: "Portal Multiplica"
            })
        });

        if (!response.ok) throw new Error('Falha na resposta do servidor');

        const data = await response.json();
        
        // Esconde o indicador de carregamento
        typingIndicator.style.display = 'none';

        // Tenta encontrar a resposta nos campos comuns do n8n (output ou data)
        const botReply = data.output || data.message || data.text || "Desculpe, não consegui processar sua solicitação agora.";
        
        appendMessage(botReply, 'received');

    } catch (error) {
        console.error('Erro:', error);
        typingIndicator.style.display = 'none';
        appendMessage("Ocorreu um erro de conexão. Por favor, tente novamente mais tarde.", 'received');
    }
}

// EVENT LISTENER DO FORMULÁRIO
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if(!text) return;

    // 1. Adiciona a mensagem do usuário visualmente
    appendMessage(text, 'sent');
    userInput.value = '';
    
    // 2. Mostra o indicador de "Aguardando resposta..."
    typingIndicator.style.display = 'block';
    
    // 3. Faz a chamada real para o n8n
    fetchAIResponse(text);
});