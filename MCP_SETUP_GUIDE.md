# Browser Development Tools MCP Server Setup

Пошаговая инструкция для настройки Browser Development Tools MCP с вашим LocalPDF проектом.

## 1. Установка Playwright MCP Server

```bash
npm install -g @modelcontextprotocol/server-playwright
```

## 2. Установка браузеров

```bash
npx playwright install
```

## 3. Настройка Claude Desktop

### Найдите конфигурационный файл:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### Добавьте Playwright MCP сервер:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "/opt/homebrew/ms-playwright"
      }
    }
  }
}
```

### Если у вас уже есть другие MCP серверы:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/Users/aleksejs/Desktop"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "/opt/homebrew/ms-playwright"
      }
    }
  }
}
```

## 4. Перезапуск Claude Desktop

1. Закройте Claude Desktop полностью
2. Запустите заново
3. В новом чате проверьте что MCP подключен - Claude должен упомянуть доступные инструменты

## 5. Проверка работы

Спросите Claude:
```
"Можешь проверить главную страницу LocalPDF на localhost:5173?"
```

Claude должен уметь:
- Открывать браузер
- Переходить на ваш сайт
- Делать скриншоты
- Проверять элементы интерфейса
- Тестировать загрузку файлов

## 6. Генерация тестовых файлов

```bash
# В вашем проекте
npm run generate:fixtures
```

Это создаст тестовые PDF файлы в `e2e/fixtures/`

## 7. Запуск автоматизированных тестов

```bash
# Запуск всех E2E тестов
npm run test:e2e

# Запуск с UI интерфейсом
npm run test:e2e:ui

# Запуск в debug режиме
npm run test:e2e:debug

# Запуск всех тестов (unit + e2e)
npm run test:all
```

## 8. Возможные проблемы и решения

### Ошибка "playwright not found":
```bash
npm install -g @playwright/test
npx playwright install
```

### Ошибка с правами доступа на macOS:
```bash
sudo npm install -g @modelcontextprotocol/server-playwright
```

### Браузеры не установлены:
```bash
npx playwright install chromium firefox webkit
```

### MCP сервер не подключается:
1. Проверьте путь к конфигурационному файлу
2. Убедитесь что JSON валидный
3. Перезапустите Claude Desktop
4. Проверьте логи в консоли Claude

## 9. Дополнительные возможности

С настроенным MCP сервером Claude сможет:

### Автоматическое тестирование:
- Проверять все инструменты PDF
- Тестировать в разных браузерах
- Снимать скриншоты проблем

### Отладка:
- Проверять JavaScript ошибки
- Мониторить производительность
- Анализировать Network запросы

### Регрессионное тестирование:
- Сравнивать скриншоты
- Проверять изменения в UI
- Валидировать функциональность

## 10. Следующие шаги

После успешной настройки можно:

1. **Расширить тесты** - добавить больше сценариев
2. **Настроить CI/CD** - автоматические тесты при коммитах
3. **Visual testing** - сравнение скриншотов
4. **Performance testing** - мониторинг скорости работы

## Готово! 🎉

Теперь у вас есть полноценная среда для автоматизированного тестирования LocalPDF с интеграцией Claude.
