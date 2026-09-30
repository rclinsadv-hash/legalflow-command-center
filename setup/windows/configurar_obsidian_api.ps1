<# Guarda a chave da Local REST API do Obsidian SEM mostrar na tela e testa a conexao.
   A chave fica so na variavel de ambiente OBSIDIAN_API_KEY do seu usuario do Windows.
   Ela nunca e gravada em arquivo, nem aparece no resultado do teste. #>
param([string]$Vault = "G:\Meu Drive\Escritorio de Raphael Lins")
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host ""
Write-Host "No Obsidian: Configuracoes > Plugins da comunidade > Local REST API > engrenagem > copie a 'API Key'."
Write-Host "Cole a chave aqui e aperte Enter (nada aparece na tela enquanto voce cola):"
$sec = Read-Host -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
$chave = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
$chave = "$chave".Trim()
if ([string]::IsNullOrWhiteSpace($chave)) { Write-Host "Nenhuma chave informada. Nada foi alterado."; exit 1 }

[Environment]::SetEnvironmentVariable("OBSIDIAN_API_KEY", $chave, "User")
$env:OBSIDIAN_API_KEY = $chave
$chave = $null
Write-Host "Chave guardada em OBSIDIAN_API_KEY (somente para o seu usuario do Windows)."

# O registro do teste comeca DEPOIS de digitar a chave, para nunca conte-la.
$log = Join-Path $env:TEMP ("teste-api-{0:yyyyMMdd-HHmmss}.txt" -f (Get-Date))
Start-Transcript -Path $log | Out-Null
Write-Host "== Teste: conectar na API e ler uma nota do vault =="
python -X utf8 (Join-Path $repo "obsidian_api.py")
$codigo = $LASTEXITCODE
Stop-Transcript | Out-Null

$pasta = Get-ChildItem -LiteralPath $Vault -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "Di*rio de Bordo" } | Select-Object -First 1
if ($pasta) {
  $copia = Join-Path $pasta.FullName ("_teste-api-{0:yyyyMMdd-HHmmss}.txt" -f (Get-Date))
  Copy-Item -LiteralPath $log -Destination $copia
  Write-Host "Resultado salvo em: $copia"
}
if ($codigo -eq 0) { Write-Host "PRONTO: a conexao funcionou. Volte ao Claude e escreva: pronto" -ForegroundColor Green }
else { Write-Host "O teste falhou (veja a mensagem acima). Volte ao Claude e escreva: pronto, mesmo assim." -ForegroundColor Yellow }
