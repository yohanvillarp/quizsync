import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Req, Inject } from '@nestjs/common';
import { CreateQuizService } from '@/quiz/application/services/create-quiz.service';
import { QuizModel } from '@/quiz/domain/models/quiz.model';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { ClerkAuthGuard } from '@/shared/infrastructure/guards/clerk-auth.guard';
import { Roles } from '@/shared/domain/decorators/roles.decorator';
import { QUIZ_REPOSITORY } from '@/quiz/domain/ports/out/quiz.repository';
import type { IQuizRepository } from '@/quiz/domain/ports/out/quiz.repository';

import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class QuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}

export class CreateQuizBody {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];
}

interface AuthedRequest {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly createQuizService: CreateQuizService,
    private readonly prisma: PrismaService,
    @Inject(QUIZ_REPOSITORY) private readonly quizRepository: IQuizRepository
  ) {}

  @Get('categories')
  async getCategories() {
    return this.prisma.category.findMany({
      where: {
        quizzes: {
          some: {}
        }
      }
    });
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizRepository.findQuizById(id);
  }

  @Get()
  async getQuizzes() {
    return this.prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            options: true
          }
        },
        category: true,
      }
    });
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async createQuiz(@Body() body: CreateQuizBody, @Req() req: AuthedRequest) {
    const user = req.user;

    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      }
    });

    const quizData: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'> = {
      title: body.title,
      description: body.description,
      categoryId: body.categoryId,
      authorId: user.id,
      questions: (body.questions ?? []).map(q => ({
        id: q.id ?? '',
        text: q.text,
        options: q.options.map(o => ({ id: o.id ?? '', text: o.text, isCorrect: o.isCorrect })),
        timeLimit: q.timeLimit,
      })) as any,
    };

    return this.createQuizService.execute(quizData);
  }

  @Put(':id')
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async updateQuiz(@Param('id') id: string, @Body() body: CreateQuizBody, @Req() req: AuthedRequest) {
    const user = req.user;

    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      }
    });

    const quizData: Omit<QuizModel, 'id' | 'createdAt' | 'updatedAt'> = {
      title: body.title,
      description: body.description,
      categoryId: body.categoryId,
      authorId: user.id,
      questions: (body.questions ?? []).map(q => ({
        id: q.id ?? '',
        text: q.text,
        options: q.options.map(o => ({ id: o.id ?? '', text: o.text, isCorrect: o.isCorrect })),
        timeLimit: q.timeLimit,
      })) as any,
    };

    return this.quizRepository.updateQuiz(id, quizData);
  }

  @Delete(':id')
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async deleteQuiz(@Param('id') id: string) {
    await this.quizRepository.deleteQuiz(id);
    return { success: true };
  }
}
