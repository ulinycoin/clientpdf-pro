import type { GlobalRegistry } from '../../core/registry/global-registry';
import type { ToolUiModule } from '../../core/types/contracts';
import { isStandaloneToolHidden } from '../tool-visibility';

export interface ToolRouteModel {
  toolId: string;
  path: string;
  title: string;
  loadUi: () => Promise<ToolUiModule>;
}

export function buildToolRoutes(registry: GlobalRegistry): ToolRouteModel[] {
  return registry
    .list()
    .filter((tool) => !isStandaloneToolHidden(tool.id))
    .map((tool) => ({
      toolId: tool.id,
      path: `/${tool.id}`,
      title: tool.name,
      loadUi: tool.uiLoader,
    }));
}
