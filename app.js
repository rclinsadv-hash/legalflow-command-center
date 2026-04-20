// --- State Management ---
let database = JSON.parse(localStorage.getItem('legalflow_db')) || {
    prazos: [],
    audiencias: [],
    andamentos: [],
    clientes: [],
    intimacoes: [],
    processos: [],
    configuracoes: {}
};

function saveToLocal() {
    localStorage.setItem('legalflow_db', JSON.stringify(database));
}

// --- Navigation ---
function showView(viewId, element) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.style.display = (viewId === 'whatsapp' || viewId === 'ia') ? 'flex' : 'block';
    }
    
    if (element) element.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'intimacoes': 'Intimações',
        'agenda': 'Agenda & Prazos',
        'processos': 'Processos & Casos',
        'clientes': 'Clientes & CRM',
        'financeiro': 'Financeiro',
        'whatsapp': 'WhatsApp Business',
        'jurisprudencia': 'Pesquisa de Jurisprudência',
        'documentos': 'Documentos & Assinaturas',
        'ia': 'Assistente Jurídico IA',
        'datajud': 'Datajud Sync (CNJ)',
        'config': 'Configurações'
    };
    document.getElementById('page-title').innerText = titles[viewId] || 'Legalflow';
}

// --- Legal Logic (Calculators) ---
class LegalCalculator {
    static calculateCPC(startDate, days) {
        let date = new Date(startDate);
        let added = 0;
        while (added < days) {
            date.setDate(date.getDate() + 1);
            if (date.getDay() !== 0 && date.getDay() !== 6) added++;
        }
        return date.toLocaleDateString('pt-BR');
    }
    static calculateCPP(startDate, days) {
        let date = new Date(startDate);
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('pt-BR');
    }
}

// --- AI Integration (LegalAI) ---
class LegalAI {
    static async chat(messages, apiKey, provider) {
        if (!apiKey) return "API Key não configurada. Vá em Configurações.";
        
        try {
            if (provider === 'gemini') {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: messages[messages.length-1].content }] }] })
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text;
            } else {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: "gpt-4", messages })
                });
                const data = await res.json();
                return data.choices[0].message.content;
            }
        } catch (e) { 
            console.error(e);
            return "Erro ao processar sua solicitação de chat."; 
        }
    }
}

// --- Datajud Service ---
class DatajudService {
    static async query(queryBody, apiKey) {
        try {
            const res = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_tjpb/_search`, {
                method: 'POST',
                headers: { 'Authorization': `APIKey ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(queryBody)
            });
            return await res.json();
        } catch (e) { return null; }
    }

    static async getByNumber(number, apiKey) {
        const query = { "query": { "match": { "numeroProcesso": number } } };
        return await this.query(query, apiKey);
    }
}

// --- App Functions ---
async function processEmail() {
    const textInput = document.getElementById('email-input');
    const text = textInput.value.trim();
    if (!text) return showToast("Cole o texto da intimação.");
    
    showToast("Analisando intimação com IA...");
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    const messages = [{ role: "user", content: `Analise este texto jurídico e extraia os dados. Retorne APENAS JSON: {"processo":"...", "tipo":"Prazo ou Audiência", "mensagem":"resumo curto", "peca_sugerida":"...", "prazo_ai":15}. Texto: ${text}` }];
    const response = await LegalAI.chat(messages, aiKey, aiProvider);
    
    let data;
    try {
        data = JSON.parse(response);
    } catch(e) {
        data = { processo: "Não Identificado", tipo: "Prazo", mensagem: response, peca_sugerida: "Petição", prazo_ai: 15 };
    }

    database.intimacoes.unshift({
        id: Date.now(),
        processo: data.processo,
        texto: text,
        analise: data,
        data: new Date()
    });
    
    // Tentar importar processo automaticamente
    if (data.processo && data.processo !== "Não Identificado") {
        const djKey = document.getElementById('datajud-api-key').value;
        if (djKey) importarProcessoAutomatico(data.processo, djKey);
    }

    saveToLocal();
    updateUI();
    renderIntimacoes();
    textInput.value = "";
    showToast("Intimação analisada e registrada!");
}

function renderIntimacoes() {
    const list = document.getElementById('list-intimacoes');
    if (!list) return;
    if (database.intimacoes.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 40px;">Nenhuma intimação registrada.</div>';
        return;
    }
    list.innerHTML = database.intimacoes.map(i => `
        <div class="intimacao-item" style="background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="font-weight: 600;">${i.processo}</div>
                <span style="font-size: 11px; background: var(--accent); padding: 2px 8px; border-radius: 4px;">${i.analise.tipo}</span>
            </div>
            <div style="font-size: 13px; color: var(--text2);">${i.analise.mensagem}</div>
            <div style="margin-top: 12px; font-size: 11px; color: var(--text3);">${new Date(i.data).toLocaleString()}</div>
        </div>
    `).join('');
}

async function importarProcessoAutomatico(numero, apiKey) {
    const result = await DatajudService.getByNumber(numero, apiKey);
    if (result?.hits?.hits?.length > 0) {
        const p = result.hits.hits[0]._source;
        const exists = database.processos.find(proc => proc.numero === p.numeroProcesso);
        if (!exists) {
            database.processos.push({
                id: Date.now(),
                numero: p.numeroProcesso,
                classe: p.classe.nome,
                orgao: p.orgaoJulgador.nome,
                partes: p.partes?.map(pt => pt.nome).join(', '),
                status: "Ativo (Importado)"
            });
            saveToLocal();
            updateUI();
            renderProcessos();
        }
    }
}

function renderProcessos() {
    const list = document.getElementById('list-processos');
    if (!list) return;
    list.innerHTML = database.processos.map(p => `
        <div style="background: var(--surface2); border: 1px solid var(--border); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
            <div style="font-weight: bold; color: var(--accent3);">${p.numero}</div>
            <div style="font-size: 12px;">${p.classe} | ${p.orgao}</div>
        </div>
    `).join('');
}

// --- Chat IA ---
let chatMessages = [{ role: "assistant", content: "Olá, como posso ajudar hoje?" }];
async function sendChatMessage() {
    const input = document.getElementById('ia-chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    chatMessages.push({ role: "user", content: text });
    input.value = "";
    renderChat();
    
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    const response = await LegalAI.chat(chatMessages, aiKey, aiProvider);
    
    chatMessages.push({ role: "assistant", content: response });
    renderChat();
}

function renderChat() {
    const chat = document.getElementById('ia-chat-messages');
    chat.innerHTML = chatMessages.map(m => `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; ${m.role === 'user' ? 'flex-direction: row-reverse' : ''}">
            <div style="background: ${m.role === 'user' ? 'var(--accent)' : 'var(--surface2)'}; padding: 10px 15px; border-radius: 12px; max-width: 80%; font-size: 13px;">
                ${m.role === 'assistant' ? '✦ ' : ''}${m.content}
            </div>
        </div>
    `).join('');
    chat.scrollTop = chat.scrollHeight;
}

// --- Utils ---
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

function saveSettings() {
    const settings = {
        advNome: document.getElementById('adv-nome').value,
        advOab: document.getElementById('adv-oab').value,
        aiProvider: document.getElementById('ai-provider').value,
        aiKey: document.getElementById('ai-api-key').value,
        djKey: document.getElementById('datajud-api-key').value
    };
    database.configuracoes = settings;
    saveToLocal();
    showToast("Configurações salvas!");
}

function loadSettings() {
    const s = database.configuracoes;
    if (s) {
        document.getElementById('adv-nome').value = s.advNome || "";
        document.getElementById('adv-oab').value = s.advOab || "";
        document.getElementById('ai-provider').value = s.aiProvider || "gemini";
        document.getElementById('ai-api-key').value = s.aiKey || "";
        document.getElementById('datajud-api-key').value = s.djKey || "";
    }
}

function updateUI() {
    document.getElementById('stat-processos').innerText = database.processos?.length || 0;
    document.getElementById('stat-prazos').innerText = database.prazos?.length || 0;
    document.getElementById('stat-audiencias').innerText = database.audiencias?.length || 0;
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// --- Initialization ---
function init() {
    loadSettings();
    updateUI();
    renderIntimacoes();
    renderProcessos();
    renderChat();
    showView('dashboard');
}

window.onload = init;
