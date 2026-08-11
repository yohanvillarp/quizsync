import { Page, Locator } from '@playwright/test';

export class PlayerLobbyPage {
  readonly page: Page;
  readonly waitingMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitingMessage = page.getByText(/Esperando al anfitrión/i);
  }

  async isWaitingMessageVisible(): Promise<boolean> {
    return await this.waitingMessage.isVisible();
  }
}
