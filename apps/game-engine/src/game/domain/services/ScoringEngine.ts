export class ScoringEngine {
  /**
   * Calcula los puntos base de una respuesta basándose en la velocidad.
   * Sigue el estilo de puntuación clásico (Propuesta 1): 
   * 50% garantizado si es correcta + hasta 50% por velocidad.
   * 
   * @param isCorrect Si la respuesta seleccionada es correcta
   * @param timeLimitMs Tiempo total disponible para la pregunta en ms
   * @param timeTakenMs Tiempo que tardó el jugador en responder en ms
   * @param maxPoints Puntos máximos posibles para la pregunta (asignados en Studio)
   * @returns Los puntos calculados
   */
  static calculateSpeedPoints(
    isCorrect: boolean,
    timeLimitMs: number,
    timeTakenMs: number,
    maxPoints: number
  ): number {
    if (!isCorrect) return 0;
    
    // Aseguramos que los valores sean válidos
    const validMaxPoints = Math.max(0, maxPoints);
    const validTimeTaken = Math.min(Math.max(0, timeTakenMs), timeLimitMs);
    const timeLeft = timeLimitMs - validTimeTaken;
    
    const timeFactor = timeLeft / timeLimitMs; // De 0 a 1
    
    // Mitad asegurada, mitad por velocidad
    const basePoints = validMaxPoints / 2;
    const speedPoints = (validMaxPoints / 2) * timeFactor;
    
    return Math.floor(basePoints + speedPoints);
  }
}
