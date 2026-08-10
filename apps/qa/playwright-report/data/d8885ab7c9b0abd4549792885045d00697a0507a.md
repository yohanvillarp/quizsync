# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: player-join.spec.ts >> Player Join Flow >> debería mostrar un error si el PIN de la sala es inválido
- Location: tests\e2e\player-join.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/No se encontró la sala|error|inválido/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/No se encontró la sala|error|inválido/i')

```

```yaml
- main:
  - heading "Quiz Sync" [level=1]
  - text: VERIFICANDO CONEXIÓN...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Suite de pruebas funcionales para la experiencia del Jugador.
  5  |  * Verifica que el flujo de unión a una partida funcione correctamente.
  6  |  */
  7  | test.describe('Player Join Flow', () => {
  8  |   
  9  |   test('debería mostrar un error si el PIN de la sala es inválido', async ({ page }) => {
  10 |     // 1. Navegar a la aplicación del Cliente (usamos la URL de producción o local dependiendo del entorno)
  11 |     const clientUrl = process.env.CLIENT_URL || 'https://quizsync.nikelyh.tech';
  12 |     await page.goto(clientUrl);
  13 |     
  14 |     // 2. Esperar a que el input del PIN esté visible (buscamos por el placeholder o rol)
  15 |     const pinInput = page.getByPlaceholder(/PIN/i);
  16 |     await expect(pinInput).toBeVisible();
  17 |     
  18 |     // 3. Escribir un PIN falso
  19 |     await pinInput.fill('000000');
  20 |     
  21 |     // 4. Hacer clic en el botón de "Ingresar"
  22 |     // Asumimos que el botón dice "Ingresar" o tiene un ícono de flecha, buscaremos el botón de submit
  23 |     const joinButton = page.getByRole('button', { name: /Ingresar|Unirse/i });
  24 |     if (await joinButton.isVisible()) {
  25 |         await joinButton.click();
  26 |     } else {
  27 |         // En caso de que el botón sea un ícono de flecha (submit)
  28 |         await pinInput.press('Enter');
  29 |     }
  30 |     
  31 |     // 5. Verificar que aparezca un mensaje de error o toast
  32 |     // Esto es un ejemplo, ajusta el texto del error real que muestra tu aplicación
  33 |     const errorMessage = page.locator('text=/No se encontró la sala|error|inválido/i');
> 34 |     await expect(errorMessage).toBeVisible({ timeout: 5000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  35 |   });
  36 | 
  37 | });
  38 | 
```