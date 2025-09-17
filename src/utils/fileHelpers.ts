/**
 * Unified file utilities for PDF processing
 * Consolidates and standardizes all file operations
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileSizeFormatOptions {
  precision?: number;
  units?: 'binary' | 'decimal';
}

export interface FileDownloadOptions {
  mimeType?: string;
  autoRevoke?: boolean;
}

/**
 * Formats file size in human-readable format
 *
 * @param bytes - The size in bytes to format
 * @param options - Formatting options including precision and unit system
 * @param options.precision - Number of decimal places (default: 1)
 * @param options.units - Unit system to use: 'binary' (1024-based) or 'decimal' (1000-based) (default: 'binary')
 * @returns Human-readable file size string (e.g., "1.5 MB", "2.3 KB")
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // "1.0 KB"
 * formatFileSize(1536, { precision: 2 }) // "1.50 KB"
 * formatFileSize(1000, { units: 'decimal' }) // "1.0 kB"
 * ```
 */
export function formatFileSize(
  bytes: number,
  options: FileSizeFormatOptions = {}
): string {
  const { precision = 1, units = 'binary' } = options;

  if (bytes === 0) return '0 B';

  const k = units === 'binary' ? 1024 : 1000;
  const sizes = units === 'binary'
    ? ['B', 'KB', 'MB', 'GB', 'TB']
    : ['B', 'kB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(precision)} ${sizes[i]}`;
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = ['application/pdf'],
  maxSize: number = 100 * 1024 * 1024 // 100MB
): FileValidationResult {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    };
  }

  // Additional PDF-specific validation
  if (file.type === 'application/pdf') {
    // Check if file starts with PDF signature
    return new Promise<FileValidationResult>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uint8Array = new Uint8Array(e.target?.result as ArrayBuffer);
        const header = Array.from(uint8Array.slice(0, 4))
          .map(byte => String.fromCharCode(byte))
          .join('');

        if (header === '%PDF') {
          resolve({ isValid: true });
        } else {
          resolve({
            isValid: false,
            error: 'File does not appear to be a valid PDF document'
          });
        }
      };
      reader.onerror = () => {
        resolve({
          isValid: false,
          error: 'Could not read file for validation'
        });
      };
      reader.readAsArrayBuffer(file.slice(0, 4));
    }) as any; // Type assertion for backward compatibility
  }

  return { isValid: true };
}

/**
 * Generates a safe filename with suffix, sanitizing invalid characters
 *
 * @param originalName - The original filename to base the new name on
 * @param suffix - Suffix to append to the filename (e.g., 'compressed', 'merged')
 * @param extension - Optional extension to use instead of original (e.g., 'pdf', 'docx')
 * @returns Sanitized filename with suffix applied
 *
 * @example
 * ```typescript
 * generateFilename('my document.pdf', 'compressed') // "my_document_compressed.pdf"
 * generateFilename('report.docx', 'converted', 'pdf') // "report_converted.pdf"
 * generateFilename('file<>name.pdf', 'cleaned') // "file__name_cleaned.pdf"
 * ```
 */
export function generateFilename(
  originalName: string,
  suffix: string,
  extension?: string
): string {
  // Remove path components for security
  const safeName = originalName.replace(/^.*[\\\/]/, '');

  // Extract base name and extension
  const lastDotIndex = safeName.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? safeName.substring(0, lastDotIndex) : safeName;
  const originalExt = lastDotIndex > 0 ? safeName.substring(lastDotIndex + 1) : 'pdf';

  // Use provided extension or original
  const finalExtension = extension || originalExt;

  // Sanitize filename
  const sanitizedBaseName = baseName
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length

  const sanitizedSuffix = suffix
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_');

  return `${sanitizedBaseName}_${sanitizedSuffix}.${finalExtension}`;
}

/**
 * Download blob as file with proper cleanup
 */
export function downloadBlob(
  blob: Blob,
  filename: string,
  options: FileDownloadOptions = {}
): void {
  const { mimeType, autoRevoke = true } = options;

  // Create blob with specified MIME type if provided
  const finalBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;

  // Create download URL
  const url = URL.createObjectURL(finalBlob);

  try {
    // Create temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // Use filename directly
    link.style.display = 'none';

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } finally {
    // Clean up object URL
    if (autoRevoke) {
      // Delay revocation to ensure download starts
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }
}

/**
 * Download multiple files as separate downloads
 */
export function downloadMultipleBlobs(
  blobs: Array<{ blob: Blob; filename: string }>,
  options: FileDownloadOptions = {}
): void {
  blobs.forEach(({ blob, filename }, index) => {
    // Stagger downloads to avoid browser blocking
    setTimeout(() => {
      downloadBlob(blob, filename, options);
    }, index * 100);
  });
}

/**
 * Create a unique identifier for file operations
 */
export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file extension from filename or MIME type
 */
export function getFileExtension(filename: string, mimeType?: string): string {
  // Try to get extension from filename first
  const match = filename.match(/\.([^.]+)$/);
  if (match) {
    return match[1].toLowerCase();
  }

  // Fallback to MIME type mapping
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };

  return mimeType ? (mimeToExt[mimeType] || 'bin') : 'bin';
}

/**
 * Check if file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' ||
         file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Check if file is an image
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/') ||
         /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name);
}

/**
 * Check if file is a Word document
 */
export function isWordDocument(file: File): boolean {
  return file.type === 'application/msword' ||
         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
         /\.(doc|docx)$/i.test(file.name);
}

/**
 * Get total size of multiple files
 */
export function getTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Sort files by various criteria
 */
export function sortFiles(
  files: File[],
  criteria: 'name' | 'size' | 'date' = 'name',
  ascending: boolean = true
): File[] {
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;

    switch (criteria) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
        comparison = a.lastModified - b.lastModified;
        break;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Remove duplicate files based on name and size
 */
export function removeDuplicateFiles(files: File[]): File[] {
  const seen = new Set<string>();
  return files.filter(file => {
    const key = `${file.name}-${file.size}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Create a file preview info object
 */
export interface FilePreview {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  extension: string;
  lastModified: Date;
  isValid: boolean;
  validationError?: string;
}

export function createFilePreview(file: File): FilePreview {
  const validation = validateFile(file);

  return {
    id: generateFileId(),
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    type: file.type,
    extension: getFileExtension(file.name, file.type),
    lastModified: new Date(file.lastModified),
    isValid: validation.isValid,
    validationError: validation.error
  };
}

/**
 * Create a simple ZIP file from multiple blobs (browser-based)
 */
export async function createZipFromBlobs(
  files: Array<{ blob: Blob; filename: string }>,
  zipFilename: string
): Promise<Blob> {
  // Simple ZIP implementation for browser
  // This creates a basic ZIP structure without compression

  const zipParts: Uint8Array[] = [];
  const centralDirectoryEntries: Uint8Array[] = [];
  let offset = 0;

  for (const { blob, filename } of files) {
    const fileData = new Uint8Array(await blob.arrayBuffer());
    const filenameBytes = new TextEncoder().encode(filename);

    // Local file header
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(localHeader.buffer);

    // Local file header signature
    view.setUint32(0, 0x04034b50, true);
    // Version needed to extract
    view.setUint16(4, 20, true);
    // General purpose bit flag
    view.setUint16(6, 0, true);
    // Compression method (0 = no compression)
    view.setUint16(8, 0, true);
    // File last modification time
    view.setUint16(10, 0, true);
    // File last modification date
    view.setUint16(12, 0, true);
    // CRC-32 (simplified)
    view.setUint32(14, 0, true);
    // Compressed size
    view.setUint32(18, fileData.length, true);
    // Uncompressed size
    view.setUint32(22, fileData.length, true);
    // File name length
    view.setUint16(26, filenameBytes.length, true);
    // Extra field length
    view.setUint16(28, 0, true);

    // Copy filename
    localHeader.set(filenameBytes, 30);

    zipParts.push(localHeader);
    zipParts.push(fileData);

    // Central directory entry
    const centralEntry = new Uint8Array(46 + filenameBytes.length);
    const centralView = new DataView(centralEntry.buffer);

    centralView.setUint32(0, 0x02014b50, true); // Central directory signature
    centralView.setUint16(4, 20, true); // Version made by
    centralView.setUint16(6, 20, true); // Version needed
    centralView.setUint16(8, 0, true); // General purpose bit flag
    centralView.setUint16(10, 0, true); // Compression method
    centralView.setUint16(12, 0, true); // Last mod time
    centralView.setUint16(14, 0, true); // Last mod date
    centralView.setUint32(16, 0, true); // CRC-32
    centralView.setUint32(20, fileData.length, true); // Compressed size
    centralView.setUint32(24, fileData.length, true); // Uncompressed size
    centralView.setUint16(28, filenameBytes.length, true); // Filename length
    centralView.setUint16(30, 0, true); // Extra field length
    centralView.setUint16(32, 0, true); // Comment length
    centralView.setUint16(34, 0, true); // Disk number
    centralView.setUint16(36, 0, true); // Internal attributes
    centralView.setUint32(38, 0, true); // External attributes
    centralView.setUint32(42, offset, true); // Local header offset

    centralEntry.set(filenameBytes, 46);
    centralDirectoryEntries.push(centralEntry);

    offset += localHeader.length + fileData.length;
  }

  // Central directory
  const centralDirectory = new Uint8Array(
    centralDirectoryEntries.reduce((sum, entry) => sum + entry.length, 0)
  );
  let centralOffset = 0;
  for (const entry of centralDirectoryEntries) {
    centralDirectory.set(entry, centralOffset);
    centralOffset += entry.length;
  }

  // End of central directory
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true); // End signature
  endView.setUint16(4, 0, true); // Disk number
  endView.setUint16(6, 0, true); // Central directory disk
  endView.setUint16(8, files.length, true); // Number of entries on disk
  endView.setUint16(10, files.length, true); // Total number of entries
  endView.setUint32(12, centralDirectory.length, true); // Central directory size
  endView.setUint32(16, offset, true); // Central directory offset
  endView.setUint16(20, 0, true); // Comment length

  // Combine all parts
  const totalLength = zipParts.reduce((sum, part) => sum + part.length, 0) +
                     centralDirectory.length + endRecord.length;
  const zipData = new Uint8Array(totalLength);

  let zipOffset = 0;
  for (const part of zipParts) {
    zipData.set(part, zipOffset);
    zipOffset += part.length;
  }
  zipData.set(centralDirectory, zipOffset);
  zipOffset += centralDirectory.length;
  zipData.set(endRecord, zipOffset);

  return new Blob([zipData], { type: 'application/zip' });
}

// Legacy aliases for backward compatibility
export const downloadFile = downloadBlob;
export const createFileName = generateFilename;
