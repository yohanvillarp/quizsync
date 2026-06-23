# QuizSync ⚡

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
</p>

## 📖 Resumen del Proyecto

**QuizSync** es una plataforma interactiva de trivia multijugador en tiempo real (estilo Kahoot), diseñada bajo una arquitectura moderna, escalable y con una estética única de trazados a mano ("sketchy"). Permite a los anfitriones crear salas, y a los jugadores unirse instantáneamente mediante un código para competir respondiendo preguntas.

## 🏗 Arquitectura (Monorepo)

El proyecto está estructurado como un monorepo, dividiendo responsabilidades en cuatro aplicaciones clave:

### Frontends
- 🎮 **Cliente (`apps/cliente`)**: Aplicación principal para los usuarios (Anfitriones y Jugadores). Maneja el lobby en tiempo real, selección de avatares, sistema de reacciones y el flujo del juego. *(Arquitectura FSD - Feature-Sliced Design)*.
- 🎨 **Studio (`apps/studio`)**: Panel de control administrativo para creadores de contenido. Permite crear, editar y categorizar cuestionarios. Integrado con **Clerk** para autenticación segura.

### Backends (Microservicios)
- 💾 **API Core (`apps/api-core`)**: Servidor RESTful construido con **NestJS**. Se encarga de la persistencia de datos (Cuestionarios, Preguntas, Categorías) utilizando **Prisma ORM** y **PostgreSQL**.
- ⚡ **Game Engine (`apps/game-engine`)**: Motor de juego en tiempo real basado en **NestJS y WebSockets**. Gestiona el estado efímero de las salas, los límites dinámicos, desconexiones, reconexiones y el broadcast instantáneo de las jugadas.

## 🛠 Desarrollo Local

El proyecto utiliza `pnpm` como gestor de paquetes. 

### Requisitos Previos
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- PostgreSQL (Local o en la nube)
- Cuenta en Clerk (para credenciales de desarrollo)

### Instalación
1. Clonar el repositorio.
2. Ejecutar `pnpm install` desde la raíz para instalar las dependencias de todas las aplicaciones.
3. Configurar las variables de entorno `.env` en cada respectiva aplicación (base de datos, Clerk keys, URLs de API y WebSockets).
4. Sincronizar la base de datos:
   ```bash
   cd apps/api-core
   npx prisma db push
   ```
5. Iniciar los servicios en desarrollo.

## 🌍 Despliegue (Deployment)

Debido a su arquitectura modular, QuizSync se despliega en componentes separados para maximizar el rendimiento:

### 1. Frontends (Vercel / Netlify)
Tanto `apps/cliente` como `apps/studio` son aplicaciones Single Page Application (Vite) estáticas.
- **Hosting recomendado:** Vercel, Netlify o Cloudflare Pages.
- Ambas requerirán configurar las variables de entorno que apunten a los backends en producción.

### 2. API Core (Render / Railway)
Al ser una API REST sin estado (stateless), es altamente escalable.
- **Hosting recomendado:** Render, Railway o DigitalOcean App Platform.
- Se debe configurar la URL de la base de datos en producción.

### 3. Game Engine (Servidor con soporte WebSockets)
Este es el corazón en tiempo real. Requiere un entorno que soporte conexiones persistentes (WebSockets).
- **Hosting recomendado:** Render (Web Service), Railway o AWS EC2/Fargate.
- *Nota:* Asegúrate de habilitar afinidad de sesión (Sticky Sessions) o usar un adaptador de Redis si escalas este servicio a múltiples instancias.

### 4. Base de Datos (PostgreSQL)
- **Hosting recomendado:** Supabase, Neon Database o AWS RDS.

## 🤝 Normativa de Contribución

Sigue el flujo de trabajo estándar de Git Flow.
- [Guía de Contribución](.github/CONTRIBUTING.md)
- Los commits deben seguir la convención Semantic Commits e indicar el alcance (ej. `feat(cliente): ...`).