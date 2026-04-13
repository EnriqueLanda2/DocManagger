import os
import base64
import json as _json
from loguru import logger
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from django.conf import settings

_SECURE_KEY = b'docPlatformSecureKey2024!!!!!!!!'  # 32 bytes AES-256


def get_client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR', '')


def log_action(request, action, target=''):
    from .models import AuditLog
    user = request.user if request.user.is_authenticated else None
    ip = get_client_ip(request)
    AuditLog.objects.create(user=user, action=action, host=ip, target=target)
    logger.info(f"[AUDIT] {action} | user={getattr(user, 'username', 'anon')} | host={ip} | target={target}")


def _cipher():
    key = getattr(settings, 'FERNET_KEY', None)
    if not key:
        key = Fernet.generate_key().decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_token(value: str) -> str:
    return _cipher().encrypt(value.encode()).decode()


def decrypt_token(token: str) -> str | None:
    try:
        return _cipher().decrypt(token.encode()).decode()
    except (InvalidToken, Exception):
        return None


def encrypt_body(data: dict) -> str:
    import json
    return _cipher().encrypt(json.dumps(data).encode()).decode()


def encrypt_secure(data: dict) -> str:
    iv = os.urandom(16)
    payload = _json.dumps(data).encode()
    pad_len = 16 - len(payload) % 16
    payload += bytes([pad_len] * pad_len)
    encryptor = Cipher(algorithms.AES(_SECURE_KEY), modes.CBC(iv), backend=default_backend()).encryptor()
    ciphertext = encryptor.update(payload) + encryptor.finalize()
    return base64.b64encode(iv + ciphertext).decode()


def decrypt_secure(data: str) -> dict:
    raw = base64.b64decode(data)
    iv, ciphertext = raw[:16], raw[16:]
    decryptor = Cipher(algorithms.AES(_SECURE_KEY), modes.CBC(iv), backend=default_backend()).decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    pad_len = plaintext[-1]
    return _json.loads(plaintext[:-pad_len])
