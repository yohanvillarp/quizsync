import { useSessionStore, type Role } from '@/shared/store/useSessionStore';

export function useRole() {
  const role = useSessionStore((state) => state.role);
  
  return {
    role,
    isHost: role === 'host',
    isPlayer: role === 'player',
    isGuest: role === 'guest',
    hasRole: (allowedRoles: Role[]) => allowedRoles.includes(role),
  };
}
