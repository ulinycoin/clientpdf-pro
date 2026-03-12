interface SplitPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function SplitPdfConfig({ inputFiles, onStart, onBack }: SplitPdfConfigProps) {
  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">
        Ready to split <strong>{inputFiles.length}</strong> PDF file{inputFiles.length === 1 ? '' : 's'} into page-level outputs.
      </p>

      <div className="tool-config-card">
        <p className="tool-config-copy" style={{ margin: 0 }}>
          Each input PDF will be split page by page. Output files will be available at the result step.
        </p>
      </div>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => onStart({})}>
          Run Split
        </button>
      </div>
    </div>
  );
}
