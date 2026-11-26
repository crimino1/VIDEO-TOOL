"""Shared fetch helper: IPv4 only (IPv6 hangs here), retries with backoff on 429/errors."""
import socket, time, urllib.request
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda h, p, f=0, *a, **k: _gai(h, p, socket.AF_INET, *a, **k)
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}


def get(url, headers=None, tries=5):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, **(headers or {})}), timeout=120) as r:
                return r.read()
        except Exception as e:
            code = getattr(e, "code", "")
            print("  retry", type(e).__name__, code, flush=True)
            if code == 404:
                return None
            time.sleep((30 if code == 429 else 8) * (i + 1))
    return None
