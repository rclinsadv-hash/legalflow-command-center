"""Cliente mínimo da Local REST API do Obsidian.

A chave vem da variável de ambiente OBSIDIAN_API_KEY. Ela nunca é escrita em arquivo, log ou tela.
Configure com setup\\windows\\CONFIGURAR_OBSIDIAN_API.bat (pede a chave escondida) ou, na mão:
    setx OBSIDIAN_API_KEY "cole-a-chave"      (feche e abra o terminal depois)

Teste de conexão (lê uma nota do vault):
    python obsidian_api.py                          -> lê "Perfil do Escritório.md"
    python obsidian_api.py "Diário de Bordo/2026-09-30 Briefing.md"

Uso em código:
    from obsidian_api import ObsidianAPI
    api = ObsidianAPI()
    texto = api.ler_nota("Perfil do Escritório.md")

O Obsidian precisa estar aberto no vault e o plugin Local REST API ligado.
A API usa certificado autoassinado em 127.0.0.1, então a verificação de certificado é desligada
somente para esse endereço local. Para outro endereço, a verificação fica ligada.
"""
from __future__ import annotations

import os
import sys
from urllib.parse import quote, urlparse

import requests

URL_PADRAO = "https://127.0.0.1:27124"
NOTA_TESTE = "Perfil do Escritório.md"


class ErroObsidian(RuntimeError):
    """Erro com mensagem já pronta para mostrar ao usuário."""


class ObsidianAPI:
    def __init__(self, url: str | None = None, chave: str | None = None, timeout: float = 10.0):
        self.url = (url or os.environ.get("OBSIDIAN_API_URL") or URL_PADRAO).rstrip("/")
        self._chave = chave or os.environ.get("OBSIDIAN_API_KEY")
        if not self._chave:
            raise ErroObsidian(
                "A variável OBSIDIAN_API_KEY não está definida. Rode CONFIGURAR_OBSIDIAN_API.bat "
                "(ou 'setx OBSIDIAN_API_KEY \"sua-chave\"') e abra um terminal novo."
            )
        self.timeout = timeout
        host = urlparse(self.url).hostname or ""
        self._verificar_tls = host not in ("127.0.0.1", "localhost", "::1")
        if not self._verificar_tls:
            try:
                import urllib3
                urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            except Exception:
                pass

    # -- núcleo ---------------------------------------------------------
    def _pedir(self, metodo: str, caminho: str, **kw) -> requests.Response:
        cab = {"Authorization": f"Bearer {self._chave}", **kw.pop("headers", {})}
        try:
            r = requests.request(metodo, f"{self.url}{caminho}", headers=cab, timeout=self.timeout,
                                 verify=self._verificar_tls, **kw)
        except requests.exceptions.ConnectionError:
            raise ErroObsidian(
                f"Não consegui conectar em {self.url}. Confira: o Obsidian está aberto no vault certo e o plugin "
                "'Local REST API' está ligado (Configurações > Plugins da comunidade)."
            ) from None
        except requests.exceptions.Timeout:
            raise ErroObsidian(f"Tempo esgotado falando com {self.url}.") from None
        if r.status_code in (401, 403):
            raise ErroObsidian("A chave foi recusada (401/403). Copie a chave de novo em Local REST API > engrenagem "
                               "e rode CONFIGURAR_OBSIDIAN_API.bat.")
        return r

    @staticmethod
    def _caminho_nota(nota: str) -> str:
        limpo = nota.replace("\\", "/").lstrip("/")
        if not limpo or ".." in limpo.split("/"):
            raise ErroObsidian(f"Caminho de nota inválido: {nota!r}")
        return "/vault/" + "/".join(quote(parte, safe="") for parte in limpo.split("/"))

    # -- operações ------------------------------------------------------
    def status(self) -> dict:
        r = self._pedir("GET", "/")
        r.raise_for_status()
        return r.json()

    def ler_nota(self, nota: str) -> str:
        r = self._pedir("GET", self._caminho_nota(nota), headers={"Accept": "text/markdown"})
        if r.status_code == 404:
            raise ErroObsidian(f"Nota não encontrada no vault: {nota}")
        r.raise_for_status()
        r.encoding = "utf-8"
        return r.text

    def listar_pasta(self, pasta: str = "") -> list[str]:
        caminho = self._caminho_nota(pasta).rstrip("/") + "/" if pasta else "/vault/"
        r = self._pedir("GET", caminho)
        if r.status_code == 404:
            raise ErroObsidian(f"Pasta não encontrada no vault: {pasta}")
        r.raise_for_status()
        return r.json().get("files", [])


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    nota = sys.argv[1] if len(sys.argv) > 1 else NOTA_TESTE
    try:
        api = ObsidianAPI()
        st = api.status()
        print(f"[OK] Conectado em {api.url} | autenticado: {st.get('authenticated')} | serviço: {st.get('service', '?')}")
        texto = api.ler_nota(nota)
        print(f"[OK] Li a nota '{nota}' ({len(texto)} caracteres). Início:")
        print("-" * 40)
        print(texto[:300].rstrip())
        print("-" * 40)
        return 0
    except ErroObsidian as e:
        print(f"[FALHOU] {e}")
        return 1
    except Exception as e:  # nunca imprimir a chave: só o tipo e a mensagem
        print(f"[FALHOU] Erro inesperado: {type(e).__name__}: {e}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
