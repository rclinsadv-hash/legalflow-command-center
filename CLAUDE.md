# CLAUDE.md — Escritório Raphael Lins

> Aprovado por Raphael Correia Lins em 30/09/2026. Leia este arquivo no início de toda sessão.

## 1. Quem sou
- **Raphael Correia Lins**, advogado, **OAB/PB nº 21.036**. Escritório Raphael Lins Advocacia e Consultoria.
- Atuação: Patos-PB e Coremas-PB (Juizados Especiais, Vara Única, Justiça Federal/JEF de Sousa-PB, TJPB e Turmas Recursais).
- Áreas: todas. Maior volume em consignado e fraude bancária (INSS), previdenciário, trabalhista, família, civil, criminal, energia e serviços, licitações.
- O Dr. Mateus Lacerda Rodrigues (OAB/PB 24.369) aparece em procurações e peças conjuntas. Nunca trocar ou misturar as inscrições.
- Assinatura padrão: `RAPHAEL CORREIA LINS` / `OAB/PB nº 21.036`.

## 2. O que produzo
Petição inicial, réplica à contestação, recurso inominado, impugnação a laudo pericial, embargos de declaração, manifestações, habilitação e procurações.
Formato: **.docx** (principal, editável) e **.pdf** (para protocolo).

## 3. Estrutura das peças (observada nos meus documentos)
- **Toda peça:** endereçamento em caixa alta → número do processo → qualificação → título da peça → corpo → pedidos → "Nestes termos, pede deferimento." → local e data → assinatura.
- **Inicial:** síntese da demanda → fatos (numerados) → tutela de urgência → gratuidade e prioridade (idoso) → prejudicial (prescrição) → mérito → jurisprudência do TJPB → pedidos → valor da causa → documentos anexos.
- **Réplica:** síntese do estado processual → advertência sobre documentos reproduzidos → preliminares e prejudicial → fragilidade documental da defesa → mérito → dobra → dano moral → pedidos subsidiários → pedidos.
- **Recurso inominado:** tempestividade → delimitação do objeto recursal → síntese cronológica → razões de reforma → pedidos.
- **Impugnação a laudo:** síntese e tempestividade → fatos → o que o laudo reconheceu → vícios do laudo → direito → pedidos → quesitos suplementares.
- Recursos visuais usados: linha do tempo, tabelas comparativas, prints de extrato com marcações, etiquetas ("NÃO RESPONDIDO", "CONTRADIÇÃO").

## 4. Onde salvar
| O quê | Onde |
|---|---|
| Peças de clientes novos | `G:\Meu Drive\PROCESSOS DE RL ADVOCACIA\CLIENTES NOVOS\<NOME DO CLIENTE>\` |
| Temporários e extrações de PDF | `_tmp\` na raiz da pasta de trabalho |
| Notas, índices, teses | Vault Obsidian `G:\Meu Drive\Escritorio de Raphael Lins` |
| Backup | HD externo (definir letra na Fase 4) |
- **Subpasta por cliente**, com o nome em caixa alta: `CLIENTES NOVOS\FULANO DE TAL\`.
- **Nome do arquivo:** `TIPO_CLIENTE_AAAA-MM-DD.docx`, por exemplo `REPLICA_FULANO_DE_TAL_2026-09-30.docx`. O PDF leva o mesmo nome.
- Nunca sobrescrever: se o arquivo existir, gravar `_v2`, `_v3`. O módulo `pecas_rl.py` (`caminho_saida`) já faz isso.
- Nunca mover, renomear ou apagar arquivo do acervo sem eu pedir.

## 5. Formatação (fixa)
- **Página:** A4. **Margens:** superior e inferior 2,5 cm; esquerda e direita 3,0 cm.
- **Fonte:** Verdana em tudo. **Corpo:** 12 pt, justificado, recuo de primeira linha de 1,25 cm, entrelinha 1,5.
- **Citações e ementas:** 10 pt, recuo esquerdo de 4 cm, entrelinha simples.
- **Títulos:** negrito, azul-marinho `#1F3864`, numeração romana (`I.`, `II.`, `IV.1.`). Título da peça centralizado, 14 pt.
- **Travessão:** permitido nos títulos (ex.: `I — DA SÍNTESE`). No corpo do texto, evitar, salvo se eu pedir.
- **Tabelas:** cabeçalho azul-marinho com texto branco, corpo em 10 pt.
- **Destaques:** vermelho `#CC0000` só para contradição ou ponto crítico; dourado `#D4AF37` só em detalhes.
- **Papel timbrado:** cabeçalho e rodapé com a marca do escritório. Sempre partir de um modelo .docx do escritório.
- **Gerar peças com** `pecas_rl.py` (raiz da pasta de trabalho), sem reescrever a formatação a cada vez.

## 6. Nunca
- Alterar peça já protocolada ou documento do acervo.
- Inventar jurisprudência, súmula, tema, número de processo, ID de documento, valor ou data. Se não estiver nos autos ou não puder ser verificado, marcar `[CONFERIR]`.
- Deixar `XXX`, `[...]` ou campo em branco sem avisar.
- Dizer "pronto para protocolo": a revisão final é minha.
- Gravar dados de cliente (nome, CPF, número de processo) em memória, no repositório ou em nota pública.
- Confundir OAB: 21.036 é a minha; 24.369 é do Dr. Mateus.
- Citar jurisprudência de outro Estado antes de esgotar a do TJPB.

## 7. Conferências obrigatórias por matéria (da minha nota "MAPA GERAL")
- FGTS: confirmar se a suspensão do Tema 810 / ADI 5.873 foi revista antes de protocolar.
- Revisão da Vida Toda: conferir o marco temporal vigente do Tema 1.102.
- Modelos de fornecedor externo (INSS, bancário, energia): adaptar vara, assinatura e jurisprudência.

## 8. Checklist de autoverificação (rodar antes de dizer que terminei)
1. Nome e OAB corretos na assinatura e no corpo.
2. Número do processo, vara, comarca, partes e IDs conferem com os autos.
3. Datas e prazos calculados; tempestividade demonstrada.
4. Valores recalculados; valor da causa = soma dos pedidos.
5. Cada citação (lei, súmula, tema, acórdão) verificada; o que não foi verificado está marcado `[CONFERIR]`.
6. Pedidos cobrem tudo o que a fundamentação sustenta (tutela, gratuidade, prioridade, dobra, dano moral, honorários).
7. Formatação: Verdana 12, margens, timbrado presente, títulos azul-marinho, sem placeholder.
8. Arquivo abre; PDF gerado; número de páginas informado.
9. Salvo na pasta certa, sem sobrescrever.
10. Relatei o que não consegui verificar ou falhou, com a saída real.

## 9. Ferramentas e skills
- `pecas_rl.py`: gera peças no padrão (docx, pdf).
- Skills do escritório: `replica-fraude-consignado`, `inicial-fraude-consignado-jec`, `recurso-inominado-consignado`, `dr-raphael-lins-tenente-contencioso`, `humanizer-br`, entre outras.
