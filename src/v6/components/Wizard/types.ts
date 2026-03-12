import type { ComponentType } from 'react';
import type { PlatformRuntime } from '../../../app/platform/create-platform';
import type { ToolLimits, ToolRunContext } from '../../../core/public/contracts';

export type WizardStep = 'upload' | 'config' | 'processing' | 'result';

export interface WizardState {
  step: WizardStep;
  fileIds: string[];
  outputIds: string[];
  progress: number;
  isValidating: boolean;
  isProcessing: boolean;
  error: string | null;
  toast: string | null;
  upsellReason: string | null;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface LimitService {
  check(params: {
    runtime: PlatformRuntime;
    toolId: string;
    toolLimits: ToolLimits | undefined;
    fileIds: string[];
    context: ToolRunContext;
  }): Promise<LimitCheckResult>;
}

export interface IOAdapter {
  save(fileId: string): Promise<void>;
}

export interface IToolConfigProps {
  inputFiles: string[];
  onStart: (options?: Record<string, unknown>) => void;
  onBack: () => void;
  onPickFiles?: (files: File[]) => void | Promise<void>;
  onClearFiles?: () => void | Promise<void>;
}

export interface WizardFlowOptions {
  context: ToolRunContext;
  limitService?: LimitService;
  onToast?: (message: string) => void;
}

export interface WizardShellProps {
  toolId: string;
  context?: ToolRunContext;
  ioAdapter?: IOAdapter;
  limitService?: LimitService;
}

export interface UseWizardFlowResult {
  state: WizardState;
  configComponent: ComponentType<IToolConfigProps> | null;
  handleFilesAdded: (files: File[]) => Promise<void>;
  hydrateFromFileIds: (fileIds: string[]) => Promise<void>;
  startProcessing: (options?: Record<string, unknown>) => Promise<void>;
  cancelProcessing: () => void;
  resetFlow: (deleteInputs?: boolean) => Promise<void>;
  retryConfigLoad: () => void;
  dismissToast: () => void;
  dismissUpsell: () => void;
}

export interface SmartUploadZoneProps {
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  onFilesAdded: (files: File[]) => Promise<void>;
}
