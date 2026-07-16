import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AudioVisualizerWidget } from "@/widgets/audio-background/ui/AudioVisualizerWidget";

export function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AudioVisualizerWidget />
      {children || <Outlet />}
    </>
  );
}
