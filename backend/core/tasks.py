import os
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.core import management
from celery import shared_task
from loguru import logger
from .models import Document, BackupLog

@shared_task
def release_stale_locks():
    """Libera bloqueos de documentos cuyo heartbeat lleve más de 10 minutos sin actualizarse."""
    threshold = timezone.now() - timedelta(minutes=10)
    stale_docs = Document.objects.filter(status='bloqueado', last_heartbeat__lt=threshold)
    count = stale_docs.count()
    
    for doc in stale_docs:
        logger.info(f"Liberando bloqueo expirado: {doc.name} (Usuario: {doc.locked_by})")
        doc.status = 'disponible'
        doc.locked_by = None
        doc.last_heartbeat = None
        doc.save()
    
    return f"Se liberaron {count} bloqueos expirados."

def _calculate_sha256(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@shared_task
def backup_full():
    """Ejecuta un respaldo completo."""
    date_str = timezone.now().strftime('%Y%m%d')
    filename = f"docmanager_full_{date_str}.json"
    relative_path = os.path.join('backups', 'full', filename)
    full_path = os.path.join(os.getcwd(), relative_path)
    
    try:
        management.call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                                '--exclude', 'contenttypes', '--exclude', 'auth.permission', 
                                '--indent', '2', '-o', full_path)
        
        # Guardar en log
        size_kb = os.path.getsize(full_path) / 1024
        hash_val = _calculate_sha256(full_path)
        
        BackupLog.objects.create(
            type='completo',
            filename=filename,
            size_kb=size_kb,
            hash_sha256=hash_val,
            status='success'
        )
        
        # Guardar fecha del ultimo full (como pide el documento)
        with open('backups/last_full_date.txt', 'w') as f:
            f.write(timezone.now().isoformat())
            
        logger.info(f"Respaldo completo exitoso: {filename}")
        return f"Full backup {filename} created."
    except Exception as e:
        logger.error(f"Error en respaldo completo: {str(e)}")
        BackupLog.objects.create(type='completo', filename=filename, status='failure')
        return f"Error: {str(e)}"

@shared_task
def backup_differential():
    """Ejecuta un respaldo diferencial."""
    # En esta versión simplificada, llamamos al management command personalizado
    try:
        management.call_command('backup_differential')
        return "Differential backup executed."
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def backup_incremental():
    """Ejecuta un respaldo incremental."""
    try:
        management.call_command('backup_incremental')
        return "Incremental backup executed."
    except Exception as e:
        return f"Error: {str(e)}"
