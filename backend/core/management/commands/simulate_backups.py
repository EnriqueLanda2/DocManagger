import os
import random
import hashlib
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core import management
from django.utils import timezone
from core.models import BackupLog

class Command(BaseCommand):
    help = 'Simula 30 días de historial usando DATOS REALES de producción'

    def _calculate_sha256(self, file_path):
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def handle(self, *args, **options):
        # 1. Limpiar todo lo anterior
        BackupLog.objects.all().delete()
        os.makedirs('backups/full', exist_ok=True)
        os.makedirs('backups/diff', exist_ok=True)
        os.makedirs('backups/incr', exist_ok=True)
        
        self.stdout.write(self.style.WARNING('Extrayendo snapshot REAL de producción para la simulación...'))
        
        # 2. Generar el archivo "maestro" con data real
        master_file = 'backups/temp_real_data.json'
        management.call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                                '--exclude', 'contenttypes', '--exclude', 'auth.permission', 
                                '--indent', '2', '-o', master_file)
        
        with open(master_file, 'r') as f:
            real_data = f.read()

        now = timezone.now()
        start_date = now - timedelta(days=30)
        
        current_date = start_date
        records_created = 0
        
        while current_date <= now:
            day_name = current_date.strftime('%A').lower()
            backup_type = None
            folder = ''
            
            if day_name == 'sunday':
                backup_type = 'completo'; folder = 'full'
            elif day_name in ['tuesday', 'thursday', 'saturday']:
                backup_type = 'diferencial'; folder = 'diff'
            elif day_name in ['monday', 'wednesday', 'friday']:
                backup_type = 'incremental'; folder = 'incr'
            
            if backup_type:
                filename = f"docmanager_{backup_type}_{current_date.strftime('%Y%m%d')}.json"
                file_path = os.path.join('backups', folder, filename)
                
                # Escribir la data REAL en el archivo simulado
                with open(file_path, 'w') as f:
                    f.write(real_data)
                
                # Calcular metadatos reales
                size_kb = os.path.getsize(file_path) / 1024
                hash_val = self._calculate_sha256(file_path)
                
                # Crear registro en BD
                BackupLog.objects.create(
                    type=backup_type,
                    date=current_date,
                    filename=filename,
                    size_kb=size_kb,
                    hash_sha256=hash_val,
                    status='success'
                )
                records_created += 1
            
            current_date += timedelta(days=1)
            
        os.remove(master_file) # Limpiar temporal
        self.stdout.write(self.style.SUCCESS(f'ÉXITO: Se han generado {records_created} archivos con DATA REAL de producción.'))
