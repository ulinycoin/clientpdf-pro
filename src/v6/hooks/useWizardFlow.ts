import { lazy, useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { usePlatform } from '../../app/react/platform-context';
import type { ToolRunContext } from '../../core/public/contracts';
import type {
  IToolConfigProps,
  LimitService,
  UseWizardFlowResult,
  WizardFlowOptions,
} from '../components/Wizard/types';
import { INITIAL_WIZARD_STATE, WizardFlowCore } from './wizard-flow-core';

export function useWizardFlow(toolId: string, options: WizardFlowOptions): UseWizardFlowResult {
  const { runtime } = usePlatform();
  const [state, setState] = useState(INITIAL_WIZARD_STATE);
  const [configReloadKey, setConfigReloadKey] = useState(0);

  const limitService: LimitService = useMemo(
    () =>
      options.limitService ?? {
        check: async ({ runtime: platformRuntime, fileIds, toolId: targetToolId, context }) => {
          const denied = await platformRuntime.runner.validateAccess(targetToolId, fileIds, context);
          if (!denied) {
            return { allowed: true };
          }
          return {
            allowed: false,
            reason: denied.details ?? denied.reason,
          };
        },
      },
    [options.limitService],
  );

  const core = useMemo(
    () =>
      new WizardFlowCore({
        runtime,
        toolId,
        context: options.context,
        limitService,
        onToast: options.onToast,
      }),
    [runtime, toolId, options.context, limitService, options.onToast],
  );

  useEffect(() => {
    setState(core.getState());
    return () => {
      core.cancelProcessing();
    };
  }, [core]);

  const configComponent = useMemo(() => {
    const toolDef = runtime.registry.get(toolId);
    const LazyConfig = lazy(toolDef.uiLoader);
    return LazyConfig as unknown as ComponentType<IToolConfigProps>;
  }, [runtime.registry, toolId, configReloadKey]);

  const handleFilesAdded = useCallback(
    async (files: File[]): Promise<void> => {
      const next = await core.handleFilesAdded(files);
      setState({ ...next });
    },
    [core],
  );

  const startProcessing = useCallback(
    async (payload?: Record<string, unknown>): Promise<void> => {
      const next = await core.startProcessing(payload);
      setState({ ...next });
    },
    [core],
  );

  const hydrateFromFileIds = useCallback(
    async (fileIds: string[]): Promise<void> => {
      const next = await core.hydrateFromFileIds(fileIds);
      setState({ ...next });
    },
    [core],
  );

  const resetFlow = useCallback(
    async (deleteInputs = true): Promise<void> => {
      const next = await core.resetFlow(deleteInputs);
      setState({ ...next });
    },
    [core],
  );

  const cancelProcessing = useCallback(() => {
    core.cancelProcessing();
  }, [core]);

  const dismissToast = useCallback(() => {
    const next = core.dismissToast();
    setState({ ...next });
  }, [core]);

  const dismissUpsell = useCallback(() => {
    const next = core.dismissUpsell();
    setState({ ...next });
  }, [core]);

  const retryConfigLoad = useCallback(() => {
    setConfigReloadKey((current) => current + 1);
  }, []);

  return {
    state,
    configComponent,
    handleFilesAdded,
    hydrateFromFileIds,
    startProcessing,
    cancelProcessing,
    resetFlow,
    retryConfigLoad,
    dismissToast,
    dismissUpsell,
  };
}

export const DEFAULT_TOOL_CONTEXT: ToolRunContext = {
  userId: 'demo-user',
  plan: 'pro',
  entitlements: [
    'pdf.merge',
    'pdf.split',
    'pdf.compress',
    'pdf.ocr',
    'pdf.rotate',
    'pdf.delete_pages',
    'pdf.edit',
    'pdf.to_image',
    'office.convert',
    'pdf.protect.encrypt',
    'pdf.protect.unlock',
  ],
};
