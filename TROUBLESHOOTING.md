# 🛠️ CSV to PDF Troubleshooting Guide

This guide helps resolve common issues when converting CSV files to PDF, especially with Unicode characters (Russian, Latvian, Chinese, etc.).

## 🚨 Common Error: "Cannot read properties of undefined (reading 'widths')"

This error occurs when the PDF generator encounters font compatibility issues, especially with Unicode text.

### ✅ Quick Solutions

#### 1. **Enable Robust Mode** (Recommended)
- Go to **Style** tab → **Generator Settings**
- ✅ Check "Use Robust Generator"
- ✅ Check "Enable Error Recovery"
- Click **Refresh Preview**

#### 2. **Use Safe Font Settings**
- **Font Family**: Choose "Helvetica" or "Times Roman"
- **Font Size**: Reduce to 7pt or lower
- **Page Size**: Use "Legal" for wide tables

#### 3. **Check Your Data**
- Remove special characters if possible
- Use English headers when possible
- Test with a smaller sample first

## 🌍 Unicode and International Characters

### Supported Languages
- ✅ **Cyrillic**: Русский (Russian)
- ✅ **Baltic**: Latviešu (Latvian), Lietuvių (Lithuanian)
- ✅ **European**: Deutsch, Français, Español, Polski
- ⚠️ **Asian**: Chinese, Japanese (limited support, will be transliterated)

### What Happens to Unicode Text
1. **Robust Generator Available**: Best Unicode support
2. **Fallback Mode**: Unicode characters are transliterated to ASCII
   - Russian: `Привет` → `Privet`
   - Latvian: `Būvēt` → `Buvet`
   - Chinese: `你好` → `Ni Hao` (phonetic)

## 🔧 Step-by-Step Troubleshooting

### Step 1: Check Generator Status
Look for status indicators in the top-right corner:
- 🟢 **Robust Mode**: Best compatibility
- 🟡 **Fallback Mode**: Limited Unicode support
- 🔵 **Unicode**: Unicode characters detected

### Step 2: If Preview Fails
1. **Try Robust Mode**: Enable in Style tab
2. **Use Safe Settings**: Click the "Use Safe Settings" button
3. **Reduce Complexity**:
   - Smaller font size (6-7pt)
   - Fewer columns per page
   - Portrait orientation for wide data

### Step 3: For Large Datasets
- **Rows > 1000**: Automatic optimization
- **Columns > 15**: Use landscape + smaller font
- **File > 10MB**: Will be split into multiple PDFs

## 🎯 Best Practices

### Before Upload
- ✅ Remove unnecessary special characters
- ✅ Use consistent data formatting
- ✅ Test with a small sample (first 100 rows)

### Font Selection Guide
| Content Type | Recommended Font | Notes |
|--------------|------------------|-------|
| English only | Helvetica | Fast, reliable |
| Mixed languages | Times Roman | Better Unicode support |
| Tables/Data | Courier | Monospace, consistent width |
| Auto-detect | Auto-select | Analyzes content automatically |

### Page Layout Tips
| Data Type | Orientation | Page Size | Font Size |
|-----------|-------------|-----------|-----------|
| Wide tables (10+ columns) | Landscape | Legal | 6-7pt |
| Narrow tables (< 10 columns) | Portrait | A4 | 8-10pt |
| Large datasets (1000+ rows) | Landscape | Legal | 6pt |

## 🚑 Emergency Recovery

### If All Generators Fail
The system will create an **emergency PDF** with:
- Error details
- Data summary (row/column count)
- Troubleshooting suggestions
- Contact information

### Generator Fallback Chain
1. 🔧 **Robust Generator** (handles Unicode safely)
2. 🔄 **Optimized Generator** (for large data)
3. 📋 **Standard Generator** (basic functionality)
4. 🚨 **Emergency PDF** (error information)

## 🐛 Specific Error Solutions

### "Font widths not available"
```
✅ Solution: Enable Robust Generator
Settings → Use Robust Generator ✓
```

### "Memory error" or "Data too large"
```
✅ Solutions:
1. Reduce font size to 6pt
2. Use fewer columns
3. Split data into smaller files
```

### "Unicode characters not displaying"
```
✅ Solutions:
1. Check if Robust Mode is enabled
2. Accept transliteration for better compatibility
3. Use Times Roman font
```

### Preview shows blank/empty PDF
```
✅ Solutions:
1. Refresh browser
2. Check CSV data has content
3. Try different browser (Chrome recommended)
```

## 📞 Getting Additional Help

### Before Contacting Support
1. **Check Generator Status**: Note which mode is active
2. **Test with Sample**: Try with a small, simple CSV
3. **Browser Info**: Note your browser version
4. **Error Details**: Screenshot of any error messages

### Information to Include
- CSV file characteristics (rows, columns, languages)
- Browser and version
- Generator mode used (robust/fallback)
- Specific error message
- Screenshots of the issue

### Contact Options
- GitHub Issues: Report bugs and feature requests
- Documentation: Check latest updates in README
- Community: User discussions and tips

## 🔄 Regular Maintenance

### Keep Your Data Clean
- Remove empty rows/columns
- Use consistent formatting
- Avoid mixing languages in single cells

### Browser Optimization
- Use Chrome or Firefox for best compatibility
- Enable JavaScript
- Clear cache if experiencing issues
- Ensure PDF plugins are enabled

## 📚 Advanced Tips

### For Developers
```typescript
// Test font compatibility programmatically
const compatibility = await CsvToPdfConverter.testFontCompatibility();
if (!compatibility.robust) {
  // Use fallback settings
  options.useRobustGenerator = false;
  options.enableErrorRecovery = true;
}
```

### Custom Font Handling
```typescript
// Force safe mode for production
const safeOptions = {
  useRobustGenerator: true,
  enableErrorRecovery: true,
  fontFamily: 'helvetica',
  fontSize: 7
};
```

---

## 💡 Pro Tips

1. **Always enable Error Recovery** for production use
2. **Test with your actual data** before batch processing
3. **Use Robust Mode** by default for international content
4. **Keep font size at 7pt or below** for large tables
5. **Legal page size** works best for wide CSV data

---

*This guide is updated regularly. For the latest information, check the project README and releases.*
