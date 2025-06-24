# 🚀 ClientPDF Pro - Development Setup

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

## 🔧 Troubleshooting

### MIME Type Issues
If you see MIME type errors during development:

1. **Clear node_modules and cache:**
   ```bash
   npm run clean
   npm install --legacy-peer-deps
   ```

2. **Check file permissions:**
   ```bash
   chmod +x node_modules/.bin/*
   ```

3. **Restart development server:**
   ```bash
   npm run dev
   ```

### Missing Dependencies
Ensure you're using the correct Node.js version:
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 8.0.0
```

## 📁 Project Structure
```
src/
├── components/     # Atomic Design components
├── pages/          # Page components
├── services/       # PDF processing services
├── hooks/          # Custom React hooks
└── utils/          # Helper functions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - TypeScript check
- `npm run lint` - ESLint check

## 📝 Development Notes

- Use `--legacy-peer-deps` flag for npm install
- Vite version is locked to 4.5.0 for stability
- All PDF processing happens client-side
- No server uploads required - privacy first!
