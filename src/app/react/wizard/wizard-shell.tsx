import { useState, Suspense, lazy } from 'react';
import { usePlatform } from '../platform-context';
import { useToolExecution } from '../use-tool-execution';
import { UploadStage } from './stages/upload-stage';
import { ProcessingStage } from './stages/processing-stage';
import { ResultStage } from './stages/result-stage';
import type { ToolRunContext } from '../../../core/public/contracts';

interface WizardShellProps {
    toolId: string;
}

const demoContext: ToolRunContext = {
    userId: 'demo-user',
    plan: 'pro' as const, // For demo, assuming PRO. In real app, comes from auth/billing context.
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

export type WizardStep = 'upload' | 'config' | 'processing' | 'result';

interface ToolConfigProps {
    inputIds: string[];
    onStart: (configOptions: Record<string, unknown>) => void;
    onCancel: () => void;
}

export function WizardShell({ toolId }: WizardShellProps) {
    const { runtime } = usePlatform();
    const [step, setStep] = useState<WizardStep>('upload');
    const [inputIds, setInputIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { execute, progress, statusMessage, lastResult } = useToolExecution(toolId, demoContext);

    const toolDef = runtime.registry.get(toolId);
    const ToolConfigUI = lazy(toolDef.uiLoader) as any as React.ComponentType<ToolConfigProps>;

    const handleUpload = async (ids: string[]) => {
        setInputIds(ids);
        setError(null);

        // EntitlementGate: Pre-execution access check
        const accessDenied = await runtime.runner.validateAccess(toolId, ids, demoContext);
        if (accessDenied) {
            setError(accessDenied.details || 'Access denied for this tool with these files.');
            return;
        }

        setStep('config');
    };

    const handleStart = async (configOptions: Record<string, unknown>) => {
        const finalInputIds = (configOptions.inputIds as string[]) || inputIds;
        setStep('processing');

        const result = await execute({
            inputIds: finalInputIds,
            options: configOptions,
        });

        if (result.type === 'TOOL_RESULT') {
            setStep('result');
        } else if (result.type === 'TOOL_ERROR') {
            setError(result.message);
            setStep('config'); // Return to config on error
        } else if (result.type === 'TOOL_ACCESS_DENIED') {
            setError(result.details || 'Access denied');
            setStep('upload');
        }
    };

    const handleRestart = () => {
        setStep('upload');
        setInputIds([]);
        setError(null);
    };

    return (
        <div className="wizard-container glass-card">
            {error && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    color: '#b91c1c',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    border: '1px solid #fee2e2'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {step === 'upload' && (
                <UploadStage
                    onUpload={handleUpload}
                    accept={toolId === 'excel-to-pdf' ? '.xlsx' : (toolId === 'word-to-pdf' ? '.docx' : 'application/pdf')}
                    multiple={toolId !== 'ocr-pdf' && toolId !== 'pdf-to-jpg'}
                />
            )}

            {step === 'config' && (
                <div className="animate-fade-in">
                    <h2 className="stage-title">Configure {toolDef.name}</h2>
                    <p className="stage-description">Adjust settings before processing.</p>
                    <Suspense fallback={<div>Loading options...</div>}>
                        {/* 
                We pass handleStart and inputIds to the Tool UI. 
                Existing Tool UIs will need refactoring to match this interface.
            */}
                        <ToolConfigUI
                            inputIds={inputIds}
                            onStart={handleStart}
                            onCancel={handleRestart}
                        />
                    </Suspense>
                </div>
            )}

            {step === 'processing' && (
                <ProcessingStage
                    progress={progress}
                    statusMessage={statusMessage}
                    onCancel={handleRestart}
                />
            )}

            {step === 'result' && lastResult?.type === 'TOOL_RESULT' && (
                <ResultStage
                    outputIds={lastResult.outputIds}
                    baseName={toolId}
                    onRestart={handleRestart}
                />
            )}
        </div>
    );
}
