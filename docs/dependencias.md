# Dependencias de Matecitos

Inventario de dependencias directas declaradas. Las versiones transitivas se conservan en el lockfile único; no se actualizaron masivamente los paquetes.

## Backend

| Paquete | Rango | Uso |
| --- | --- | --- |
| bcrypt | ^6.0.0 | Hash y verificación de contraseñas; binario nativo Linux incluido por el paquete. |
| cors | ^2.8.5 | Middleware CORS de Express. |
| dotenv | ^17.2.3 | Carga de variables para Knex. |
| express | ^5.2.1 | API HTTP. |
| express-validator | ^7.3.1 | Validación de peticiones. |
| jsonwebtoken | ^9.0.3 | Emisión de JWT. |
| knex | ^3.1.0 | CLI de migraciones MySQL. |
| mysql | ^2.18.1 | Sin imports directos; driver legado declarado junto a mysql2. Candidato a retirar por separado. |
| mysql2 | ^3.16.0 | Pool y consultas; driver de Knex. |
| node-cron | ^4.6.0 | Tarea diaria de cierre de planes; requiere una sola instancia del backend. |
| passport | ^0.7.0 | Autenticación de peticiones. |
| passport-jwt | ^4.0.1 | Estrategia JWT. |

## Frontend

| Paquete | Rango | Uso |
| --- | --- | --- |
| apexcharts | ^5.10.4 | Motor de gráficos. |
| axios | ^1.15.2 | Cliente API y consulta externa de feriados. |
| clsx | ^2.1.1 | Clases CSS condicionales. |
| node-cron | ^4.6.0 | Sin imports en frontend; candidato a retirar. El cron activo vive en backend. |
| react | ^19.2.0 | UI y hooks. |
| react-apexcharts | ^2.1.0 | Integración de gráficos con React. |
| react-dom | ^19.2.0 | Renderizado. |
| react-helmet-async | ^3.0.0 | Metadatos de páginas. |
| react-router-dom | ^7.13.1 | Rutas de la SPA. |
| simplebar-react | ^3.3.2 | CSS importado en main.jsx; no se encontró uso del componente. |
| swiper | ^12.1.3 | CSS importado en main.jsx; no se encontró uso del componente. |
| tailwind-merge | ^3.5.0 | Combinación de clases Tailwind. |
| @eslint/js (dev) | ^9.39.1 | Reglas base de ESLint. |
| @tailwindcss/postcss (dev) | ^4.2.2 | Integración Tailwind/PostCSS. |
| @types/react (dev) | ^19.2.2 | Tipos de React. |
| @types/react-dom (dev) | ^19.2.2 | Tipos de React DOM. |
| @vitejs/plugin-react (dev) | ^5.1.0 | Transformación React en Vite. |
| autoprefixer (dev) | ^10.4.27 | Prefijos CSS vía PostCSS. |
| eslint (dev) | ^9.39.1 | Análisis estático. |
| eslint-plugin-react-hooks (dev) | ^7.0.1 | Reglas de hooks. |
| eslint-plugin-react-refresh (dev) | ^0.4.24 | Reglas para React Refresh. |
| globals (dev) | ^16.5.0 | Globals de ESLint. |
| postcss (dev) | ^8.5.8 | Procesamiento CSS. |
| tailwindcss (dev) | ^4.2.2 | Framework CSS. |
| vite (dev) | ^7.2.2 | Servidor de desarrollo y build. |
| vite-plugin-svgr (dev) | ^5.0.0 | SVG como componentes React. |

## Servicios y configuración

- Node 24 y pnpm 11.22.0 en Docker; los manifiestos originales ya fijaban esa versión de pnpm.
- MySQL 8.4 con volumen persistente. No se publica el puerto de la base.
- Nginx sirve el build y reenvía /api a Express; soporta rutas de React Router.
- Compose espera la salud de MySQL y la finalización de Knex antes de iniciar la API.
- La API verifica una conexión real al arrancar y en /health.
- Se conserva la política minimumReleaseAge y los permisos de build para bcrypt, esbuild y Tailwind oxide.
- El calendario consulta https://api.argentinadatos.com desde el navegador; requiere conectividad externa.
- La zona horaria se configura para el cron. No escalar el backend sin coordinar la ejecución de esa tarea.

## Hallazgos

- Se unificaron dos lockfiles/workspaces en uno. Se preservan las resoluciones existentes; un snapshot compartido de get-intrinsic se toma del frontend y se valida mediante instalación congelada.
- seedadmin usaba db sin conectarse, el campo rol en vez de role y una contraseña fija. Se corrigió para usar credenciales explícitas y cerrar el pool.
- Se quitó el log de usuario y contraseña en login.
- mysql y node-cron del frontend se mantienen para evitar cambios funcionales fuera de la dockerización.
- Se ejecutó `pnpm audit --json` desde Docker: 1 crítica, 48 altas, 37 moderadas y 5 bajas (incluye desarrollo). Es el conteo reportado por pnpm, no una medida de explotabilidad. Detalle completo en [audit-dependencias.json](audit-dependencias.json). Se conservan las versiones; la remediación requiere revisar y actualizar dependencias.
- Las migraciones históricas contienen cambios destructivos (por ejemplo dropTable). El primer arranque está orientado a una base nueva; revisar y respaldar antes de apuntar a una existente.

## Verificación Docker

Se corrigieron imports con diferencias de mayúsculas para Linux y la migración de schedules que intentaba eliminar subject_id antes de quitar su clave foránea. Knex recibe su archivo .cjs explícitamente.

También se conservó un índice individual de student_id antes de eliminar el índice único compuesto requerido por su FK.

Resultado: instalación congelada y builds de las imágenes correctos; MySQL y API saludables, migraciones con salida 0, SPA y ruta /students con HTTP 200, /api/health con HTTP 200 y login inválido con HTTP 401. La prueba usó `.env.example` y dejó el stack local disponible en localhost:8080. No se ejecutó ESLint ni una suite funcional completa.
