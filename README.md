# QuizSync

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

## Resumen del Proyecto

**QuizSync** es una aplicación cliente de alto rendimiento construida para interactividad y fluidez. Diseñada bajo una arquitectura escalable, utiliza una estética analógica de trazados a mano ("sketchy") proporcionando una experiencia de usuario única y altamente interactiva.

## Arquitectura

El frontend de la aplicación sigue estrictamente el patrón arquitectónico **Feature-Sliced Design (FSD)**. Esta metodología garantiza que el código fuente mantenga alta cohesión y bajo acoplamiento al separar responsabilidades por capas (App, Pages, Widgets, Features, Entities, Shared). 

El uso estandarizado de alias absolutos (ej. `@/shared/...`) facilita la importación e interconexión de módulos y recursos visuales globales de forma escalable.

## Configuración del Entorno de Desarrollo

Este repositorio utiliza `pnpm` como gestor de paquetes principal. Asegúrese de tener instalada la versión correspondiente antes de inicializar el entorno.

### Requisitos Previos

- Node.js (v18 o superior recomendado)
- pnpm

### Pasos de Instalación

1.  **Instalar dependencias:**
    Desde el directorio de la aplicación cliente (`apps/cliente`):
    ```bash
    pnpm install
    ```

2.  **Iniciar el servidor de desarrollo:**
    ```bash
    pnpm dev
    ```
    La aplicación se expondrá de manera predeterminada en el puerto de Vite, típicamente `http://localhost:5173/`.

3.  **Compilación para producción:**
    ```bash
    pnpm build
    ```
    Este comando ejecuta la validación estricta de TypeScript y posteriormente empaqueta la aplicación en el directorio `dist`.

## Normativa de Contribución

Todo el equipo de desarrollo debe adherirse a nuestro flujo de trabajo oficial basado en ramas y convenciones estrictas de control de versiones. Todo cambio de código debe someterse a revisión.

Para mayor detalle, consulte:
- [Guía de Contribución](.github/CONTRIBUTING.md)
- [Plantilla de Pull Requests](.github/PULL_REQUEST_TEMPLATE.md)