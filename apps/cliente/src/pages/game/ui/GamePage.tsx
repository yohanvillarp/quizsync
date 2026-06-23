import React, { useState, useEffect } from 'react';
import { Pencil, Timer, Trophy } from 'lucide-react';
import { NotebookSpiral } from '@/shared/ui/NotebookSpiral';
import { WashiTape } from '@/shared/ui/WashiTape';
import { GameTimer } from '@/features/game-timer/ui/GameTimer';
import { QuestionCard } from '@/entities/game/ui/QuestionCard';
import { AnswerOption } from '@/entities/game/ui/AnswerOption';
import { RankingBoard } from '@/widgets/game-board/ui/RankingBoard';
import { useGameStore } from '@/entities/game/model/useGameStore';
import { useNavigate } from 'react-router-dom';

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const { players, gameStatus, currentQuestion, endTime, submitAnswer, connect, isConnected } = useGameStore();

  const isMe = (p: any) => p.deviceId === localStorage.getItem('quizsync_device_id');
  
  // Mapear los jugadores del store al formato que espera RankingBoard
  const rankingPlayers = players
    .map(p => ({
      id: p.deviceId,
      name: p.name,
      score: p.score || 0,
      hasAnswered: false, 
      isMe: isMe(p)
    }))
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (!isConnected) {
      const engineWsUrl = import.meta.env.VITE_ENGINE_WS_URL || 'http://localhost:3002';
      connect(engineWsUrl);
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (gameStatus === 'FINISHED') {
      const { roomId } = useGameStore.getState();
      navigate('/podium/' + roomId);
    } else if (gameStatus === 'LOBBY' || !gameStatus) {
      navigate('/');
    }
    // Reiniciar selección al cambiar la pregunta
    if (gameStatus === 'QUESTION') {
      setSelectedAnswer(null);
    }
  }, [gameStatus, navigate]);

  const handleSelectOption = async (optionId: string) => {
    if (selectedAnswer || gameStatus !== 'QUESTION') return;
    setSelectedAnswer(optionId);
    await submitAnswer(optionId);
  };

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    const updateTimer = () => {
      setTimeLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  // Calculamos la vista a forzar (por ejemplo, si el server dice RANKING, mostramos RANKING)
  const view = gameStatus === 'RANKING' ? 'ranking' : 'question';

  // Mostrar la UI de Preparación
  if (gameStatus === 'PREPARING') {
    const roundNames = [
      'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 
      'SEXTA', 'SÉPTIMA', 'OCTAVA', 'NOVENA', 'DÉCIMA'
    ];
    
    // Fallback in case of > 10 questions
    const index = useGameStore.getState().currentQuestionIndex || 0;
    const roundText = roundNames[index] ? `${roundNames[index]} RONDA` : `${index + 1}ª RONDA`;
    const text = index === 0 ? '¡PREPÁRATE!' : roundText;

    // We use a fixed 4s timer for PREPARING to avoid clock skew issues with the server
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-16 w-full bg-ink relative">
        <div className="z-20 flex items-center justify-center scale-[2.5] md:scale-[3]">
          <GameTimer key={index} initialTime={4} />
        </div>
        <h1 className="text-white font-display text-4xl md:text-6xl uppercase tracking-widest animate-pulse text-center px-4 mt-12 drop-shadow-lg">
          {text}
        </h1>
      </div>
    );
  }

  // Pantalla final
  if (gameStatus === 'FINISHED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative w-full bg-paper">
        <h1 className="text-ink font-display text-6xl uppercase tracking-widest mb-10 text-center">
          ¡FIN DEL JUEGO!
        </h1>
        <RankingBoard players={rankingPlayers} />
        <button onClick={() => navigate('/')} className="mt-12 bg-high-yellow px-8 py-4 border-4 border-ink font-bold text-2xl uppercase shadow-[6px_6px_0px_0px_var(--color-ink)]">
          Volver a Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden bg-paper">
      <NotebookSpiral />
      
      {/* Header */}
      <header className="w-full px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center border-b-2 border-ink bg-white/80 backdrop-blur-sm z-40 relative">
        <div className="flex items-center gap-2 sm:gap-6 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Pencil className="text-primary animate-bounce hidden sm:block" size={32} />
            <div className="text-2xl sm:text-3xl font-headline font-extrabold tracking-tight text-primary hidden sm:block">
              QuizSync
            </div>
            <div className="text-2xl font-headline font-extrabold tracking-tight text-primary sm:hidden">
              QS
            </div>
          </div>
          
          <div className="hidden sm:block h-8 w-0.5 bg-ink/20"></div>

          <div className="flex items-center gap-2 font-headline font-bold uppercase tracking-wider bg-white border-2 border-ink text-ink px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base">
            {view === 'question' ? (
              <>
                <Timer size={16} className={timeLeft <= 3 ? "text-red-500 animate-bounce" : ""} />
                <span className={timeLeft <= 3 ? "text-red-500" : ""}>
                  {timeLeft}s
                </span>
              </>
            ) : (
              <>
                <Trophy size={16} />
                <span>Ranking</span>
              </>
            )}
          </div>
        </div>
        
        {/* RIGHT SIDE */}
        <div className="relative items-center gap-8 mr-2 sm:mr-16 z-10 hidden md:flex">
          <div className="relative">
            <WashiTape className="-top-2 -left-4 w-12 h-6" colorClass="bg-accent-pink" />
            <div className="text-lg font-sketch font-bold uppercase border-2 border-ink px-6 py-1 rotate-1 bg-accent-yellow/30">
              RONDA EN VIVO
            </div>
            <WashiTape className="-bottom-2 -right-4 w-12 h-6" colorClass="bg-accent-mint" rotation="rotate-12" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-6 flex flex-col items-center justify-center z-10 w-full max-w-7xl relative">
        {/* Vista de Pregunta */}
        <div className={`w-full h-full overflow-y-auto pb-24 flex flex-col items-center gap-8 transition-all duration-500 absolute inset-0 pt-6 px-6 ${
          view === 'question' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}>
          {currentQuestion && (
            <>
              <QuestionCard question={currentQuestion.text} roundNumber={1} />
              <section className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mb-8">
                {currentQuestion.options.map((opt: any, index: number) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const styles = ['default', 'alt', 'alt', 'default'];
                  const isSelected = selectedAnswer === opt.id;
                  
                  return (
                    <AnswerOption
                      key={opt.id}
                      letter={letters[index] || ''}
                      text={opt.text}
                      rotation={index % 2 === 0 ? 'rotate-1' : '-rotate-1'}
                      styleType={styles[index] as any}
                      isSelected={isSelected}
                      onClick={() => handleSelectOption(opt.id)}
                    />
                  );
                })}
              </section>
              {selectedAnswer && (
                <div className="text-2xl font-display uppercase bg-high-yellow border-4 border-ink px-6 py-3 shadow-[4px_4px_0px_0px_var(--color-ink)] animate-bounce">
                  Respuesta Registrada
                </div>
              )}
            </>
          )}
        </div>

        {/* Vista de Ranking */}
        <div className={`w-full h-full overflow-y-auto pb-24 flex flex-col items-center gap-8 transition-all duration-500 absolute inset-0 pt-6 px-6 ${
          view === 'ranking' ? 'opacity-100 translate-y-0 pointer-events-auto delay-150' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}>
          <RankingBoard players={rankingPlayers} />
        </div>
      </main>

      {/* Background doodles mapping */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i}
          className="fixed pointer-events-none opacity-5 font-sketch text-3xl select-none"
          style={{
            left: `${Math.random() * 95}vw`,
            top: `${Math.random() * 95}vh`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {['★', '•', '◦', '✎', '〰', '?', '!', 'x', '+'][Math.floor(Math.random() * 9)]}
        </div>
      ))}
    </div>
  );
};
