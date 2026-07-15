import { Howl } from 'howler';
import { COMMON_SOUNDS, BACKGROUND_MUSIC, AVATAR_SOUNDS, UI_SOUNDS } from './audioMap';

class AudioManager {
  private commonSprite: Howl | null = null;
  private bgMusic: Howl | null = null;
  private avatarSounds: Map<string, Howl> = new Map();
  private cooldowns: Map<string, number> = new Map();

  private isMuted: boolean = false;

  constructor() {
    // Inicializar propiedades
  }

  /**
   * Pre-carga los sonidos comunes (UI, aciertos, errores) como un Sprite.
   * Esto debe llamarse cuando la app inicializa.
   */
  public initCommonSounds() {
    if (this.commonSprite) return;

    this.commonSprite = new Howl({
      src: [COMMON_SOUNDS.sprite],
      sprite: {
        click: [0, 500],          
        success: [600, 1500],     
        error: [2200, 1000],      
        tick: [3500, 200],        
      },
      preload: true,
      // No pasamos this.masterVolume porque Howler.volume() ya lo aplica globalmente
    });
  }

  /**
   * Pre-carga los sonidos específicos de los avatares que están en la sala actual.
   * Evita cargar todos los sonidos de la base de datos, solo los necesarios.
   */
  public preloadAvatarSounds(avatarIds: string[]) {
    avatarIds.forEach((id) => {
      if (!this.avatarSounds.has(id) && AVATAR_SOUNDS[id]) {
        const howl = new Howl({
          src: [AVATAR_SOUNDS[id]],
          preload: true,
        });
        this.avatarSounds.set(id, howl);
      }
    });
  }

  /**
   * Reproduce un sonido del sprite común
   */
  public playCommon(soundId: 'click' | 'success' | 'error' | 'tick') {
    if (this.isMuted || !this.commonSprite) return;
    this.commonSprite.play(soundId);
  }

  /**
   * Reproduce el sonido de un avatar específico
   */
  public playAvatarSound(avatarId: string) {
    if (this.isMuted) return;
    const sound = this.avatarSounds.get(avatarId);
    if (sound) {
      sound.play();
    } else if (AVATAR_SOUNDS[avatarId]) {
      // Si no estaba precargado por alguna razón, cargarlo on-the-fly (puede tener lag la primera vez)
      const newSound = new Howl({ src: [AVATAR_SOUNDS[avatarId]] });
      newSound.play();
      this.avatarSounds.set(avatarId, newSound);
    }
  }

  /**
   * Reproduce un sonido de UI independiente (fuera del sprite común)
   */
  public playUISound(soundId: string) {
    if (this.isMuted) return;
    // @ts-ignore
    const soundUrl = UI_SOUNDS[soundId];
    if (soundUrl) {
      const newSound = new Howl({ src: [soundUrl] });
      newSound.play();
    }
  }

  /**
   * Reproduce un sonido de UI con sistema "anti-cacofonía" (Debouncing)
   */
  public playUISoundWithCooldown(soundId: string, cooldownMs: number = 1000) {
    const now = Date.now();
    const lastPlayed = this.cooldowns.get(soundId) || 0;
    
    // Si todavía estamos en cooldown, ignoramos silenciosamente para evitar empalmes ruidosos
    if (now - lastPlayed < cooldownMs) {
      return;
    }
    
    this.cooldowns.set(soundId, now);
    this.playUISound(soundId);
  }

  /**
   * Manejo de la música de fondo
   */
  private currentTrack: 'lobby' | 'lobby_gallo' | 'gameplay' | 'podium' | null = null;

  public playMusic(track: 'lobby' | 'lobby_gallo' | 'gameplay' | 'podium') {
    if (this.currentTrack === track && this.bgMusic && this.bgMusic.playing()) {
      return; // Ya está sonando la pista correcta
    }

    if (this.bgMusic) {
      this.bgMusic.stop();
    }

    this.currentTrack = track;
    this.bgMusic = new Howl({
      src: [BACKGROUND_MUSIC[track]],
      loop: true,
      volume: 0.5, // La música de fondo siempre será la mitad de fuerte que los efectos (en relación al volumen maestro)
      autoplay: !this.isMuted
    });
  }

  public stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }

  // --- Controles Globales ---

  public setMute(mute: boolean) {
    this.isMuted = mute;
    Howler.mute(mute); // Mutea todo a nivel global en howler
  }

  public setVolume(volume: number) {
    Howler.volume(volume);
  }
}

// Exportamos un singleton para que toda la app use la misma instancia
export const audioManager = new AudioManager();
