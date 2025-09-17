/**
 * Russian translations for PDF Protection tool
 */

export const protect = {
  // Basic properties for tools grid
  title: 'Защитить PDF',
  description: 'Добавить защиту паролем и ограничения безопасности к PDF файлам',
  
  // Main page elements
  pageTitle: "Защитить PDF паролем",
  pageDescription: "Добавьте защиту паролем и ограничения безопасности к вашим PDF-документам для повышенной конфиденциальности и контроля",
  breadcrumb: "Защитить PDF",
  
  // Tool interface
  uploadTitle: "Выберите PDF для защиты",
  uploadSubtitle: "Перетащите ваш PDF сюда или нажмите для выбора",
  supportedFormats: "Поддерживает PDF файлы до 100МБ",
  
  // Password fields
  userPassword: "Пароль для открытия документа",
  confirmPassword: "Подтвердите пароль",
  ownerPassword: "Пароль для изменения разрешений (опционально)",
  passwordPlaceholder: "Введите надежный пароль",
  confirmPlaceholder: "Повторно введите ваш пароль",
  
  // Encryption settings
  encryptionLevel: "Уровень шифрования",
  encryption128: "128-бит AES (Стандартный)",
  encryption256: "256-бит AES (Высокая безопасность)",
  
  // Security presets
  securityPresets: "Предустановки безопасности",
  presetBasic: "Базовая защита",
  presetBasicDesc: "Защита паролем с базовыми ограничениями",
  presetBusiness: "Деловой документ",
  presetBusinessDesc: "Профессиональная безопасность документа",
  presetConfidential: "Конфиденциальный",
  presetConfidentialDesc: "Максимальные ограничения безопасности",
  presetCustom: "Пользовательские настройки",
  presetCustomDesc: "Настроить все опции вручную",
  
  // Permissions section
  permissions: "Ограничения документа",
  permissionsDesc: "Контролируйте, что пользователи могут делать с защищенным документом",
  advancedPermissions: "Расширенные разрешения",
  
  // Permission types with descriptions
  permissionPrinting: "Печать",
  permissionPrintingDesc: "Контроль разрешений печати",
  permissionCopying: "Копирование текста",
  permissionCopyingDesc: "Разрешить выделение и копирование текста",
  permissionModifying: "Редактирование документа",
  permissionModifyingDesc: "Разрешить изменение документа",
  permissionAnnotating: "Комментарии и аннотации",
  permissionAnnotatingDesc: "Разрешить добавление комментариев и разметки",
  permissionFillingForms: "Заполнение форм",
  permissionFillingFormsDesc: "Разрешить заполнение интерактивных форм",
  permissionDocumentAssembly: "Извлечение страниц",
  permissionDocumentAssemblyDesc: "Разрешить вставку, удаление и поворот страниц",
  permissionContentAccessibility: "Доступ программ чтения с экрана",
  permissionContentAccessibilityDesc: "Разрешить инструменты доступности (рекомендуется)",
  
  // Security note
  securityNoteTitle: "Примечание о безопасности",
  securityNoteDesc: "Эти ограничения соблюдаются PDF-просмотрщиками, которые следуют стандарту PDF. Они обеспечивают разумную защиту, но не следует полагаться на них для особо чувствительных документов.",
  
  // Permission types
  printing: "Печать",
  printingNone: "Не разрешена",
  printingLow: "Только низкое разрешение",
  printingHigh: "Высокое разрешение разрешено",
  copying: "Копирование и выделение текста",
  modifying: "Редактирование и изменение документа",
  annotating: "Комментарии и аннотации",
  fillingForms: "Заполнение интерактивных форм",
  contentAccessibility: "Доступ программ чтения с экрана (рекомендуется)",
  documentAssembly: "Извлечение и сборка страниц",
  
  // Progress and status messages
  analyzing: "Анализ безопасности документа...",
  encrypting: "Применение защиты паролем...",
  finalizing: "Завершение создания защищенного документа...",
  complete: "Защита успешно применена!",
  
  // Security info
  securityInfo: "Информация о безопасности документа",
  isProtected: "Этот документ уже защищен паролем",
  noProtection: "Этот документ не имеет защиты паролем",
  
  // Warnings and alerts
  passwordWarning: "⚠️ Важно: Если вы забудете этот пароль, документ невозможно будет восстановить!",
  weakPassword: "Пароль слишком слабый. Рекомендуется использовать:",
  passwordMismatch: "Пароли не совпадают",
  existingProtection: "Этот PDF уже имеет защиту паролем. Вам может потребоваться текущий пароль для изменения.",
  
  // Password strength
  strengthVeryWeak: "Очень слабый",
  strengthWeak: "Слабый",
  strengthFair: "Приемлемый",
  strengthStrong: "Сильный",
  strengthVeryStrong: "Очень сильный",
  
  // Protection modes
  protectionMode: "Режим защиты",
  fullProtection: "Полная защита",
  smartProtection: "Умная защита",
  fullProtectionDesc: "Требует пароль для открытия документа. Максимальная безопасность для конфиденциальных файлов.",
  smartProtectionDesc: "Свободный просмотр, ограниченная печать/копирование. Идеально для обмена документами.",
  passwordProtection: "Защита паролем",
  documentRestrictions: "Ограничения документа",
  realPDFEncryption: "Реальное шифрование PDF",
  securityLevel: "Уровень безопасности",
  simpleView: "Простой вид",
  
  // Optional field labels
  documentPasswordOptional: "Пароль документа (опционально)",
  leaveEmptyForPermissions: "Оставьте пустым для защиты только разрешениями",
  notNeededForPermissions: "Не требуется для защиты разрешениями",

  // Encryption notices
  realPDFEncryptionTitle: "Реальное шифрование PDF",
  realPDFEncryptionDesc: "Этот инструмент применяет стандартное промышленное шифрование PDF, которое работает со всеми PDF-ридерами. Ваш документ будет действительно защищен паролем и ограничен в соответствии с вашими настройками.",
  securityLevelLabel: "Уровень безопасности",
  passwordWillBeRequired: "Ваш PDF потребует пароль для открытия и будет соблюдать все настройки разрешений.",

  // Buttons and actions
  protectButton: "🛡️ Защитить PDF",
  downloadProtected: "Скачать защищенный PDF",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  generatePassword: "Генерировать безопасный пароль",
  toggleAdvanced: "Расширенные настройки",
  applyPreset: "Применить предустановку",
  dismiss: "Скрыть",
  
  // File selection
  selectedFile: "Выбранный файл",
  fileSize: "Размер файла",
  removeFile: "Удалить файл",
  selectNewFile: "Выбрать другой файл",
  
  // Quick steps section
  quickSteps: {
    title: "Как защитить ваш PDF",
    step1: {
      title: "Загрузите ваш PDF",
      description: "Выберите PDF-документ, который хотите защитить"
    },
    step2: {
      title: "Установите надежный пароль",
      description: "Создайте безопасный пароль, который вы запомните"
    },
    step3: {
      title: "Выберите ограничения",
      description: "Настройте, что пользователи могут делать с документом"
    },
    step4: {
      title: "Скачайте защищенный файл",
      description: "Получите ваш защищенный паролем PDF-документ"
    }
  },
  
  // Benefits section
  benefits: {
    title: "Зачем защищать ваши PDF?",
    privacy: {
      title: "Сохранить конфиденциальность информации",
      description: "Предотвратить несанкционированный доступ к чувствительным документам"
    },
    control: {
      title: "Контролировать использование документа",
      description: "Решите, кто может печатать, копировать или редактировать ваш контент"
    },
    compliance: {
      title: "Соответствовать требованиям безопасности",
      description: "Удовлетворить регуляторные и бизнес-стандарты безопасности"
    },
    professional: {
      title: "Профессиональная безопасность документов",
      description: "Добавьте защиту корпоративного уровня к вашим документам"
    }
  },
  
  // File size warnings
  fileSizeWarnings: {
    mediumFile: "Предупреждение о большом файле",
    largeFile: "Предупреждение о очень большом файле",
    criticalFile: "Критическое предупреждение о размере",
    mediumFileDesc: "Этот файл достаточно большой и шифрование может занять 10-30 секунд.",
    largeFileDesc: "Этот файл большой и шифрование может занять 1-2 минуты. Пожалуйста, будьте терпеливы и не закрывайте вкладку браузера.",
    criticalFileDesc: "Этот файл очень большой и шифрование может занять несколько минут. Вкладка браузера может перестать отвечать во время обработки.",
    tips: "Советы:",
    tipCloseOtherTabs: "Закройте другие вкладки браузера для освобождения памяти",
    tipEnsureRAM: "Убедитесь, что на вашем устройстве достаточно RAM",
    tipCompressFirst: "Рассмотрите возможность сжатия PDF сначала"
  },
  
  // Error messages
  errors: {
    fileNotSelected: "Пожалуйста, сначала выберите PDF файл",
    invalidFile: "Недопустимый формат PDF файла",
    passwordRequired: "Требуется пароль",
    passwordTooShort: "Пароль должен содержать не менее 6 символов",
    passwordsDoNotMatch: "Пароли не совпадают",
    encryptionFailed: "Не удалось зашифровать документ",
    fileTooLarge: "Файл слишком большой для шифрования (максимум 100МБ)",
    processingError: "Ошибка обработки PDF. Пожалуйста, попробуйте снова.",
    unsupportedPDF: "Этот формат PDF не поддерживается для шифрования"
  },
  
  // Success messages
  success: {
    protected: "PDF успешно защищен паролем!",
    downloaded: "Защищенный PDF успешно скачан"
  }
};