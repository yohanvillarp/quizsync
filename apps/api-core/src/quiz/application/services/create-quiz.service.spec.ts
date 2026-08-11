import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { QuizController } from '@/quiz/infrastructure/adapters/in/web/quiz.controller';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateQuizService } from '@/quiz/application/services/create-quiz.service';
import { QUIZ_REPOSITORY } from '@/quiz/domain/ports/out/quiz.repository';

describe('QuizController', () => {
  let controller: QuizController;
  let prismaMock: {
    category: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    user: {
      upsert: jest.Mock;
    };
  };
  let quizRepositoryMock: {
    findQuizById: jest.Mock;
    updateQuiz: jest.Mock;
    deleteQuiz: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      category: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      user: {
        upsert: jest.fn(),
      },
    };

    quizRepositoryMock = {
      findQuizById: jest.fn(),
      updateQuiz: jest.fn(),
      deleteQuiz: jest.fn(),
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

  // ==========================================
  // RF-04: Gestión de Categorías
  // ==========================================
  describe('RF-04 - Gestión de Categorías', () => {
    it('debe crear una categoría correctamente y generar el ID automáticamente a partir del nombre', async () => {
      prismaMock.category.findMany.mockResolvedValue([]);
      prismaMock.category.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: data.id, name: data.name, description: data.description })
      );

      const result = await controller.createCategory({
        name: 'Ciencia Ficción',
        description: 'Preguntas sobre sci-fi y espacio',
      });

      expect(prismaMock.category.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.category.create).toHaveBeenCalledWith({
        data: {
          id: 'CIENCIA_FICCIÓN',
          name: 'Ciencia Ficción',
          description: 'Preguntas sobre sci-fi y espacio',
        },
      });
      expect(result).toEqual({
        id: 'CIENCIA_FICCIÓN',
        name: 'Ciencia Ficción',
        description: 'Preguntas sobre sci-fi y espacio',
      });
    });

    it('debe lanzar ConflictException si ya existe una categoría con el mismo nombre o ID', async () => {
      prismaMock.category.findMany.mockResolvedValue([
        { id: 'HISTORIA', name: 'Historia', description: 'Historia universal' },
      ]);

      await expect(
        controller.createCategory({
          name: 'historia',
          description: 'Nueva descripción',
        })
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.category.create).not.toHaveBeenCalled();
    });

    it('debe retornar la lista completa de categorías disponibles', async () => {
      const mockCategories = [
        { id: 'CIENCIA', name: 'Ciencia', description: 'General' },
        { id: 'ARTE', name: 'Arte', description: 'Cultura' },
      ];
      prismaMock.category.findMany.mockResolvedValue(mockCategories);

      const categories = await controller.getCategories();

      expect(categories).toEqual(mockCategories);
      expect(prismaMock.category.findMany).toHaveBeenCalledWith();
    });

    it('debe filtrar categorías que tienen preguntas cuando hasQuestions es true', async () => {
      const mockCategories = [{ id: 'CIENCIA', name: 'Ciencia', description: 'General' }];
      prismaMock.category.findMany.mockResolvedValue(mockCategories);

      const categories = await controller.getCategories('true');

      expect(categories).toEqual(mockCategories);
      expect(prismaMock.category.findMany).toHaveBeenCalledWith({
        where: {
          quizzes: {
            some: {
              questions: {
                some: {},
              },
            },
          },
        },
      });
    });
  });

  // ==========================================
  // RF-02: Edición de Cuestionarios
  // ==========================================
  describe('RF-02 - Edición de Cuestionarios', () => {
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
});