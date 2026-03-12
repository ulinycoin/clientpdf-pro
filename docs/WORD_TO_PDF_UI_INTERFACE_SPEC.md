# Word-to-PDF: Interface Description, Markup, and Styles

Status: Canonical reference for the V6 tool UI pattern.

## 1) Interface Description

The `word-to-pdf` tool interface has two columns:

- Left column (`settings panel`)
  - Header and short scenario description.
  - `.docx` upload area.
  - Selected file block (name + clear action).
  - Conversion settings:
    - quality (`standard`, `high`, `min`);
    - `PDF/A` (on/off);
    - `Searchable PDF` (on/off);
    - password protection (when environment support is available).
  - Actions:
    - `Cancel`;
    - `Convert to PDF` / `Download PDF` (depends on step state).

- Right column (`preview panel`)
  - Empty state: prompt to upload a document.
  - Tabs:
    - `PDF` (visual page preview);
    - `Details` (technical parameter summary).
  - Preview page pager (`Prev`, `Page N`, `Next`).
  - Content area:
    - PDF page image;
    - loading/error text when needed.

Interface states:

- `upload`: no file selected, empty state is shown.
- `config`: file selected, settings and preview are available.
- `processing`: start button shows progress.
- `result`: download button for the result is available.

---

## 2) Markup Example (HTML Structure)

```html
<section class="word-tool">
  <div class="word-tool__layout">
    <aside class="word-tool__settings">
      <header class="word-tool__intro">
        <p class="word-tool__kicker">Word to PDF tool</p>
        <h2 class="word-tool__title">Interface overview</h2>
        <p class="word-tool__subtitle">
          Upload DOCX, configure conversion, inspect preview, then export PDF.
        </p>
      </header>

      <button class="word-tool__upload" type="button">
        <span class="word-tool__upload-icon">W</span>
        <span class="word-tool__upload-title">Drop files or click to upload</span>
        <span class="word-tool__upload-copy">DOCX only. Local processing.</span>
      </button>

      <div class="word-tool__file-chip">
        <span class="word-tool__file-name">contract-v2.docx</span>
        <button class="word-tool__clear" type="button" aria-label="Clear file">x</button>
      </div>

      <div class="word-tool__fields">
        <label class="word-tool__label" for="quality">Quality</label>
        <select id="quality" class="word-tool__select">
          <option>Standard</option>
          <option>High</option>
          <option>Minimum size</option>
        </select>

        <label class="word-tool__check"><input type="checkbox" /> Create PDF/A</label>
        <label class="word-tool__check"><input type="checkbox" checked /> Searchable PDF</label>
        <label class="word-tool__check"><input type="checkbox" /> Protect with password</label>

        <input class="word-tool__input" type="password" placeholder="Password" />
      </div>

      <footer class="word-tool__actions">
        <button class="word-tool__btn ghost" type="button">Cancel</button>
        <button class="word-tool__btn primary" type="button">Convert to PDF</button>
      </footer>
    </aside>

    <main class="word-tool__preview">
      <div class="word-tool__tabs">
        <button class="word-tool__tab is-active" type="button">PDF</button>
        <button class="word-tool__tab" type="button">Details</button>
      </div>

      <div class="word-tool__toolbar">
        <button class="word-tool__mini-btn" type="button">Prev</button>
        <select class="word-tool__pager">
          <option>Page 1</option>
          <option>Page 2</option>
        </select>
        <button class="word-tool__mini-btn" type="button">Next</button>
      </div>

      <div class="word-tool__canvas">
        <img class="word-tool__page" src="preview-page.png" alt="PDF preview page 1" />
      </div>
    </main>
  </div>
</section>
```

---

## 3) Style Example (CSS)

```css
.word-tool {
  --wt-bg: rgba(20, 31, 43, 0.84);
  --wt-panel: rgba(13, 22, 31, 0.9);
  --wt-stroke: rgba(183, 202, 219, 0.24);
  --wt-text: #edf4fa;
  --wt-muted: #bfd2e4;
  --wt-accent: #60a5fa;

  color: var(--wt-text);
}

.word-tool__layout {
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 0.9rem;
  min-height: clamp(560px, 74vh, 920px);
}

.word-tool__settings,
.word-tool__preview {
  border: 1px solid var(--wt-stroke);
  border-radius: 16px;
  background: var(--wt-bg);
}

.word-tool__settings {
  padding: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.82rem;
}

.word-tool__intro {
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 14px;
  padding: 0.78rem 0.85rem;
  background: linear-gradient(180deg, rgba(29, 53, 79, 0.45) 0%, rgba(17, 28, 38, 0.68) 100%);
}

.word-tool__kicker {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ec5e8;
}

.word-tool__title {
  margin: 0.24rem 0 0;
  font-size: 1rem;
}

.word-tool__subtitle {
  margin: 0.36rem 0 0;
  font-size: 0.8rem;
  color: var(--wt-muted);
  line-height: 1.45;
}

.word-tool__upload {
  border: 1px dashed rgba(96, 165, 250, 0.48);
  border-radius: 14px;
  padding: 0.95rem;
  background: linear-gradient(180deg, rgba(36, 64, 92, 0.34) 0%, rgba(18, 30, 42, 0.68) 100%);
  color: inherit;
  text-align: left;
}

.word-tool__file-chip {
  border: 1px solid rgba(96, 165, 250, 0.34);
  border-radius: 10px;
  background: rgba(15, 24, 34, 0.9);
  padding: 0.52rem 0.62rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.word-tool__file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.word-tool__fields {
  display: grid;
  gap: 0.62rem;
}

.word-tool__label {
  font-size: 0.83rem;
  font-weight: 600;
}

.word-tool__select,
.word-tool__input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(183, 202, 219, 0.32);
  background: var(--wt-panel);
  color: var(--wt-text);
  padding: 0.58rem 0.68rem;
}

.word-tool__actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 0.58rem;
}

.word-tool__btn {
  border-radius: 0.72rem;
  min-height: 2.3rem;
  padding: 0.56rem 0.9rem;
  border: 1px solid transparent;
}

.word-tool__btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.word-tool__btn.ghost {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(183, 202, 219, 0.24);
  color: var(--wt-text);
}

.word-tool__preview {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 560px;
}

.word-tool__tabs {
  display: flex;
  gap: 0.35rem;
  padding: 0.52rem 0.65rem 0;
  border-bottom: 1px solid var(--wt-stroke);
}

.word-tool__tab {
  border: 0;
  background: transparent;
  color: #b4c9dc;
  padding: 0.5rem 0.62rem;
  border-bottom: 2px solid transparent;
}

.word-tool__tab.is-active {
  color: #edf6ff;
  border-bottom-color: var(--wt-accent);
}

.word-tool__toolbar {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  padding: 0.58rem 0.65rem;
  border-bottom: 1px solid var(--wt-stroke);
  background: rgba(11, 18, 25, 0.42);
}

.word-tool__canvas {
  flex: 1;
  padding: 0.9rem;
  overflow: auto;
  background: linear-gradient(180deg, rgba(14, 22, 30, 0.7) 0%, rgba(10, 16, 23, 0.9) 100%);
}

.word-tool__page {
  display: block;
  width: 100%;
  border-radius: 10px;
  background: #fff;
}

@media (max-width: 1100px) {
  .word-tool__layout {
    grid-template-columns: 1fr;
  }

  .word-tool__preview {
    min-height: 460px;
  }
}
```
