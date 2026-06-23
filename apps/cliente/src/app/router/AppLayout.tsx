import { Outlet } from "react-router-dom";
import { AudioVisualizerWidget } from "@/widgets/audio-background/ui/AudioVisualizerWidget";

export function AppLayout() {
  return (
    <>
      <AudioVisualizerWidget />
      <Outlet />
    </>
  );
}
