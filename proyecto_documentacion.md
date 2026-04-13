# Documentación Técnica — DocManagger

## 1. Descripción General

**DocManagger** es una plataforma de gestión de documentos colaborativa que permite crear, editar, versionar y compartir documentos de texto enriquecido. Implementa un sistema de bloqueo pesimista para prevenir conflictos de edición simultánea, control de acceso basado en roles (RBAC), y un registro de auditoría de todas las acciones del sistema.

---

## 2. Versiones del Entorno

| Herramienta | Versión mínima requerida |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| MySQL | 8.0+ |

---

## 3. Dependencias del Backend

**Archivo:** `backend/requirements.txt`

| Paquete | Versión | Uso |
|---|---|---|
| Django | 5.2.1 | Framework principal |
| djangorestframework | 3.16.1 | API REST |
| djangorestframework-simplejwt | 5.5.1 | Autenticación JWT (access + refresh tokens) |
| django-cors-headers | 4.9.0 | Manejo de CORS entre frontend y backend |
| PyMySQL | 1.1.2 | Driver de conexión a MySQL |
| PyJWT | 2.11.0 | Codificación/decodificación de tokens JWT |
| cryptography | 42.0.5 | Cifrado Fernet para tokens de links públicos |
| python-dotenv | 1.0.1 | Carga de variables de entorno desde `.env` |
| loguru | 0.7.2 | Logging estructurado (archivos `debug.log` y `error.log`) |
| asgiref | 3.11.1 | Soporte async de Django |
| sqlparse | 0.5.5 | Parseo de SQL (dependencia interna de Django) |
| pytest | 8.3.5 | Framework de pruebas |
| pytest-django | 4.9.0 | Plugin de pytest para Django |
| pytest-cov | 6.1.0 | Reporte de cobertura de pruebas |

**Instalar:**
```bash
pip install -r requirements.txt
```

---

## 4. Dependencias del Frontend

**Archivo:** `frontend/package.json`

### Dependencias de producción

| Paquete | Versión | Uso |
|---|---|---|
| react | ^19.2.0 | Framework de UI |
| react-dom | ^19.2.0 | Renderizado de React en el DOM |
| axios | ^1.13.6 | Cliente HTTP para llamadas a la API |
| @tiptap/react | ^3.20.0 | Editor de texto enriquecido (headless) |
| @tiptap/starter-kit | ^3.20.0 | Extensiones base de TipTap |
| @tiptap/extension-highlight | ^3.20.0 | Resaltado de texto |
| @tiptap/extension-image | ^3.20.0 | Inserción de imágenes |
| @tiptap/extension-underline | ^3.20.0 | Subrayado |
| @tiptap/extension-color | ^3.20.0 | Color de texto |
| @tiptap/extension-text-align | ^3.20.0 | Alineación de texto |
| @tiptap/extension-text-style | ^3.20.0 | Estilos de texto personalizados |
| tailwindcss | ^4.1.18 | Framework de estilos utility-first |
| bootstrap | ^5.3.8 | Componentes de UI adicionales |
| lucide-react | ^0.563.0 | Librería de iconos |
| docx | ^9.5.3 | Exportación de documentos a formato Word (.docx) |
| jspdf | ^4.2.0 | Exportación de documentos a PDF |
| dompurify | ^3.3.3 | Sanitización de HTML (prevención de XSS) |
| react-hot-toast | ^2.6.0 | Notificaciones toast |
| react-data-table-component | ^7.7.0 | Tablas con soporte de paginación y ordenamiento |
| prop-types | ^15.8.1 | Validación de props en componentes React |

### Dependencias de desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| vite | ^7.3.1 | Bundler y servidor de desarrollo |
| @vitejs/plugin-react | ^5.1.1 | Plugin de Vite para React (HMR, JSX) |
| vitest | ^4.1.4 | Framework de pruebas unitarias |
| @testing-library/react | ^16.3.2 | Utilidades de pruebas para componentes React |
| @testing-library/jest-dom | ^6.9.1 | Matchers adicionales para pruebas del DOM |
| @vitest/coverage-v8 | ^4.1.4 | Reporte de cobertura con V8 |
| jsdom | ^29.0.2 | Simulación del DOM para pruebas |
| eslint | ^9.39.1 | Linter de JavaScript |
| eslint-plugin-react-hooks | ^7.0.1 | Reglas de linting para hooks de React |
| eslint-plugin-react-refresh | ^0.4.24 | Soporte para Fast Refresh en linting |
| autoprefixer | ^10.4.24 | Prefijos CSS automáticos |
| postcss | ^8.5.6 | Transformaciones de CSS |

**Instalar:**
```bash
npm install
```

---

## 5. Variables de Entorno

### Backend — `backend/.env`

| Variable | Requerida | Descripción | Default local |
|---|---|---|---|
| `SECRET_KEY` | Sí | Clave secreta de Django | valor de dev (inseguro) |
| `FERNET_KEY` | Sí | Clave de cifrado Fernet para tokens de share links | valor de dev |
| `DEBUG` | No | Modo debug de Django | `True` |
| `ALLOWED_HOSTS` | No | Hosts permitidos (separados por coma) | `127.0.0.1,localhost` |
| `CORS_ALLOW_ALL_ORIGINS` | No | Permitir todos los orígenes CORS | `True` |
| `CORS_ALLOWED_ORIGINS` | No | Orígenes CORS permitidos (solo si el anterior es `False`) | — |
| `DB_NAME` | Sí | Nombre de la base de datos MySQL | `doc_platform_db` |
| `DB_USER` | Sí | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Sí | Contraseña de MySQL | *(vacío, debes rellenarla)* |
| `DB_HOST` | No | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | No | Puerto de MySQL | `3306` |

> El backend busca primero `.env.production` y luego `.env`. En local usa `.env`.

### Frontend — `frontend/.env`

| Variable | Requerida | Descripción | Default local |
|---|---|---|---|
| `VITE_API_URL` | Sí | URL base del backend | `http://127.0.0.1:8000/api` |

---

## 6. Arquitectura General

```
DocManagger/
├── backend/                        # API REST en Django
│   ├── core/                       # App principal
│   │   ├── models.py               # Modelos de base de datos
│   │   ├── views.py                # ViewSets (documentos, usuarios, auditoría)
│   │   ├── serializers.py          # Serialización de modelos a JSON
│   │   ├── urls.py                 # Rutas de la API
│   │   ├── utils.py                # Cifrado Fernet, log_action
│   │   ├── migrations/             # Migraciones de la BD (0001–0008)
│   │   └── authentication/         # Endpoints de autenticación
│   │       └── views.py            # login, register, refresh, profile, change-password
│   ├── doc_platform/               # Configuración de Django
│   │   └── settings.py            # Settings con carga de .env
│   ├── interceptor.py              # Handler de Loguru para integración con Django logging
│   ├── requirements.txt
│   └── pytest.ini
│
├── frontend/                       # SPA en React + Vite
│   ├── src/
│   │   ├── auth/                   # Login, Register, EmailVerification
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── RichTextEditor.jsx  # Editor TipTap
│   │   │   ├── Toolbar.jsx         # Barra de herramientas del editor
│   │   │   ├── ShareModal.jsx      # Modal para compartir documentos
│   │   │   ├── PermissionsModal.jsx
│   │   │   ├── CreateDocumentModal.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── Notification.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── SplashScreen.jsx
│   │   ├── pages/                  # Vistas principales
│   │   │   ├── Dashboard.jsx       # Lista de documentos
│   │   │   ├── Editor.jsx          # Editor de documentos con locking
│   │   │   ├── LandingPage.jsx     # Página de inicio
│   │   │   ├── CompareView.jsx     # Comparación de versiones
│   │   │   └── PublicViewer.jsx    # Visor público por share link
│   │   ├── service/
│   │   │   └── api.js              # Cliente HTTP (axios) con interceptores JWT
│   │   └── utils/
│   │       └── tokenUtils.js       # Manejo de tokens en localStorage
│   └── package.json
│
└── .github/
    └── workflows/
        ├── ci.yml                  # Pipeline de CI (tests automáticos)
        └── deploy.yml              # Pipeline de despliegue
```

---

## 7. Modelos de Base de Datos

### `UserProfile`
Extiende el modelo `User` de Django con datos adicionales del perfil.

| Campo | Tipo | Descripción |
|---|---|---|
| `user` | OneToOne → User | Usuario de Django |
| `phone` | CharField(20) | Teléfono (único, opcional) |
| `age` | IntegerField | Edad (opcional) |
| `gender` | CharField(20) | Género (opcional) |

---

### `Document`
Documento principal del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | CharField(255) | Nombre del documento |
| `content` | TextField | Contenido HTML del documento |
| `owner` | FK → User | Propietario |
| `status` | CharField | `disponible` \| `bloqueado` |
| `locked_by` | FK → User | Usuario que tiene el bloqueo activo |
| `last_heartbeat` | DateTimeField | Último heartbeat del editor activo |
| `last_mod` | DateTimeField | Última modificación (auto) |
| `version` | CharField(20) | Versión actual (ej: `v1.3`) |

---

### `Version`
Historial de versiones de un documento.

| Campo | Tipo | Descripción |
|---|---|---|
| `document` | FK → Document | Documento al que pertenece |
| `version_number` | CharField(20) | Número de versión (ej: `v1.1`) |
| `content` | TextField | Snapshot del contenido en esa versión |
| `created_at` | DateTimeField | Fecha de creación (auto) |
| `author` | FK → User | Quien guardó la versión |
| `note` | TextField | Nota o comentario de la versión |

---

### `Permission`
Control de acceso de usuarios a documentos (RBAC).

| Campo | Tipo | Descripción |
|---|---|---|
| `document` | FK → Document | Documento |
| `user` | FK → User | Usuario invitado |
| `role` | CharField | `lector` \| `editor` \| `admin` |
| `status` | CharField | `pendiente` \| `aceptado` |
| `granted_at` | DateTimeField | Fecha de la invitación (auto) |

---

### `ShareLink`
Links públicos para compartir documentos sin cuenta.

| Campo | Tipo | Descripción |
|---|---|---|
| `document` | FK → Document | Documento compartido |
| `token` | UUIDField | Token único generado automáticamente |
| `role` | CharField | `editor` \| `viewer` |
| `created_by` | FK → User | Usuario que generó el link |
| `created_at` | DateTimeField | Fecha de creación (auto) |

> El token se cifra con Fernet antes de enviarse al cliente. El backend lo descifra al recibirlo.

---

### `AuditLog`
Registro de auditoría de todas las acciones del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `user` | FK → User | Usuario que realizó la acción |
| `action` | CharField(100) | Tipo de acción (ej: `LOGIN`, `CREATE_DOCUMENT`) |
| `host` | CharField(100) | IP de origen |
| `target` | CharField(255) | Recurso afectado |
| `timestamp` | DateTimeField | Fecha y hora (auto) |

**Acciones registradas:** `LOGIN`, `REGISTER`, `CREATE_DOCUMENT`, `DELETE_DOCUMENT`, `SHARE_DOCUMENT`, `ACQUIRE_LOCK`, `SAVE_VERSION`, `GENERATE_SHARE_LINK`, `PUBLIC_VIEW`, `UPDATE_PROFILE`, `CHANGE_PASSWORD`, `ACCEPT_INVITATION`

---

## 8. Endpoints de la API

**Base URL local:** `http://127.0.0.1:8000/api`

### Autenticación (sin token requerido)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/login/` | Login con username + password. Devuelve `access` y `refresh` JWT |
| POST | `/auth/register/` | Registro de nuevo usuario |
| POST | `/auth/refresh/` | Refresca el access token con el refresh token |

### Perfil (requiere token)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/auth/profile/` | Obtener datos del perfil del usuario autenticado |
| PATCH | `/auth/profile/` | Actualizar datos del perfil |
| POST | `/auth/change-password/` | Cambiar contraseña |

### Documentos (requiere token)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/documents/` | Listar documentos propios y compartidos |
| POST | `/documents/` | Crear documento |
| GET | `/documents/{id}/` | Obtener documento por ID |
| PATCH | `/documents/{id}/` | Actualizar documento |
| DELETE | `/documents/{id}/` | Eliminar documento (solo el owner) |
| POST | `/documents/{id}/acquire_lock/` | Tomar el bloqueo de edición |
| POST | `/documents/{id}/release_lock/` | Liberar el bloqueo |
| POST | `/documents/{id}/heartbeat/` | Mantener el bloqueo activo (cada ~30s) |
| POST | `/documents/{id}/autosave/` | Guardado automático del contenido |
| POST | `/documents/{id}/save_version/` | Guardar nueva versión oficial |
| POST | `/documents/{id}/share/` | Invitar usuario por email |
| POST | `/documents/{id}/revoke_permission/` | Revocar permiso de un usuario |
| POST | `/documents/{id}/generate_share_link/` | Generar link público cifrado |
| GET | `/documents/my_invitations/` | Ver invitaciones pendientes del usuario |
| POST | `/documents/accept_invitation/` | Aceptar invitación |
| POST | `/documents/reject_invitation/` | Rechazar invitación |

### Usuarios (requiere token)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/users/?search={email}` | Buscar usuarios por email (máx. 10 resultados) |

### Links públicos (sin token requerido)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/share/{token}/` | Acceder a documento mediante link público cifrado |

### Auditoría (requiere rol admin de Django)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/audit/` | Listar todos los logs de auditoría |

---

## 9. Sistema de Autenticación

- **Tipo:** JWT (JSON Web Tokens) con SimpleJWT
- **Access token:** duración de **15 minutos**
- **Refresh token:** duración de **7 días**, con rotación automática
- **Flujo:** El frontend adjunta el `access` token en el header `Authorization: Bearer <token>`. Al recibir un 401, el interceptor de axios intenta renovar automáticamente usando el `refresh` token.
- **Almacenamiento:** Los tokens se guardan en `localStorage` vía `tokenUtils.js`.

---

## 10. Sistema de Bloqueo (Locking)

El sistema usa **bloqueo pesimista** para evitar conflictos de edición simultánea:

1. El usuario llama a `acquire_lock` antes de editar.
2. El backend registra al usuario en `locked_by` y marca el documento como `bloqueado`.
3. Mientras edita, el frontend envía `heartbeat` cada ~30 segundos para mantener el bloqueo activo.
4. Si el heartbeat no llega en **120 segundos**, el bloqueo expira automáticamente y cualquier otro usuario puede tomarlo.
5. Al salir del editor, se llama a `release_lock`.

---

## 11. Cifrado de Share Links

Los links públicos usan **cifrado Fernet** (AES-128-CBC + HMAC) de la librería `cryptography`:

- Al generar el link, el UUID del `ShareLink` se cifra con `FERNET_KEY` y se devuelve como string cifrado.
- Al acceder al link, el token cifrado se descifra para obtener el UUID original y buscar el documento.
- Esto impide que usuarios adivinen o manipulen tokens de links.

---

## 12. Logging

El backend usa **Loguru** integrado con el sistema de logging de Django:

| Archivo | Nivel | Rotación | Retención |
|---|---|---|---|
| `backend/logs/debug.log` | DEBUG (no errores) | 10 MB | 7 días |
| `backend/logs/error.log` | ERROR y superior | 10 MB | 7 días |

> La carpeta `logs/` está en `.gitignore` y se crea automáticamente al iniciar el servidor.

---

## 13. CI/CD

**GitHub Actions** — `.github/workflows/`

| Archivo | Trigger | Descripción |
|---|---|---|
| `ci.yml` | Push / PR a `develop` y `main` | Ejecuta tests de backend y frontend |
| `deploy.yml` | Push a `main` | Despliega a producción |

**Jenkins** — `Jenkinsfile` (raíz y `frontend/Jenkinsfile`)
Pipeline alternativo para entornos con Jenkins.

---

## 14. Comandos Útiles

### Backend

```bash
# Activar entorno virtual
source venv/bin/activate          # macOS/Linux
venv\Scripts\activate             # Windows

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Correr servidor
python manage.py runserver

# Correr tests
pytest

# Tests con cobertura
pytest --cov=core --cov-report=term-missing
```

### Frontend

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Tests
npm run test

# Tests con cobertura
npm run test:coverage

# Linting
npm run lint
```
