# Known Issues - ClientPDF Pro

## 🐛 Активные проблемы

### Critical: PdfToImageTool component not exported
**Дата обнаружения**: 2025-07-01
**Серьезность**: critical
**Компонент**: PdfToImageTool.tsx
**Воспроизведение**: 
1. Запустить приложение
2. Открыть консоль браузера
3. Увидеть ошибку: "The requested module '/src/components/organisms/PdfToImageTool.tsx' does not provide an export named 'PdfToImageTool'"

**Ожидаемое поведение**: Компонент должен экспортироваться и загружаться корректно
**Фактическое поведение**: Файл содержит только фрагмент кода ProgressBar вместо полного компонента
**Workaround**: Временно недоступен PDF to Image tool
**Статус**: in-progress

### Minor: Vite WebSocket connection warnings
**Дата обнаружения**: 2025-07-01
**Серьезность**: low
**Компонент**: Vite dev server
**Воспроизведение**: Запустить dev server и открыть консоль
**Ожидаемое поведение**: Нет предупреждений о WebSocket
**Фактическое поведение**: WebSocket connection failed warnings
**Workaround**: Можно игнорировать, не влияет на функциональность
**Статус**: open

## ✅ Решенные проблемы

*Пусто*

## 📋 Шаблон для новых проблем

```markdown
### [Короткое описание]
**Дата обнаружения**: YYYY-MM-DD
**Серьезность**: critical/high/medium/low
**Компонент**: название компонента/сервиса
**Воспроизведение**: шаги для воспроизведения
**Ожидаемое поведение**: что должно происходить
**Фактическое поведение**: что происходит
**Workaround**: временное решение (если есть)
**Статус**: open/in-progress/resolved
```
