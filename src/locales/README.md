# 🌍 Система интернационализации LocalPDF

## Обзор

LocalPDF поддерживает 5 языков:
- 🇺🇸 **English** (en) - основной язык
- 🇩🇪 **Deutsch** (de) - немецкий
- 🇫🇷 **Français** (fr) - французский  
- 🇪🇸 **Español** (es) - испанский
- 🇷🇺 **Русский** (ru) - русский

## Архитектура

### 1. Типы и интерфейсы
- `src/types/i18n.ts` - TypeScript типы для переводов
- Полная типизация всех переводов
- Поддержка интерполяции параметров

### 2. Файлы переводов  
- `src/locales/en.ts` - английский (базовый)
- `src/locales/de.ts` - немецкий
- `src/locales/fr.ts` - французский
- `src/locales/es.ts` - испанский
- `src/locales/ru.ts` - русский
- `src/locales/index.ts` - экспорт всех языков

### 3. Hooks и Context
- `src/hooks/useI18n.tsx` - React Context для i18n
- `useI18n()` - полный доступ к системе
- `useTranslation()` - только функция перевода

### 4. Компоненты
- `src/components/molecules/LanguageSwitcher.tsx` - переключатель языка
- Три варианта: default, compact, mobile

### 5. Утилиты
- `src/utils/pluralization.ts` - правила множественного числа
- Особенно важно для русского языка

## Использование

### Базовое использование

```tsx
import { useTranslation } from '../hooks/useI18n';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <h1>{t('home.hero.title')}</h1>
  );
};
```

### С параметрами

```tsx
const { t } = useTranslation();

// В файле переводов: "Hello {{name}}!"
const greeting = t('common.greeting', { name: 'John' });
```

### Работа с плюрализацией

```tsx
import { useI18n } from '../hooks/useI18n';
import { getFilesText } from '../utils/pluralization';

const FileCounter = ({ count }: { count: number }) => {
  const { currentLanguage } = useI18n();
  
  return (
    <span>{count} {getFilesText(count, currentLanguage)}</span>
  );
};
```

### Переключатель языка

```tsx
import LanguageSwitcher from '../components/molecules/LanguageSwitcher';

// Обычный вариант
<LanguageSwitcher />

// Компактный для хедера
<LanguageSwitcher variant="compact" />

// Мобильная версия
<LanguageSwitcher variant="mobile" />
```

## Структура переводов

```typescript
export interface Translations {
  common: {
    loading: string;
    error: string;
    // ...
  };
  
  header: {
    title: string;
    navigation: {
      privacy: string;
      faq: string;
    };
    // ...
  };
  
  home: {
    hero: {
      title: string;
      description: string;
    };
    // ...
  };
  
  tools: {
    merge: {
      title: string;
      description: string;
    };
    // ...
  };
}
```

## Добавление нового языка

1. Добавить код языка в `SupportedLanguage`:
```typescript
export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'ru' | 'it';
```

2. Добавить информацию о языке в `SUPPORTED_LANGUAGES`:
```typescript
{
  code: 'it',
  name: 'Italian',
  nativeName: 'Italiano',
  flag: '🇮🇹',
}
```

3. Создать файл переводов `src/locales/it.ts`

4. Экспортировать в `src/locales/index.ts`

5. Добавить правила плюрализации в `src/utils/pluralization.ts`

## Добавление нового перевода

1. Добавить ключ в интерфейс `Translations`
2. Добавить перевод во все языковые файлы
3. TypeScript покажет ошибки если что-то пропущено

## Автодетекция языка

Система автоматически:
1. Проверяет сохраненный язык в localStorage
2. Определяет язык браузера
3. Fallback на английский

## Производительность

- ✅ Легковесная собственная реализация
- ✅ Без внешних зависимостей
- ✅ TypeScript строгая типизация
- ✅ Lazy loading готов к реализации
- ✅ Сохранение выбора в localStorage

## Особенности языков

### Русский
- Сложные правила множественного числа
- 1 файл, 2-4 файла, 5+ файлов
- Реализовано в `pluralization.ts`

### Немецкий
- Длинные композитные слова
- Четкая грамматическая структура

### Французский  
- Гендерные формы
- Особые символы (é, è, ç)

### Испанский
- Инвертированные знаки вопроса
- Региональные различия учтены

## Тестирование

```bash
# Проверка типов
npm run type-check

# Запуск в режиме разработки
npm run dev

# Переключение языков в UI
```

## SEO и доступность

- `lang` атрибут HTML обновляется автоматически
- ARIA labels переведены
- Поисковые системы получают правильный язык

## Roadmap

- [ ] Lazy loading языков для уменьшения бандла
- [ ] Автоматическое детектирование RTL языков
- [ ] Интеграция с react-helmet для мета-тегов
- [ ] Дополнительные языки по запросу
- [ ] Валидация полноты переводов в CI/CD
