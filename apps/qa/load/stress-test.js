/**
 * stress-test.js - Prueba de carga con socket.io-client directo
 * Simula N usuarios conectandose al game-engine via Socket.IO v4.
 * Genera un reporte JSON compatible con el dashboard QA Portal.
 */
const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

// --- Configuracion ---
const TARGET = process.env.TARGET_URL || 'http://127.0.0.1:3002';
const TOTAL_USERS = parseInt(process.env.TOTAL_USERS || '1600', 10);
const RAMP_DURATION_S = 40; // Tiempo total para lanzar todos los usuarios
const OUTPUT_FILE = process.argv[2] || 'artillery-report.json';

// --- Metricas ---
let created = 0;
let completed = 0;
let failed = 0;
const errors = {};
const sessionDurations = [];

function recordError(msg) {
  const key = msg || 'unknown error';
  errors[key] = (errors[key] || 0) + 1;
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

/**
 * Simula un usuario virtual:
 * 1. Conecta al servidor
 * 2. Emite join_room
 * 3. Espera 2s
 * 4. Emite submit_answer
 * 5. Espera 2s y desconecta
 */
function runVirtualUser(userId) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    created++;

    const socket = io(TARGET, {
      transports: ['websocket'],
      timeout: 15000,
      reconnection: false,
      forceNew: true,
    });

    const failAndCleanup = (reason) => {
      failed++;
      recordError(reason);
      socket.disconnect();
      resolve();
    };

    const timeout = setTimeout(() => {
      failAndCleanup('Connection timeout (15s)');
    }, 15000);

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      failAndCleanup(`connect_error: ${err.message}`);
    });

    socket.on('connect', () => {
      clearTimeout(timeout);

      // Paso 1: join_room
      socket.emit('join_room', {
        roomId: `stress-${userId % 100}`, // Distribuir en 100 salas
        name: `StressUser${userId}`,
        avatarId: 'stress-avatar',
        deviceId: `stress-device-${userId}`,
      });

      // Paso 2: Esperar 2s, luego enviar respuesta
      setTimeout(() => {
        socket.emit('submit_answer', {
          roomId: `stress-${userId % 100}`,
          deviceId: `stress-device-${userId}`,
          answerId: 'a1',
        });

        // Paso 3: Esperar 2s mas y desconectar
        setTimeout(() => {
          const duration = Date.now() - startTime;
          sessionDurations.push(duration);
          completed++;
          socket.disconnect();
          resolve();
        }, 2000);
      }, 2000);
    });
  });
}

async function main() {
  console.log('');
  console.log('[LOAD TEST] Prueba de carga Socket.IO');
  console.log(`[CONFIG]    Target:   ${TARGET}`);
  console.log(`[CONFIG]    Usuarios: ${TOTAL_USERS}`);
  console.log(`[CONFIG]    Rampa:    ${RAMP_DURATION_S}s`);
  console.log('');

  const delayBetweenUsers = (RAMP_DURATION_S * 1000) / TOTAL_USERS;
  const promises = [];
  const startTime = Date.now();

  for (let i = 0; i < TOTAL_USERS; i++) {
    promises.push(runVirtualUser(i));
    // Esperar entre cada usuario para distribuir la carga
    if (i < TOTAL_USERS - 1) {
      await new Promise((r) => setTimeout(r, delayBetweenUsers));
    }

    // Log de progreso cada 200 usuarios
    if ((i + 1) % 200 === 0) {
      console.log(`[PROGRESS]  ${i + 1}/${TOTAL_USERS} lanzados | ${completed} completados | ${failed} fallidos`);
    }
  }

  // Esperar a que todos terminen
  await Promise.all(promises);
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // --- Generar reporte compatible con Artillery ---
  const errorCounters = {};
  for (const [key, count] of Object.entries(errors)) {
    errorCounters[`errors.${key}`] = count;
  }

  const report = {
    aggregate: {
      counters: {
        'vusers.created': created,
        'vusers.completed': completed,
        'vusers.failed': failed,
        ...errorCounters,
      },
      rates: {
        'http.request_rate': created / (parseFloat(totalTime) || 1),
      },
      summaries: {
        'vusers.session_length': {
          min: sessionDurations.length ? Math.min(...sessionDurations) : 0,
          max: sessionDurations.length ? Math.max(...sessionDurations) : 0,
          median: percentile(sessionDurations, 50),
          p95: percentile(sessionDurations, 95),
        },
      },
    },
  };

  fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(report, null, 2));

  // --- Resumen en consola ---
  const sep = '-'.repeat(50);
  console.log('');
  console.log(sep);
  console.log(`  Resumen de Prueba de Carga @ ${new Date().toISOString()}`);
  console.log(sep);
  console.log(`  Usuarios creados:     ${created}`);
  console.log(`  Usuarios completados: ${completed}`);
  console.log(`  Usuarios fallidos:    ${failed}`);
  if (sessionDurations.length > 0) {
    console.log(`  Sesion min:  ${report.aggregate.summaries['vusers.session_length'].min}ms`);
    console.log(`  Sesion max:  ${report.aggregate.summaries['vusers.session_length'].max}ms`);
    console.log(`  Sesion p95:  ${report.aggregate.summaries['vusers.session_length'].p95}ms`);
  }
  if (Object.keys(errors).length > 0) {
    console.log('  Errores:');
    for (const [key, count] of Object.entries(errors)) {
      console.log(`    - ${key}: ${count}`);
    }
  }
  console.log(`  Tiempo total: ${totalTime}s`);
  console.log(`  Reporte:      ${OUTPUT_FILE}`);
  console.log('');

  process.exit(failed === created ? 1 : 0);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
