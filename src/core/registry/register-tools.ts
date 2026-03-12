import type { IToolDefinition } from '../types/contracts';
import { GlobalRegistry } from './global-registry';

type DefinitionModule = Record<string, unknown>;
type DefinitionModules = Record<string, DefinitionModule>;

function isToolDefinition(value: unknown): value is IToolDefinition {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.description === 'string' &&
    typeof v.uiLoader === 'function' &&
    typeof v.logicLoader === 'function'
  );
}

function extractDefinitions(modules: DefinitionModules): IToolDefinition[] {
  const out: IToolDefinition[] = [];
  for (const modulePath of Object.keys(modules)) {
    const moduleExports = modules[modulePath];
    for (const exportName of Object.keys(moduleExports)) {
      const candidate = moduleExports[exportName];
      if (isToolDefinition(candidate)) {
        out.push(candidate);
      }
    }
  }
  return out;
}

// Vite-friendly plugin discovery.
export function discoverToolDefinitions(): IToolDefinition[] {
  const discovered = import.meta.glob('../../plugins/**/definition.ts', { eager: true }) as DefinitionModules;
  return extractDefinitions(discovered);
}

export function createRegistry(definitions: IToolDefinition[] = discoverToolDefinitions()): GlobalRegistry {
  const registry = new GlobalRegistry();
  for (const definition of definitions) {
    registry.register(definition);
  }
  return registry;
}
