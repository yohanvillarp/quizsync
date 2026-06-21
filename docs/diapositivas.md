# temas relacionados - diapositivas

De acuerdo con las instrucciones de la asignatura, **es un requisito obligatorio que en cada proyecto justifiques tus decisiones técnicas aplicando los conceptos de TODAS las sesiones de la Unidad I**.

Para el **Proyecto 3 (Juego multijugador por red - Trivia)**, el cual consiste en un servidor central que envía preguntas simultáneas a un grupo de 2 a 4 jugadores, los conceptos de cada sesión se aplicarán de la siguiente manera:

**Sesión 01: Fundamentos de Sistemas Distribuidos**

- **Paso de mensajes:** El juego operará bajo el principio básico de los sistemas distribuidos, donde computadoras independientes trabajan juntas y **se comunican exclusivamente enviando mensajes** a través de la red para coordinar las rondas de preguntas.
- **Sistema único:** Para el usuario final, la trivia debe presentarse como un sistema único y coherente, ocultando la complejidad de la comunicación subyacente.

**Sesión 02: Metas de diseño y Desafíos**

- **Concurrencia:** Esta es una meta de diseño vital para el proyecto, ya que **el servidor debe manejar de 2 a 4 jugadores interactuando en simultáneo**, enviándoles la misma pregunta al mismo tiempo y recibiendo sus respuestas sin que se interfieran.
- **Transparencia:** El jugador no necesita saber cómo funciona el servidor por detrás o si hay retrasos en la red; solo interactúa con la interfaz del juego.
- **Heterogeneidad (Desafío):** Deberás asegurar que tu sistema use protocolos estándar de red (como sockets) para que los clientes puedan entenderse con el servidor independientemente del sistema operativo o lenguaje.

**Sesión 03: Modelos Arquitectónicos**

- **Modelo Cliente-Servidor:** Toda la arquitectura de tu juego de trivia se basa en este modelo clásico. El **Servidor** central es el proveedor de recursos (gestiona el banco de 20 preguntas, envía las preguntas, registra respuestas y lleva los puntajes) y los jugadores actúan como **Clientes** que piden conectarse, visualizan las preguntas y envían sus respuestas (peticiones) al servidor.

**Sesión 04: Modelos Fundamentales (Interacción y Fallos)**

- **Latencia y Ordenamiento (Modelo de Interacción):** Debido a que la regla del juego establece que **el servidor debe registrar "quién respondió correcto más rápido"**, tendrás que lidiar con la **latencia** (el tiempo que tarda el mensaje de cada jugador en viajar por la red) y el **ordenamiento** (determinar de manera justa qué evento o respuesta ocurrió primero al no existir un reloj global exacto).
- **Manejo de Fallos (Temporización y Omisión):** El proyecto indica explícitamente que **"si un jugador no responde en 30 segundos, pierde el turno (timeout)"**. Esta es una aplicación directa para mitigar un **fallo de temporización** (el jugador respondió, pero la respuesta llegó demasiado tarde) o un **fallo por omisión** (el jugador perdió la conexión, la aplicación falló o el mensaje se perdió en la red y el sistema dejó de responder). Al implementar el *timeout*, tu sistema seguirá operando sin quedarse bloqueado esperando.