# 🛠️ Scripts Directory

This directory contains utility scripts for LocalPDF development and maintenance.

## 📄 add-copyright-headers.sh

Automatically adds copyright headers to all TypeScript and JavaScript source files.

### Usage

```bash
# Navigate to project root
cd /path/to/clientpdf-pro

# Make script executable
chmod +x scripts/add-copyright-headers.sh

# Run the script
./scripts/add-copyright-headers.sh
```

### What it does

- ✅ Adds copyright headers to all `.ts`, `.tsx`, `.js`, `.jsx` files in `src/`
- ✅ Processes configuration files (`vite.config.ts`, `tailwind.config.js`, etc.)
- ✅ Skips files that already have copyright headers
- ✅ Creates backups before modification
- ✅ Provides colorized output with progress tracking
- ✅ Reports summary of processed, skipped, and error files

### Example Output

```
LocalPDF Copyright Header Tool
================================

Processing source files...
✅ Added header: src/main.tsx
✅ Added header: src/App.tsx
⏭️  Header exists: src/components/Layout.tsx
✅ Added header: src/pages/HomePage.tsx

Processing configuration files...
✅ Added header: vite.config.ts
⏭️  Config file not found: vitest.config.ts

Summary:
✅ Processed: 15 files
⏭️  Skipped: 3 files
❌ Errors: 0 files

🎉 All files processed successfully!
```

### Verification

To check which files have copyright headers:

```bash
# List files with headers
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "Copyright (c) 2024 LocalPDF Team"

# List files missing headers
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -L "Copyright (c) 2024 LocalPDF Team"
```

### Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Verify copyright headers
  run: |
    chmod +x scripts/add-copyright-headers.sh
    ./scripts/add-copyright-headers.sh
    
    # Check if any files were modified
    if [ -n "$(git status --porcelain)" ]; then
      echo "❌ Some files are missing copyright headers"
      git status
      exit 1
    else
      echo "✅ All files have proper copyright headers"
    fi
```

## ⚖️ Legal Notice

All scripts in this directory are proprietary and subject to the same licensing terms as the main LocalPDF codebase.

---

**Copyright (c) 2024 LocalPDF Team**  
See LICENSE file for terms and conditions.
