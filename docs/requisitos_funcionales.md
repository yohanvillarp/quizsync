# Requisitos Funcionales (RF) - Sistema de Trivia Distribuida

Este documento detalla las funciones específicas, las interacciones y las reglas de negocio que el sistema debe ejecutar para garantizar el correcto flujo del juego.

## 1. Gestión del Banco de Preguntas
* **RF-01 (Almacenamiento de Cuestionarios):** El servidor debe contar con un banco de datos compuesto por un mínimo de 20 preguntas.
* **RF-02 (Estructura de Pregunta):** Cada entidad pregunta debe contener obligatoriamente 4 opciones de respuesta de selección múltiple, donde solo una es correcta.
* **RF-03 (Categorización):** El sistema debe permitir la clasificación de preguntas en las áreas de Cultura General, Tecnología y Sistemas Distribuidos.

## 2. Gestión de Partidas y Conectividad (Lobby)
* **RF-04 (Control de Concurrencia de Jugadores):** El servidor debe permitir y gestionar la conexión simultánea de un mínimo de 2 y un máximo de 4 jugadores para iniciar una partida.

## 3. Ciclo de Vida del Juego e Interacción en Tiempo Real
* **RF-05 (Sincronización de Preguntas - Broadcast):** El servidor debe despachar de manera simultánea la misma pregunta a todos los clientes conectados y activos en la partida.
* **RF-06 (Registro y Evaluación de Respuestas):** El sistema debe procesar las respuestas de los jugadores, validar su precisión (correcta/incorrecta) y registrar con precisión de milisegundos el tiempo de respuesta.
* **RF-07 (Cómputo de Velocidad):** El servidor debe determinar de manera automatizada qué jugador respondió correctamente en el menor tiempo para asignarle la prioridad en el puntaje de la ronda.
* **RF-08 (Sincronización de Estado y Puntajes):** Al finalizar cada ronda, el servidor debe calcular las puntuaciones acumuladas y transmitir la tabla de posiciones actualizada a todos los participantes en tiempo real.
* **RF-09 (Control de Turno por Expiración - Timeout):** El servidor debe ejecutar un temporizador de 30 segundos por cada pregunta. Si un jugador no emite respuesta dentro de este lapso, el sistema debe dar por perdido su turno automáticamente.
* **RF-10 (Finalización de Partida y Ganador):** El juego debe concluir estrictamente al finalizar la ronda número 10. En ese momento, el servidor debe consolidar los puntajes finales, anunciar oficialmente al ganador y cerrar la sesión de juego.