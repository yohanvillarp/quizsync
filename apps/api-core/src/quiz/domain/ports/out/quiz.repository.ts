import { QuizModel } from '../../models/quiz.model';

export const QUIZ_REPOSITORY = Symbol('QUIZ_REPOSITORY');

export interface IQuizRepository {
  createQuiz(quiz: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizModel>;
  findQuizById(id: string): Promise<QuizModel | null>;
  findAllQuizzes(): Promise<QuizModel[]>;
  deleteQuiz(id: string): Promise<void>;
  updateQuiz(id: string, quiz: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizModel>;
}
