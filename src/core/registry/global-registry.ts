import type { IToolDefinition } from '../types/contracts';

export class GlobalRegistry {
  private readonly tools = new Map<string, IToolDefinition>();

  register(tool: IToolDefinition): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool already registered: ${tool.id}`);
    }
    this.tools.set(tool.id, tool);
  }

  get(toolId: string): IToolDefinition {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }
    return tool;
  }

  list(): IToolDefinition[] {
    return Array.from(this.tools.values());
  }
}
