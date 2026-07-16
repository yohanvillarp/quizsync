import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { HandDrawnFilter } from "@/shared/ui/HandDrawnFilter";
import { CustomCursorWidget } from "@/widgets/cursor-trail/ui/CustomCursorWidget";
import { MajesticEffect } from "@/shared/ui/MajesticEffect";
import { GlobalAlert } from "@/shared/ui/GlobalAlert/GlobalAlert";
import "./styles/App.css";

import { Preloader } from "@/app/providers/Preloader";
import { PWAProvider } from "@/app/providers/PWAProvider";

export function App() {
  return (
    <PWAProvider>
      <Preloader>
        <MajesticEffect />
        <CustomCursorWidget />
        <GlobalAlert />
        <div className="min-h-screen flex flex-col items-center">
          <HandDrawnFilter />
          <RouterProvider router={router} />
        </div>
      </Preloader>
    </PWAProvider>
  );
}

export default App;
