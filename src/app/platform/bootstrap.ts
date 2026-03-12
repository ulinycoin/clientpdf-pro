import { buildToolMenu, type ToolMenuItem } from '../navigation/build-tool-menu';
import { createPlatformRuntime, type PlatformRuntime } from './create-platform';
import { buildToolRoutes, type ToolRouteModel } from '../routing/build-tool-routes';
import type { IToolDefinition } from '../../core/types/contracts';

export interface PlatformBootstrap {
  runtime: PlatformRuntime;
  routes: ToolRouteModel[];
  menu: ToolMenuItem[];
}

export function bootstrapPlatform(
  mode: 'browser-worker' | 'in-process' = 'browser-worker',
  definitions?: IToolDefinition[],
): PlatformBootstrap {
  const runtime = createPlatformRuntime(mode, definitions);
  const routes = buildToolRoutes(runtime.registry);
  const menu = buildToolMenu(runtime.registry);
  return { runtime, routes, menu };
}
