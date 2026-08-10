/**
 * verify-connection.js - Diagnostico de conectividad Socket.IO
 * Verifica que el game-engine acepta conexiones antes de lanzar la prueba de carga.
 */
const { io } = require('socket.io-client');

const TARGET = process.env.TARGET_URL || 'http://127.0.0.1:3002';
const TIMEOUT_MS = 10000;

console.log(`[VERIFY] Verificando conexion Socket.IO a ${TARGET}...`);

const socket = io(TARGET, {
  transports: ['websocket'],
  timeout: TIMEOUT_MS,
  reconnection: false,
});

const timer = setTimeout(() => {
  console.error(`[FAIL] TIMEOUT: No se pudo conectar en ${TIMEOUT_MS / 1000}s`);
  socket.disconnect();
  process.exit(1);
}, TIMEOUT_MS);

socket.on('connect', () => {
  console.log(`[OK] Conexion establecida (socket id: ${socket.id})`);
  
  // Intentar emitir un join_room para verificar que el gateway responde
  socket.emit('join_room', {
    roomId: 'test-verify',
    name: 'VerifyBot',
    avatarId: 'test-avatar',
    deviceId: 'verify-device-001',
  }, (response) => {
    clearTimeout(timer);
    if (response) {
      console.log(`[OK] Gateway responde:`, JSON.stringify(response));
    } else {
      console.log(`[WARN] Gateway conecto pero no envio respuesta (puede ser normal)`);
    }
    socket.disconnect();
    process.exit(0);
  });

  // Si no hay callback en 5s, igual es exito (la conexion funciono)
  setTimeout(() => {
    clearTimeout(timer);
    console.log(`[OK] Conexion establecida. Gateway no usa callback para join_room.`);
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('connect_error', (err) => {
  clearTimeout(timer);
  console.error(`[FAIL] Error de conexion: ${err.message}`);
  console.error(`       Tipo: ${err.type || 'desconocido'}`);
  console.error(`       Descripcion: ${err.description || 'ninguna'}`);
  socket.disconnect();
  process.exit(1);
});
