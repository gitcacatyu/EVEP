// ===== CONFIGURAÇÃO DA API GEMINI =====
// Obtenha uma API key GRATUITA em: https://makersuite.google.com/app/apikey
// Basta colar sua chave abaixo (entre as aspas)

const GEMINI_API_KEY = 'AIzaSyC-YOUR-API-KEY-HERE'; // ← SUBSTITUA COM SUA CHAVE!
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ===== IA INTELIGENTE COM API REAL =====

class IAInteligente {
    constructor() {
        this.conversaHistorico = this.carregarHistorico();
        this.contextoUsuario = this.carregarContexto();
        this.usarAPIReal = this.verificarAPIKey();
        this.inicializarTopicos();
        this.ultimaRequisicao = 0;
        this.intervaloMinimo = 1000; // 1 segundo entre requisições
    }

    verificarAPIKey() {
        // Se a chave estiver preenchida e não for o padrão, usar API real
        const temChave = GEMINI_API_KEY && !GEMINI_API_KEY.includes('YOUR-API-KEY');
        if (temChave) {
            console.log('%c✅ API Gemini configurada! Usando IA real.', 'color: green; font-weight: bold;');
        } else {
            console.log('%c⚠️ API Gemini não configurada. Use: https://makersuite.google.com/app/apikey', 'color: orange; font-weight: bold;');
        }
        return temChave;
    }

    inicializarTopicos() {
        // Nada necessário aqui, pois usaremos a API para tudo
    }

    carregarHistorico() {
        const historico = localStorage.getItem('iaHistorico');
        return historico ? JSON.parse(historico) : [];
    }

    salvarHistorico() {
        localStorage.setItem('iaHistorico', JSON.stringify(this.conversaHistorico));
    }

    carregarContexto() {
        const contexto = localStorage.getItem('iaContexto');
        return contexto ? JSON.parse(contexto) : {
            nome: localStorage.getItem('usuarioAtual') || 'Usuário',
            conversasTotal: 0
        };
    }

    salvarContexto() {
        localStorage.setItem('iaContexto', JSON.stringify(this.contextoUsuario));
    }

    // ===== CHAMAR API GEMINI =====
    async chamarGemini(mensagem) {
        try {
            // Controlar rate limiting
            const agora = Date.now();
            if (agora - this.ultimaRequisicao < this.intervaloMinimo) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.intervaloMinimo - (agora - this.ultimaRequisicao))
                );
            }
            this.ultimaRequisicao = Date.now();

            // Preparar histórico para maior contexto
            const historicoContexto = this.conversaHistorico.slice(-6).map(msg => 
                `Usuário: ${msg.usuario}\nAssistente: ${msg.ia}`
            ).join('\n\n');

            const prompt = historicoContexto ? 
                `Histórico da conversa:\n${historicoContexto}\n\nNova mensagem do usuário: ${mensagem}\n\nResponda de forma amigável, concisa (máximo 3 linhas) e em português brasileiro.` :
                `Mensagem do usuário: ${mensagem}\n\nResponda de forma amigável, concisa (máximo 3 linhas) e em português brasileiro.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 150,
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('❌ Chave de API inválida! Verifique sua chave em https://makersuite.google.com/app/apikey');
                    return this.responderOffline(mensagem);
                }
                if (response.status === 429) {
                    return "Desculpe, fiz muitas requisições muito rápido. Espere alguns segundos e tente novamente! ⏳";
                }
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const texto = data.candidates[0].content.parts[0].text;
                return texto.trim();
            }

            return this.responderOffline(mensagem);
        } catch (erro) {
            console.error('Erro ao chamar Gemini:', erro);
            return this.responderOffline(mensagem);
        }
    }

    // ===== RESPOSTAS OFFLINE (FALLBACK) =====
    responderOffline(mensagem) {
        const msg = mensagem.toLowerCase();
        
        // Respostas rápidas sem API
        if (msg.includes('hora')) {
            const agora = new Date();
            return `⏰ Agora são ${agora.getHours()}:${String(agora.getMinutes()).padStart(2, '0')}`;
        }

        if (msg.includes('piada')) {
            return this.contarPiada();
        }

        if (/\d+[\+\-\*\/]\d+/.test(msg) || msg.includes('calcul')) {
            const resultado = this.resolverMatematica(msg);
            if (resultado !== null) return `🧮 O resultado é: **${resultado}**`;
        }

        // Resposta genérica segura
        return `Estou com dificuldade de conectar à IA neste momento. 🤔 Tente reformular sua pergunta ou em alguns segundos. (Verifique se configurou a API key!)`;
    }

    // ===== RESOLVER MATEMÁTICA (OFFLINE) =====
    resolverMatematica(expressao) {
        try {
            let expr = expressao.trim().replace(/\s+/g, '');
            expr = expr.replace('x', '*').replace('÷', '/').replace('×', '*').replace('^', '**').replace('√', 'Math.sqrt');

            if (!/^[0-9+\-*/().%Math.sqrt**]+$/.test(expr)) {
                return null;
            }

            const resultado = Function('"use strict"; return (' + expr + ')')();
            
            if (typeof resultado !== 'number' || isNaN(resultado)) {
                return null;
            }

            return Math.round(resultado * 10000) / 10000;
        } catch (e) {
            return null;
        }
    }

    // ===== PIADAS =====
    contarPiada() {
        const piadas = [
            "🤣 Por que o livro de matemática se suicidou? Porque tinha muitos problemas!",
            "😆 O que o C disse pro C++? Você é muito++ pra mim!",
            "🐻 Como é que se chama um urso sem dentes? Urso de goma!",
            "📡 Por que o programador saiu de casa? Perdeu a conexão com a internet!",
            "💾 Qual é a diferença entre um programador e um psicólogo? O psicólogo sabe que não é culpa do programador!"
        ];
        return piadas[Math.floor(Math.random() * piadas.length)];
    }

    // ===== GERAR RESPOSTA PRINCIPAL =====
    async gerarResposta(mensagem) {
        // Se API está configurada, usar ela
        if (this.usarAPIReal) {
            const resposta = await this.chamarGemini(mensagem);
            this.salvarConversa(mensagem, resposta);
            return resposta;
        }

        // Fallback para respostas locais simples
        const msg = mensagem.toLowerCase().trim();

        if (msg.includes('hora') || msg.includes('horas')) {
            const agora = new Date();
            return `⏰ Agora são ${agora.getHours()}:${String(agora.getMinutes()).padStart(2, '0')}`;
        }

        if (msg.includes('piada') || msg.includes('brincadeira')) {
            return this.contarPiada();
        }

        if (/\d+[\+\-\*\/]\d+/.test(msg)) {
            const resultado = this.resolverMatematica(msg);
            if (resultado !== null) return `🧮 O resultado é: **${resultado}**`;
        }

        if (['oi', 'ola', 'hey', 'e aí', 'fala'].some(s => msg.includes(s))) {
            return `Oi! Tudo bem? 😊 Como posso ajudar você?`;
        }

        return `Interesting! 🤔 Para respostas mais completas, configure a API key do Gemini!`;
    }

    salvarConversa(mensagemUsuario, respostaIA) {
        this.conversaHistorico.push({
            usuario: mensagemUsuario,
            ia: respostaIA,
            timestamp: new Date().toLocaleTimeString('pt-BR')
        });

        if (this.conversaHistorico.length > 50) {
            this.conversaHistorico.shift();
        }

        this.salvarHistorico();
        this.contextoUsuario.conversasTotal++;
        this.salvarContexto();
    }

    obterHistorico() {
        return this.conversaHistorico;
    }
}

// ===== INICIALIZAR IA =====
const ia = new IAInteligente();

// ===== FUNÇÃO PARA ENVIAR MENSAGEM =====
async function enviarMensagem() {
    const input = document.getElementById('mensagemInput');
    const mensagem = input.value.trim();

    if (mensagem === '') return;

    // Adicionar mensagem do usuário
    adicionarMensagem(mensagem, 'user');
    input.value = '';
    input.focus();

    // Mostrar indicador de digitação
    mostrarDigitando();
    
    try {
        // Aguardar resposta da IA (com ou sem API)
        const resposta = await ia.gerarResposta(mensagem);
        removerDigitando();
        adicionarMensagem(resposta, 'bot');
    } catch (erro) {
        console.error('Erro:', erro);
        removerDigitando();
        adicionarMensagem('Desculpe, algo deu errado. Tente novamente em alguns momentos.', 'bot');
    }
}

// ===== FUNÇÕES DE UI =====
function adicionarMensagem(texto, tipo) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remover mensagem de boas-vindas
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${tipo}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = texto.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function mostrarDigitando() {
    const chatMessages = document.getElementById('chatMessages');
    const digitandoDiv = document.createElement('div');
    digitandoDiv.className = 'message bot';
    digitandoDiv.id = 'digitando';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content loading';
    contentDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    
    digitandoDiv.appendChild(contentDiv);
    chatMessages.appendChild(digitandoDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removerDigitando() {
    const digitando = document.getElementById('digitando');
    if (digitando) {
        digitando.remove();
    }
}

// ===== VERIFICAÇÃO DE LOGIN =====
function verificaLogin() {
    if (localStorage.getItem('logado') !== 'true') {
        window.location.href = 'login.html';
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('mensagemInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enviarMensagem();
        }
    });

    const usuarioAtual = localStorage.getItem('usuarioAtual');
    if (usuarioAtual) {
        document.getElementById('userGreeting').textContent = `Bem-vindo, ${usuarioAtual}! 👋`;
    }

    verificaLogin();
});


