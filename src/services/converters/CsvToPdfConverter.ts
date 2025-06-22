  /**
   * Валидация CSV файла
   */
  static validateCSV(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    const validExtensions = ['.csv', '.txt', '.tsv'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`Invalid file type. Supported: ${validExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }