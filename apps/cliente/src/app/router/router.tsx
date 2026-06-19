import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage";
import { InventoryPage } from "@/pages/inventory/ui/InventoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/inventory",
    element: <InventoryPage />,
  }
]);
