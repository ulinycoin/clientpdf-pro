/**
 * File helper utilities for PDF processing
 */

export function createFileName(baseName: string, suffix: string, extension: string = 'pdf'): string {
  // Remove existing extension if present
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
  
  // Add suffix and new extension
  return `${nameWithoutExt}_${suffix}.${extension}`;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function generateFilename(originalName: string, suffix: string, extension?: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  // ✅ ИСПРАВЛЕНО: правильная обработка extension параметра
  const ext = extension !== undefined ? extension : (originalName.split('.').pop() || 'pdf');
  return `${baseName}_${suffix}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}