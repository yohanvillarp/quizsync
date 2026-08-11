import { Page, Locator } from '@playwright/test';

export class PlayerJoinPage {
  readonly page: Page;
  readonly pinInput: Locator;
  readonly nameInput: Locator;
  readonly joinButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pinInput = page.getByPlaceholder('PIN de la sala');
    this.nameInput = page.getByPlaceholder('Tu nombre');
    this.joinButton = page.getByRole('button', { name: 'Unirse' });
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
    await this.enterName(name);
    await this.submit();
  }
}
