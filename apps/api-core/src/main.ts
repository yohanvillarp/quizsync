import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Habilitar CORS para que React pueda consumir la API
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Añadir prefijo /api a todas las rutas
  app.setGlobalPrefix('api');
  
  // Escuchar en el puerto 3000 para evitar conflictos con game-engine
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
