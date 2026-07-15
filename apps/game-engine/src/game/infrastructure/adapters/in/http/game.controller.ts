import { Controller, Post, Body, InternalServerErrorException, Get, HttpException, HttpStatus, UseGuards, Logger, Param, Delete, Query } from '@nestjs/common';
import { GameService, Question, RoomAlreadyExistsException } from '@/game/application/services/game.service';
import { GameModeId } from '@/game/domain/models/game-mode';
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

  @Get('active-host/:hostId')
  getActiveHostRoom(@Param('hostId') hostId: string) {
    const room = this.gameService.getActiveRoomForHost(hostId);
    if (!room) {
      throw new HttpException('No active room', HttpStatus.NOT_FOUND);
    }
    return { roomId: room.roomId, quizTitle: room.quizTitle };
  }

  @Delete(':roomId')
  deleteRoom(@Param('roomId') roomId: string, @Query('hostId') hostId: string) {
    try {
      const room = this.gameService.getRoom(roomId);
      if (room.hostId === hostId) {
        this.gameService.destroyRoom(roomId, 'El anfitrión ha destruido la sala manualmente.');
        return { success: true };
      }
      throw new HttpException('No tienes permisos', HttpStatus.FORBIDDEN);
    } catch (e) {
      throw new HttpException('Sala no encontrada', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async createRoom(@Body() payload: { categoryId: string; quizId?: string; gameModeId: GameModeId; visibility: string; hostId: string; force?: boolean; maxPlayers?: number; questionCount?: number }) {
    try {
      // Invocación Remota a ApiCore para obtener las preguntas
      const apiCoreUrl = process.env.API_CORE_URL || 'http://localhost:3000/api';
      const fetchUrl = payload.categoryId && payload.categoryId !== 'random' 
        ? `${apiCoreUrl}/quizzes?categoryId=${payload.categoryId}` 
        : `${apiCoreUrl}/quizzes`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('Error al conectar con ApiCore');
      const allQuizzes: ApiCoreQuiz[] = await res.json();
      // Filter quizzes by category, or use all if random
      let filteredQuizzes: ApiCoreQuiz[] = [];
      let roomTitle = 'Trivia Mixta Mix';
      let categoryName = 'Trivia Mixta';
      let quizDescription = '';

      if (payload.quizId && payload.quizId !== 'random') {
        const exactQuiz = allQuizzes.find(q => q.id === payload.quizId);
        if (exactQuiz) {
          filteredQuizzes = [exactQuiz];
          roomTitle = exactQuiz.title;
          categoryName = exactQuiz.category?.name || 'Categoría Libre';
          quizDescription = exactQuiz.description || quizDescription;
        } else {
          throw new Error('No se encontró el cuestionario específico solicitado');
        }
      } else if (payload.categoryId === 'random' || !payload.categoryId) {
        filteredQuizzes = allQuizzes;
      } else {
        filteredQuizzes = allQuizzes.filter((q) => q.categoryId === payload.categoryId);
        if (filteredQuizzes.length > 0) {
          categoryName = filteredQuizzes[0].category?.name || 'Categoría Libre';
          roomTitle = categoryName + ' Mix';
        } else {
          filteredQuizzes = allQuizzes; // fallback if category not found or has no quizzes
        }
      }

      if (filteredQuizzes.length === 0) {
        throw new Error('No hay quizzes disponibles en la base de datos');
      }

      // Collect all questions from all filtered quizzes
      let allQuestions: Question[] = [];
      for (const quiz of filteredQuizzes) {
        const mapped = quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          timeLimit: q.timeLimit || 15,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect
          }))
        }));
        allQuestions = allQuestions.concat(mapped);
      }

      // Shuffle and pick requested amount (default 10)
      const count = payload.questionCount && payload.questionCount > 0 ? payload.questionCount : 10;
      let questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);

      const roomId = this.gameService.createRoom(
        payload.categoryId || 'random',
        roomTitle,
        quizDescription,
        categoryName,
        payload.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        payload.gameModeId || 'NORMAL',
        payload.hostId,
        questions,
        payload.force,
        payload.maxPlayers || 10
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
