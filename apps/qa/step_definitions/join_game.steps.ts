import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/hooks';

// Setup state
Given('que el anfitrión ha creado una sala', async function (this: CustomWorld) {
  // Hacemos una petición real al Game Engine para crear la sala
  const engineUrl = process.env.ENGINE_URL || 'http://127.0.0.1:3002';
  
  const response = await fetch(`${engineUrl}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: "random",
      quizId: "random",
      gameModeId: "NORMAL",
      visibility: "PRIVATE",
      hostId: "bdd-test-host",
      maxPlayers: 10,
      questionCount: 10,
      force: true
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create room: ${response.statusText}`);
  }

  const data = await response.json();
  this.currentPin = data.roomId;
  console.log(`Sala REAL creada con PIN: ${this.currentPin}`);

  await this.playerJoinPage.navigate();
});

// Actions
When('el jugador ingresa el PIN de la sala y su nombre {string}', async function (this: CustomWorld, name: string) {
  if (!this.currentPin) throw new Error("No hay un PIN guardado en el contexto");
  await this.playerJoinPage.joinGame(this.currentPin, name);
});

// Assertions
Then('el jugador debe ver la pantalla de {string}', async function (this: CustomWorld, message: string) {
  // Simulamos que revisa que estamos en el lobby
  await this.page?.screenshot({ path: 'test-screenshot.png' });
  const isVisible = await this.playerLobbyPage.isWaitingMessageVisible();
  
  // Verificamos que realmente se ve el mensaje de espera, indicando que logramos entrar al lobby
  expect(isVisible).toBeTruthy(); 
  console.log(`Verificación de visibilidad de "${message}": ${isVisible}`);
});
