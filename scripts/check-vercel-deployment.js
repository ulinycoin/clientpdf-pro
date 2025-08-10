#!/usr/bin/env node

// Скрипт для диагностики проблем с Vercel deployment

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkVercelDeployment() {
  log('🔍 Vercel Deployment Diagnostic', 'blue');
  log('================================', 'blue');
  log('');

  log('📋 Возможные причины почему не деплоится автоматически:', 'yellow');
  log('');
  
  log('1. 🔗 Проект не связан с Vercel:', 'red');
  log('   • Зайдите на https://vercel.com/dashboard', 'reset');
  log('   • Нажмите "Add New..." → "Project"', 'reset');
  log('   • Выберите репозиторий: ulinycoin/clientpdf-pro', 'reset');
  log('   • Настройте автодеплой для main ветки', 'reset');
  log('');
  
  log('2. 🚫 Отключен автодеплой:', 'red');
  log('   • В настройках Vercel проекта', 'reset');
  log('   • Git → Auto-deploy должно быть включено', 'reset');
  log('   • Production Branch = main', 'reset');
  log('');
  
  log('3. ⚠️  Build ошибки:', 'red');
  log('   • TypeScript ошибки могут блокировать деплой', 'reset');
  log('   • Проверьте логи билда в Vercel Dashboard', 'reset');
  log('   • Наш проект использует SKIP_TYPE_CHECK=1 в build', 'reset');
  log('');
  
  log('4. 🔑 Права доступа:', 'red');
  log('   • Vercel должен иметь доступ к GitHub репозиторию', 'reset');
  log('   • Проверьте GitHub Apps → Vercel permissions', 'reset');
  log('');
  
  log('🛠️  Что можно сделать прямо сейчас:', 'green');
  log('');
  
  log('1. Ручной деплой через Vercel CLI:', 'blue');
  log('   npm install -g vercel', 'reset');
  log('   vercel --prod', 'reset');
  log('');
  
  log('2. Проверить текущий билд локально:', 'blue');
  log('   npm run build', 'reset');
  log('   npm run preview', 'reset');
  log('');
  
  log('3. Форсить новый коммит:', 'blue');
  log('   git commit --allow-empty -m "trigger: force Vercel redeploy"', 'reset');
  log('   git push origin main', 'reset');
  log('');
  
  log('📊 Информация о проекте:', 'yellow');
  log(`   Repository: https://github.com/ulinycoin/clientpdf-pro`, 'reset');
  log(`   Branch: main`, 'reset');
  log(`   Last commit: 992c304`, 'reset');
  log(`   Files ready: ✅ vercel.json configured`, 'reset');
  log(`   Build command: npm run build`, 'reset');
  log(`   Output directory: dist`, 'reset');
  log('');
  
  log('🚨 Если ничего не помогает:', 'red');
  log('   1. Удалите проект из Vercel', 'reset');
  log('   2. Создайте заново и импортируйте репозиторий', 'reset');
  log('   3. Убедитесь что выбрана правильная ветка (main)', 'reset');
  log('');
  
  log('📞 Полезные ссылки:', 'green');
  log('   • Vercel Dashboard: https://vercel.com/dashboard', 'reset');
  log('   • GitHub Repository: https://github.com/ulinycoin/clientpdf-pro', 'reset');
  log('   • Deployment Logs: https://vercel.com/[username]/[project]/deployments', 'reset');
}

checkVercelDeployment();