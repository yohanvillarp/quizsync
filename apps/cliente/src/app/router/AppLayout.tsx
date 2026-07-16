import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AudioVisualizerWidget } from "@/widgets/audio-background/ui/AudioVisualizerWidget";
import { UnlockToast } from "@/features/unlock-avatars/ui/UnlockToast";
import { initUnlockEvaluator } from "@/features/unlock-avatars/model/useUnlockEvaluator";
import { useEffect } from "react";

export function AppLayout({ children }: { children?: ReactNode }) {
  useEffect(() => {
    initUnlockEvaluator();
  }, []);
  
  return (
    <>
      <AudioVisualizerWidget />
      <UnlockToast />
      {children || <Outlet />}
    </>
  );
}
