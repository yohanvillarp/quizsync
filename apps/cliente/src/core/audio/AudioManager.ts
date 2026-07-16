import { Howl } from 'howler';
import { COMMON_SOUNDS, BACKGROUND_MUSIC, getAvatarSoundUrl, getAvatarPowerSoundUrl, UI_SOUNDS } from './audioMap';
import { usePreloadStore } from '@/shared/store/usePreloadStore';

class AudioManager {
  private commonSprite: Howl | null = null;
  private bgMusic: Howl | null = null;
  private bgMusicPool: Record<string, Howl> = {};
  private uiSoundPool: Record<string, Howl> = {};
  private avatarSounds: Map<string, Howl> = new Map();
  private avatarPowerSounds: Map<string, Howl> = new Map();
  private cooldowns: Map<string, number> = new Map();

  private isMuted: boolean = false;

  constructor() {
    // Inicializar propiedades
  }

  /**
   * FASE 1: Carga Crítica (Fuentes y sonidos core)
   * Resuelve la promesa cuando lo vital está listo.
   */
  public async preloadCriticalAssetsAsync(): Promise<void> {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalToLoad = 3; // sprite + bgLobby + 1 ui sound core

      const checkDone = () => {
        loadedCount++;
        if (loadedCount >= totalToLoad) {
          usePreloadStore.getState().setCriticalLoaded(true);
          resolve();
        }
      };

      // 1. Sprite
      if (!this.commonSprite) {
        this.commonSprite = new Howl({
          src: [COMMON_SOUNDS.sprite],
          sprite: { click: [0, 500], success: [600, 1500], error: [2200, 1000], tick: [3500, 200] },
          preload: true, onload: checkDone, onloaderror: checkDone,
        });
      } else { checkDone(); }

      // 2. BG Lobby
      if (!this.bgMusicPool['lobby']) {
        this.bgMusicPool['lobby'] = new Howl({
          src: [BACKGROUND_MUSIC['lobby']], loop: true, volume: 0.5, preload: true, onload: checkDone, onloaderror: checkDone,
        });
      } else { checkDone(); }

      // 3. UI Hover core
      if (!this.uiSoundPool['hover']) {
        this.uiSoundPool['hover'] = new Howl({
          src: [UI_SOUNDS['hover']], preload: true, onload: checkDone, onloaderror: checkDone,
        });
      } else { checkDone(); }
      
      // Fallback (2s)
      setTimeout(() => {
        if (!usePreloadStore.getState().isCriticalLoaded) {
          usePreloadStore.getState().setCriticalLoaded(true);
          resolve();
        }
      }, 2000);
    });
  }

  /**
   * FASE 2: Carga en segundo plano (Resto de bgm, resto de ui, mascotas)
   */
  public preloadHeavyAssetsAsync() {
    const allAvatarIds = ['fox', 'owl', 'bear', 'cat', 'rabbit', 'dog', 'gallo', 'peacock', 'chameleon', 'bat', 'dragon'];
    
    const uiKeys = Object.keys(UI_SOUNDS).filter(k => k !== 'hover');
    const bgKeys = Object.keys(BACKGROUND_MUSIC).filter(k => k !== 'lobby');

    const totalAssets = allAvatarIds.length + uiKeys.length + bgKeys.length;
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      usePreloadStore.getState().setBackgroundProgress(Math.floor((loadedCount / totalAssets) * 100));
    };

    bgKeys.forEach(k => {
      if (!this.bgMusicPool[k]) {
        this.bgMusicPool[k] = new Howl({ src: [BACKGROUND_MUSIC[k as keyof typeof BACKGROUND_MUSIC]], loop: true, volume: 0.5, preload: true, onload: updateProgress, onloaderror: updateProgress });
      } else { updateProgress(); }
    });

    uiKeys.forEach(k => {
      if (!this.uiSoundPool[k]) {
        this.uiSoundPool[k] = new Howl({ src: [UI_SOUNDS[k]], preload: true, onload: updateProgress, onloaderror: updateProgress });
      } else { updateProgress(); }
    });

    allAvatarIds.forEach(id => {
      if (!this.avatarSounds.has(id)) {
        const h = new Howl({ src: [getAvatarSoundUrl(id)], preload: true, onload: updateProgress, onloaderror: updateProgress });
        this.avatarSounds.set(id, h);
      } else { updateProgress(); }
      
      // Precarga de los sonidos de poder
      if (!this.avatarPowerSounds.has(id)) {
        const hPower = new Howl({ 
          src: [getAvatarPowerSoundUrl(id)], 
          preload: true,
          onloaderror: () => {
            // Fallback: Si el audio específico (ej. Zorro) no existe o da 404,
            // asignamos el genérico en su lugar de forma invisible.
            if (this.uiSoundPool['power-activation']) {
              this.avatarPowerSounds.set(id, this.uiSoundPool['power-activation']);
            }
          }
        });
        this.avatarPowerSounds.set(id, hPower);
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
    } else {
      const newSound = new Howl({ src: [getAvatarSoundUrl(avatarId)] });
      newSound.play();
      this.avatarSounds.set(avatarId, newSound);
    }
  }

  /**
   * Reproduce el sonido de poder específico de un avatar
   */
  public playAvatarPowerSound(avatarId: string) {
    if (this.isMuted) return;
    const sound = this.avatarPowerSounds.get(avatarId);
    if (sound) {
      sound.play();
    } else {
      const newSound = new Howl({ 
        src: [getAvatarPowerSoundUrl(avatarId)],
        onloaderror: () => {
          if (this.uiSoundPool['power-activation']) {
            this.avatarPowerSounds.set(avatarId, this.uiSoundPool['power-activation']);
          }
        }
      });
      newSound.play();
      this.avatarPowerSounds.set(avatarId, newSound);
    }
  }

  /**
   * Reproduce un sonido de UI independiente
   */
  public playUISound(soundId: string) {
    if (this.isMuted) return;
    
    // Usar del pool si existe
    if (this.uiSoundPool[soundId]) {
      this.uiSoundPool[soundId].play();
      return;
    }

    // @ts-ignore
    const soundUrl = UI_SOUNDS[soundId];
    if (soundUrl) {
      const newSound = new Howl({ src: [soundUrl] });
      newSound.play();
      this.uiSoundPool[soundId] = newSound;
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
    
    if (this.bgMusicPool[track]) {
      this.bgMusic = this.bgMusicPool[track];
      if (!this.isMuted) this.bgMusic.play();
    } else {
      this.bgMusic = new Howl({
        src: [BACKGROUND_MUSIC[track]],
        loop: true,
        volume: 0.5,
        autoplay: !this.isMuted
      });
      this.bgMusicPool[track] = this.bgMusic;
    }
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
