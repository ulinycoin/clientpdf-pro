import type { GlobalRegistry } from '../../core/registry/global-registry';
import { isStandaloneToolHidden } from '../tool-visibility';

export interface ToolMenuItem {
  toolId: string;
  label: string;
  href: string;
  requiredEntitlements: string[];
  requiresPro: boolean;
}

export function buildToolMenu(registry: GlobalRegistry): ToolMenuItem[] {
  return registry
    .list()
    .filter((tool) => !isStandaloneToolHidden(tool.id))
    .map((tool) => ({
      toolId: tool.id,
      label: tool.name,
      href: `/${tool.id}`,
      requiredEntitlements: tool.entitlements ?? [],
      requiresPro: tool.limits?.featureTier === 'pro',
    }));
}
