import type { RunnerExecuteResult, ToolRunContext, ToolRunInput } from '../../core/types/contracts';
import type { PlatformRuntime } from './create-platform';
import { runTool } from './run-tool';

export interface RunWithTempInputsResult {
  result: RunnerExecuteResult;
  tempInputIds: string[];
  scopeId: string;
}

export async function runToolWithTempInputs(
  runtime: PlatformRuntime,
  toolId: string,
  inputBlobs: Blob[],
  context: ToolRunContext,
  input: Omit<ToolRunInput, 'inputIds'> = {},
  onProgress?: (progress: number) => void,
): Promise<RunWithTempInputsResult> {
  const scopeId = crypto.randomUUID();
  const tempInputIds: string[] = [];
  for (const blob of inputBlobs) {
    const entry = await runtime.vfs.writeTemp(scopeId, blob);
    tempInputIds.push(entry.id);
  }

  try {
    const result = await runTool(
      runtime,
      toolId,
      { ...input, inputIds: tempInputIds },
      context,
      onProgress,
    );
    return { result, tempInputIds, scopeId };
  } finally {
    await runtime.vfs.cleanupScope(scopeId);
  }
}
