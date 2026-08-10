import { test, expect } from '@playwright/test';

/**
 * Suite de pruebas funcionales para la experiencia del Jugador.
 * Verifica que el flujo de unión a una partida funcione correctamente.
 */
test.describe('Player Join Flow', () => {
  
  test('debería mostrar un error si el PIN de la sala es inválido', async ({ page }) => {
    // 1. Navegar a la aplicación del Cliente (usamos la URL de producción o local dependiendo del entorno)
    const clientUrl = process.env.CLIENT_URL || 'https://quizsync.nikelyh.tech';
    await page.goto(clientUrl);
    
    // 2. Esperar a que el input del PIN esté visible (buscamos por el placeholder o rol)
    const pinInput = page.getByPlaceholder(/PIN/i);
    await expect(pinInput).toBeVisible();
    
    // 3. Escribir un PIN falso
    await pinInput.fill('000000');
    
    // 4. Hacer clic en el botón de "Ingresar"
    // Asumimos que el botón dice "Ingresar" o tiene un ícono de flecha, buscaremos el botón de submit
    const joinButton = page.getByRole('button', { name: /Ingresar|Unirse/i });
    if (await joinButton.isVisible()) {
        await joinButton.click();
    } else {
        // En caso de que el botón sea un ícono de flecha (submit)
        await pinInput.press('Enter');
    }
    
    // 5. Verificar que aparezca un mensaje de error o toast
    const errorMessage = page.locator('text=/La sala no existe o ha sido cerrada/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

});
