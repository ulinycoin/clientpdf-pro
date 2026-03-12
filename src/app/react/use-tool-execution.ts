import { useState } from 'react';
import type { RunnerExecuteResult, ToolRunContext, ToolRunInput } from '../../core/public/contracts';
import { isVfsQuotaExceededError } from '../platform/error-utils';
import { runTool } from '../platform/run-tool';
import { usePlatform } from './platform-context';
import { toUserMessage } from './tool-execution-messages';

export function useToolExecution(toolId: string, context: ToolRunContext) {
  const { runtime } = usePlatform();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastResult, setLastResult] = useState<RunnerExecuteResult | null>(null);

  const execute = async (input: ToolRunInput): Promise<RunnerExecuteResult> => {
    setIsRunning(true);
    setProgress(0);
    setStatusMessage('');
    setLastResult(null);
    try {
      const result = await runTool(runtime, toolId, input, context, (nextProgress) => {
        setProgress(nextProgress);
      });
      setLastResult(result);
      setStatusMessage(toUserMessage(result));
      return result;
    } catch (error) {
      const fallback: RunnerExecuteResult =
        isVfsQuotaExceededError(error)
          ? {
              type: 'TOOL_ERROR',
              code: 'VFS_QUOTA_EXCEEDED',
              message: error instanceof Error ? error.message : 'Storage quota exceeded',
            }
          : {
              type: 'TOOL_ERROR',
              code: 'UNEXPECTED_EXECUTION_ERROR',
              message: error instanceof Error ? error.message : 'Unexpected execution error',
            };
      setLastResult(fallback);
      setStatusMessage(toUserMessage(fallback));
      return fallback;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    execute,
    isRunning,
    progress,
    statusMessage,
    lastResult,
  };
}
