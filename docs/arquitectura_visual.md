# Arquitectura Distribuida del Sistema QuizSync (Microservicios)

A continuación se presenta el diagrama de arquitectura en la nube para el sistema de trivia, evidenciando el modelo de Microservicios (2 servidores independientes) y la separación de responsabilidades que garantiza la concurrencia, transparencia y escalabilidad del sistema.

```mermaid
flowchart TD
    %% Frontend / Clientes
    subgraph Vercel ["🖥️ Frontend Global (Vercel Edge Network)"]
        direction LR
        P1("👤 Jugador 1")
        P2("👤 Jugador 2")
        P3("👤 Jugador 3")
        P4("👤 Jugador 4")
    end

    %% Capa de Conexión
    subgraph RealTime ["⚡ Capa de Tiempo Real (Red)"]
        PubSub{"Azure Web PubSub\n(Gestor de WebSockets)"}
    end

    %% Sistema Distribuido (Microservicios)
    subgraph Compute ["⚙️ Sistema Distribuido (Nodos de Procesamiento)"]
        direction LR
        GameEngine["Nodo 2: Game Engine\n(NestJS - Tiempo Real)"]
        ApiCore["Nodo 1: Core API\n(NestJS - REST y Reglas)"]
    end

    %% Capa de Datos Separada
    subgraph Storage ["🗄️ Capa de Datos (Aislada)"]
        direction LR
        Redis[("Redis\n(Memoria Rápida)")]
        Postgres[("PostgreSQL\n(Datos Persistentes)")]
    end

    %% Conexiones de Clientes
    P1 -->|"Paso de Mensajes (WSS)"| PubSub
    P2 -->|"Paso de Mensajes (WSS)"| PubSub
    P3 -->|"Paso de Mensajes (WSS)"| PubSub
    P4 -->|"Paso de Mensajes (WSS)"| PubSub
    Vercel -->|"Llamadas API REST (HTTP)"| ApiCore

    %% Conexiones de Backend
    PubSub -->|"Eventos Concurrentes (JSON)"| GameEngine
    GameEngine <-->|"Invocación Remota (RPC) / Comunicación entre Nodos"| ApiCore
    
    %% Bases de Datos
    GameEngine -->|"Estado de Partida / Ordenamiento exacto"| Redis
    ApiCore -->|"Consultas de Banco e Historial (Prisma)"| Postgres

    %% Estilos
    classDef cliente fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef red fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef logic fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef bd fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class P1,P2,P3,P4,Vercel cliente;
    class PubSub,RealTime red;
    class GameEngine,ApiCore,Compute logic;
    class Redis,Postgres,Storage bd;
```

## Relación con Metas de Diseño (Sistemas Distribuidos)

1. **Modelo Cliente-Servidor:** Clara división entre la interfaz (Vercel) y los recursos (Nodos NestJS).
2. **Paso de Mensajes (Externo):** Representado por las flechas de `WSS` desde los clientes, ocultando la complejidad del sistema distribuido (Transparencia).
3. **Paso de Mensajes e Invocación Remota (Interna):** El `Game Engine` no tiene acceso a la base de datos de preguntas. Para iniciar una partida o guardar los resultados, debe enviar mensajes por red al `Core API` comunicando dos nodos distintos.
4. **Manejo de Concurrencia:** `Azure Web PubSub` recibe todas las conexiones simultáneas y las delega al `Game Engine`.
5. **Ordenamiento y Latencia:** El `Game Engine` utiliza `Redis` para resolver los empates en memoria RAM (< 5ms) sin afectar a la base de datos central de PostgreSQL, resolviendo el problema de ausencia de reloj global.
6. **Tolerancia a Fallos:** Si el nodo `Core API` sufre una caída, las partidas activas en el `Game Engine` (que dependen de Redis) continuarán funcionando sin interrupciones.
