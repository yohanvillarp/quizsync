import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateQuizService } from '@/quiz/application/services/create-quiz.service';
import { QUIZ_REPOSITORY } from '@/quiz/domain/ports/out/quiz.repository';

describe('QuizController - RF-04 (Gestión de Categorías)', () => {
  let controller: QuizController;
  let prismaMock: {
    category: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      category: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        { provide: PrismaService, useValue: prismaMock },
        { provide: CreateQuizService, useValue: {} },
        { provide: QUIZ_REPOSITORY, useValue: {} },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory (RF-04 - Creación de categoría)', () => {
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
  });

  describe('getCategories (RF-04 - Consulta de categorías)', () => {
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
});