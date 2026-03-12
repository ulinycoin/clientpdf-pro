import type { RunnerExecuteResult, ToolRunContext, ToolRunInput } from '../../core/types/contracts';
import type { PlatformRuntime } from './create-platform';

export async function runTool(
  runtime: PlatformRuntime,
  toolId: string,
  input: ToolRunInput,
  context: ToolRunContext,
  onProgress?: (progress: number) => void,
): Promise<RunnerExecuteResult> {
  return runtime.runner.execute(toolId, input, context, (event) => {
    onProgress?.(event.progress);
  });
}
