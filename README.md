# Matecitos

Monorepo pnpm con frontend React/Vite y API Express/MySQL.

## Docker

Requiere Docker Engine/Desktop y Compose v2. Desde la raíz:

```sh
cp .env.example .env
# Editá las contraseñas y JWT_SECRET en .env.
docker compose up --build -d
docker compose ps -a
```

Abrí http://localhost:8080. Nginx sirve la SPA y reenvía `/api` a Express.
MySQL guarda datos en un volumen. El servicio `migrate` ejecuta Knex y debe
terminar con código 0 antes de iniciar la API. Una falla detiene esa cadena;
consultá `docker compose logs migrate`.

La configuración está orientada a uso local y una base nueva. Las migraciones
históricas incluyen operaciones destructivas: respaldá y revisalas antes de
usarlas sobre una base existente. Los archivos `.txt` no se importan como SQL.
Los valores de `.env.example` son ejemplos locales; reemplazalos en `.env`.

Creá el primer administrador explícitamente (usá tus propias credenciales):

```sh
docker compose run --rm -e ADMIN_USERNAME=admin -e ADMIN_PASSWORD='elegir-una-clave-propia' backend pnpm db:seed-admin
```

```sh
docker compose logs -f                  # Ver logs
docker compose down                     # Detener; conserva los datos
docker compose up --build -d             # Aplicar cambios de código
docker compose run --rm migrate          # Ejecutar migraciones pendientes
```

`docker compose down -v` elimina los datos. No lo uses para detener normalmente.
El puerto se cambia con `APP_PORT`. La API y MySQL solo son accesibles dentro de
la red de Compose. `/api/health` comprueba la conexión a la base.

## Desarrollo sin contenedores

Usá Node 24 y pnpm 11.22.0. Hay un único workspace y lockfile en la raíz:

```sh
pnpm install --frozen-lockfile
cp backend/.env.example backend/.env
# Configurá una base MySQL accesible desde tu equipo en backend/.env.
pnpm db:migrate
pnpm dev
```

Knex lee `backend/.env`; la API también lo carga al ejecutar `dev`.
Vite sirve en http://localhost:5173 y reenvía `/api` a localhost:3000.
`API_PROXY_TARGET` permite cambiar ese destino. `VITE_API_URL` permite cambiar
la URL del cliente en el momento del build; por defecto usa `/api`.

```sh
pnpm build
pnpm lint
```

## Dependencias

El [inventario](docs/dependencias.md) describe todas las dependencias directas,
servicios externos y hallazgos. El lockfile contiene las transitivas.
No se actualizaron masivamente las versiones durante esta conversión. La auditoría
reportó 1 vulnerabilidad crítica, 48 altas, 37 moderadas y 5 bajas, incluyendo
dependencias de desarrollo. El detalle está en `docs/audit-dependencias.json`;
la actualización y validación de versiones queda pendiente.

Para consultar vulnerabilidades del registro:

```sh
pnpm audit
```

Referencias: [orden de arranque de Compose](https://docs.docker.com/compose/how-tos/startup-order/)
y [compatibilidad de pnpm](https://github.com/pnpm/pnpm/blob/main/pnpm11/docs/installation.md).
