# API Core Server

![API](https://img.shields.io/badge/Architecture-REST_API-blue.svg)
![NodeJS](https://img.shields.io/badge/Node.js-NestJS-red.svg)

This service is the primary data manager for QuizSync. It strictly handles the persistence and state of static entities.

## Responsibilities
- Authentication and User Management.
- Creation and management of Quizzes and Question Banks.
- Storage of historical data and scoring records.

## Technologies
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Framework:** NestJS (HTTP)

## Local Development
Refer to the root `Makefile` to spin up the entire ecosystem via Docker.
