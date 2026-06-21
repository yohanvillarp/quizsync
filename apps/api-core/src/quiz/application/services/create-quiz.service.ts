import { Inject, Injectable } from '@nestjs/common';
import { QuizModel } from '../../domain/models/quiz.model';
import type { IQuizRepository } from '../../domain/ports/out/quiz.repository';
import { QUIZ_REPOSITORY } from '../../domain/ports/out/quiz.repository';
@Injectable()
export class CreateQuizService {
  constructor(
    @Inject(QUIZ_REPOSITORY)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(data: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizModel> {
    // Aquí irían las reglas de negocio puras, por ejemplo:
    if (data.questions && data.questions.length === 0) {
      throw new Error('A quiz must have at least one question to be valid (Business Rule)');
    }

    return this.quizRepository.createQuiz(data);
  }
}
