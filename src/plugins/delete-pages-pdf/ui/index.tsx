import { useState } from 'react';

interface DeletePagesPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function DeletePagesPdfConfig({ inputFiles, onStart, onBack }: DeletePagesPdfConfigProps) {
  const [pages, setPages] = useState('');

  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">
        Delete pages from <strong>{inputFiles.length}</strong> PDF file{inputFiles.length === 1 ? '' : 's'}.
      </p>

      <div className="tool-config-card">
        <label className="tool-config-label">Pages to delete:</label>
        <input
          className="tool-config-input"
          type="text"
          placeholder="e.g. 1, 3, 5-8"
          value={pages}
          onChange={(event) => setPages(event.target.value)}
        />
      </div>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => onStart({ pages })} disabled={!pages.trim()}>
          Run Delete Pages
        </button>
      </div>
    </div>
  );
}
