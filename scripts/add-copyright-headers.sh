#!/bin/bash

# Copyright Header Script for LocalPDF
# Automatically adds copyright headers to all TypeScript and JavaScript files

set -e  # Exit on any error

# Copyright header template
read -r -d '' COPYRIGHT_HEADER << 'EOF'
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
EOF

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PROCESSED=0
SKIPPED=0
ERRORS=0

echo -e "${BLUE}LocalPDF Copyright Header Tool${NC}"
echo -e "${BLUE}================================${NC}\n"

# Function to add header to a file
add_header() {
    local file="$1"
    
    # Skip if file doesn't exist
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        ((ERRORS++))
        return 1
    fi
    
    # Check if header already exists
    if grep -q "Copyright (c) 2024 LocalPDF Team" "$file" 2>/dev/null; then
        echo -e "${YELLOW}⏭️  Header exists: $file${NC}"
        ((SKIPPED++))
        return 0
    fi
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Create temporary file with header
    {
        echo "$COPYRIGHT_HEADER"
        echo ""
        cat "$file"
    } > "$file.tmp"
    
    # Replace original file
    if mv "$file.tmp" "$file"; then
        rm "$file.backup"
        echo -e "${GREEN}✅ Added header: $file${NC}"
        ((PROCESSED++))
    else
        mv "$file.backup" "$file"
        echo -e "${RED}❌ Error processing: $file${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Process TypeScript and JavaScript files in src/
echo -e "${BLUE}Processing source files...${NC}"
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 | \
while IFS= read -r -d '' file; do
    add_header "$file"
done

# Process configuration files
echo -e "\n${BLUE}Processing configuration files...${NC}"
CONFIG_FILES=(
    "vite.config.ts"
    "tailwind.config.js" 
    "postcss.config.js"
    "eslint.config.js"
    "vitest.config.ts"
)

for config_file in "${CONFIG_FILES[@]}"; do
    if [[ -f "$config_file" ]]; then
        add_header "$config_file"
    else
        echo -e "${YELLOW}⏭️  Config file not found: $config_file${NC}"
    fi
done

# Summary
echo -e "\n${BLUE}Summary:${NC}"
echo -e "${GREEN}✅ Processed: $PROCESSED files${NC}"
echo -e "${YELLOW}⏭️  Skipped: $SKIPPED files${NC}"
echo -e "${RED}❌ Errors: $ERRORS files${NC}"

if [[ $ERRORS -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All files processed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some files had errors. Please check the output above.${NC}"
    exit 1
fi
