.PHONY: up down dev-db db-push dev-api dev-engine dev-client dev-studio dev clean

# Desplegar bases de datos y servidores en contenedores Docker
up:
	docker-compose up -d

# Bajar todos los servicios Docker
down:
	docker-compose down

# Limpiar contenedores, redes y volumenes huérfanos
clean:
	docker-compose down -v --remove-orphans

# Levantar SOLO las bases de datos para programar en local sin compilar Nest en Docker
dev-db:
	docker-compose up -d postgres redis

# Aplicar migraciones a la base de datos (Requiere DB encendida)
db-push:
	cd apps/api-core && pnpm exec prisma db push

# Levantar API Core en modo watch
dev-api:
	cd apps/api-core && pnpm start:dev

# Levantar Game Engine en modo watch
dev-engine:
	cd apps/game-engine && pnpm start:dev

# Levantar Cliente React en modo watch (Vite)
dev-client:
	cd apps/cliente && pnpm run dev

# Shortcut para levantar todo localmente (Ejecuta bases de datos en Docker y servidores en terminal)
dev: dev-db
	@echo "Bases de datos listas. Levanta dev-api, dev-engine, dev-client y dev-studio en terminales separadas."

# Levantar Studio React en modo watch (Vite)
dev-studio:
	cd apps/studio && pnpm run dev
