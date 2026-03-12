import { APP_BASE_PATH, buildAppPath, getAppOriginUrl, resolveAppRoute } from '../../../shared/app-routes';

export function getAppUrl(target?: string) {
  const configuredBase = import.meta.env.PUBLIC_APP_URL?.trim();
  if (configuredBase) {
    const base = configuredBase.endsWith('/') ? configuredBase.slice(0, -1) : configuredBase;
    if (base.endsWith(APP_BASE_PATH)) {
      return `${base}${resolveAppRoute(target)}`;
    }
    return `${base}${buildAppPath(target)}`;
  }

  return import.meta.env.DEV ? getAppOriginUrl(target) : buildAppPath(target);
}
