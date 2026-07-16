import { createBrowserRouter } from "react-router-dom";
import { GamePage } from "@/pages/game/ui/GamePage";
import { HomePage } from "@/pages/home/ui/HomePage";
import { InventoryPage } from "@/pages/inventory/ui/InventoryPage";
import { PodiumPage } from "@/pages/podium/ui/PodiumPage";
import { CreateGamePage } from "@/pages/create-game/ui/CreateGamePage";
import { LobbyPage } from "@/pages/lobby/ui/LobbyPage";
import { AppLayout } from "./AppLayout";
import { NotFoundPage } from "@/pages/not-found/ui/NotFoundPage";
import { GlobalErrorBoundary } from "@/app/providers/GlobalErrorBoundary";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/inventory",
        element: <InventoryPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      }
    ]
  },
  {
    path: "/podium/:code",
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
