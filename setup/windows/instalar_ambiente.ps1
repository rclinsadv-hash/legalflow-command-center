<#
  Instala e prepara o ambiente Python + Obsidian no Windows.
  Uso (PowerShell, sem precisar de administrador na maioria dos casos):
    powershell -ExecutionPolicy Bypass -File .\instalar_ambiente.ps1 -Vault "G:\Meu Drive\Escritorio de Raphael Lins" -Trabalho "G:\Meu Drive\PROCESSOS DE RL ADVOCACIA"

  Regras:
   - Nao reinstala o que ja existe.
   - Nao apaga, move nem reorganiza nenhum arquivo.
   - Nao ativa plugins (isso e feito na interface do Obsidian).
   - Se o winget pedir permissao de administrador, o Windows mostra a janela: aceite voce mesmo.
#>
param(
  [Parameter(Mandatory=$true)][string]$Vault,
  [Parameter(Mandatory=$true)][string]$Trabalho
)
$ErrorActionPreference = "Stop"

function Tem($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

Write-Host "== 1. Winget ==" -ForegroundColor Cyan
if (-not (Tem "winget")) { throw "winget nao encontrado. Atualize o 'Instalador de Aplicativo' na Microsoft Store e rode de novo." }

Write-Host "== 2. Python ==" -ForegroundColor Cyan
if (Tem "python") { python --version } else {
  winget install --id Python.Python.3.12 -e --source winget --accept-package-agreements --accept-source-agreements
  Write-Host "Python instalado. FECHE e ABRA o PowerShell e rode este script de novo para o PATH atualizar." -ForegroundColor Yellow
  exit 0
}

Write-Host "== 3. Bibliotecas ==" -ForegroundColor Cyan
python -m pip install --upgrade pip
python -m pip install pypdf python-docx reportlab requests openpyxl
foreach ($m in "pypdf","docx","reportlab","requests","openpyxl") {
  python -c "import $m; print('import $m -> OK', getattr($m,'__version__',''))"
}

Write-Host "== 4. Pasta _tmp ==" -ForegroundColor Cyan
$tmp = Join-Path $Trabalho "_tmp"
if (-not (Test-Path $tmp)) { New-Item -ItemType Directory -Path $tmp | Out-Null; Write-Host "criada: $tmp" } else { Write-Host "ja existe: $tmp" }

Write-Host "== 5. Obsidian ==" -ForegroundColor Cyan
$obs = winget list --id Obsidian.Obsidian -e 2>$null | Select-String "Obsidian"
if ($obs) { Write-Host "Obsidian ja instalado." } else {
  winget install --id Obsidian.Obsidian -e --source winget --accept-package-agreements --accept-source-agreements
}

Write-Host "== 6. Plugins (releases oficiais do GitHub) ==" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $Vault ".obsidian"))) { throw "Nao achei .obsidian em '$Vault'. Confira o caminho do vault." }
$plugins = @(
  @{ id="dataview";                repo="blacksmithgu/obsidian-dataview" },
  @{ id="obsidian-local-rest-api"; repo="coddingtonbear/obsidian-local-rest-api" }
)
foreach ($p in $plugins) {
  $dir = Join-Path $Vault ".obsidian\plugins\$($p.id)"
  if (Test-Path (Join-Path $dir "main.js")) { Write-Host "$($p.id): ja presente, nada a fazer."; continue }
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  foreach ($f in "main.js","manifest.json","styles.css") {
    $url = "https://github.com/$($p.repo)/releases/latest/download/$f"
    try { Invoke-WebRequest -Uri $url -OutFile (Join-Path $dir $f) -UseBasicParsing }
    catch { if ($f -ne "styles.css") { throw "Falha ao baixar $url : $_" } }   # styles.css e opcional
  }
  Write-Host "$($p.id): baixado em $dir"
}

Write-Host ""
Write-Host "PRONTO. Falta so a parte na interface:" -ForegroundColor Green
Write-Host " 1) Abra o Obsidian e o vault '$Vault'."
Write-Host " 2) Configuracoes > Plugins da comunidade > desative o 'Modo restrito'."
Write-Host " 3) Ative 'Dataview' e 'Local REST API'."
Write-Host " 4) Em Local REST API, copie a chave e rode:  setx OBSIDIAN_API_KEY ""COLE_A_CHAVE"""
