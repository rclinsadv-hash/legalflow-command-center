# Instalação no Windows (Python + Obsidian)

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
