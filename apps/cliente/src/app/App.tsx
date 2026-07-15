import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { HandDrawnFilter } from "@/shared/ui/HandDrawnFilter";
import { CustomCursorWidget } from "@/widgets/cursor-trail/ui/CustomCursorWidget";
import { MajesticEffect } from "@/shared/ui/MajesticEffect";
import { GlobalAlert } from "@/shared/ui/GlobalAlert/GlobalAlert";
import "./styles/App.css";

export function App() {
  return (
    <>
      <MajesticEffect />
      <CustomCursorWidget />
      <GlobalAlert />
      <div className="min-h-screen flex flex-col items-center">
        <HandDrawnFilter />
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
