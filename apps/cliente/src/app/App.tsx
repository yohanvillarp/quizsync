import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { HandDrawnFilter } from "@/shared/ui/HandDrawnFilter";
import { CustomCursorWidget } from "@/widgets/cursor-trail/ui/CustomCursorWidget";
import "./styles/App.css";

export function App() {
  return (
    <>
      <CustomCursorWidget />
      <div className="min-h-screen flex flex-col items-center justify-center">
        <HandDrawnFilter />
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
