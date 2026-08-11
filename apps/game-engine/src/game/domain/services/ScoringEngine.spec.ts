import { ScoringEngine } from './ScoringEngine';

describe('ScoringEngine', () => {
  describe('calculateSpeedPoints', () => {
    it('debería retornar 0 puntos si la respuesta es incorrecta, sin importar el tiempo', () => {
      const points = ScoringEngine.calculateSpeedPoints(
        false, // isCorrect
        10000, // timeLimitMs
        0,     // timeTakenMs (respondió de inmediato)
        1000,  // maxPoints
      );

      expect(points).toBe(0);
    });

    it('debería retornar el 100% de los puntos si responde correctamente sin tiempo transcurrido', () => {
      const points = ScoringEngine.calculateSpeedPoints(
        true,
        10000,
        0, // no tardó nada, todo el tiempo quedó disponible
        1000,
      );

      expect(points).toBe(1000);
    });

    it('debería retornar solo el 50% garantizado si responde correctamente justo al límite del tiempo', () => {
      const points = ScoringEngine.calculateSpeedPoints(
        true,
        10000,
        10000, // tardó exactamente todo el tiempo disponible
        1000,
      );

      expect(points).toBe(500);
    });

    it('debería retornar aproximadamente el 75% de los puntos si responde a la mitad del tiempo', () => {
      const points = ScoringEngine.calculateSpeedPoints(
        true,
        10000,
        5000, // tardó la mitad del tiempo disponible
        1000,
      );

      // 500 (base) + 500 * 0.5 (velocidad) = 750
      expect(points).toBe(750);
    });

    it('debería limitar (clamp) el tiempo tomado al límite si se recibe un valor mayor al permitido', () => {
      const pointsConTiempoExcedido = ScoringEngine.calculateSpeedPoints(
        true,
        10000,
        15000, // tiempo tomado mayor al límite (dato corrupto o manipulado)
        1000,
      );

      const pointsEnElLimite = ScoringEngine.calculateSpeedPoints(
        true,
        10000,
        10000, // tiempo exactamente en el límite
        1000,
      );

      // Ambos casos deben dar el mismo resultado, confirmando que
      // el tiempo excedido se "clampa" correctamente al límite.
      expect(pointsConTiempoExcedido).toBe(pointsEnElLimite);
      expect(pointsConTiempoExcedido).toBe(500);
    });

    it('debería retornar 0 puntos si maxPoints es 0, incluso con respuesta correcta', () => {
      const points = ScoringEngine.calculateSpeedPoints(
        true,
        10000,
        0,
        0, // maxPoints en 0
      );

      expect(points).toBe(0);
    });
  });
});