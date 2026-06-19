# Guía de Contribución para QuizSync

Bienvenido al repositorio de **QuizSync**. Para mantener la calidad, legibilidad y escalabilidad del código, hemos establecido reglas estrictas de flujo de trabajo y convenciones de *commits*. Por favor, lee detenidamente este documento antes de realizar cualquier aporte.

## 1. Estrategia de Ramas (Branching Strategy)

Trabajamos bajo un modelo adaptado de **Git Flow** donde la estabilidad de producción es la prioridad absoluta.

### Ramas Principales
*   `main`: **Entorno de Producción**. El código en esta rama siempre debe ser estable, probado y funcional. Solo recibe código a través de *Pull Requests* de versiones (*Releases*) o parches críticos (*Hotfixes*). **Nunca se trabaja directamente en `main`.**
*   `develop`: **Entorno de Desarrollo Activo**. Esta es la rama base para todo el desarrollo. Todas las nuevas características y correcciones parten de aquí.

### Ramas de Trabajo (Creación de Ramas)
Cuando vayas a realizar una tarea, debes crear una rama nueva partiendo siempre de `develop`. Nombra tu rama usando los siguientes prefijos según el caso de uso:

*   **Nuevas características:** `feature/<nombre-descriptivo-con-guiones>`
    *   *Ejemplo:* `feature/autenticacion-usuarios`
*   **Corrección de errores:** `bugfix/<nombre-del-error>`
    *   *Ejemplo:* `bugfix/cierre-sesion-inesperado`
*   **Parches urgentes en producción:** `hotfix/<nombre-del-parche>` (Únicas ramas que parten de `main`)
*   **Documentación o mantenimiento:** `chore/<descripcion>` o `docs/<descripcion>`

## 2. Convención de Commits (Conventional Commits)

Exigimos el uso estricto del estándar **Conventional Commits** para mantener un historial limpio y automatizable. No utilices emojis genéricos ni informales; la comunicación debe ser técnica y directa.

### Estructura del Commit
```text
<tipo>[ámbito opcional]: <descripción breve>

[cuerpo opcional detallando el porqué del cambio]
```

### Tipos Permitidos
*   `feat`: Una nueva característica.
*   `fix`: Corrección de un error (*bug*).
*   `refactor`: Cambio de código que no corrige un error ni añade una característica (ej. reestructuración FSD).
*   `docs`: Cambios exclusivos en la documentación.
*   `style`: Cambios que no afectan el significado del código (espacios, formateo, comas, etc.).
*   `perf`: Cambio que mejora el rendimiento.
*   `test`: Añadir o corregir pruebas existentes.
*   `chore`: Tareas de construcción, actualización de dependencias, etc.

*Ejemplo de commit correcto:*
`feat(auth): implementar inicio de sesión con JWT`

## 3. Flujo de Trabajo y Pull Requests (PRs)

1.  Asegúrate de estar en `develop` y con el código actualizado (`git pull origin develop`).
2.  Crea tu rama de trabajo (`git checkout -b feature/mi-nueva-caracteristica`).
3.  Desarrolla, haz commits respetando las reglas y realiza los tests pertinentes.
4.  Sube tu rama al repositorio remoto (`git push origin feature/mi-nueva-caracteristica`).
5.  Abre un **Pull Request** en GitHub dirigido hacia la rama `develop`.
6.  Rellena exhaustivamente la plantilla de Pull Request automática (`PULL_REQUEST_TEMPLATE.md`).
7.  Un revisor deberá aprobar tu PR antes de que pueda ser fusionado (*merged*).

---
*El incumplimiento reiterado de estas reglas resultará en el rechazo automático de los Pull Requests.*
