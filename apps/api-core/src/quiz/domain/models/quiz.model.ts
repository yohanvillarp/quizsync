export class QuestionModel {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly options: OptionModel[],
    public readonly timeLimit?: number,
    public readonly maxPoints?: number,
  ) {}
}

export class OptionModel {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly isCorrect: boolean,
  ) {}
}

export class QuizModel {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly categoryId: string,
    public readonly authorId: string,
    public readonly questions: QuestionModel[] = [],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
