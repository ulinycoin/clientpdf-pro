# Hybrid Architecture - FAQ & Technical Decisions
**Version:** 1.1
**Date:** October 17, 2025
**Status:** 🟢 Approved Technical Decisions

---

## 1. Middleware/Redirect Logic & State Transfer

### Q1.1: Как передать state из лендинга в SPA при прямом заходе на /app#merge?

**Проблема:**
```
User: localpdf.online/merge-pdf → Click CTA → app.localpdf.online/#merge
                                                    ↑
                                            Нет context, нет state
```

**Решение: URL Parameters + Hash Routing**

```typescript
// src/components/molecules/BetaCTA.tsx (Landing page)

export const BetaCTA: React.FC<BetaCTAProps> = ({ tool }) => {
  const handleClick = () => {
    const params = new URLSearchParams({
      // Transfer context
      source: 'landing',
      ref: window.location.pathname,
      lang: getCurrentLanguage(), // ru, de, en, etc.

      // UTM preservation
      ...(window.location.search && {
        utm: window.location.search
      }),

      // First-time user flag
      first_visit: !hasVisitedBefore() ? '1' : '0'
    });

    // Redirect with full context
    const toolHash = tool.replace('-pdf', '');
    window.location.href = `https://app.localpdf.online/#${toolHash}?${params}`;
  };

  return <button onClick={handleClick}>🚀 Launch Tool</button>;
};
```

**SPA парсит параметры при загрузке:**

```typescript
// app-spa/src/hooks/useHashRouter.tsx

export const useHashRouter = () => {
  const [context, setContext] = useState<URLContext | null>(null);

  useEffect(() => {
    const parseHashWithParams = () => {
      const hash = window.location.hash.slice(1); // Remove #
      const [toolHash, queryString] = hash.split('?');

      // Parse tool
      const tool = TOOL_HASH_MAP[toolHash];

      // Parse URL parameters
      if (queryString) {
        const params = new URLSearchParams(queryString);
        setContext({
          source: params.get('source') || 'direct',
          referrer: params.get('ref') || null,
          language: params.get('lang') as Language || 'en',
          utmParams: params.get('utm') || null,
          isFirstVisit: params.get('first_visit') === '1'
        });
      }

      setCurrentTool(tool);
    };

    parseHashWithParams();
  }, []);

  return { currentTool, context };
};
```

**Fallback для пустого экрана:**

```typescript
// app-spa/src/App.tsx

export default function App() {
  const { currentTool, context } = useHashRouter();

  // No tool selected → show welcome screen
  if (!currentTool) {
    return <WelcomeScreen context={context} />;
  }

  return <ToolCanvas tool={currentTool} context={context} />;
}

// Welcome screen with tool selector
const WelcomeScreen = ({ context }) => {
  const { t } = useI18n();

  return (
    <div className="welcome-screen">
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.subtitle')}</p>

      {/* Show popular tools */}
      <div className="popular-tools">
        {POPULAR_TOOLS.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => navigateToTool(tool.id)}
          />
        ))}
      </div>

      {/* Context-aware message */}
      {context?.isFirstVisit && (
        <div className="first-visit-banner">
          <p>{t('welcome.firstTimeBanner')}</p>
        </div>
      )}
    </div>
  );
};
```

### Q1.2: Стратегия для старых bookmarks/прямых заходов на /merge-pdf

**Решение: Smart Redirect на основе cookies + middleware**

```typescript
// middleware.ts (Vercel Edge Functions)

export function middleware(request: Request) {
  const url = new URL(request.url);
  const isBot = isBotUserAgent(request.headers.get('user-agent'));
  const cookies = parseCookies(request.headers.get('cookie'));

  // Bot detection → always show landing
  if (isBot) {
    return next(); // Show SEO landing page
  }

  // Tool page path (e.g., /merge-pdf, /ru/split-pdf)
  const isToolPage = /^\/(ru|de|fr|es)?\/?[a-z-]+\-pdf$/.test(url.pathname);

  if (isToolPage) {
    const userPreference = cookies.get('spa_preference'); // 'landing' | 'app'
    const hasVisited = cookies.get('visited_spa') === 'true';
    const visitCount = parseInt(cookies.get('visit_count') || '0', 10);

    // Strategy decision tree:

    // 1. User explicitly prefers landing pages
    if (userPreference === 'landing') {
      return next(); // Show landing
    }

    // 2. User explicitly prefers SPA
    if (userPreference === 'app') {
      return redirectToSPA(url, request);
    }

    // 3. Returning user (visited SPA before)
    if (hasVisited && visitCount > 2) {
      return redirectToSPA(url, request);
    }

    // 4. New user or infrequent visitor → show landing
    return next();
  }

  return next();
}

function redirectToSPA(url: URL, request: Request): Response {
  // Extract tool and language from path
  const pathParts = url.pathname.split('/').filter(Boolean);
  const lang = ['ru', 'de', 'fr', 'es'].includes(pathParts[0])
    ? pathParts[0]
    : 'en';
  const toolSlug = pathParts[pathParts.length - 1]; // e.g., "merge-pdf"
  const toolHash = toolSlug.replace('-pdf', ''); // "merge"

  // Build SPA URL with context
  const spaUrl = new URL(`https://app.localpdf.online/#${toolHash}`);
  const params = new URLSearchParams({
    source: 'auto_redirect',
    ref: url.pathname,
    lang,
    utm: url.search.slice(1) // Preserve UTM params
  });
  spaUrl.hash += `?${params}`;

  // Redirect with context preservation
  const response = Response.redirect(spaUrl.toString(), 302);

  // Update visit tracking
  response.headers.set('Set-Cookie', [
    'visited_spa=true; Max-Age=31536000; Path=/; SameSite=Lax',
    `visit_count=${parseInt(request.cookies.visit_count || '0') + 1}; Max-Age=31536000; Path=/`
  ].join(', '));

  return response;
}
```

**User preference controls in SPA:**

```typescript
// app-spa/src/components/layout/Header.tsx

const PreferenceToggle = () => {
  const [preference, setPreference] = useLocalStorage('spa_preference', null);

  const handleToggle = (pref: 'landing' | 'app') => {
    setPreference(pref);

    // Set cookie for middleware
    document.cookie = `spa_preference=${pref}; Max-Age=31536000; Path=/; SameSite=Lax`;

    toast.success(`Preference saved: ${pref === 'app' ? 'Modern UI' : 'Classic View'}`);
  };

  return (
    <div className="preference-toggle">
      <button onClick={() => handleToggle('landing')}>
        Classic View
      </button>
      <button onClick={() => handleToggle('app')}>
        Modern UI (Default)
      </button>
    </div>
  );
};
```

---

## 2. Языки и Deep Linking

### Q2.1: Fallback для локализованных SPA-сценариев

**Решение: Auto-detect language from referrer + localStorage**

```typescript
// app-spa/src/hooks/useI18n.tsx

export const useI18n = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Priority 1: URL parameter (from redirect)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const urlLang = urlParams.get('lang') as Language;
    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      return urlLang;
    }

    // Priority 2: localStorage (previous session)
    const storedLang = localStorage.getItem('preferred_language') as Language;
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }

    // Priority 3: Browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }

    // Priority 4: Referrer (if coming from localized landing)
    const referrer = document.referrer;
    if (referrer) {
      const match = referrer.match(/localpdf\.online\/(ru|de|fr|es)\//);
      if (match && match[1]) {
        return match[1] as Language;
      }
    }

    // Fallback: English
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);

    // Track language change
    analytics.track('language_changed', {
      from: language,
      to: lang
    });
  };

  return { language, setLanguage, t: getTranslation(language) };
};
```

**Landing page передаёт язык:**

```typescript
// src/components/molecules/BetaCTA.tsx

const handleClick = () => {
  const currentLang = getCurrentLanguageFromPath(); // Extract from /ru/merge-pdf
  const params = new URLSearchParams({
    lang: currentLang, // ← This ensures language continuity
    source: 'landing',
    ref: window.location.pathname
  });

  const toolHash = tool.replace('-pdf', '');
  window.location.href = `https://app.localpdf.online/#${toolHash}?${params}`;
};
```

### Q2.2: Сохранение user-язык в localStorage/cookie

**Решение: Hybrid approach (localStorage + cookie)**

```typescript
// app-spa/src/utils/languageManager.ts

export class LanguageManager {
  private static STORAGE_KEY = 'preferred_language';
  private static COOKIE_NAME = 'user_language';

  // Set language in both localStorage and cookie
  static setLanguage(lang: Language): void {
    // localStorage (for SPA)
    localStorage.setItem(this.STORAGE_KEY, lang);

    // Cookie (for middleware/server-side detection)
    document.cookie = `${this.COOKIE_NAME}=${lang}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;

    // Update HTML lang attribute (for SEO/accessibility)
    document.documentElement.lang = lang;
  }

  // Get language with priority
  static getLanguage(): Language {
    // Priority 1: URL param
    const urlLang = this.getLanguageFromURL();
    if (urlLang) return urlLang;

    // Priority 2: localStorage
    const storedLang = localStorage.getItem(this.STORAGE_KEY) as Language;
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }

    // Priority 3: Cookie (if user came from main site)
    const cookieLang = this.getLanguageFromCookie();
    if (cookieLang) return cookieLang;

    // Priority 4: Browser
    return this.getBrowserLanguage();
  }

  private static getLanguageFromURL(): Language | null {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const lang = params.get('lang') as Language;
    return lang && SUPPORTED_LANGUAGES.includes(lang) ? lang : null;
  }

  private static getLanguageFromCookie(): Language | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.COOKIE_NAME && SUPPORTED_LANGUAGES.includes(value as Language)) {
        return value as Language;
      }
    }
    return null;
  }

  private static getBrowserLanguage(): Language {
    const browserLang = navigator.language.split('-')[0] as Language;
    return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
  }
}
```

**Особенно полезно для RU/DE пользователей с рекламных кампаний:**

```typescript
// app-spa/src/App.tsx

useEffect(() => {
  // Detect ad campaign language
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const utmContent = urlParams.get('utm_content');

  // Campaign-specific language detection
  if (utmContent?.includes('ru_campaign')) {
    LanguageManager.setLanguage('ru');
  } else if (utmContent?.includes('de_campaign')) {
    LanguageManager.setLanguage('de');
  }
}, []);
```

### Q2.3: Deep linking с UTM-метками

**Решение: UTM preservation через весь flow**

```typescript
// app-spa/src/utils/utmManager.ts

export class UTMManager {
  private static STORAGE_KEY = 'utm_params';
  private static SESSION_KEY = 'session_utm';

  // Parse and store UTM parameters
  static captureUTM(): void {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const utmParams: Record<string, string> = {};

    // Extract all UTM parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });

    // Store if found
    if (Object.keys(utmParams).length > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(utmParams));
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(utmParams));
    }
  }

  // Get current UTM parameters
  static getUTM(): Record<string, string> {
    // Priority 1: Session (current visit)
    const sessionUTM = sessionStorage.getItem(this.SESSION_KEY);
    if (sessionUTM) {
      return JSON.parse(sessionUTM);
    }

    // Priority 2: localStorage (first visit)
    const storedUTM = localStorage.getItem(this.STORAGE_KEY);
    if (storedUTM) {
      return JSON.parse(storedUTM);
    }

    return {};
  }

  // Append UTM to any URL
  static appendToURL(url: string): string {
    const utmParams = this.getUTM();
    if (Object.keys(utmParams).length === 0) return url;

    const urlObj = new URL(url);
    Object.entries(utmParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });

    return urlObj.toString();
  }
}

// Usage in App.tsx
useEffect(() => {
  UTMManager.captureUTM();
}, []);

// Usage in analytics
analytics.track('tool_opened', {
  tool: 'merge-pdf',
  ...UTMManager.getUTM() // Include UTM in all events
});
```

**Сохранение UTM для конверсионной атрибуции:**

```typescript
// When user completes operation
const handleDownload = () => {
  analytics.track('file_downloaded', {
    tool: currentTool,
    fileSize: outputFile.size,

    // Attribution data
    ...UTMManager.getUTM(),

    // Conversion tracking
    conversion_value: calculateConversionValue(currentTool),
    session_duration: Date.now() - sessionStartTime,
    tools_used: getToolsUsedInSession()
  });
};
```

---

## 3. SEO-стратегия и hreflang

### Q3.1: Куда указывать alternate/hreflang?

**Решение: ТОЛЬКО на landing pages (не в SPA)**

**Почему:**
- Google не индексирует SPA глубоко (особенно hash routing)
- Yandex игнорирует hreflang в динамическом контенте
- Bing требует статические страницы для hreflang

**Landing page implementation:**

```typescript
// src/components/SEO/SEOHead.tsx (main project)

export const SEOHead = ({ tool, language }: SEOHeadProps) => {
  const alternateLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== language);

  return (
    <Helmet>
      {/* Canonical - always to landing page */}
      <link
        rel="canonical"
        href={`https://localpdf.online${getToolPath(tool, language)}`}
      />

      {/* Hreflang - all language variants */}
      {alternateLanguages.map(lang => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`https://localpdf.online${getToolPath(tool, lang)}`}
        />
      ))}

      {/* Default to English */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`https://localpdf.online${getToolPath(tool, 'en')}`}
      />

      {/* NO alternate to SPA - SPA is not for SEO */}
    </Helmet>
  );
};
```

**SPA implementation (minimal SEO):**

```typescript
// app-spa/src/components/layout/Head.tsx

export const Head = () => {
  return (
    <Helmet>
      {/* Basic meta only */}
      <title>LocalPDF - PDF Tools</title>
      <meta name="description" content="Privacy-first PDF tools in your browser" />

      {/* Canonical points to MAIN site homepage */}
      <link rel="canonical" href="https://localpdf.online" />

      {/* NO hreflang - this is app, not content */}

      {/* Robots: Allow indexing of app homepage only */}
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};
```

**Critical: Google Search Console configuration**

```
Property 1: localpdf.online
  → Submit sitemap with all tool pages (5 languages × 23 pages = 115 URLs)
  → Enable hreflang monitoring
  → Set preferred domain: localpdf.online

Property 2: app.localpdf.online
  → Submit minimal sitemap (homepage only)
  → NO hreflang needed
  → This is NOT primary property for SEO
```

### Q3.2: Yandex-specific considerations

**Yandex preferences:**
- Strong preference for `/ru/` prefix URLs
- Slower to index hash-based SPAs
- Requires Yandex.Metrica for proper tracking

**Strategy for Russian market:**

```typescript
// middleware.ts - Special handling for Yandex bot

export function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isYandexBot = /YandexBot|YandexImages/i.test(userAgent);

  if (isYandexBot) {
    // ALWAYS serve landing pages to Yandex
    // Never redirect to SPA
    return next();
  }

  // Regular bot/user logic...
}
```

**Yandex.Metrica in SPA:**

```typescript
// app-spa/src/utils/analytics.ts

// Initialize Yandex.Metrica for Russian users
if (language === 'ru') {
  (window as any).ym = (window as any).ym || function() {
    ((window as any).ym.a = (window as any).ym.a || []).push(arguments);
  };

  ym(YANDEX_METRICA_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    trackHash: true // ← Important for hash routing
  });
}
```

---

## 4. State Management & Persistence

### Q4.1: localStorage/sessionStorage для state management

**Решение: Hybrid state management**

```typescript
// app-spa/src/hooks/usePersistedState.tsx

import { useState, useEffect, useCallback } from 'react';

type StorageType = 'local' | 'session';

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  storage: StorageType = 'local'
): [T, (value: T) => void, () => void] {
  const storageObj = storage === 'local' ? localStorage : sessionStorage;

  // Initialize from storage or default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = storageObj.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from ${storage}Storage:`, error);
      return defaultValue;
    }
  });

  // Update storage when state changes
  useEffect(() => {
    try {
      storageObj.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to ${storage}Storage:`, error);
    }
  }, [key, state, storageObj]);

  // Clear function
  const clearState = useCallback(() => {
    setState(defaultValue);
    storageObj.removeItem(key);
  }, [key, defaultValue, storageObj]);

  return [state, setState, clearState];
}
```

**Usage in App.tsx:**

```typescript
// app-spa/src/App.tsx

export default function App() {
  // Session state (cleared on browser close)
  const [files, setFiles] = usePersistedState<FileMetadata[]>(
    'current_files',
    [],
    'session' // ← Session storage for temporary files
  );

  // Persistent state (survives browser close)
  const [language, setLanguage] = usePersistedState<Language>(
    'preferred_language',
    'en',
    'local' // ← Local storage for preferences
  );

  const [theme, setTheme] = usePersistedState<Theme>(
    'theme',
    'dark',
    'local'
  );

  // Tool settings (per-tool preferences)
  const [toolSettings, setToolSettings] = usePersistedState(
    'tool_settings',
    {},
    'local'
  );

  return (
    <App
      files={files}
      language={language}
      theme={theme}
      toolSettings={toolSettings}
    />
  );
}
```

### Q4.2: Восстановление state при reload

**Проблема:**
```
User: Загрузил 5 PDF файлов → Настроил параметры → Обновил страницу (F5)
                                                        ↓
                                                  Всё потерялось? ❌
```

**Решение: Auto-save + Recovery UI**

```typescript
// app-spa/src/hooks/useAutoSave.tsx

export const useAutoSave = <T,>(
  key: string,
  state: T,
  debounceMs: number = 1000
): void => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify({
          data: state,
          timestamp: Date.now(),
          version: APP_VERSION
        }));
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [key, state, debounceMs]);
};

// Usage
export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [toolSettings, setToolSettings] = useState({});

  // Auto-save every second
  useAutoSave('app_state', { files, toolSettings });

  // Recovery on mount
  useEffect(() => {
    const recovered = sessionStorage.getItem('app_state');
    if (recovered) {
      const { data, timestamp } = JSON.parse(recovered);

      // Only recover if less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        setShowRecoveryModal(true);
        setRecoveredState(data);
      }
    }
  }, []);

  return (
    <>
      {showRecoveryModal && (
        <RecoveryModal
          state={recoveredState}
          onRecover={() => {
            setFiles(recoveredState.files);
            setToolSettings(recoveredState.toolSettings);
            setShowRecoveryModal(false);
          }}
          onDiscard={() => {
            sessionStorage.removeItem('app_state');
            setShowRecoveryModal(false);
          }}
        />
      )}

      <App files={files} settings={toolSettings} />
    </>
  );
}
```

**Recovery Modal:**

```typescript
// app-spa/src/components/modals/RecoveryModal.tsx

export const RecoveryModal = ({ state, onRecover, onDiscard }) => {
  const { t } = useI18n();

  return (
    <Modal>
      <div className="recovery-modal">
        <h2>{t('recovery.title')}</h2>
        <p>{t('recovery.description')}</p>

        {/* Show what can be recovered */}
        <div className="recovery-preview">
          <p>📁 {state.files.length} files</p>
          <p>⚙️ Settings: {JSON.stringify(state.toolSettings).slice(0, 50)}...</p>
          <p>🕐 {formatRelativeTime(state.timestamp)}</p>
        </div>

        <div className="recovery-actions">
          <button onClick={onRecover} className="btn-primary">
            {t('recovery.restore')}
          </button>
          <button onClick={onDiscard} className="btn-secondary">
            {t('recovery.startFresh')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

**File recovery strategy:**

```typescript
// Problem: Files are binary blobs, can't serialize to JSON
// Solution: Store file metadata + offer re-upload

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  order: number;
}

// Save only metadata
const saveFileMetadata = (files: File[]): void => {
  const metadata: FileMetadata[] = files.map((file, index) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    order: index
  }));

  sessionStorage.setItem('file_metadata', JSON.stringify(metadata));
};

// Recovery UI
const RecoveryFileList = ({ metadata }: { metadata: FileMetadata[] }) => {
  return (
    <div className="recovery-files">
      <p>You had these files loaded:</p>
      <ul>
        {metadata.map(file => (
          <li key={file.name}>
            📄 {file.name} ({formatBytes(file.size)})
          </li>
        ))}
      </ul>
      <button onClick={handleReupload}>
        Re-upload these files
      </button>
    </div>
  );
};
```

---

## 5. Implementation Decisions Summary

| Feature | Decision | Rationale |
|---------|----------|-----------|
| **State transfer** | URL params + hash | Cross-domain, no CORS issues |
| **Language detection** | URL → localStorage → cookie → browser | Multi-layer fallback |
| **UTM preservation** | sessionStorage + localStorage | Attribution tracking |
| **Bookmark handling** | Smart redirect based on cookies | Balance UX and SEO |
| **Hreflang** | Landing pages only | Google/Yandex requirements |
| **State persistence** | sessionStorage (files) + localStorage (prefs) | Security + UX |
| **Recovery** | Auto-save + modal | Prevent data loss |
| **Yandex handling** | Always serve landing pages | RU market optimization |

---

## 6. Edge Cases & Solutions

### Edge Case 1: User clears cookies mid-session
**Solution:** State in sessionStorage persists, app continues working

### Edge Case 2: User switches language mid-operation
**Solution:** Re-analyze PDF with new language (AI recommendations)

### Edge Case 3: Browser blocks localStorage
**Solution:** Fallback to in-memory state, show warning banner

### Edge Case 4: Large files (>100MB) in sessionStorage
**Solution:** Store metadata only, re-upload files after reload

### Edge Case 5: UTM parameters lost in redirect chain
**Solution:** Capture on first load, persist for entire session

---

## 7. Performance & Optimization

### Q7.1: Как избежать дублирования PDF libraries (pdf-lib, pdfjs)?

**Проблема:**
```
Landing pages: bundled with pdf-lib (2.5MB)
SPA app: bundled with pdf-lib (2.5MB again)
→ User downloads 5MB total for same library
```

**Решение: Shared CDN + version pinning**

```typescript
// app-spa/index.html

<!-- Preload shared libraries from CDN -->
<link rel="preload" as="script" href="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" />
<link rel="preload" as="script" href="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js" />

<script>
  // Load from CDN with browser caching
  window.pdflibCDN = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  window.pdfjsCDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
</script>
```

```typescript
// app-spa/vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'pdf-lib', // Don't bundle, use CDN
        'pdfjs-dist'
      ],
      output: {
        globals: {
          'pdf-lib': 'PDFLib',
          'pdfjs-dist': 'pdfjsLib'
        }
      }
    }
  }
});
```

**Cache strategy:**
```typescript
// Service Worker (optional - for offline support)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pdf-libs-v1').then((cache) => {
      return cache.addAll([
        'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
        'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.0/dist/tesseract.min.js'
      ]);
    })
  );
});
```

**Benefits:**
- ✅ User downloads libraries once (shared cache)
- ✅ CDN edge caching (faster globally)
- ✅ Reduced bundle size (-70% for SPA)
- ✅ Version consistency across landing + SPA

### Q7.2: Lazy loading для 18 tools в SPA

**Решение: Dynamic imports + route-based code splitting**

```typescript
// app-spa/src/components/ToolCanvas.tsx

import { lazy, Suspense } from 'react';
import { Tool } from '@/types/tools';

// Lazy load tool components
const toolComponents = {
  'merge-pdf': lazy(() => import('./tools/MergePDFTool')),
  'split-pdf': lazy(() => import('./tools/SplitPDFTool')),
  'compress-pdf': lazy(() => import('./tools/CompressPDFTool')),
  'protect-pdf': lazy(() => import('./tools/ProtectPDFTool')),
  'ocr-pdf': lazy(() => import('./tools/OCRPDFTool')),
  // ... all 18 tools
};

export const ToolCanvas = ({ tool }: { tool: Tool }) => {
  const ToolComponent = toolComponents[tool];

  if (!ToolComponent) {
    return <NotFoundScreen />;
  }

  return (
    <Suspense fallback={<ToolLoadingSkeleton tool={tool} />}>
      <ToolComponent />
    </Suspense>
  );
};
```

**Vite configuration for optimal chunking:**

```typescript
// app-spa/vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-pdf-core': ['pdf-lib', '@pdf-lib/fontkit'],
          'vendor-pdf-render': ['pdfjs-dist'],

          // Feature chunks (lazy loaded)
          'tools-tier1': [
            './src/components/tools/MergePDFTool.tsx',
            './src/components/tools/SplitPDFTool.tsx',
            './src/components/tools/CompressPDFTool.tsx'
          ],
          'tools-tier2': [
            './src/components/tools/ProtectPDFTool.tsx',
            './src/components/tools/OCRPDFTool.tsx',
            // ... other tier 2 tools
          ],

          // Heavy dependencies
          'tesseract': ['tesseract.js'],
          'ai-services': [
            './src/services/smartPDFService.ts',
            './src/services/smartMergeService.ts'
          ]
        }
      }
    },

    // Target modern browsers for smaller bundle
    target: 'es2020',

    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        passes: 2
      }
    }
  }
});
```

**Expected bundle sizes:**

| Chunk | Size | When loaded |
|-------|------|-------------|
| `index.html` | 2 KB | Initial |
| `vendor-react.js` | 140 KB | Initial |
| `app-core.js` | 50 KB | Initial |
| `tools-tier1.js` | 80 KB | On demand |
| `tools-tier2.js` | 120 KB | On demand |
| `tesseract.js` | 1.8 MB | OCR tool only |
| `ai-services.js` | 45 KB | On demand |

**Total initial load:** ~200 KB (vs 3 MB if everything bundled)

### Q7.3: Preloading для popular tools

**Solution: Predictive preloading based on analytics**

```typescript
// app-spa/src/utils/preloader.ts

export class ToolPreloader {
  private static preloadedTools = new Set<Tool>();

  // Preload most popular tools after initial load
  static preloadPopularTools(): void {
    if (document.readyState === 'complete') {
      this.executePreload();
    } else {
      window.addEventListener('load', () => this.executePreload());
    }
  }

  private static executePreload(): void {
    // Wait for idle time (don't compete with user actions)
    requestIdleCallback(() => {
      const popularTools: Tool[] = [
        'merge-pdf',
        'split-pdf',
        'compress-pdf'
      ];

      popularTools.forEach(tool => {
        this.preloadTool(tool);
      });
    });
  }

  static preloadTool(tool: Tool): void {
    if (this.preloadedTools.has(tool)) return;

    // Dynamic import to trigger download
    import(`./components/tools/${getToolComponentName(tool)}.tsx`)
      .then(() => {
        this.preloadedTools.add(tool);
        console.log(`[Preloader] ${tool} ready`);
      })
      .catch(err => {
        console.warn(`[Preloader] Failed to preload ${tool}:`, err);
      });
  }

  // Predictive preloading based on user behavior
  static predictNextTool(currentTool: Tool): Tool | null {
    // Common tool sequences from analytics
    const sequences: Record<Tool, Tool[]> = {
      'merge-pdf': ['compress-pdf', 'protect-pdf'],
      'split-pdf': ['merge-pdf', 'compress-pdf'],
      'compress-pdf': ['merge-pdf', 'protect-pdf'],
      // ... based on real usage data
    };

    const likely = sequences[currentTool]?.[0];
    if (likely) {
      this.preloadTool(likely);
    }

    return likely || null;
  }
}

// Usage in App.tsx
useEffect(() => {
  ToolPreloader.preloadPopularTools();
}, []);

// Predictive preloading when user opens a tool
useEffect(() => {
  if (currentTool) {
    ToolPreloader.predictNextTool(currentTool);
  }
}, [currentTool]);
```

---

## 8. Security & Privacy Considerations

### Q8.1: CORS issues при обращении к app.localpdf.online из localpdf.online

**Проблема:**
```javascript
// Landing page trying to access SPA data
fetch('https://app.localpdf.online/api/user-state')
  .then(...)
// ❌ Blocked by CORS
```

**Решение: Same-domain cookies + PostMessage API**

```typescript
// Option A: Shared cookies (if subdomain)
// In Vercel headers config for app.localpdf.online
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://localpdf.online"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        }
      ]
    }
  ]
}

// Set cookie with domain=.localpdf.online (works for both)
document.cookie = "user_id=123; domain=.localpdf.online; Secure; SameSite=Lax";
```

```typescript
// Option B: PostMessage for cross-window communication
// Landing page embeds SPA in iframe for state check
// src/components/molecules/BetaCTA.tsx

const checkUserHasSPA = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://app.localpdf.online/check';
    iframe.style.display = 'none';

    const messageHandler = (event: MessageEvent) => {
      if (event.origin === 'https://app.localpdf.online') {
        resolve(event.data.hasVisited || false);
        window.removeEventListener('message', messageHandler);
        iframe.remove();
      }
    };

    window.addEventListener('message', messageHandler);
    document.body.appendChild(iframe);

    // Timeout after 2 seconds
    setTimeout(() => {
      resolve(false);
      window.removeEventListener('message', messageHandler);
      iframe.remove();
    }, 2000);
  });
};

// SPA sends back state
// app-spa/public/check.html
window.parent.postMessage({
  hasVisited: localStorage.getItem('visited_spa') === 'true',
  lastTool: localStorage.getItem('last_tool')
}, 'https://localpdf.online');
```

### Q8.2: Безопасность localStorage с sensitive data

**Проблема:**
- localStorage доступен всему JS коду (включая third-party scripts)
- XSS vulnerability может украсть данные

**Решение: Minimal sensitive data + encryption**

```typescript
// app-spa/src/utils/secureStorage.ts

import CryptoJS from 'crypto-js';

export class SecureStorage {
  private static SECRET_KEY = 'user-specific-key-from-session'; // Generate per-session

  // Only store non-sensitive data in plain localStorage
  static setPublic(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Encrypt sensitive data (if absolutely necessary)
  static setPrivate(key: string, value: any): void {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      this.SECRET_KEY
    ).toString();

    sessionStorage.setItem(key, encrypted); // Session only, not persistent
  }

  static getPrivate(key: string): any | null {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}

// Usage
SecureStorage.setPublic('theme', 'dark'); // OK - not sensitive
SecureStorage.setPublic('language', 'ru'); // OK

// DON'T store:
// ❌ User email
// ❌ Payment info
// ❌ Personal documents
// ❌ API keys

// Our app: No user accounts → No sensitive data to store!
```

**Privacy policy compliance:**

```typescript
// app-spa/src/utils/privacy.ts

export class PrivacyManager {
  // GDPR compliance
  static requestConsent(): boolean {
    const consent = localStorage.getItem('analytics_consent');

    if (consent === null) {
      // Show consent banner
      const userConsent = showConsentBanner();
      localStorage.setItem('analytics_consent', userConsent.toString());
      return userConsent;
    }

    return consent === 'true';
  }

  // Right to be forgotten
  static deleteAllData(): void {
    // Clear all localStorage
    localStorage.clear();
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    });

    // Reload page
    window.location.reload();
  }

  // Data export (GDPR requirement)
  static exportUserData(): object {
    const data = {
      preferences: {
        language: localStorage.getItem('preferred_language'),
        theme: localStorage.getItem('theme'),
        sidebarCollapsed: localStorage.getItem('sidebar_collapsed')
      },
      analytics: {
        consent: localStorage.getItem('analytics_consent'),
        visitCount: localStorage.getItem('visit_count')
      },
      usage: {
        lastTool: localStorage.getItem('last_tool'),
        toolsUsed: JSON.parse(localStorage.getItem('tools_used') || '[]')
      }
    };

    return data;
  }
}
```

### Q8.3: Content Security Policy для SPA

```typescript
// app-spa/vercel.json

{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## 9. Testing Strategy

### Q9.1: Как тестировать hash routing?

```typescript
// app-spa/src/__tests__/routing.test.ts

import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from '../App';

describe('Hash Routing', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  test('renders welcome screen when no hash', () => {
    render(<App />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  test('loads merge tool on #merge', () => {
    window.location.hash = '#merge';
    render(<App />);
    expect(screen.getByText(/merge pdf/i)).toBeInTheDocument();
  });

  test('parses URL parameters correctly', () => {
    window.location.hash = '#merge?lang=ru&source=landing';
    render(<App />);

    // Should display Russian language
    expect(document.documentElement.lang).toBe('ru');
  });

  test('handles invalid tool gracefully', () => {
    window.location.hash = '#invalid-tool';
    render(<App />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  test('switches tools without reload', async () => {
    const { rerender } = render(<App />);

    // Start with merge
    act(() => {
      window.location.hash = '#merge';
    });
    rerender(<App />);
    expect(screen.getByText(/merge pdf/i)).toBeInTheDocument();

    // Switch to split
    act(() => {
      window.location.hash = '#split';
    });
    rerender(<App />);
    expect(screen.getByText(/split pdf/i)).toBeInTheDocument();
  });
});
```

### Q9.2: E2E тестирование с Playwright

```typescript
// app-spa/tests/e2e/user-journey.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('landing → SPA → merge → download', async ({ page }) => {
    // 1. Start on landing page
    await page.goto('https://localpdf.online/merge-pdf');
    await expect(page).toHaveTitle(/merge pdf/i);

    // 2. Click Beta CTA
    await page.click('[data-testid="beta-cta"]');

    // 3. Should redirect to SPA
    await expect(page).toHaveURL(/app\.localpdf\.online\/#merge/);

    // 4. Upload files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'tests/fixtures/sample1.pdf',
      'tests/fixtures/sample2.pdf'
    ]);

    // 5. Wait for upload
    await expect(page.locator('[data-testid="file-list"]')).toContainText('sample1.pdf');
    await expect(page.locator('[data-testid="file-list"]')).toContainText('sample2.pdf');

    // 6. Click merge button
    await page.click('[data-testid="merge-button"]');

    // 7. Wait for processing
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();

    // 8. Download should be available
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;

    // 9. Verify download
    expect(download.suggestedFilename()).toMatch(/merged.*\.pdf/);
  });

  test('preserves language across redirect', async ({ page }) => {
    // 1. Start on Russian landing page
    await page.goto('https://localpdf.online/ru/merge-pdf');

    // 2. Click Beta CTA
    await page.click('[data-testid="beta-cta"]');

    // 3. Check SPA has Russian
    await expect(page).toHaveURL(/lang=ru/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

    // 4. Check UI is in Russian
    await expect(page.locator('[data-testid="sidebar"]')).toContainText('Инструменты');
  });

  test('tool switching is instant', async ({ page }) => {
    await page.goto('https://app.localpdf.online/#merge');

    // Measure time to switch tools
    const startTime = Date.now();

    await page.click('[data-testid="tool-split"]');
    await expect(page).toHaveURL(/#split/);
    await expect(page.locator('h1')).toContainText(/split/i);

    const switchTime = Date.now() - startTime;

    // Should be instant (<500ms)
    expect(switchTime).toBeLessThan(500);
  });
});
```

### Q9.3: Performance testing

```typescript
// app-spa/tests/performance/lighthouse.spec.ts

import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test('Lighthouse audit for SPA', async ({ page }) => {
  await page.goto('https://app.localpdf.online');

  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 80, // Lower for SPA (expected)
      pwa: 0 // Not a PWA yet
    },
    reports: {
      formats: {
        html: true
      },
      directory: 'lighthouse-reports'
    }
  });
});
```

---

## 10. Monitoring & Debugging

### Q10.1: Как отслеживать performance metrics в production?

```typescript
// app-spa/src/utils/performanceMonitor.ts

export class PerformanceMonitor {
  static trackPageLoad(): void {
    if (!window.performance) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        // Send to analytics
        analytics.track('page_performance', {
          pageLoadTime,
          connectTime,
          renderTime,
          url: window.location.href
        });
      }, 0);
    });
  }

  static trackToolLoad(tool: Tool, startTime: number): void {
    const loadTime = Date.now() - startTime;

    analytics.track('tool_load_time', {
      tool,
      loadTime,
      cached: loadTime < 100 // Likely from cache
    });
  }

  static trackOperationPerformance(
    tool: Tool,
    fileCount: number,
    totalSize: number,
    duration: number
  ): void {
    analytics.track('operation_performance', {
      tool,
      fileCount,
      totalSize,
      duration,
      throughput: totalSize / duration // bytes per ms
    });
  }

  // Core Web Vitals
  static trackWebVitals(): void {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        analytics.track('web_vital_lcp', {
          value: entry.renderTime || entry.loadTime
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        analytics.track('web_vital_fid', {
          value: entry.processingStart - entry.startTime
        });
      }
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsScore = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
        }
      }
      analytics.track('web_vital_cls', { value: clsScore });
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Initialize in App.tsx
useEffect(() => {
  PerformanceMonitor.trackPageLoad();
  PerformanceMonitor.trackWebVitals();
}, []);
```

### Q10.2: Error tracking и debugging

```typescript
// app-spa/src/utils/errorTracker.ts

export class ErrorTracker {
  static init(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });

    // React error boundary fallback
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.logError({
        type: 'react_error',
        message: event.detail.error.message,
        componentStack: event.detail.errorInfo.componentStack,
        stack: event.detail.error.stack
      });
    }) as EventListener);
  }

  static logError(error: ErrorLog): void {
    // Send to analytics
    analytics.track('error', {
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracker]', error);
    }

    // Optional: Send to error tracking service (Sentry, LogRocket, etc.)
    // Sentry.captureException(error);
  }
}

// React Error Boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorTracker.logError({
      type: 'react_boundary',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Oops! Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 11. Implementation Checklist

### Phase 1: Foundation ✅
- [ ] Create `app-spa/` directory structure
- [ ] Setup Vite + React + TypeScript
- [ ] Configure Vercel subdomain deployment
- [ ] Implement hash routing hook
- [ ] Setup i18n system
- [ ] Build base layout (Sidebar + Header)
- [ ] Implement theme system

### Phase 2: Core Features ✅
- [ ] File manager with persistence
- [ ] Language detection & switching
- [ ] UTM parameter handling
- [ ] State recovery system
- [ ] Analytics integration
- [ ] Error tracking

### Phase 3: Tools Migration ✅
- [ ] Tier 1: Merge, Split, Compress (3 tools)
- [ ] Tier 2: Protect, OCR, Watermark, Add Text (4 tools)
- [ ] Tier 3: All remaining tools (11 tools)
- [ ] AI recommendations integration
- [ ] Testing for each tool

### Phase 4: Integration ✅
- [ ] BetaCTA component in main site
- [ ] Middleware redirect logic
- [ ] Cookie-based preference system
- [ ] Cross-domain state transfer
- [ ] Performance optimization
- [ ] Security headers

### Phase 5: Testing & Launch ✅
- [ ] Unit tests (routing, hooks, components)
- [ ] E2E tests (user journeys)
- [ ] Performance testing (Lighthouse)
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Soft launch (20% traffic)
- [ ] Monitor metrics
- [ ] Full launch (100% traffic)

---

## Next Steps

**Ready to begin implementation?**

1. ✅ Start with Phase 1: Foundation
2. ✅ Create initial SPA structure
3. ✅ Deploy to `app.localpdf.online`
4. ✅ Test basic routing and i18n
5. ✅ Proceed to tool migration

**Command to start:**
```bash
cd /Users/aleksejs/Desktop/clientpdf-pro
mkdir app-spa
cd app-spa
npm create vite@latest . -- --template react-ts
```

---

**Document Status:** 🟢 Complete & Ready for Implementation
