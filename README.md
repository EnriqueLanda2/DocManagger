# DocManagger

Plataforma de gestión de documentos colaborativa. Permite crear, editar, compartir y versionar documentos en tiempo real.

**Stack:** Django 5 (backend) + React 19 + Vite (frontend) + MySQL

---

## Requisitos previos

- Python 3.10 o superior
- Node.js 18 o superior y npm
- MySQL 8 corriendo localmente

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/EnriqueLanda2/DocManagger.git
cd DocManagger
```

---

### 2. Backend (Django)

```bash
cd backend
```

**Crear y activar el entorno virtual:**

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

**Instalar dependencias:**

```bash
pip install -r requirements.txt
```

**Configurar variables de entorno:**

```bash
cp .env.example .env
```

Abre `backend/.env` y edita la contraseña de MySQL:

```
DB_PASSWORD=tu_password_de_mysql
```

> El resto de valores ya están configurados para desarrollo local. No toques nada más si solo quieres correrlo en local.

**Crear la base de datos en MySQL:**

```sql
CREATE DATABASE doc_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Aplicar migraciones:**

```bash
python manage.py migrate
```

**Crear superusuario (opcional):**

```bash
python manage.py createsuperuser
```

**Levantar el servidor:**

```bash
python manage.py runserver
```

El backend corre en: `http://127.0.0.1:8000/`

---

### 3. Frontend (React)

Abre una nueva terminal:

```bash
cd frontend
```

**Configurar variables de entorno:**

```bash
cp .env.example .env
```

> El `.env` del frontend ya apunta a `http://127.0.0.1:8000/api` por defecto. No necesitas cambiar nada para local.

**Instalar dependencias:**

```bash
npm install
```

**Levantar el servidor de desarrollo:**

```bash
npm run dev
```

El frontend corre en: `http://localhost:5173/`

---

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Default local |
|---|---|---|
| `DEBUG` | Modo debug de Django | `True` |
| `SECRET_KEY` | Clave secreta de Django | valor de dev (inseguro) |
| `FERNET_KEY` | Clave para cifrado de datos | valor de dev |
| `ALLOWED_HOSTS` | Hosts permitidos | `127.0.0.1,localhost` |
| `CORS_ALLOW_ALL_ORIGINS` | Permitir todos los orígenes CORS | `True` |
| `DB_NAME` | Nombre de la base de datos | `doc_platform_db` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | *(debes rellenarla)* |
| `DB_HOST` | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |

### `frontend/.env`

| Variable | Descripción | Default local |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://127.0.0.1:8000/api` |

---

## Correr tests

### Backend

```bash
cd backend
source venv/bin/activate   # si no está activado
pytest
```

Con reporte de cobertura:

```bash
pytest --cov=core --cov-report=term-missing
```

### Frontend

```bash
cd frontend
npm run test
```

Con cobertura:

```bash
npm run test:coverage
```

---

## Estructura del proyecto

```
DocManagger/
├── backend/
│   ├── core/               # App principal (modelos, vistas, serializers)
│   │   ├── authentication/ # Endpoints de autenticación
│   │   └── migrations/     # Migraciones de la base de datos
│   ├── doc_platform/       # Configuración de Django (settings, urls)
│   ├── .env                # Variables de entorno locales (no se sube a git)
│   ├── .env.example        # Plantilla de variables de entorno
│   └── requirements.txt    # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── auth/           # Pantallas de login, registro, verificación
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas principales (Dashboard, Editor, etc.)
│   │   ├── service/        # Cliente HTTP (api.js)
│   │   └── utils/          # Utilidades (tokenUtils, etc.)
│   ├── .env                # Variables de entorno locales (no se sube a git)
│   ├── .env.example        # Plantilla de variables de entorno
│   └── package.json
└── .github/
    └── workflows/          # CI/CD con GitHub Actions
```

---

## Acceso al panel de administración

Una vez levantado el backend, el panel admin de Django está disponible en:

`http://127.0.0.1:8000/admin/`

Usa las credenciales del superusuario que creaste con `createsuperuser`.
