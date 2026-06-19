import { HandDrawnFilter } from "@/shared/ui/HandDrawnFilter";
import { Logo } from "@/shared/ui/Logo";
import "./styles/App.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <HandDrawnFilter />
      <Logo />
    </div>
  );
}

export default App;
