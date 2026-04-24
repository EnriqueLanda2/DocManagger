import os
from django.core.management.base import BaseCommand
from django.core import management
from django.utils import timezone
from core.models import BackupLog

class Command(BaseCommand):
    help = 'Realiza un respaldo incremental de la base de datos'

    def handle(self, *args, **options):
        date_str = timezone.now().strftime('%Y%m%d_%H%M')
        filename = f"docmanager_incr_{date_str}.json"
        full_path = os.path.join(os.getcwd(), 'backups', 'incr', filename)
        
        try:
            management.call_command('dumpdata', '--indent', '2', '-o', full_path)
            BackupLog.objects.create(
                type='incremental',
                filename=filename,
                status='success'
            )
            self.stdout.write(self.style.SUCCESS(f'Respaldo incremental creado: {filename}'))
        except Exception as e:
            BackupLog.objects.create(type='incremental', filename=filename, status='failure')
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
