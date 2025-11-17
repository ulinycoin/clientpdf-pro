# 🚀 shadcn/ui Migration Plan - Full Migration

**Goal:** Migrate all 11 implemented PDF tools to shadcn/ui for consistent, modern UI.

**Current Bundle Size:** ~74 KB gzip
**Target Bundle Size:** ~85-95 KB gzip (acceptable increase for better UX)

---

## 📋 Migration Status

### ✅ Completed
- [x] shadcn/ui dependencies installed
- [x] Core utilities (`cn()`, path aliases)
- [x] Base components (Button, Card, Badge, Textarea, Select, RadioGroup, Tabs)
- [x] Test pages deleted

### 🔄 In Progress
- [ ] Migration plan finalized

---

## 🎯 Phase 1: Additional shadcn/ui Components (30 min)

**Critical components we need for migration:**

### 1.1 Dialog/AlertDialog
**Why:** Replace all `alert()` calls with proper modals
**Used in:** All tools (error handling, confirmations)
**Installation:**
```bash
npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

### 1.2 Toast/Sonner
**Why:** Beautiful notifications for success/error messages
**Used in:** All tools (copy success, download success, errors)
**Installation:**
```bash
npm install sonner
```

### 1.3 Checkbox
**Why:** Better checkboxes for permissions, options
**Used in:** ProtectPDF (permissions), OCRPDF (auto-detect)
**Installation:**
```bash
npm install @radix-ui/react-checkbox
```

### 1.4 Switch
**Why:** Toggle for dark mode, settings
**Used in:** Header (theme toggle), Settings
**Installation:**
```bash
npm install @radix-ui/react-switch
```

### 1.5 Input
**Why:** Consistent text inputs across all forms
**Used in:** RotatePDF, DeletePagesPDF, ExtractPagesPDF (page numbers)
**Installation:**
```bash
npm install (no dependencies - just styling)
```

### 1.6 Label
**Why:** Proper accessibility labels
**Used in:** All forms
**Installation:**
```bash
npm install @radix-ui/react-label
```

### 1.7 Progress
**Why:** Better progress bars (optional - ProgressBar component works well)
**Used in:** All tools (processing)
**Installation:**
```bash
npm install @radix-ui/react-progress
```

**Action Items:**
- [ ] Install all missing components
- [ ] Create component files in `src/components/ui/`
- [ ] Test each component in isolation

---

## 🎯 Phase 2: Core Tools Migration (Tier 1) - 90 min

**These are the most important tools - highest priority.**

### 2.1 MergePDF ✅ (Already tested)
**Status:** Test version created, needs final migration
**Changes:**
- Replace `<button>` → `<Button>`
- Replace `<div className="card">` → `<Card>`
- Keep rest as-is

**Files:** `src/components/tools/MergePDF.tsx`
**Time:** 15 min
**Action:** Copy changes from MergePDFTest

---

### 2.2 SplitPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace mode selection → `<Tabs>` (4 modes: pages, range, intervals, custom)
- Replace inputs → `<Input>` (page numbers, intervals)
- Add `<Badge>` for page counts

**Files:** `src/components/tools/SplitPDF.tsx`
**Time:** 20 min
**Complexity:** Medium (has multiple modes)

---

### 2.3 CompressPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Simple tool, minimal changes

**Files:** `src/components/tools/CompressPDF.tsx`
**Time:** 10 min
**Complexity:** Low

---

### 2.4 ProtectPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace checkboxes → `<Checkbox>` (permissions: print, copy, modify, etc.)
- Replace inputs → `<Input>` (password fields)
- Add `<Label>` for form fields

**Files:** `src/components/tools/ProtectPDF.tsx`
**Time:** 20 min
**Complexity:** Medium (has form with multiple checkboxes)

---

### 2.5 OCRPDF ✅ (Already tested)
**Status:** Test version created, needs final migration
**Changes:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace language select → `<Select>`
- Replace page mode radio → `<Tabs>`
- Replace output format radio → `<RadioGroup>`
- Replace textarea → `<Textarea>`
- Add `<Badge>` for confidence levels
- Replace checkbox → `<Checkbox>` (auto-detect)

**Files:** `src/components/tools/OCRPDF.tsx`
**Time:** 25 min
**Action:** Copy changes from OCRPDFTest

---

## 🎯 Phase 3: Edit Tools Migration (Tier 2) - 60 min

### 3.1 AddTextPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace inputs → `<Input>` (text content, font size, position)
- Add `<Label>` for form fields
- Replace color picker wrapper → custom with shadcn styling

**Files:** `src/components/tools/AddTextPDF.tsx`
**Time:** 15 min
**Complexity:** Medium

---

### 3.2 WatermarkPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace inputs → `<Input>` (watermark text, opacity, rotation)
- Replace select → `<Select>` (position)

**Files:** `src/components/tools/WatermarkPDF.tsx`
**Time:** 15 min
**Complexity:** Medium

---

### 3.3 RotatePDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace inputs → `<Input>` (page selection)
- Add `<Badge>` for rotation degrees

**Files:** `src/components/tools/RotatePDF.tsx`
**Time:** 10 min
**Complexity:** Low

---

### 3.4 DeletePagesPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace inputs → `<Input>` (page numbers)
- Add `<Badge>` for selected pages count

**Files:** `src/components/tools/DeletePagesPDF.tsx`
**Time:** 10 min
**Complexity:** Low

---

### 3.5 ExtractPagesPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace inputs → `<Input>` (page range)
- Add `<Badge>` for page count

**Files:** `src/components/tools/ExtractPagesPDF.tsx`
**Time:** 10 min
**Complexity:** Low

---

## 🎯 Phase 4: Convert Tools Migration (Tier 3) - 30 min

### 4.1 ImagesToPDF
**Changes needed:**
- Replace buttons → `<Button>`
- Replace cards → `<Card>`
- Replace select → `<Select>` (page size, orientation)
- Add `<Badge>` for image count

**Files:** `src/components/tools/ImagesToPDF.tsx`
**Time:** 15 min
**Complexity:** Medium

---

### 4.2 Other Tier 3 Tools
**Tools:** EditTextPDF, AddFormFieldsPDF, PDFToImages, WordToPDF, PDFToWord, SignPDF, FlattenPDF

**Note:** Some are not yet implemented. When implementing, use shadcn/ui from the start.

**Time:** 15 min (for implemented ones)

---

## 🎯 Phase 5: Common Components & Layout - 45 min

### 5.1 Replace alert() with Dialog/Toast
**Files to update:**
- All tool components (error handling)
- Create reusable `useToast()` hook
- Create `ConfirmDialog` component for confirmations

**Changes:**
```tsx
// Before
alert('File uploaded successfully!');

// After
toast({
  title: "✅ Success",
  description: "File uploaded successfully!"
});
```

**Time:** 20 min

---

### 5.2 Update Header/Sidebar
**Changes:**
- Replace theme toggle button → `<Switch>`
- Add shadcn styling to logo
- Update sidebar tool buttons → `<Button variant="ghost">`

**Files:**
- `src/components/layout/Sidebar.tsx`
- `src/App.tsx` (header section)

**Time:** 15 min

---

### 5.3 Update WelcomeScreen
**Changes:**
- Replace cards → `<Card>`
- Replace buttons → `<Button>`
- Add `<Badge>` for popular tools

**Files:** `src/components/WelcomeScreen.tsx`
**Time:** 10 min

---

## 🎯 Phase 6: Global Styles & CSS Variables - 15 min

### 6.1 Add CSS Variables to index.css
**Why:** shadcn/ui uses CSS variables for theming

**Add to `src/index.css`:**
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

**Action:**
- [ ] Add CSS variables
- [ ] Update ocean/privacy colors to use CSS variables
- [ ] Test light/dark mode

**Time:** 15 min

---

## 🎯 Phase 7: Testing & Bundle Size Check - 30 min

### 7.1 Test Each Tool
- [ ] MergePDF - upload, merge, download
- [ ] SplitPDF - all 4 modes
- [ ] CompressPDF - compress
- [ ] ProtectPDF - password + permissions
- [ ] OCRPDF - OCR with different languages
- [ ] AddTextPDF - add text
- [ ] WatermarkPDF - add watermark
- [ ] RotatePDF - rotate pages
- [ ] DeletePagesPDF - delete pages
- [ ] ExtractPagesPDF - extract pages
- [ ] ImagesToPDF - convert images

**Time:** 20 min

---

### 7.2 Bundle Size Check
```bash
npm run build
```

**Check:**
- Initial bundle size (should be < 100 KB gzip)
- Vendor chunks (react, pdf-lib, pdfjs, ocr, ui)
- Tree-shaking working correctly

**Time:** 10 min

---

## 🎯 Phase 8: Cleanup - 15 min

### 8.1 Remove Old Styles
- [ ] Remove unused `.btn`, `.btn-primary`, `.btn-secondary` classes
- [ ] Remove unused `.card` styles (keep only if needed for backwards compatibility)
- [ ] Clean up tailwind config (remove unused utilities)

### 8.2 Update Documentation
- [ ] Update CLAUDE.md with shadcn/ui info
- [ ] Update README.md with component library mention
- [ ] Add components.json to git

**Time:** 15 min

---

## 📊 Total Time Estimate

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1: Additional Components | 30 min | HIGH |
| Phase 2: Core Tools (Tier 1) | 90 min | HIGH |
| Phase 3: Edit Tools (Tier 2) | 60 min | MEDIUM |
| Phase 4: Convert Tools (Tier 3) | 30 min | MEDIUM |
| Phase 5: Common Components | 45 min | HIGH |
| Phase 6: Global Styles | 15 min | HIGH |
| Phase 7: Testing | 30 min | HIGH |
| Phase 8: Cleanup | 15 min | LOW |
| **TOTAL** | **~5 hours** | - |

---

## 🚨 Critical Notes

### Performance Considerations:
1. **Lazy loading:** All shadcn/ui components are small, but Dialog/Select use Radix UI
2. **Manual chunks:** Update `vite.config.ts` to split Radix UI into separate chunk:
```ts
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],
  'vendor-pdfjs': ['pdfjs-dist'],
  'vendor-ocr': ['tesseract.js'],
  'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', ...], // NEW
}
```

### Bundle Size Tracking:
- Current: ~74 KB gzip
- After shadcn/ui: Expected ~85-95 KB gzip
- Max acceptable: 100 KB gzip (still excellent for a full PDF toolkit)

### Rollback Plan:
- Git commit before each phase
- If bundle size > 100 KB, revert last phase
- Keep old components in `src/components/legacy/` for 1 week

---

## 🎯 Next Steps

**Option A: Start Now (Full Day Migration)**
1. Complete all phases in one session (~5 hours)
2. Thorough testing after each phase
3. Deploy to production after Phase 7

**Option B: Phased Migration (Over 3-5 Days)**
1. Day 1: Phases 1-2 (Core tools)
2. Day 2: Phases 3-4 (Edit + Convert tools)
3. Day 3: Phases 5-6 (Common + Styles)
4. Day 4: Phases 7-8 (Testing + Cleanup)

**Option C: Critical Path (Priority-Based)**
1. Session 1: Phase 1 + Phase 2.1-2.3 (Core essentials) - 2 hours
2. Session 2: Phase 2.4-2.5 + Phase 5.1 (Remaining core + alerts) - 2 hours
3. Session 3: Phases 3-8 (Everything else) - 3 hours

---

## 🤔 Ready to Start?

**Choose your approach:**
- [ ] Option A - Full migration today (5 hours)
- [ ] Option B - Spread over 3-5 days
- [ ] Option C - Critical path first (2+2+3 hours)

**I recommend: Option C** - Critical path gives you visible improvements quickly while spreading the work.

---

**Once you decide, I'll begin with Phase 1!** 🚀
