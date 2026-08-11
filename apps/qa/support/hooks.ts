import { BeforeAll, AfterAll, Before, After, setWorldConstructor, World } from '@cucumber/cucumber';
import { chromium, ChromiumBrowser, Page, BrowserContext } from '@playwright/test';
import { PlayerJoinPage } from '../pages/PlayerJoinPage';
import { PlayerLobbyPage } from '../pages/PlayerLobbyPage';

let browser: ChromiumBrowser;

export class CustomWorld extends World {
  context!: BrowserContext;
  page!: Page;
  playerJoinPage!: PlayerJoinPage;
  playerLobbyPage!: PlayerLobbyPage;
}

setWorldConstructor(CustomWorld);

BeforeAll(async function () {
  browser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  await browser.close();
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
  this.playerJoinPage = new PlayerJoinPage(this.page);
  this.playerLobbyPage = new PlayerLobbyPage(this.page);
});

After(async function (this: CustomWorld) {
  await this.page.close();
  await this.context.close();
});
