---
name: "Reporte Automático de CI"
about: Plantilla utilizada por GitHub Actions para reportar fallos en el pipeline
title: "[Fallo CI/CD]: [Componente]"
labels: ["bug", "ci/cd", "automated"]
assignees: ''
---

> [!CAUTION]
> **Fallo Detectado en el Pipeline**
> El sistema de Integración Continua (GitHub Actions) ha detectado un fallo en el último commit. El código no cumple con los estándares de calidad o las pruebas automatizadas han fallado.

### Detalles de Ejecución
- **Autor del Commit:** {{AUTHOR}}
- **Commit SHA:** {{COMMIT_SHA}}
- **Rama:** {{BRANCH}}
- **Job fallido:** Pruebas E2E y Compilación (Integracion_Continua)

### Enlaces de Diagnóstico
> [!NOTE]
> [Ver Logs Completos en GitHub Actions]({{RUN_URL}})

---
*Este issue ha sido generado automáticamente por el sistema de CI/CD de QuizSync. Por favor, revise los logs de ejecución, reproduzca el problema en su entorno local y envíe un nuevo commit.*
