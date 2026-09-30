<# Confere cada item da verificação final e imprime [OK] ou [FALHOU]. Não altera nada, exceto criar um .docx e um .pdf de teste. #>
param(
  [string]$Vault    = "G:\Meu Drive\Escritorio de Raphael Lins",
  [string]$Clientes = "G:\Meu Drive\PROCESSOS DE RL ADVOCACIA\CLIENTES NOVOS"
)
$Repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
function Ok($t)    { Write-Host "[OK]     $t" }
function Falha($t) { Write-Host "[FALHOU] $t" }

Write-Host "== 1. Python e bibliotecas =="
try {
  python --version
  $saida = python -X utf8 -c "import pypdf, docx, reportlab, requests, openpyxl; print('imports OK')" 2>&1
  if ($LASTEXITCODE -eq 0) { Ok "python importa pypdf, docx, reportlab, requests e openpyxl ($saida)" } else { Falha "imports: $saida" }
} catch { Falha "python nao encontrado: $_" }

Write-Host "== 2. Obsidian =="
$exe = Join-Path $env:LOCALAPPDATA "Programs\Obsidian\Obsidian.exe"
if ((Test-Path $exe) -or (winget list --id Obsidian.Obsidian -e 2>$null | Select-String "Obsidian")) { Ok "Obsidian instalado" } else { Falha "Obsidian nao encontrado" }

Write-Host "== 3. Vault e plugins =="
if (Test-Path (Join-Path $Vault ".obsidian")) { Ok "vault encontrado: $Vault" } else { Falha "vault nao encontrado: $Vault" }
foreach ($id in "dataview","obsidian-local-rest-api") {
  if (Test-Path (Join-Path $Vault ".obsidian\plugins\$id\main.js")) { Ok "plugin $id baixado (falta ativar na interface)" } else { Falha "plugin $id ausente" }
}
$comunidade = Join-Path $Vault ".obsidian\community-plugins.json"
if (Test-Path $comunidade) { Write-Host "plugins ativados: $(Get-Content $comunidade -Raw)" } else { Write-Host "[AVISO]  nenhum plugin ativado ainda (ative no Obsidian)" }

Write-Host "== 4. Correcao da nota do vault =="
$mapa = Join-Path $Vault "00 MAPA GERAL.md"
if (Test-Path $mapa) {
  $txt = Get-Content $mapa -Raw -Encoding UTF8
  if ($txt -match "reutilizables|affectam") { Falha "nota ainda tem os erros 'reutilizables'/'affectam'" } else { Ok "nota 00 MAPA GERAL.md corrigida" }
} else { Falha "nota nao encontrada: $mapa" }

Write-Host "== 5. Abrir Obsidian ao ligar =="
$atalho = Join-Path ([Environment]::GetFolderPath("Startup")) "Obsidian - Vault RL.lnk"
if (Test-Path $atalho) { Ok "atalho de inicializacao existe" } else { Falha "atalho de inicializacao ausente" }

Write-Host "== 6. CLAUDE.md =="
$claude = Join-Path $Repo "CLAUDE.md"
if (Test-Path $claude) { Ok "CLAUDE.md na raiz ($((Get-Item $claude).Length) bytes)" } else { Falha "CLAUDE.md nao encontrado em $Repo" }

Write-Host "== 7. Teste ponta a ponta: .docx e .pdf =="
$pasta = Join-Path $Clientes "TESTE DO SISTEMA"
$py = @"
import sys, glob
sys.path.insert(0, r'$Repo')
from pecas_rl import Peca, caminho_saida, docx_para_pdf
p = Peca()
p.titulo_peca('Teste do sistema')
p.paragrafo('Documento de **teste** gerado pelo verificador. Pode apagar esta pasta.')
p.tabela(['Item','Situacao'], [['docx','gerado'], ['pdf','gerado']])
p.fecho('Coremas/PB', '30 de setembro de 2026')
d = p.salvar(caminho_saida('Teste do sistema', 'Teste', base=r'$Clientes'))
print('DOCX:', d)
print('PDF :', docx_para_pdf(d))
"@
python -X utf8 -c $py 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -eq 0) { Ok "docx e pdf gerados em $pasta" } else { Falha "geracao de docx/pdf (veja a mensagem acima)" }
Get-ChildItem -LiteralPath $pasta -ErrorAction SilentlyContinue | ForEach-Object { Write-Host ("  {0}  {1} bytes" -f $_.Name, $_.Length) }
