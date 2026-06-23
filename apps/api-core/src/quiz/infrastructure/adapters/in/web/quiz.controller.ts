import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Req, Inject, ConflictException, Query } from '@nestjs/common';
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
  async getCategories(@Query('hasQuestions') hasQuestions?: string) {
    if (hasQuestions === 'true') {
      return this.prisma.category.findMany({
        where: {
          quizzes: {
            some: {
              questions: {
                some: {}
              }
            }
          }
        }
      });
    }
    return this.prisma.category.findMany();
  }

  @Post('categories')
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async createCategory(@Body() body: { id?: string; name: string; description: string }) {
    const id = body.id || body.name.toUpperCase().replace(/\s+/g, '_');
    const allCategories = await this.prisma.category.findMany();
    const existing = allCategories.find(c => 
      c.id === id || c.name.toLowerCase() === body.name.toLowerCase()
    );

    if (existing) {
      throw new ConflictException('Ya existe una categoría con este nombre.');
    }

    return this.prisma.category.create({
      data: {
        id,
        name: body.name,
        description: body.description
      }
    });
  }

  @Get('models')
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async getModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConflictException('El servidor no tiene configurada la API KEY de Gemini.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Error desconocido');
      }

      // Filtrar solo modelos que soportan generacion de texto/contenido
      const validModels = data.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
          id: m.name.replace('models/', ''),
          name: m.displayName || m.name.replace('models/', '')
        }));

      return validModels;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new ConflictException('No se pudieron obtener los modelos disponibles.');
    }
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizRepository.findQuizById(id);
  }

  @Get()
  async getQuizzes(@Query('categoryId') categoryId?: string) {
    const where = categoryId && categoryId !== 'random' ? { categoryId } : {};
    return this.prisma.quiz.findMany({
      where,
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


  @Post('generate')
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async generateQuestions(@Body() body: { title: string; description: string; categoryName: string; model?: string }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConflictException('El servidor no tiene configurada la API KEY de Gemini.');
    }

    // Por defecto 10 preguntas
    const count = 10;
    // Si el frontend envía un modelo dinámico lo usamos, sino usamos por defecto flash latest
    const selectedModel = body.model || 'gemini-flash-latest';

    const title = body.title.trim().replace(/\s+/g, ' ');
    const description = body.description.trim().replace(/\s+/g, ' ');
    const categoryName = body.categoryName.trim().replace(/\s+/g, ' ');

    const prompt = `Actúa como un experto en educación y creador de trivia.
Genera exactamente ${count} preguntas de opción múltiple.

Contexto del Cuestionario:
- Título: "${title}"
- Descripción: "${description}"
- Categoría: "${categoryName}"

Asegúrate de que las preguntas sean desafiantes, precisas y relevantes para este contexto específico.
SI Y SÓLO SI el tema es inapropiado, ilegal, o trata sobre violencia explícita o daños, devuelve una lista vacía [].
De lo contrario, devuelve un JSON Array exacto. NO DEVUELVAS NADA MÁS QUE EL JSON. NO ESCRIBAS TEXTO FUERA DEL JSON. NO USES BLOQUES DE MARKDOWN.
Cada elemento del array debe tener este formato:
{
  "text": "La pregunta",
  "timeLimit": 20, // Asigna un tiempo lógico en segundos (ej: 10 para preguntas fáciles/rápidas, 20 normal, 30 para cálculos/lógica).
  "maxPoints": 100, // Asigna un puntaje base lógico (ej: 50 fácil, 100 normal, 150-200 difícil).
  "options": [
    { "text": "Respuesta correcta", "isCorrect": true },
    { "text": "Incorrecta 1", "isCorrect": false },
    { "text": "Incorrecta 2", "isCorrect": false },
    { "text": "Incorrecta 3", "isCorrect": false }
  ]
}

El orden de las opciones debe ser SIEMPRE el mismo en el JSON (la correcta siempre de primera). El sistema se encargará de mezclar las opciones aleatoriamente para cada jugador. No intentes mezclarlas tú.`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error de Gemini API:', data);
        throw new Error(data.error?.message || 'Error desconocido');
      }

      let jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      // Limpiar posibles bloques markdown
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const questions = JSON.parse(jsonStr);
      if (!Array.isArray(questions) || questions.length === 0) {
         return { error: true, message: 'El tema fue rechazado o no se generaron preguntas.' };
      }
      
      // Randomizar el orden de las opciones para que la correcta no sea siempre la primera
      questions.forEach((q: any) => {
        if (Array.isArray(q.options)) {
          q.options.sort(() => Math.random() - 0.5);
        }
      });

      return questions;
    } catch (error: any) {
      console.error('Error con Gemini:', error);
      if (error.message && error.message.includes('high demand')) {
        throw new ConflictException('Los servidores de Google Gemini están saturados en este momento. Por favor, inténtalo de nuevo en unos segundos.');
      }
      throw new ConflictException('Hubo un error al generar las preguntas con IA.');
    }
  }

  @Post('generate-full')
  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  async generateFullQuiz(@Body() body: { textContext: string; categories: { id: string, name: string }[]; model?: string }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConflictException('El servidor no tiene configurada la API KEY de Gemini.');
    }

    const count = 10;
    const selectedModel = body.model || 'gemini-flash-latest';
    const categoriesListStr = body.categories.map(c => `- ID: "${c.id}" (Nombre: "${c.name}")`).join('\n');
    const optimizedText = body.textContext.trim().replace(/\s+/g, ' ');

    const prompt = `Actúa como un experto en educación y creador de trivia.
Lee detenidamente los siguientes apuntes/texto y crea un cuestionario completo.

APUNTES DEL USUARIO:
"""
${optimizedText}
"""

CATEGORÍAS DISPONIBLES EN LA BASE DE DATOS:
${categoriesListStr}

Deberás generar un objeto JSON con la siguiente estructura exacta. NO ESCRIBAS NINGÚN TEXTO FUERA DEL JSON NI USES BLOQUES MARKDOWN:
{
  "title": "Un título académico y descriptivo para el quiz. IMPORTANTE: El título NO debe incluir el nombre de la categoría elegida.",
  "description": "Una descripción educativa y formal de una oración sobre el contenido del cuestionario",
  "categoryId": "El ID exacto de la categoría más relevante de la lista disponible",
  "questions": [
    {
      "text": "La pregunta de opción múltiple",
      "timeLimit": 20, // Asigna un tiempo lógico en segundos (ej: 10 fácil, 20 normal, 30 difícil)
      "maxPoints": 100, // Asigna un puntaje base lógico (ej: 50 fácil, 100 normal, 150-200 difícil)
      "options": [
        { "text": "Respuesta correcta", "isCorrect": true },
        { "text": "Incorrecta 1", "isCorrect": false },
        { "text": "Incorrecta 2", "isCorrect": false },
        { "text": "Incorrecta 3", "isCorrect": false }
      ]
    }
  ] // El array de questions debe tener exactamente ${count} preguntas.
}

Asegúrate de extraer conceptos importantes, fechas o definiciones del texto proporcionado.
El orden de las opciones debe ser SIEMPRE el mismo en el JSON (la correcta de primera).`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error de Gemini API:', data);
        throw new Error(data.error?.message || 'Error desconocido');
      }

      let jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      if (jsonStr.startsWith('\`\`\`json')) {
        jsonStr = jsonStr.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      } else if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }

      const generatedData = JSON.parse(jsonStr);
      
      if (!generatedData || !Array.isArray(generatedData.questions) || generatedData.questions.length === 0) {
         return { error: true, message: 'El tema fue rechazado o no se pudo procesar correctamente el texto.' };
      }
      
      generatedData.questions.forEach((q: any) => {
        if (Array.isArray(q.options)) {
          q.options.sort(() => Math.random() - 0.5);
        }
      });

      return generatedData;
    } catch (error: any) {
      console.error('Error con Gemini:', error);
      if (error.message && error.message.includes('high demand')) {
        throw new ConflictException('Los servidores de Google Gemini están saturados en este momento. Por favor, inténtalo de nuevo en unos segundos.');
      }
      throw new ConflictException('Hubo un error al extraer el cuestionario de tus apuntes.');
    }
  }
}
