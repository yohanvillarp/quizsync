// Mapa de URLs apuntando a Azure Blob Storage (o CDN)
// Obtenemos la URL base desde el archivo .env de Vite
export const AZURE_BLOB_BASE_URL = import.meta.env.VITE_AZURE_BLOB_URL || 'https://quizsyncprodstorage.blob.core.windows.net/assets';

export const COMMON_SOUNDS = {
  // Sprite de audios comunes para reducir peticiones HTTP (Acierto, error, click, etc.)
  // Howler permite definir "sprites" indicando el inicio y la duración de cada sonido dentro de este archivo
  sprite: `${AZURE_BLOB_BASE_URL}/ui/audio/common-sprite.webm`,
};

// Sonidos de interfaz que no están dentro del sprite
export const UI_SOUNDS: Record<string, string> = {
  'cursor-select': `${AZURE_BLOB_BASE_URL}/ui/audio/cursor-select.mp3`,
  'hover': `${AZURE_BLOB_BASE_URL}/ui/audio/hover-tick.mp3`,
  'click': `${AZURE_BLOB_BASE_URL}/ui/audio/cursor-select.mp3`, // Reutiliza el mismo del puntero
  'confirm': `${AZURE_BLOB_BASE_URL}/ui/audio/confirm-ding.mp3`,
  'error': `${AZURE_BLOB_BASE_URL}/ui/audio/error-bonk.mp3`,
  'random-select': `${AZURE_BLOB_BASE_URL}/ui/audio/random-select.mp3`,
  'power-activation': `${AZURE_BLOB_BASE_URL}/ui/audio/power-activation.mp3`,
};

export const AVATAR_SOUNDS: Record<string, string> = {
  'fox': `${AZURE_BLOB_BASE_URL}/characters/fox/select.mp3`,
  'owl': `${AZURE_BLOB_BASE_URL}/characters/owl/select.mp3`,
  'bear': `${AZURE_BLOB_BASE_URL}/characters/bear/select.mp3`,
  'cat': `${AZURE_BLOB_BASE_URL}/characters/cat/select.mp3`,
  'rabbit': `${AZURE_BLOB_BASE_URL}/characters/rabbit/select.mp3`,
  'dog': `${AZURE_BLOB_BASE_URL}/characters/dog/select.mp3`,
  'gallo': `${AZURE_BLOB_BASE_URL}/characters/gallo/select.mp3`,
};

// También podemos precargar la música de fondo
export const BACKGROUND_MUSIC = {
  lobby: `${AZURE_BLOB_BASE_URL}/ui/audio/lobby-theme.mp3`,
  lobby_gallo: `${AZURE_BLOB_BASE_URL}/ui/audio/lobby-theme-gallo.mp3`,
  gameplay: `${AZURE_BLOB_BASE_URL}/ui/audio/gameplay-action.mp3`,
};
