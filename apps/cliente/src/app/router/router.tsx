import { createBrowserRouter } from "react-router-dom";
import { GamePage } from "@/pages/game/ui/GamePage";
import { HomePage } from "@/pages/home/ui/HomePage";
import { InventoryPage } from "@/pages/inventory/ui/InventoryPage";
import { PodiumPage } from "@/pages/podium/ui/PodiumPage";
import { CreateGamePage } from "@/pages/create-game/ui/CreateGamePage";
import { LobbyPage } from "@/pages/lobby/ui/LobbyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/inventory",
    element: <InventoryPage />,
  },
  {
    path: "/podium",
    element: <PodiumPage />,
  },
  {
    path: "/create",
    element: <CreateGamePage />,
  },
  {
    path: "/lobby/:code",
    element: <LobbyPage />,
  },
  {
    path: "/game/:code",
    element: <GamePage />,
  }
]);
