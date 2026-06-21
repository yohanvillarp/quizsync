import { Module } from '@nestjs/common';
import { QuizController } from './infrastructure/adapters/in/web/quiz.controller';
import { CreateQuizService } from './application/services/create-quiz.service';
import { PrismaQuizRepository } from './infrastructure/adapters/out/persistence/prisma-quiz.repository';
import { QUIZ_REPOSITORY } from './domain/ports/out/quiz.repository';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Module({
  controllers: [QuizController],
  providers: [
    PrismaService, // Usualmente estaría en un DatabaseModule compartido
    CreateQuizService,
    {
      provide: QUIZ_REPOSITORY,
      useClass: PrismaQuizRepository, // Inyección de Dependencias Hexagonal
    },
  ],
})
export class QuizModule {}
