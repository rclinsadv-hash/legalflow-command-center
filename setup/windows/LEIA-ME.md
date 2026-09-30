# Instalação no Windows (Python + Obsidian): forma mais simples

1. Neste endereço, baixe o pacote (botão do navegador; precisa estar logado no GitHub):
   https://github.com/rclinsadv-hash/legalflow-command-center/archive/refs/heads/claude/laughing-wright-kj3am2.zip
2. Extraia o ZIP na pasta Documentos (botão direito > Extrair tudo).
3. Abra a pasta extraída > `setup` > `windows` e dê **dois cliques em `RODAR_TUDO.bat`**.
   - Se o Windows avisar "O Windows protegeu o computador", clique em **Mais informações > Executar assim mesmo**.
   - Se aparecer uma janela pedindo permissão para instalar, aceite.
   - Se o Python for instalado agora, a janela pede para fechar: feche e dê dois cliques em `RODAR_TUDO.bat` de novo.
4. Ao terminar, abra o **Obsidian**, vá em Configurações > Plugins da comunidade, desative o **Modo restrito** e ative **Dataview** e **Local REST API**.
5. Volte ao Claude e escreva: **pronto**. O resultado fica salvo no vault, em `Diário de Bordo`, e o Claude lê de lá.

O que o `RODAR_TUDO.bat` faz: instala o que faltar (sem reinstalar o que já existe), corrige a nota do vault (com cópia de segurança), cria o atalho para abrir o Obsidian ao ligar, gera um .docx e um .pdf de teste em `CLIENTES NOVOS\TESTE DO SISTEMA` (pode apagar depois) e imprime `[OK]` ou `[FALHOU]` para cada item. Nada é apagado ou movido.

---
## Detalhes técnicos

Este roteiro prepara o seu computador **sem apagar, mover ou reorganizar nada**.

1. Abra o PowerShell (menu Iniciar > digite `PowerShell`).
2. Rode (ajuste os dois caminhos se forem diferentes):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar_ambiente.ps1 `
  -Vault "G:\Meu Drive\Escritorio de Raphael Lins" `
  -Trabalho "G:\Meu Drive\PROCESSOS DE RL ADVOCACIA"
```

3. Se o script instalar o Python agora, feche e abra o PowerShell e rode o mesmo comando outra vez.
4. Cole aqui no chat a saída completa. Só considero pronto o que aparecer com `OK` nela.
5. Abra o Obsidian, desative o Modo restrito e ative **Dataview** e **Local REST API**.

O script pula tudo o que já existir. Ele **não** foi executado em Windows por mim: testei apenas a lógica dos passos de Python neste ambiente Linux.

## Fase 4: automação (não testada em Windows)
```powershell
# Abrir o Obsidian no vault ao ligar o computador
powershell -ExecutionPolicy Bypass -File .\instalar_inicializacao.ps1 -Vault "G:\Meu Drive\Escritorio de Raphael Lins"

# Backup (só copia, nunca apaga no destino). Rode uma vez à mão e confira; depois agende com -Agendar
powershell -ExecutionPolicy Bypass -File .\backup.ps1 -Destino "E:\Backup RL"
powershell -ExecutionPolicy Bypass -File .\backup.ps1 -Destino "E:\Backup RL" -Agendar
```
O backup recusa destino no Google Drive (G:) e, no disco C:, exige `-ConfirmoDiscoInterno`, exceto dentro do OneDrive.
