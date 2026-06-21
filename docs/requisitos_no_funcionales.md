# Requisitos No Funcionales (RNF) - Atributos de Calidad (ISO/IEC 25010)

Este documento define las restricciones técnicas, criterios de calidad y propiedades arquitectónicas que el sistema debe cumplir para asegurar su correcto comportamiento operacional.

## 1. Idoneidad Funcional (Functional Suitability)
* **RNF-01 (Completitud Funcional):** El sistema debe cubrir el 100% de las reglas del negocio de la trivia (rondas, puntajes, timeouts y ganadores) sin desviaciones en la lógica del estado del juego.

## 2. Eficiencia de Desempeño (Performance Efficiency)
* **RNF-02 (Comportamiento Temporal - Latencia):** El tiempo de procesamiento y envío de eventos críticos del servidor (como la distribución de preguntas y actualización de puntajes) no debe exceder los 100ms, garantizando la equidad en la competencia por tiempo.
* **RNF-03 (Capacidad de Concurrencia del Servidor):** El diseño arquitectónico del backend debe ser capaz de soportar múltiples partidas simultáneas de 4 jugadores (escalabilidad horizontal) sin degradar los tiempos de respuesta del sistema.

## 3. Fiabilidad (Reliability)
* **RNF-04 (Tolerancia a Fallos - Desconexiones):** Si un cliente se desconecta o experimenta pérdida de paquetes durante las 10 rondas, el servidor no debe bloquear el hilo de la partida; debe continuar el juego para los usuarios activos y procesar el timeout correspondiente para el usuario ausente.

## 4. Seguridad (Security)
* **RNF-05 (Integridad de Datos y Anti-Cheat):** La lógica de validación del juego debe residir estrictamente en el lado del servidor. El cliente solo enviará el identificador de la opción seleccionada. El servidor sanitizará las entradas para evitar la manipulación de relojes locales o inyección de respuestas maliciosas.

## 5. Mantenibilidad (Maintainability)
* **RNF-06 (Modularidad y Desacoplamiento):** El banco de preguntas debe estar completamente desacoplado del código fuente del servidor (almacenado en una base de datos o archivo de configuración estructurado como JSON), permitiendo la actualización, inserción o eliminación de preguntas sin necesidad de redesplegar o reiniciar el backend.