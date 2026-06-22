import { Controller, Post, Body, InternalServerErrorException, Get, HttpException, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { GameService, Question, RoomAlreadyExistsException } from '@/game/application/services/game.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ApiCoreQuiz } from '@/game/domain/models/api-core.dto';

@Controller('api/rooms')
@UseGuards(ThrottlerGuard)
export class GameController {
  private readonly logger = new Logger(GameController.name);
  constructor(private readonly gameService: GameService) {}

  @Get()
  getPublicRooms() {
    return this.gameService.getPublicRooms();
  }

  @Post()
  async createRoom(@Body() payload: { categoryId: string; gameMode: string; visibility: string; hostId: string; force?: boolean }) {
    try {
      // Invocación Remota a ApiCore para obtener las preguntas
      const apiCoreUrl = process.env.API_CORE_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiCoreUrl}/quizzes`);
      if (!res.ok) throw new Error('Error al conectar con ApiCore');
      const allQuizzes: ApiCoreQuiz[] = await res.json();
      
      // Lógica simple para elegir un quiz: el primero, o filtramos por categoría luego
      // (asumimos que el payload.categoryId podría ser 'random' u otro)
      let selectedQuiz = allQuizzes.find((q) => q.categoryId === payload.categoryId);
      if (!selectedQuiz && allQuizzes.length > 0) {
        selectedQuiz = allQuizzes[0]; // Fallback
      }

      if (!selectedQuiz) {
        throw new Error('No hay quizzes disponibles en la base de datos');
      }

      // Mapear las preguntas desde el formato de ApiCore al formato de GameEngine
      let questions: Question[] = selectedQuiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        timeLimit: q.timeLimit || 15,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect
        }))
      }));

      // Si hay más de 10 preguntas, seleccionar 10 aleatorias
      if (questions.length > 10) {
        questions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);
      }

      const roomId = this.gameService.createRoom(
        selectedQuiz.id,
        selectedQuiz.title,
        selectedQuiz.category?.name || 'Categoría Libre',
        payload.visibility as 'PUBLIC' | 'PRIVATE',
        payload.hostId,
        questions,
        payload.force
      );
      
      return { roomId, status: 'success' };
    } catch (error) {
      if (error instanceof RoomAlreadyExistsException) {
        throw new HttpException({
          status: 'error',
          errorCode: 'ROOM_ALREADY_EXISTS',
          message: error.message,
          previousRoomId: error.previousRoomId
        }, HttpStatus.CONFLICT);
      }
      this.logger.error('Error al invocar ApiCore o crear sala: ' + (error?.stack || error?.message || error));
      throw new InternalServerErrorException('No se pudo inicializar la partida');
    }
  }
}
