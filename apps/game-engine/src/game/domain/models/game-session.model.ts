export class PlayerModel {
  constructor(
    public readonly socketId: string,
    public readonly nickname: string,
    public readonly avatarId: string,
    public score: number = 0,
  ) {}
}

export type GameMode = 'NORMAL' | 'POWER_MODE';
export type PlayerRole = 'PLAYER' | 'SPECTATOR';

export class GameSessionModel {
  constructor(
    public readonly roomId: string,
    public readonly quizId: string,
    public readonly name: string = 'Sala de Juego',
    public isPublic: boolean = false,
    public maxPlayers: number = 8,
    public gameMode: GameMode = 'NORMAL',
    public players: PlayerModel[] = [],
    public spectators: PlayerModel[] = [],
    public status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED' = 'WAITING',
    public currentQuestionIndex: number = 0,
  ) {}

  addPlayer(player: PlayerModel) {
    if (this.status !== 'WAITING') {
      throw new Error('Cannot join a game in progress');
    }
    if (!this.players.find(p => p.socketId === player.socketId)) {
      this.players.push(player);
    }
  }

  start() {
    if (this.players.length === 0) {
      throw new Error('Cannot start game without players');
    }
    this.status = 'IN_PROGRESS';
  }
}
