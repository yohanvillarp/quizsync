import type { AvatarType } from "@/shared/store/useAvatarStore";

export interface PodiumPlayer {
  id: string;
  username: string;
  avatarId: AvatarType;
  score: number;
  rank: 1 | 2 | 3;
}
