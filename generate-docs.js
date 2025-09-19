#!/usr/bin/env node
/**
 * LocalPDF Documentation Generator
 * Автоматически создает актуальную документацию проекта
 * Inspired by Context7
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalPDFDocsGenerator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.docs = {
      overview: {},
      api: {},
      components: {},
      tools: {},
      libraries: {},
      multilingual: {}
    };
  }

  /**
   * Анализирует package.json и извлекает информацию о библиотеках
   */
  analyzePackageJson() {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      this.docs.overview = {
        name: packageData.name,
        version: packageData.version,
        description: packageData.description,
        homepage: packageData.homepage,
        repository: packageData.repository,
        keywords: packageData.keywords
      };

      // Анализируем ключевые зависимости
      const keyLibraries = {
        'pdf-lib': 'Core PDF manipulation library',
        'pdfjs-dist': 'PDF.js for rendering and text extraction', 
        'tesseract.js': 'OCR functionality for PDF text recognition',
        'jspdf': 'PDF generation capabilities',
        'react': 'UI framework',
        'react-router-dom': 'Routing for multilingual support',
        'tailwindcss': 'Styling framework with glassmorphism design',
        'vite': 'Build tool and development server'
      };

      this.docs.libraries = Object.entries(packageData.dependencies)
        .filter(([name]) => keyLibraries[name])
        .map(([name, version]) => ({
          name,
          version,
          description: keyLibraries[name],
          usage: this.getLibraryUsage(name)
        }));

      return this.docs;
    } catch (error) {
      console.error('Error analyzing package.json:', error);
      return null;
    }
  }

  /**
   * Определяет как используется библиотека в проекте
   */
  getLibraryUsage(libraryName) {
    const usageMap = {
      'pdf-lib': {
        purpose: 'PDF document creation, manipulation, merging, splitting',
        files: ['src/services/pdfService.ts'],
        features: ['Merge PDFs', 'Split PDFs', 'Add text', 'Watermarks', 'Password protection']
      },
      'pdfjs-dist': {
        purpose: 'PDF rendering, text extraction, image extraction',
        files: ['src/workers/', 'src/services/'],
        features: ['PDF to Image conversion', 'Text extraction', 'Page rendering']
      },
      'tesseract.js': {
        purpose: 'OCR functionality for scanned PDFs',
        files: ['src/pages/tools/OCRPDFPage.tsx'],
        features: ['Text recognition from images', 'Multiple language support']
      },
      'react': {
        purpose: 'UI framework for all components',
        files: ['src/components/', 'src/pages/'],
        features: ['Component architecture', 'State management', 'Multilingual UI']
      },
      'tailwindcss': {
        purpose: 'Styling with glassmorphism design',
        files: ['src/index.css', 'tailwind.config.js'],
        features: ['Responsive design', 'Dark mode', 'Modern aesthetics']
      }
    };

    return usageMap[libraryName] || { purpose: 'Library usage not documented', files: [], features: [] };
  }

  /**
   * Анализирует структуру компонентов
   */
  analyzeComponents() {
    try {
      const componentsPath = path.join(this.projectRoot, 'src/components');
      const directories = ['atoms', 'molecules', 'organisms', 'templates'];
      
      this.docs.components = directories.map(dir => {
        const dirPath = path.join(componentsPath, dir);
        if (!fs.existsSync(dirPath)) return null;
        
        const files = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.tsx'))
          .map(file => ({
            name: file.replace('.tsx', ''),
            path: `src/components/${dir}/${file}`,
            type: dir
          }));
        
        return {
          category: dir,
          description: this.getComponentCategoryDescription(dir),
          components: files
        };
      }).filter(Boolean);

      return this.docs.components;
    } catch (error) {
      console.error('Error analyzing components:', error);
      return [];
    }
  }

  getComponentCategoryDescription(category) {
    const descriptions = {
      atoms: 'Basic UI elements (buttons, inputs, icons)',
      molecules: 'Simple combinations of atoms (upload zones, file lists)', 
      organisms: 'Complex UI sections (PDF tools, navigation)',
      templates: 'Page layouts and structures'
    };
    return descriptions[category] || 'Component category';
  }

  /**
   * Анализирует PDF инструменты
   */
  analyzeTools() {
    try {
      const toolsPath = path.join(this.projectRoot, 'src/pages/tools');
      const toolFiles = fs.readdirSync(toolsPath)
        .filter(file => file.endsWith('Page.tsx'));

      this.docs.tools = toolFiles.map(file => {
        const toolName = file.replace('Page.tsx', '').replace(/([A-Z])/g, ' $1').trim();
        const slug = file.replace('Page.tsx', '').toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
        
        return {
          name: toolName,
          slug: slug,
          file: file,
          path: `src/pages/tools/${file}`,
          description: this.getToolDescription(slug),
          multilingual: true,
          urls: this.generateToolUrls(slug)
        };
      });

      return this.docs.tools;
    } catch (error) {
      console.error('Error analyzing tools:', error);
      return [];
    }
  }

  getToolDescription(slug) {
    const descriptions = {
      'merge-p-d-f': 'Combine multiple PDF files into one document',
      'split-p-d-f': 'Split PDF into separate pages or ranges',
      'compress-p-d-f': 'Reduce PDF file size while maintaining quality',
      'add-text-p-d-f': 'Add custom text overlays to PDF pages',
      'watermark-p-d-f': 'Add watermarks for document protection',
      'rotate-p-d-f': 'Rotate PDF pages in any direction',
      'extract-pages-p-d-f': 'Extract specific pages from PDF',
      'extract-text-p-d-f': 'Extract text content from PDF files',
      'o-c-r-p-d-f': 'Optical Character Recognition for scanned PDFs',
      'p-d-f-to-image': 'Convert PDF pages to image files',
      'images-to-p-d-f': 'Create PDF from multiple images',
      'word-to-p-d-f': 'Convert Word documents to PDF format',
      'excel-to-p-d-f': 'Convert Excel spreadsheets to PDF',
      'protect-p-d-f': 'Add password protection to PDF files'
    };
    return descriptions[slug] || 'PDF processing tool';
  }

  generateToolUrls(slug) {
    const languages = ['en', 'de', 'fr', 'es', 'ru'];
    const cleanSlug = slug.replace(/-p-d-f$/, '-pdf').replace(/-([a-z])/g, (match, letter) => `-${letter}`);
    
    return languages.map(lang => {
      const url = lang === 'en' 
        ? `https://localpdf.online/${cleanSlug}`
        : `https://localpdf.online/${lang}/${cleanSlug}`;
      return { language: lang, url };
    });
  }

  /**
   * Анализирует мультиязычную поддержку
   */
  analyzeMultilingual() {
    try {
      const localesPath = path.join(this.projectRoot, 'src/locales');
      const languages = fs.readdirSync(localesPath).filter(dir => 
        fs.statSync(path.join(localesPath, dir)).isDirectory()
      );

      this.docs.multilingual = {
        supportedLanguages: languages,
        defaultLanguage: 'en',
        totalTranslations: languages.length * this.docs.tools.length,
        structure: languages.map(lang => ({
          code: lang,
          name: this.getLanguageName(lang),
          toolsTranslated: this.docs.tools.length,
          exampleUrl: lang === 'en' ? 'https://localpdf.online/' : `https://localpdf.online/${lang}/`
        }))
      };

      return this.docs.multilingual;
    } catch (error) {
      console.error('Error analyzing multilingual support:', error);
      return {};
    }
  }

  getLanguageName(code) {
    const names = {
      en: 'English',
      de: 'Deutsch (German)',
      fr: 'Français (French)', 
      es: 'Español (Spanish)',
      ru: 'Русский (Russian)'
    };
    return names[code] || code.toUpperCase();
  }

  /**
   * Генерирует полную документацию
   */
  generateFullDocs() {
    console.log('🔍 Analyzing LocalPDF project...');
    
    this.analyzePackageJson();
    this.analyzeComponents();
    this.analyzeTools();
    this.analyzeMultilingual();

    const documentation = {
      meta: {
        generatedAt: new Date().toISOString(),
        generator: 'LocalPDF Documentation Generator v1.0',
        inspired: 'Context7 by Upstash'
      },
      ...this.docs
    };

    return documentation;
  }

  /**
   * Генерирует Markdown документацию
   */
  generateMarkdownDocs() {
    const docs = this.generateFullDocs();
    
    let markdown = `# ${docs.overview.name} - Documentation\n\n`;
    markdown += `> ${docs.overview.description}\n\n`;
    markdown += `**Version:** ${docs.overview.version}  \n`;
    markdown += `**Homepage:** [${docs.overview.homepage}](${docs.overview.homepage})  \n`;
    markdown += `**Repository:** [GitHub](${docs.overview.repository.url})\n\n`;

    // Overview
    markdown += `## 🌟 Overview\n\n`;
    markdown += `LocalPDF is a privacy-first PDF toolkit with ${docs.tools.length} tools supporting ${docs.multilingual.supportedLanguages.length} languages.\n\n`;

    // Tools
    markdown += `## 🛠️ PDF Tools (${docs.tools.length} total)\n\n`;
    docs.tools.forEach(tool => {
      markdown += `### ${tool.name}\n`;
      markdown += `- **Description:** ${tool.description}\n`;
      markdown += `- **File:** \`${tool.path}\`\n`;
      markdown += `- **Multilingual:** ${tool.multilingual ? '✅ Yes' : '❌ No'}\n`;
      markdown += `- **URLs:** ${tool.urls.length} language versions\n\n`;
    });

    // Libraries
    markdown += `## 📚 Key Libraries\n\n`;
    docs.libraries.forEach(lib => {
      markdown += `### ${lib.name} (${lib.version})\n`;
      markdown += `${lib.description}\n\n`;
      markdown += `**Purpose:** ${lib.usage.purpose}\n\n`;
      if (lib.usage.features.length > 0) {
        markdown += `**Features:**\n${lib.usage.features.map(f => `- ${f}`).join('\n')}\n\n`;
      }
    });

    // Multilingual
    markdown += `## 🌍 Multilingual Support\n\n`;
    markdown += `**Supported Languages:** ${docs.multilingual.supportedLanguages.join(', ')}\n\n`;
    docs.multilingual.structure.forEach(lang => {
      markdown += `- **${lang.name}** (\`${lang.code}\`): [${lang.exampleUrl}](${lang.exampleUrl})\n`;
    });

    markdown += `\n**Total Translations:** ${docs.multilingual.totalTranslations} (${docs.tools.length} tools × ${docs.multilingual.supportedLanguages.length} languages)\n\n`;

    // Architecture
    markdown += `## 🏗️ Architecture\n\n`;
    markdown += `### Component Structure\n`;
    docs.components.forEach(category => {
      markdown += `**${category.category.toUpperCase()}** (${category.components.length} components)  \n`;
      markdown += `${category.description}\n\n`;
    });

    // AI Optimization
    markdown += `## 🤖 AI-First Optimization\n\n`;
    markdown += `LocalPDF is optimized for AI discovery with:\n`;
    markdown += `- Structured data for better AI understanding\n`;
    markdown += `- Clear component hierarchy\n`;
    markdown += `- Semantic HTML and accessibility\n`;
    markdown += `- Privacy-first messaging that resonates with AI systems\n\n`;

    markdown += `---\n\n`;
    markdown += `*Documentation generated on ${docs.meta.generatedAt}*\n`;

    return markdown;
  }

  /**
   * Сохраняет документацию в файл
   */
  saveDocs(outputPath = 'localpdf-docs.json') {
    const docs = this.generateFullDocs();
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2));
      console.log(`✅ Documentation saved to ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error saving documentation:', error);
      return null;
    }
  }

  /**
   * Сохраняет Markdown документацию
   */
  saveMarkdownDocs(outputPath = 'LocalPDF-Documentation.md') {
    const markdown = this.generateMarkdownDocs();
    
    try {
      fs.writeFileSync(outputPath, markdown);
      console.log(`📝 Markdown documentation saved to ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error saving markdown documentation:', error);
      return null;
    }
  }
}

// Запуск если вызывается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectRoot = process.cwd();
  const generator = new LocalPDFDocsGenerator(projectRoot);
  
  console.log('🚀 Starting LocalPDF Documentation Generation...');
  console.log(`📁 Project root: ${projectRoot}`);
  
  // Генерируем оба формата
  generator.saveDocs('localpdf-docs.json');
  generator.saveMarkdownDocs('LocalPDF-Documentation.md');
  
  console.log('✨ Documentation generation complete!');
}
