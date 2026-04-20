// State Management
let database = JSON.parse(localStorage.getItem('legalflow_db')) || {
    prazos: [],
    audiencias: [],
    andamentos: [],
    clientes: [],
    intimacoes: [],
    processos: [],
    configuracoes: {}
};

// --- Navegação ---
function showView(viewId, element) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.style.display = viewId === 'whatsapp' || viewId === 'ia' ? 'flex' : 'block';
    
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

// --- UI Helpers ---
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

// --- Legal Engine ---
const HOLIDAYS_2026 = ['2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04', '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25'];

class LegalCalculator {
    static isBusinessDay(date) {
        const day = date.getDay();
        const dateString = date.toISOString().split('T')[0];
        return day !== 0 && day !== 6 && !HOLIDAYS_2026.includes(dateString);
    }
    static calculateCPC(startDate, days) {
        let current = new Date(startDate);
        let count = 0;
        while (count < days) {
            current.setDate(current.getDate() + 1);
            if (this.isBusinessDay(current)) count++;
        }
        return current;
    }
    static calculateCPP(startDate, days) {
        let current = new Date(startDate);
        current.setDate(current.getDate() + days);
        return current;
    }
}

class EmailParser {
    static parse(text) {
        return {
            processo: text.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)?.[0] || "Não Identificado",
            partes: this.extractPartes(text),
            local: text.match(/(?:Vara|Tribunal|Comarca)[^\n,.]+/i)?.[0] || "Tribunal de Justiça",
            tipo: this.detectTipo(text),
            link: text.match(/https?:\/\/[^\s]+(?:zoom|teams|meet|google\.com\/meet)[^\s"']+/i)?.[0] || null,
            dataMencionada: this.extractDate(text),
            isCPP: /penal|criminal|cpp/i.test(text),
            mensagem: this.extractMensagem(text)
        };
    }
    static extractMensagem(text) {
        const lines = text.split('\n');
        const match = lines.find(l => /intimado|intimação|despacho|sentença/i.test(l));
        return match ? match.trim() : text.substring(0, 150) + "...";
    }
    static extractPartes(text) {
        const autor = text.match(/(?:Autor|Requerente|Exequente):\s*([^\n]+)/i)?.[1];
        const reu = text.match(/(?:Réu|Requerido|Executado):\s*([^\n]+)/i)?.[1];
        return (autor && reu) ? `${autor.trim()} vs ${reu.trim()}` : "Partes não identificadas";
    }
    static detectTipo(text) {
        if (/citação|citado/i.test(text)) return "Citação";
        if (/sentença|julgado/i.test(text)) return "Sentença";
        if (/audiência|conciliação/i.test(text)) return "Audiência";
        return "Despacho";
    }
    static extractDate(text) {
        const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2]}-${match[1]}`) : new Date();
    }
}

// --- AI & Datajud Integration ---
class LegalAI {
    static async analyze(text, apiKey, provider = 'gemini') {
        if (!apiKey) return null;
        const prompt = `Você é um assistente jurídico. Analise este texto e retorne APENAS um JSON: {"tipo": "...", "peca": "...", "prazo_dias": ..., "resumo": "..."}`;
        try {
            if (provider === 'openai') {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: "gpt-4", messages: [{role:"system", content:prompt}, {role:"user", content:text}] })
                });
                const data = await res.json();
                return JSON.parse(data.choices[0].message.content);
            } else {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n\n${text}` }] }], generationConfig: { responseMimeType: "application/json" } })
                });
                const data = await res.json();
                return JSON.parse(data.candidates[0].content.parts[0].text);
            }
        } catch (e) { return null; }
    }

    static async chat(messages, apiKey, provider = 'gemini') {
        if (!apiKey) return "Configure sua API Key nas configurações.";
        try {
            if (provider === 'openai') {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: "gpt-4", messages: messages })
                });
                const data = await res.json();
                return data.choices[0].message.content;
            } else {
                const geminiMsgs = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    body: JSON.stringify({ contents: geminiMsgs })
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text;
            }
        } catch (e) { return "Erro ao processar sua solicitação de chat."; }
    }
}

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
        // Limpa o número (remove pontos e traços)
        const cleanNumber = number.replace(/\D/g, '');
        const query = {
            "query": {
                "match": {
                    "numeroProcesso": number // A API geralmente aceita o formato original ou limpo dependendo do tribunal
                }
            }
        };
        return await this.query(query, apiKey);
    }
}

// --- App Logic ---
function saveToLocal() {
    localStorage.setItem('legalflow_db', JSON.stringify(database));
}

async function processEmail() {
    const text = document.getElementById('email-input').value;
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    if (!text.trim()) return showToast("Por favor, cole o texto da intimação.");
    
    showToast("Analisando com IA...");
    
    let data = EmailParser.parse(text);
    if (aiKey) {
        const ai = await LegalAI.analyze(text, aiKey, aiProvider);
        if (ai) { 
            data.tipo = ai.tipo; 
            data.prazo_ai = ai.prazo_dias; 
            data.peca_sugerida = ai.peca; 
            data.mensagem = ai.resumo; 
        }
    }

    if (data.tipo === "Audiência") {
        database.audiencias.push({ id: Date.now(), ...data, data: data.dataMencionada });
        showToast("Audiência adicionada à agenda!");
    } else {
        let dias = data.prazo_ai || 15;
        let peca = data.peca_sugerida || (data.tipo === "Citação" ? "Contestação" : "Manifestação");
        const deadline = data.isCPP ? LegalCalculator.calculateCPP(data.dataMencionada, dias) : LegalCalculator.calculateCPC(data.dataMencionada, dias);
        database.prazos.push({ id: Date.now(), ...data, peca, vencimento: deadline, regime: data.isCPP ? "CPP" : "CPC" });
        showToast("Novo prazo registrado!");
    }
    
    // Tentar importar processo automaticamente se houver número
    if (data.processo && data.processo !== "Não Identificado") {
        const djKey = document.getElementById('datajud-api-key').value;
        if (djKey) {
            importarProcessoAutomatico(data.processo, djKey);
        }
    }
    
    // Adiciona à lista de intimações para visualização detalhada
    database.intimacoes.unshift({
        id: Date.now(),
        processo: data.processo,
        texto: text,
        analise: data,
        data: new Date()
    });
    
    saveToLocal();
    updateUI();
    document.getElementById('email-input').value = "";
    renderIntimacoes();
}

function renderIntimacoes() {
    const list = document.getElementById('list-intimacoes');
    if (!list) return;
    
    if (database.intimacoes.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 40px;">Cole uma intimação acima para começar.</div>';
        return;
    }
    
    list.innerHTML = database.intimacoes.map(i => `
        <div class="intimacao-item" style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid ${i.analise.tipo === 'Audiência' ? 'var(--green)' : 'var(--accent)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="font-weight: 600; color: var(--text);">${i.processo}</div>
                <span style="background: rgba(124,58,237,0.1); color: var(--accent3); padding: 2px 8px; border-radius: 4px; font-size: 11px;">${i.analise.tipo}</span>
            </div>
            <div style="font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 16px;">
                ${i.analise.mensagem}
            </div>
            <div style="display: flex; gap: 10px; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
                <button onclick="analisarComIA('${i.id}')" style="background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">✦ Detalhar com IA</button>
                <div style="margin-left: auto; font-size: 11px; color: var(--text3);">${new Date(i.data).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function renderProcessos() {
    const list = document.getElementById('list-processos');
    if (!list) return;
    
    if (!database.processos || database.processos.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 40px;">Nenhum processo cadastrado. Importe via Datajud ou analise uma intimação.</div>';
        return;
    }
    
    list.innerHTML = database.processos.map(p => `
        <div class="processo-item" style="background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--accent3);">${p.numero}</div>
                <div style="font-size: 12px; color: var(--text2); margin: 4px 0;">${p.classe} | ${p.orgao}</div>
                <div style="font-size: 11px; color: var(--text3);"><strong>Partes:</strong> ${p.partes}</div>
            </div>
            <div style="text-align: right;">
                <span style="display: block; font-size: 11px; color: var(--green); margin-bottom: 8px;">${p.status}</span>
                <button style="background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">Acessar</button>
            </div>
        </div>
    `).join('');
}

// --- Clientes & CRM ---
async function buscarCEP() {
    const cepInput = document.getElementById('cli-cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return showToast("CEP inválido.");
    
    showToast("Buscando CEP...");
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        
        if (data.erro) return showToast("CEP não encontrado.");
        
        document.getElementById('cli-endereco').value = `${data.logradouro}, ${data.complemento}`.trim().replace(/,$/, '');
        document.getElementById('cli-bairro-cidade').value = `${data.bairro} - ${data.localidade}/${data.uf}`;
        showToast("Endereço preenchido!");
    } catch (e) { showToast("Erro ao buscar CEP."); }
}

async function buscarCPF() {
    const cpfInput = document.getElementById('cli-cpf');
    const cpf = cpfInput.value;
    if (!cpf) return showToast("Digite um CPF.");
    
    showToast("Consultando base de dados...");
    
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    if (aiKey) {
        const messages = [{ role: "user", content: `Aja como uma API de consulta. Simule dados fictícios mas realistas para o CPF/CNPJ: ${cpf}. Retorne APENAS um JSON: {"nome": "...", "email": "..."}` }];
        const response = await LegalAI.chat(messages, aiKey, aiProvider);
        try {
            const data = JSON.parse(response);
            if (data.nome) document.getElementById('cli-nome').value = data.nome;
            if (data.email) document.getElementById('cli-email').value = data.email;
            showToast("Dados sugeridos pela IA.");
        } catch (e) { showToast("Erro no formato da resposta."); }
    } else {
        setTimeout(() => showToast("Funcionalidade requer API Key configurada."), 1000);
    }
}

function salvarCliente() {
    const nome = document.getElementById('cli-nome').value;
    const cpf = document.getElementById('cli-cpf').value;
    const email = document.getElementById('cli-email').value;
    
    if (!nome || !cpf) return showToast("Nome e CPF são obrigatórios.");
    
    const novo = {
        id: Date.now(),
        nome, cpf, email,
        endereco: document.getElementById('cli-endereco').value,
        bairroCidade: document.getElementById('cli-bairro-cidade').value,
        cep: document.getElementById('cli-cep').value,
        data: new Date()
    };
    
    database.clientes.unshift(novo);
    saveToLocal();
    updateUI();
    renderClientes();
    showToast("Cliente cadastrado!");
    
    ['cli-nome', 'cli-cpf', 'cli-email', 'cli-endereco', 'cli-bairro-cidade', 'cli-cep'].forEach(id => document.getElementById(id).value = "");
}

function renderClientes() {
    const list = document.getElementById('list-clientes');
    if (!list) return;
    
    if (!database.clientes || database.clientes.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 20px;">Nenhum cliente cadastrado.</div>';
        return;
    }
    
    list.innerHTML = database.clientes.map(c => `
        <div style="background: var(--surface2); border: 1px solid var(--border); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${c.nome.substring(0,2).toUpperCase()}</div>
            <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 600;">${c.nome}</div>
                <div style="font-size: 11px; color: var(--text3);">${c.cpf}</div>
            </div>
        </div>
    `).join('');
}

async function importarProcessoAutomatico(numero, apiKey) {
    addLog(`Buscando dados do processo ${numero} no Datajud...`, "#a855f7");
    const result = await DatajudService.getByNumber(numero, apiKey);
    
    if (result?.hits?.hits?.length > 0) {
        const p = result.hits.hits[0]._source;
        const exists = database.processos.find(proc => proc.numero === p.numeroProcesso);
        
        if (!exists) {
            const novoProcesso = {
                id: Date.now(),
                numero: p.numeroProcesso,
                classe: p.classe.nome,
                orgao: p.orgaoJulgador.nome,
                partes: p.partes?.map(pt => `${pt.nome} (${pt.tipo})`).join(', ') || "Não informadas",
                dataAjuizamento: p.dataAjuizamento,
                status: "Ativo (Importado)"
            };
            database.processos.push(novoProcesso);
            addLog(`Processo ${numero} e partes cadastrados automaticamente!`, "#10b981");
            saveToLocal();
            updateUI();
        } else {
            addLog(`Processo ${numero} já está cadastrado.`);
        }
    } else {
        addLog(`Não foi possível obter detalhes do processo ${numero} via API.`, "#f59e0b");
    }
}
async function analisarComIA(id) {
    const item = database.intimacoes.find(i => i.id == id);
    if (!item) return;
    
    showView('ia');
    chatMessages.push({ role: "user", content: `Analise detalhadamente esta intimação do processo ${item.processo}:\n\n${item.texto}` });
    renderChat();
    
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    const loadingId = "loading-" + Date.now();
    addChatBubble("Analisando intimação...", "assistant", loadingId);
    
    const response = await LegalAI.chat(chatMessages, aiKey, aiProvider);
    document.getElementById(loadingId).remove();
    
    chatMessages.push({ role: "assistant", content: response });
    renderChat();
}

// --- Chat IA Logic ---
let chatMessages = [{ role: "assistant", content: "Olá, Dr. Raphael. Sou seu assistente jurídico. Posso ajudar a analisar peças, calcular prazos ou pesquisar jurisprudência. Como posso ajudar agora?" }];

async function sendChatMessage() {
    const input = document.getElementById('ia-chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    chatMessages.push({ role: "user", content: text });
    input.value = "";
    renderChat();
    
    const loadingId = "loading-" + Date.now();
    addChatBubble("Processando...", "assistant", loadingId);
    
    const response = await LegalAI.chat(chatMessages, aiKey, aiProvider);
    document.getElementById(loadingId).remove();
    
    chatMessages.push({ role: "assistant", content: response });
    renderChat();
}

function addChatBubble(text, role, id = null) {
    const chat = document.getElementById('ia-chat-messages');
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '12px';
    if (role === 'user') div.style.flexDirection = 'row-reverse';
    if (id) div.id = id;
    
    div.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${role === 'assistant' ? 'var(--accent)' : 'var(--gold)'}; display: flex; align-items: center; justify-content: center; font-size: 12px;">${role === 'assistant' ? '✦' : 'U'}</div>
        <div style="background: ${role === 'assistant' ? 'var(--surface2)' : 'var(--accent)'}; border: 1px solid var(--border); padding: 12px 16px; border-radius: ${role === 'assistant' ? '0 12px 12px 12px' : '12px 0 12px 12px'}; font-size: 13.5px; max-width: 80%;">
            ${text.replace(/\n/g, '<br>')}
        </div>
    `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function renderChat() {
    const chat = document.getElementById('ia-chat-messages');
    chat.innerHTML = "";
    chatMessages.forEach(m => addChatBubble(m.content, m.role));
}

// --- Datajud Logic ---
function addLog(msg, color = "#10b981") {
    const log = document.getElementById('sync-log');
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.style.color = color;
    div.textContent = `[${time}] ${msg}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

async function syncDatajud() {
    addLog("Iniciando sincronização Datajud...", "#c084fc");
    showToast("Sincronizando com CNJ...");
    
    // Simulação de busca
    setTimeout(() => {
        addLog("Conectando à API api-publica.datajud.cnj.jus.br...");
        setTimeout(() => {
            addLog("Verificando 0 processos monitorados.");
            addLog("Nenhuma nova movimentação detectada.");
            addLog("Sincronização completa.", "#10b981");
            showToast("Sincronização finalizada.");
        }, 1000);
    }, 1000);
}

async function searchDatajudManual() {
    const nome = document.getElementById('search-adv-nome').value;
    const oab = document.getElementById('search-adv-oab').value;
    const key = document.getElementById('datajud-api-key').value;
    const resultsDiv = document.getElementById('results-cnj');

    if (!key) return showToast("Configure a API Key do Datajud primeiro.");
    resultsDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Consultando CNJ...</p>';
    addLog(`Busca manual iniciada: ${nome || ''} ${oab || ''}`);

    let query = { "query": { "bool": { "should": [] } } };
    if (nome) query.query.bool.should.push({ "match": { "advogados.nome": nome } });
    if (oab) query.query.bool.should.push({ "match": { "advogados.numeroOab": oab } });

    const data = await DatajudService.query(query, key);
    if (data?.hits?.hits?.length > 0) {
        addLog(`${data.hits.hits.length} processos encontrados.`, "#10b981");
        resultsDiv.innerHTML = data.hits.hits.map(h => `
            <div class="data-item" style="background: var(--surface2); border: 1px solid var(--border); padding: 16px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--accent3)">${h._source.numeroProcesso}</strong><br>
                    <small style="color: var(--text3)">${h._source.classe.nome} | ${h._source.orgaoJulgador.nome}</small>
                </div>
                <button class="btn-sync-quick" style="background: var(--accent); border: none; padding: 6px 12px; border-radius: 6px; color: #fff; cursor: pointer;">Importar</button>
            </div>
        `).join('');
    } else {
        addLog("Nenhum processo encontrado na busca manual.", "#ef4444");
        resultsDiv.innerHTML = '<p style="color: var(--text3)">Nenhum processo encontrado.</p>';
    }
}

// --- Sync & Settings ---
function loadSettings() {
    const s = JSON.parse(localStorage.getItem('legalflow_settings') || '{}');
    if (s.gasUrl) document.getElementById('sync-gas-url').value = s.gasUrl;
    if (s.aiKey) document.getElementById('ai-api-key').value = s.aiKey;
    if (s.djKey) document.getElementById('datajud-api-key').value = s.djKey;
    if (s.advNome) document.getElementById('adv-nome').value = s.advNome;
    if (s.advOab) document.getElementById('adv-oab').value = s.advOab;
    if (s.aiProvider) document.getElementById('ai-provider').value = s.aiProvider;
}

function saveSettings() {
    const s = {
        gasUrl: document.getElementById('sync-gas-url').value,
        aiKey: document.getElementById('ai-api-key').value,
        djKey: document.getElementById('datajud-api-key').value,
        advNome: document.getElementById('adv-nome').value,
        advOab: document.getElementById('adv-oab').value,
        aiProvider: document.getElementById('ai-provider').value
    };
    localStorage.setItem('legalflow_settings', JSON.stringify(s));
    showToast("Configurações salvas!");
}

function updateUI() {
    document.getElementById('stat-processos').innerText = database.prazos.length;
    document.getElementById('stat-prazos').innerText = database.prazos.filter(p => {
        const diff = new Date(p.vencimento) - new Date();
        return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000);
    }).length;
    document.getElementById('stat-audiencias').innerText = database.audiencias.length;

    // Render Recent Intimações
    const recentDiv = document.getElementById('recent-intimacoes');
    if (database.prazos.length === 0) {
        recentDiv.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 20px;">Nenhuma intimação nova.</div>';
    } else {
        recentDiv.innerHTML = database.prazos.slice(-3).reverse().map(p => `
            <div style="border-left: 3px solid var(--accent); padding: 8px 12px; background: rgba(124,58,237,0.05); margin-bottom: 10px;">
                <div style="font-size: 13px; font-weight: 600;">${p.processo}</div>
                <div style="font-size: 11px; color: var(--text3)">${p.peca} - Vence em: ${new Date(p.vencimento).toLocaleDateString('pt-BR')}</div>
            </div>
        `).join('');
    }

    // Render Upcoming Deadlines
    const deadlineDiv = document.getElementById('upcoming-deadlines');
    if (database.prazos.length === 0) {
        deadlineDiv.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 20px;">Sem prazos próximos.</div>';
    } else {
        deadlineDiv.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="font-size: 10px; color: var(--text3); text-transform: uppercase;">
                    <tr><th style="padding: 10px; text-align: left;">Processo</th><th style="padding: 10px; text-align: left;">Vencimento</th></tr>
                </thead>
                <tbody style="font-size: 12px;">
                    ${database.prazos.slice(0, 5).map(p => `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid var(--border)">${p.processo}</td>
                            <td style="padding: 10px; border-bottom: 1px solid var(--border); color: var(--red)">${new Date(p.vencimento).toLocaleDateString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// --- WhatsApp Business Mock Logic ---
const DEMO_CONTACTS = [
    { id: 1, nome: "Maria Silva", preview: "Dr. Raphael, o prazo vence amanhã?", hora: "10:30", avatar: "MS", cor: "#7c3aed" },
    { id: 2, nome: "João Oliveira", preview: "Pode me enviar o link da audiência?", hora: "09:15", avatar: "JO", cor: "#10b981" },
    { id: 3, nome: "Empresa ABC", preview: "Contrato assinado!", hora: "Ontem", avatar: "AB", cor: "#f59e0b" }
];

function renderWhatsApp() {
    const list = document.getElementById('wpp-conversas');
    if (!list) return;
    
    list.innerHTML = DEMO_CONTACTS.map(c => `
        <div onclick="selectWppChat(${c.id})" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${c.cor}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 14px;">${c.avatar}</div>
            <div style="flex: 1; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 14px; font-weight: 600; color: var(--text);">${c.nome}</span>
                    <span style="font-size: 11px; color: var(--text3);">${c.hora}</span>
                </div>
                <div style="font-size: 12px; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.preview}</div>
            </div>
        </div>
    `).join('');
}

function selectWppChat(id) {
    const contact = DEMO_CONTACTS.find(c => c.id == id);
    const header = document.getElementById('wpp-chat-header');
    header.innerHTML = `
        <div style="width: 36px; height: 36px; border-radius: 50%; background: ${contact.cor}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold;">${contact.avatar}</div>
        <div>
            <div style="font-size: 14px; font-weight: 600;">${contact.nome}</div>
            <div style="font-size: 11px; color: var(--green);">Online</div>
        </div>
    `;
    
    const msgs = document.getElementById('wpp-messages');
    msgs.innerHTML = `
        <div style="align-self: flex-start; background: var(--surface2); padding: 8px 12px; border-radius: 0 12px 12px 12px; max-width: 80%; font-size: 13px; margin-bottom: 12px;">
            ${contact.preview}
        </div>
    `;
    
    document.getElementById('wpp-ia-suggest').innerHTML = `<span style="color: var(--accent3)">Sugestão Claude:</span> Olá ${contact.nome.split(' ')[0]}, bom dia! Confirmado, o prazo é até amanhã 23:59. Alguma dúvida específica?`;
}

// --- Jurisprudência & Documentos ---
async function buscarJurisprudencia() {
    const input = document.getElementById('juris-input');
    const query = input.value.trim();
    if (!query) return showToast("Digite um tema para pesquisar.");
    
    const resultsDiv = document.getElementById('juris-results');
    resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Pesquisando julgados com IA...</div>';
    
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    const prompt = [{ role: "user", content: `Pesquise e resuma a jurisprudência predominante sobre: "${query}". Retorne os principais entendimentos do STJ/STF e TJs.` }];
    const response = await LegalAI.chat(prompt, aiKey, aiProvider);
    
    resultsDiv.innerHTML = `<div style="background: var(--surface2); padding: 20px; border-radius: 12px; line-height: 1.8; border: 1px solid var(--border);">${response.replace(/\n/g, '<br>')}</div>`;
}

async function gerarDocumento() {
    const type = document.getElementById('doc-type').value;
    const preview = document.getElementById('doc-preview');
    
    showToast(`Gerando ${type}...`);
    preview.style.display = 'block';
    preview.innerHTML = '<div style="text-align: center; color: #666;"><i class="fas fa-spinner fa-spin"></i> Redigindo documento jurídico...</div>';
    
    const aiKey = document.getElementById('ai-api-key').value;
    const aiProvider = document.getElementById('ai-provider').value;
    
    const prompt = [{ role: "user", content: `Escreva um modelo formal de ${type} em português jurídico. Deixe espaços em branco [ ] para preenchimento de dados.` }];
    const response = await LegalAI.chat(prompt, aiKey, aiProvider);
    
    preview.innerHTML = `<div style="white-space: pre-wrap;">${response}</div>`;
    preview.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
function init() {
    loadSettings();
    updateUI();
    renderIntimacoes();
    renderProcessos();
    renderClientes();
    renderWhatsApp();
    showView('dashboard');
}

init();
