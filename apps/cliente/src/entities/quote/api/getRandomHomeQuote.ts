const quotesDatabase: string[] = [
  "Sincronizando conocimientos a la velocidad de la luz...",
  "Conecta, compite y sincroniza tus neuronas en tiempo real.",
  "Un cuestionario al día mantiene el aburrimiento en la bahía.",
  "Miles de preguntas te esperan. Cero excusas.",
  "Tu cerebro necesita calentamiento antes de presionar 'Jugar'."
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
