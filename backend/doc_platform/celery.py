import os
from celery import Celery

# Establecer el módulo de configuración predeterminado de Django para Celery.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'doc_platform.settings')

app = Celery('doc_platform')

# Usar una cadena aquí significa que el trabajador no tiene que serializar
# el objeto de configuración a procesos secundarios.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Cargar archivos de tareas de todos los archivos tasks.py registrados.
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
