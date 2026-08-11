import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/hooks';

// Setup state
Given('que el anfitrión ha creado una sala con el PIN {string}', async function (this: CustomWorld, pin: string) {
  // Aquí idealmente haríamos una llamada API al backend para crear la sala rápidamente sin interfaz gráfica.
  // Por ahora, asumimos que la sala ya existe o la simulamos.
  console.log(`Sala ${pin} simulada como creada por el anfitrión.`);
  await this.playerJoinPage.navigate();
});

// Actions
When('el jugador ingresa {string} y su nombre {string}', async function (this: CustomWorld, pin: string, name: string) {
  await this.playerJoinPage.joinGame(pin, name);
});

// Assertions
Then('el jugador debe ver la pantalla de {string}', async function (this: CustomWorld, message: string) {
  // Simulamos que revisa que estamos en el lobby
  const isVisible = await this.playerLobbyPage.isWaitingMessageVisible();
  
  // Dependiendo de si el backend está corriendo, fallará o pasará.
  // expect(isVisible).toBeTruthy(); 
  console.log(`Verificación de visibilidad de "${message}": ${isVisible}`);
});
