#!/bin/bash

HEADER='/**
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

'

for file in $(find src/ -name "*.ts" -o -name "*.tsx" | grep -v main.tsx | grep -v App.tsx); do
    if ! grep -q "Copyright (c) 2024 LocalPDF Team" "$file"; then
        echo "Adding header to $file"
        echo "$HEADER" > temp_file
        cat "$file" >> temp_file
        mv temp_file "$file"
    fi
done
