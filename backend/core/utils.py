import os
import base64
import json as _json
from loguru import logger
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings

def _get_secure_key() -> bytes:
    return getattr(settings, 'SECURE_AES_KEY', b'docPlatformSecureKey2024!!!!!!!!')


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
    nonce = os.urandom(12)
    ciphertext = AESGCM(_get_secure_key()).encrypt(nonce, _json.dumps(data).encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_secure(data: str) -> dict:
    raw = base64.b64decode(data)
    return _json.loads(AESGCM(_get_secure_key()).decrypt(raw[:12], raw[12:], None))
