import { PrismaClient } from 'prisma-client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Insertar Frases Aleatorias (Quotes)
  const quotes = [
    "¡A jugar!",
    "¿Listo para el reto?",
    "¡Demuestra lo que sabes!",
    "¡A ganar!",
    "¡Que comience el juego!"
  ];

  for (const text of quotes) {
    await prisma.quote.create({
      data: { text }
    });
  }

  // 2. Insertar SuperPoderes
  const superPowers = [
    {
      id: 'thief',
      name: 'Ladrón Astuto',
      description: 'Roba el 50% de los puntos ganados en una ronda a un oponente que elijas (solo funciona si él acierta y tú fallas).',
      effectType: 'STEAL_POINTS'
    },
    {
      id: 'fifty_fifty',
      name: 'Visión Clara',
      description: 'Elimina la mitad de las opciones incorrectas de la pantalla (50/50). Solo 1 uso por partida.',
      effectType: 'REMOVE_OPTION'
    },
    {
      id: 'nine_lives',
      name: '7 Vidas',
      description: 'Te permite fallar una vez. Si aciertas en tu segundo intento, obtienes la mitad de los puntos. Solo 1 uso por partida.',
      effectType: 'SECOND_CHANCE'
    },
    {
      id: 'brute_force',
      name: 'Fuerza Bruta',
      description: 'Duplica tus puntos en esta ronda si aciertas, pero pierdes el doble de puntos si te equivocas.',
      effectType: 'DOUBLE_OR_NOTHING'
    },
    {
      id: 'speed_boost',
      name: 'Liebre',
      description: 'Si respondes correctamente en los primeros 3 segundos de la ronda, obtienes un multiplicador de x1.5 puntos.',
      effectType: 'SPEED_BOOST'
    },
    {
      id: 'loyalty',
      name: 'Lealtad',
      description: 'Comparte el 50% de tus puntos ganados en esta ronda con un compañero que elijas (incluso si él falló).',
      effectType: 'SHARE_POINTS'
    }
  ];

  for (const power of superPowers) {
    await prisma.superPower.upsert({
      where: { id: power.id },
      update: {},
      create: power,
    });
  }

  // 3. Insertar Avatares
  const avatars = [
    {
      id: 'fox',
      name: 'Zorro',
      phrase: '¡A la victoria con astucia!',
      superPowerId: 'thief'
    },
    {
      id: 'owl',
      name: 'Búho',
      phrase: 'La sabiduría es nuestra mejor arma.',
      superPowerId: 'fifty_fifty'
    },
    {
      id: 'cat',
      name: 'Gato',
      phrase: 'Curiosidad, y 9 vidas para fallar.',
      superPowerId: 'nine_lives'
    },
    {
      id: 'bear',
      name: 'Oso',
      phrase: '¡Fuerza y concentración para cada pregunta!',
      superPowerId: 'brute_force'
    },
    {
      id: 'rabbit',
      name: 'Conejo',
      phrase: '¡Velocidad máxima en las respuestas!',
      superPowerId: 'speed_boost'
    },
    {
      id: 'dog',
      name: 'Perro',
      phrase: '¡El mejor amigo de tus notas!',
      superPowerId: 'loyalty'
    }
  ];

  for (const avatar of avatars) {
    await prisma.avatar.upsert({
      where: { id: avatar.id },
      update: avatar,
      create: avatar,
    });
  }

  // 4. Insertar Categorías
  const categories = [
    { id: 'GENERAL_CULTURE', name: 'Cultura General', description: 'Preguntas sobre historia, geografía y arte.' },
    { id: 'TECHNOLOGY', name: 'Tecnología', description: 'Preguntas sobre programación, hardware y software.' },
    { id: 'DISTRIBUTED_SYSTEMS', name: 'Sistemas Distribuidos', description: 'Conceptos avanzados de arquitectura de software.' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }

  // 5. Insertar un Quiz de Prueba
  // Para que esto funcione sin fallar por las foreign keys, necesitamos un User dummy
  const dummyUser = await prisma.user.upsert({
    where: { email: 'admin@quizsync.com' },
    update: {},
    create: {
      email: 'admin@quizsync.com',
      name: 'Admin',
      avatarId: 'owl'
    }
  });

  const sampleQuiz = await prisma.quiz.create({
    data: {
      title: 'Historia de la Computación',
      description: 'Demuestra tus conocimientos sobre los orígenes de la informática.',
      categoryId: 'TECHNOLOGY',
      authorId: dummyUser.id,
      questions: {
        create: [
          {
            text: '¿Quién es considerado el padre de la computación?',
            timeLimit: 15,
            maxPoints: 1000,
            options: {
              create: [
                { text: 'Alan Turing', isCorrect: true },
                { text: 'Bill Gates', isCorrect: false },
                { text: 'Steve Jobs', isCorrect: false },
                { text: 'Mark Zuckerberg', isCorrect: false }
              ]
            }
          },
          {
            text: '¿En qué año se lanzó el primer iPhone?',
            timeLimit: 10, // Menos tiempo porque es más fácil
            maxPoints: 800,
            options: {
              create: [
                { text: '2005', isCorrect: false },
                { text: '2007', isCorrect: true },
                { text: '2008', isCorrect: false },
                { text: '2010', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
