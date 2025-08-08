# Browser Development Tools MCP Setup

## 1. Установка Playwright MCP Server

```bash
npm install -g @modelcontextprotocol/server-playwright
```

## 2. Настройка Claude Desktop

Добавьте в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "/path/to/browsers"
      }
    }
  }
}
```

## 3. Установка браузеров

```bash
npx playwright install
```

## 4. Добавление в проект

```bash
npm install --save-dev @playwright/test
npm install --save-dev playwright
```

## 5. Создание базовой конфигурации

Создайте `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 6. Примеры тестов для PDF-функций

Создайте папку `e2e/` с тестами:

### Excel to PDF тест:
```typescript
// e2e/excel-to-pdf.spec.ts
import { test, expect } from '@playwright/test';

test('Excel to PDF conversion', async ({ page }) => {
  await page.goto('/excel-to-pdf');

  // Генерируем тестовый файл
  await page.click('button:has-text("Generate Test Excel File")');

  // Загружаем файл
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./test-files/test.xlsx');

  // Ожидаем конвертации
  await expect(page.locator('text=Processing')).toBeVisible();
  await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 10000 });

  // Проверяем скачивание
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=Download PDF');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

## 7. Скрипты в package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## 8. Использование с Claude

После настройки MCP сервера, Claude сможет:
- Автоматически запускать браузерные тесты
- Делать скриншоты PDF-страниц
- Проверять функционал загрузки/скачивания
- Тестировать в разных браузерах
- Отлаживать проблемы с PDF-рендерингом

## Следующие шаги

1. Выполните установку
2. Создайте базовые тесты
3. Интегрируйте в CI/CD процесс
4. Добавьте visual regression testing
