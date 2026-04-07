\# Document Management Platform (DocManager)



Este proyecto consta de dos partes: Backend (Django) y Frontend (React).



\## Requisitos previos



\- Python 3.x

\- Node.js y npm



\## Instrucciones de Ejecución



Debes abrir dos terminales separadas, una para el backend y otra para el frontend.



\### Terminal 1: Backend (Django)



1\. Navega a la carpeta del backend:

&#x20;  ```bash

&#x20;  cd doc\_platform/backend

&#x20;  ```



2\. Activa el entorno virtual:

&#x20;  ```bash

&#x20;  source venv/bin/activate

&#x20;  ```



3\. Ejecuta el servidor:

&#x20;  ```bash

&#x20;  python manage.py runserver

&#x20;  ```

&#x20;  

&#x20;  El backend correrá en: http://127.0.0.1:8000/



\### Terminal 2: Frontend (React)



1\. Navega a la carpeta del frontend:

&#x20;  ```bash

&#x20;  cd doc\_platform/frontend

&#x20;  ```



2\. Instala las dependencias (si no lo has hecho):

&#x20;  ```bash

&#x20;  npm install

&#x20;  ```

&#x20;  \*Nota: Si tienes errores de permisos con npm, intenta usar este comando para limpiar caché local:\*

&#x20;  `export npm\_config\_cache=../.npm\_cache \&\& npm install`



3\. Ejecuta el servidor de desarrollo:

&#x20;  ```bash

&#x20;  npm run dev

&#x20;  ```

&#x20;  \*Nota: Si tuviste errores de permisos antes, usa:\*

&#x20;  `export npm\_config\_cache=../.npm\_cache \&\& npm run dev`



&#x20;  El frontend correrá en: http://localhost:5173/



\## Usuarios



\- \*\*Superusuario (Admin)\*\*: 

&#x20; - Usuario: `admin`

&#x20; - Contraseña: `admin123`

