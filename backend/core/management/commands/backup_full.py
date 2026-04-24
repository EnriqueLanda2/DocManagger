import os
import hashlib
from django.core.management.base import BaseCommand
from django.core import management
from django.utils import timezone
from core.models import BackupLog

class Command(BaseCommand):
    help = 'Realiza un respaldo COMPLETO de la base de datos de producción'

    def _calculate_sha256(self, file_path):
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def handle(self, *args, **options):
        date_str = timezone.now().strftime('%Y%m%d_%H%M')
        filename = f"docmanager_full_{date_str}.json"
        
        # Asegurar que la carpeta existe
        os.makedirs('backups/full', exist_ok=True)
        full_path = os.path.join(os.getcwd(), 'backups', 'full', filename)
        
        self.stdout.write(f'Iniciando respaldo completo en: {filename}...')
        
        try:
            # Ejecutar dumpdata con parámetros de producción
            management.call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                                    '--exclude', 'contenttypes', '--exclude', 'auth.permission', 
                                    '--indent', '2', '-o', full_path)
            
            # Calcular metadatos
            size_kb = os.path.getsize(full_path) / 1024
            hash_val = self._calculate_sha256(full_path)
            
            # Registrar en la base de datos
            BackupLog.objects.create(
                type='completo',
                filename=filename,
                size_kb=size_kb,
                hash_sha256=hash_val,
                status='success'
            )
            
            # Guardar fecha de referencia para diferenciales futuros
            with open('backups/last_full_date.txt', 'w') as f:
                f.write(timezone.now().isoformat())
                
            self.stdout.write(self.style.SUCCESS(f'¡Respaldo exitoso! Hash: {hash_val[:10]}...'))
            
        except Exception as e:
            BackupLog.objects.create(type='completo', filename=filename, status='failure')
            self.stdout.write(self.style.ERROR(f'Error fatal en respaldo: {str(e)}'))
