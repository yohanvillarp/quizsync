import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateQuizService } from '@/quiz/application/services/create-quiz.service';
import { QUIZ_REPOSITORY } from '@/quiz/domain/ports/out/quiz.repository';

describe('QuizController - RF-02 (Edición de Cuestionarios)', () => {
  let controller: QuizController;
  let prismaMock: {
    user: {
      upsert: jest.Mock;
    };
  };
  let quizRepositoryMock: {
    updateQuiz: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        upsert: jest.fn(),
      },
    };

    quizRepositoryMock = {
      updateQuiz: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        { provide: PrismaService, useValue: prismaMock },
        { provide: CreateQuizService, useValue: {} },
        { provide: QUIZ_REPOSITORY, useValue: quizRepositoryMock },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe actualizar los datos de un cuestionario y sincro-actualizar el usuario anfitrión', async () => {
    const quizId = 'quiz-123';
    const mockUserReq = {
      user: {
        id: 'usr-999',
        email: 'admin@quizsync.com',
        firstName: 'Admin',
        lastName: 'User',
      },
    };

    const updateBody = {
      title: 'Quiz de Historia Modificado',
      description: 'Descripción actualizada',
      categoryId: 'HISTORIA',
      questions: [
        {
          id: 'q-1',
          text: '¿En qué año terminó la Segunda Guerra Mundial?',
          timeLimit: 30,
          options: [
            { id: 'o-1', text: '1945', isCorrect: true },
            { id: 'o-2', text: '1939', isCorrect: false },
          ],
        },
      ],
    };

    const expectedUpdatedQuiz = {
      id: quizId,
      ...updateBody,
      authorId: 'usr-999',
    };

    prismaMock.user.upsert.mockResolvedValue({ id: 'usr-999' });
    quizRepositoryMock.updateQuiz.mockResolvedValue(expectedUpdatedQuiz);

    const result = await controller.updateQuiz(quizId, updateBody as any, mockUserReq as any);

    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { id: 'usr-999' },
      update: {},
      create: {
        id: 'usr-999',
        email: 'admin@quizsync.com',
        name: 'Admin User',
      },
    });

    expect(quizRepositoryMock.updateQuiz).toHaveBeenCalledWith(quizId, {
      title: 'Quiz de Historia Modificado',
      description: 'Descripción actualizada',
      categoryId: 'HISTORIA',
      authorId: 'usr-999',
      questions: [
        {
          id: 'q-1',
          text: '¿En qué año terminó la Segunda Guerra Mundial?',
          timeLimit: 30,
          options: [
            { id: 'o-1', text: '1945', isCorrect: true },
            { id: 'o-2', text: '1939', isCorrect: false },
          ],
        },
      ],
    });

    expect(result).toEqual(expectedUpdatedQuiz);
  });

  it('debe procesar la actualización correctamente cuando las preguntas o IDs son opcionales', async () => {
    const quizId = 'quiz-456';
    const mockUserReq = {
      user: {
        id: 'usr-888',
        email: 'editor@quizsync.com',
        firstName: 'Editor',
        lastName: 'Sync',
      },
    };

    const updateBodyWithoutIds = {
      title: 'Quiz Sin IDs Previos',
      description: 'Actualización rápida',
      categoryId: 'CIENCIA',
      questions: [
        {
          text: '¿Cuál es la fórmula del agua?',
          options: [
            { text: 'H2O', isCorrect: true },
            { text: 'CO2', isCorrect: false },
          ],
        },
      ],
    };

    prismaMock.user.upsert.mockResolvedValue({ id: 'usr-888' });
    quizRepositoryMock.updateQuiz.mockResolvedValue({ id: quizId, ...updateBodyWithoutIds });

    await controller.updateQuiz(quizId, updateBodyWithoutIds as any, mockUserReq as any);

    expect(quizRepositoryMock.updateQuiz).toHaveBeenCalledWith(quizId, {
      title: 'Quiz Sin IDs Previos',
      description: 'Actualización rápida',
      categoryId: 'CIENCIA',
      authorId: 'usr-888',
      questions: [
        {
          id: '',
          text: '¿Cuál es la fórmula del agua?',
          timeLimit: undefined,
          options: [
            { id: '', text: 'H2O', isCorrect: true },
            { id: '', text: 'CO2', isCorrect: false },
          ],
        },
      ],
    });
  });
});