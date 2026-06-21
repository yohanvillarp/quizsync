# Game Engine Server

![Engine](https://img.shields.io/badge/Architecture-WebSockets-green.svg)
![NodeJS](https://img.shields.io/badge/Node.js-NestJS-red.svg)

This service manages the real-time execution of active quiz sessions. It is designed to handle high concurrency and sub-second data propagation.

## Responsibilities
- Client WebSocket connections and lifecycle.
- Sub-second latency responses and race-condition resolutions.
- Real-time leaderboards and synchronized distributed timers.

## Technologies
- **State Manager:** Redis
- **Protocol:** TCP (WebSockets)
- **Framework:** NestJS (@nestjs/websockets)

## Local Development
Refer to the root `Makefile` to spin up the entire ecosystem via Docker.
