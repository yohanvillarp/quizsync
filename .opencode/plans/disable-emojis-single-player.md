# Plan: Deshabilitar emojis con 1 jugador + Rate limiting anti-sobrecarga

## Archivos a modificar

### 1. `apps/game-engine/src/game/infrastructure/adapters/in/ws/game.gateway.ts`

**A) Añadir rate-limiting por dispositivo:**
```diff
 export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer()
   server: Server;

   private questionTimeouts: Map<string, NodeJS.Timeout> = new Map();
+  private lastEmoteTime: Map<string, number> = new Map();
+  private readonly EMOTE_COOLDOWN_MS = 200;

   constructor(private readonly gameService: GameService) {}
```

**B) Modificar `handlePlayerAction` para añadir rate-limit + skip 1 jugador:**
```diff
   @SubscribeMessage('player_action')
   handlePlayerAction(
     @MessageBody() payload: { roomId: string; actionType: string; senderId: string; targetId?: string; payload?: string }
   ) {
     if (payload.actionType === 'emote') {
+      // Rate limiting server-side (previene sobrecarga aunque el cliente ignore el cooldown)
+      const now = Date.now();
+      const lastTime = this.lastEmoteTime.get(payload.senderId) || 0;
+      if (now - lastTime < this.EMOTE_COOLDOWN_MS) return;
+      this.lastEmoteTime.set(payload.senderId, now);
+
       try {
         const room = this.gameService.getRoom(payload.roomId);
+
+        // Si solo hay un jugador en la sala, los emotes son innecesarios
+        if (room.players.size <= 1) return;
+
         const player = room.players.get(payload.senderId);
         // Si el jugador está silenciado, no propagamos la acción
         if (player && player.emotesMuted) return;
       } catch (e) {
         return;
       }
     }
     // Retransmitimos la accion a todos en la sala sin guardar estado
     this.server.to(payload.roomId).emit('player_action_received', payload);
   }
```

### 2. `apps/cliente/src/pages/lobby/ui/LobbyPage.tsx`

**C) Ocultar barra de emojis cuando solo hay 1 jugador:**
```diff
         {/* Barra de Reacciones Flotante */}
+        {players.length > 1 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white border-4 border-[var(--color-ink)] p-3 px-6 rounded-full shadow-[6px_6px_0px_0px_var(--color-ink)] z-50 animate-in slide-in-from-bottom duration-500">
           {AVAILABLE_EMOTES.map(emoji => (
             <button
               key={emoji}
               onClick={() => handleEmote(emoji)}
               className="text-3xl hover:scale-125 transition-transform active:scale-95"
             >
               {emoji}
             </button>
           ))}
         </div>
+        )}
```

---

## Resumen de cambios
- **Gateway**: Rate-limit de 200ms por `deviceId` + rechazo de emote si `players.size <= 1`
- **Cliente**: Ocultar barra flotante de emojis si `players.length <= 1`
- **Protección**: El servidor ya no confía ciegamente en el cooldown del cliente; aplica su propio límite de 200ms
