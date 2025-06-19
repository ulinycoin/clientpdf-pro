# 📄 Copyright Notice

**All source code files in this repository are protected by copyright and proprietary licensing.**

## 🔒 Standard Copyright Header

Each source code file should include the following copyright header:

```typescript
/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */
```

## 🛠️ Adding Headers Automatically

Use the provided script to automatically add copyright headers to all source files:

```bash
# Make the script executable
chmod +x scripts/add-copyright-headers.sh

# Run the script to add headers to all source files
./scripts/add-copyright-headers.sh
```

## 📁 Protected Files

The following file types are protected by copyright:

- **Source Code**: `*.ts`, `*.tsx`, `*.js`, `*.jsx`
- **Stylesheets**: `*.css`, `*.scss`, `*.sass`
- **Configuration**: `*.json`, `*.config.js`, `*.config.ts`
- **Documentation**: `*.md` (project-specific documentation)
- **Assets**: Custom icons, images, and design files

## ⚖️ Legal Notice

```
Copyright (c) 2024 LocalPDF Team
All rights reserved.

This software and associated documentation files are proprietary.
Unauthorized copying, distribution, modification, or use is prohibited.

For licensing inquiries: license@localpdf.online
```

## 🔍 Verification

To verify that all files have proper copyright headers:

```bash
# Check for missing headers
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -L "Copyright (c) 2024 LocalPDF Team"

# List files with headers
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "Copyright (c) 2024 LocalPDF Team"
```

---

**⚠️ Important**: Any contribution to this repository automatically transfers copyright to LocalPDF Team under the terms specified in the Contributor License Agreement (CLA).
