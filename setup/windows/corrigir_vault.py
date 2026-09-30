"""Aplica, no vault do Obsidian, a correção aprovada na nota '00 MAPA GERAL.md'.

Uso:
    python corrigir_vault.py "G:\\Meu Drive\\Escritorio de Raphael Lins\\00 MAPA GERAL.md"            (só mostra o que mudaria)
    python corrigir_vault.py "G:\\Meu Drive\\Escritorio de Raphael Lins\\00 MAPA GERAL.md" --aplicar   (grava)

Segurança:
 - Por padrão NÃO grava nada (simulação).
 - Com --aplicar, antes cria uma cópia '00 MAPA GERAL.md.bak-AAAAMMDD-HHMMSS' ao lado do arquivo.
 - Cada trecho precisa ser encontrado exatamente uma vez; se não for, o script para sem alterar nada.
"""
import difflib
import shutil
import sys
from datetime import datetime

TROCAS = [
    ("Peças reutilizables", "Peças reutilizáveis"),
    ("Pendências que affectam protocolo", "Pendências que afetam protocolo"),
    (
        "em peças de terceiros.",
        "em peças de terceiros.\n"
        "Atenção: `OAB/PB 24.369` é a inscrição do Dr. Mateus Lacerda Rodrigues e está correta quando aparece no nome dele; "
        "só é erro quando aparece no nome de Raphael Correia Lins (OAB/PB 21.036).",
    ),
    (
        "5. **OAB divergente:** corrigir para 21.036 nas peças reaproveitadas.",
        "5. **OAB divergente:** corrigir para 21.036 nas peças reaproveitadas, somente onde o número errado aparecer no nome "
        "de Raphael Correia Lins (não alterar o 24.369 do Dr. Mateus).",
    ),
]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    caminho, aplicar = sys.argv[1], "--aplicar" in sys.argv[2:]
    with open(caminho, "r", encoding="utf-8", newline="") as f:
        original = f.read()
    quebra = "\r\n" if "\r\n" in original else "\n"
    novo = original
    for antigo, nova in TROCAS:
        nova = nova.replace("\n", quebra)
        if nova in novo:
            print(f"[já aplicado] {antigo[:60]}")
            continue
        if novo.count(antigo) != 1:
            sys.exit(f"PARADO: o trecho abaixo apareceu {novo.count(antigo)} vez(es) (esperado: 1). Nada foi alterado.\n  {antigo}")
        novo = novo.replace(antigo, nova)
    if novo == original:
        print("Nada a fazer: a nota já está corrigida.")
        return
    diff = difflib.unified_diff(original.splitlines(), novo.splitlines(), "antes", "depois", lineterm="", n=0)
    print("\n".join(diff))
    if not aplicar:
        print("\nSIMULAÇÃO: nada foi gravado. Rode de novo com --aplicar para gravar.")
        return
    copia = f"{caminho}.bak-{datetime.now():%Y%m%d-%H%M%S}"
    shutil.copy2(caminho, copia)
    with open(caminho, "w", encoding="utf-8", newline="") as f:
        f.write(novo)
    print(f"\nGravado. Cópia de segurança: {copia}")


if __name__ == "__main__":
    main()
