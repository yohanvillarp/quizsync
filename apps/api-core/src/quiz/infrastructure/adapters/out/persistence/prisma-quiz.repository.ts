import { Injectable } from '@nestjs/common';
import { IQuizRepository } from '../../../../domain/ports/out/quiz.repository';
import { QuizModel, QuestionModel, OptionModel } from '../../../../domain/models/quiz.model';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@Injectable()
export class PrismaQuizRepository implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuiz(quizData: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizModel> {
    const createdQuiz = await this.prisma.quiz.create({
      data: {
        title: quizData.title,
        description: quizData.description,
        categoryId: quizData.categoryId,
        authorId: quizData.authorId,
        questions: {
          create: quizData.questions.map(q => ({
            text: q.text,
            timeLimit: q.timeLimit || 20,
            maxPoints: q.maxPoints || 100,
            options: {
              create: q.options.map(o => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return this.mapToDomain(createdQuiz);
  }

  async findQuizById(id: string): Promise<QuizModel | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) return null;
    return this.mapToDomain(quiz);
  }

  async findAllQuizzes(): Promise<QuizModel[]> {
    const quizzes = await this.prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });
    return quizzes.map(q => this.mapToDomain(q));
  }

  async deleteQuiz(id: string): Promise<void> {
    // Prisma borra en cascada si está configurado en el esquema.
    // Pero si no hay onDelete: Cascade, tenemos que borrar manualmente.
    // Vamos a asegurar el borrado manual de opciones y preguntas por si acaso.
    await this.prisma.option.deleteMany({
      where: { question: { quizId: id } }
    });
    await this.prisma.question.deleteMany({
      where: { quizId: id }
    });
    await this.prisma.quiz.delete({
      where: { id }
    });
  }

  async updateQuiz(id: string, quizData: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizModel> {
    // Técnica "Replace All" para colecciones anidadas complejas.
    // Primero borramos las viejas preguntas y opciones.
    await this.prisma.option.deleteMany({
      where: { question: { quizId: id } }
    });
    await this.prisma.question.deleteMany({
      where: { quizId: id }
    });

    // Luego actualizamos el Quiz e insertamos las nuevas.
    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: {
        title: quizData.title,
        description: quizData.description,
        categoryId: quizData.categoryId,
        questions: {
          create: quizData.questions.map(q => ({
            text: q.text,
            timeLimit: q.timeLimit || 20,
            maxPoints: q.maxPoints || 100,
            options: {
              create: q.options.map(o => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return this.mapToDomain(updatedQuiz);
  }

  // Mapeador para aislar Prisma del Dominio
  private mapToDomain(prismaQuiz: any): QuizModel {
    const questions = prismaQuiz.questions.map((q: any) => {
      const options = q.options.map((o: any) => new OptionModel(o.id, o.text, o.isCorrect));
      return new QuestionModel(q.id, q.text, options, q.timeLimit, q.maxPoints);
    });

    return new QuizModel(
      prismaQuiz.id,
      prismaQuiz.title,
      prismaQuiz.description,
      prismaQuiz.categoryId,
      prismaQuiz.authorId,
      questions,
      prismaQuiz.createdAt,
      prismaQuiz.updatedAt
    );
  }
}
