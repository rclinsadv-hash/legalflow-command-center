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
