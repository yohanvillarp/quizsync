const quotesDatabase: string[] = [
  "¡A jugar!",
  "¿Listo para el reto?",
  "¡Demuestra lo que sabes!",
  "¡A ganar!",
  "¡Que comience el juego!"
];

/**
 * Mock asíncrono que simula una petición a la base de datos para obtener
 * una frase aleatoria para la pantalla de inicio.
 */
export async function getRandomHomeQuote(): Promise<string> {
  return new Promise((resolve) => {
    // Simulamos latencia de red de 300ms
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotesDatabase.length);
      resolve(quotesDatabase[randomIndex]);
    }, 300);
  });
}
