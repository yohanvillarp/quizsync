import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateQuizService } from '@/quiz/application/services/create-quiz.service';
import { QUIZ_REPOSITORY } from '@/quiz/domain/ports/out/quiz.repository';

describe('QuizController - RF-03 (Eliminación de Cuestionarios)', () => {
  let controller: QuizController;
  let quizRepositoryMock: {
    deleteQuiz: jest.Mock;
  };

  beforeEach(async () => {
    quizRepositoryMock = {
      deleteQuiz: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        { provide: PrismaService, useValue: {} },
        { provide: CreateQuizService, useValue: {} },
        { provide: QUIZ_REPOSITORY, useValue: quizRepositoryMock },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe eliminar un cuestionario existente por su ID y retornar la confirmación', async () => {
    const quizId = 'quiz-to-delete-123';
    quizRepositoryMock.deleteQuiz.mockResolvedValue({ success: true });

    const result = await controller.deleteQuiz(quizId);

    expect(quizRepositoryMock.deleteQuiz).toHaveBeenCalledWith(quizId);
    expect(quizRepositoryMock.deleteQuiz).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('debe propagar la excepción cuando el repositorio falla o el cuestionario no existe', async () => {
    const quizId = 'non-existent-quiz';
    quizRepositoryMock.deleteQuiz.mockRejectedValue(new NotFoundException('Cuestionario no encontrado'));

    await expect(controller.deleteQuiz(quizId)).rejects.toThrow(NotFoundException);
    expect(quizRepositoryMock.deleteQuiz).toHaveBeenCalledWith(quizId);
  });
});