interface CodedErrorLike {
  code?: unknown;
  name?: unknown;
}

export function isVfsQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return true;
  }
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const typed = error as CodedErrorLike;
  return typed.code === 'VFS_QUOTA_EXCEEDED' || typed.name === 'VfsQuotaExceededError';
}
