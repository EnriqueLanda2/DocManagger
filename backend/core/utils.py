from loguru import logger
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


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
