const DEFAULT_BILLING_PATH = '/pricing';

export function resolveBillingDestination(rawValue: string | undefined): string {
  const value = rawValue?.trim();
  if (!value) {
    return DEFAULT_BILLING_PATH;
  }
  return value;
}

export function openBillingPlans(rawValue: string | undefined): string {
  const destination = resolveBillingDestination(rawValue);
  if (typeof window === 'undefined') {
    return destination;
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(destination);
  if (isAbsoluteUrl) {
    window.open(destination, '_blank', 'noopener,noreferrer');
    return destination;
  }

  window.location.assign(destination);
  return destination;
}
