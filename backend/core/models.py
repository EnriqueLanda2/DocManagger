from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default="")

    def __str__(self):
        return f"Perfil de {self.user.username}"


class Document(models.Model):
    STATUS_CHOICES = [('disponible', 'Disponible'), ('bloqueado', 'Bloqueado')]

    name = models.CharField(max_length=255)
    content = models.TextField(blank=True, default="")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_documents')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible')
    locked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='locked_documents')
    last_heartbeat = models.DateTimeField(null=True, blank=True)
    last_mod = models.DateTimeField(auto_now=True)
    version = models.CharField(max_length=20, default="v1.0")

    def __str__(self):
        return self.name


class Version(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.CharField(max_length=20)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document.name} - {self.version_number}"


class Permission(models.Model):
    ROLE_CHOICES = [('lector', 'Lector'), ('editor', 'Editor'), ('admin', 'Administrador')]
    STATUS_CHOICES = [('pendiente', 'Pendiente'), ('aceptado', 'Aceptado')]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_permissions')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='lector')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('document', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.document.name} ({self.role})"


class ShareLink(models.Model):
    ROLE_CHOICES = [('editor', 'Editor'), ('viewer', 'Viewer')]
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='share_links')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document.name} - {self.role} - {self.token}"


class AuditLog(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=100)
    host = models.CharField(max_length=100, blank=True)
    target = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp'], name='auditlog_timestamp_idx'),
            models.Index(fields=['action'], name='auditlog_action_idx'),
        ]
    def __str__(self):
        return f"{self.timestamp} | {self.user} | {self.action} | {self.host}"


class BackupLog(models.Model):
    BACKUP_TYPES = [('completo', 'Completo'), ('diferencial', 'Diferencial'), ('incremental', 'Incremental')]

    type = models.CharField(max_length=20, choices=BACKUP_TYPES)
    date = models.DateTimeField(default=timezone.now) # Cambiado para permitir simulación
    filename = models.CharField(max_length=255)
    size_kb = models.FloatField(default=0.0)
    hash_sha256 = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=20, default='success') # success, failure

    def __str__(self):
        return f"{self.type} - {self.date} - {self.status}"
