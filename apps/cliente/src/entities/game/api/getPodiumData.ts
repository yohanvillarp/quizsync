import type { PodiumPlayer } from "../model/types";

// Simulamos una latencia de red de 600ms
export async function getPodiumData(): Promise<PodiumPlayer[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "usr_1001",
          username: "FoxPro",
          avatarId: "fox",
          score: 8540,
          rank: 1,
        },
        {
          id: "usr_1002",
          username: "NightOwl",
          avatarId: "owl",
          score: 7210,
          rank: 2,
        },
        {
          id: "usr_1003",
          username: "SleepyCat",
          avatarId: "cat",
          score: 6900,
          rank: 3,
        },
      ]);
    }, 600);
  });
}
