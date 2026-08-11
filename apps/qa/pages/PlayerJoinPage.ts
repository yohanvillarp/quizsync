import { Page, Locator } from '@playwright/test';

export class PlayerJoinPage {
  readonly page: Page;
  readonly pinInput: Locator;
  readonly nameInput: Locator;
  readonly joinButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pinInput = page.getByPlaceholder('PIN DE JUEGO');
    this.nameInput = page.getByPlaceholder('Tu Nickname');
    this.joinButton = page.getByRole('button', { name: 'UNIRSE' });
  }

  async navigate() {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await this.page.goto(baseUrl);
  }

  async enterPin(pin: string) {
    await this.pinInput.fill(pin);
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  async submit() {
    await this.joinButton.click();
  }

  async joinGame(pin: string, name: string) {
    await this.enterPin(pin);
    await this.submit();
    await this.enterName(name);
    await this.page.getByRole('button', { name: '¡A Jugar!' }).click();
  }
}
