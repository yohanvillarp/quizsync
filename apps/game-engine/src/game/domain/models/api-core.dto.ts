export interface ApiCoreOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ApiCoreQuestion {
  id: string;
  text: string;
  timeLimit?: number;
  options: ApiCoreOption[];
}

export interface ApiCoreQuiz {
  id: string;
  categoryId: string;
  category?: { name: string };
  questions: ApiCoreQuestion[];
}
