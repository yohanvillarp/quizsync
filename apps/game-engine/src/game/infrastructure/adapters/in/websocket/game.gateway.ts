import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinGameService } from '../../../../application/services/join-game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly joinGameService: JoinGameService) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; quizId: string; nickname: string; avatarId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = await this.joinGameService.execute(data.roomId, data.quizId, client.id, data.nickname, data.avatarId);
      
      // Unir al socket room de socket.io
      client.join(data.roomId);
      
      // Notificar a todos en la sala que alguien entró
      this.server.to(data.roomId).emit('playerJoined', session.players);
      
      return { event: 'joined', success: true, session };
    } catch (error: any) {
      return { event: 'error', message: error.message };
    }
  }
}
