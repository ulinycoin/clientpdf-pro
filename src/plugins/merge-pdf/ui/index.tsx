import { useState, useEffect } from 'react';
import { usePlatform } from '../../../app/react/platform-context';
import { LinearIcon } from '../../../v6/components/icons/linear-icon';

interface MergePdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function MergePdfConfig({ inputFiles, onStart, onBack }: MergePdfConfigProps) {
  const { runtime } = usePlatform();
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [orderedIds, setOrderedIds] = useState<string[]>(inputFiles);

  useEffect(() => {
    const loadNames = async () => {
      const names: Record<string, string> = {};
      for (const id of inputFiles) {
        const entry = await runtime.vfs.read(id);
        names[id] = entry.getName();
      }
      setFileNames(names);
    };
    void loadNames();
  }, [inputFiles, runtime.vfs]);

  const moveUp = (index: number) => {
    if (index === 0) {
      return;
    }
    const newOrder = [...orderedIds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrderedIds(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === orderedIds.length - 1) {
      return;
    }
    const newOrder = [...orderedIds];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setOrderedIds(newOrder);
  };

  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">Arrange the files in the order you want them to appear in the merged PDF.</p>

      <ul className="tool-config-list">
        {orderedIds.map((id, index) => (
          <li key={id} className="tool-config-list-item">
            <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>{fileNames[id] || 'Loading...'}</span>
            <div style={{ display: 'flex', gap: '0.34rem' }}>
              <button
                className="btn-secondary"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                aria-label="Move file up"
                title="Move file up"
              >
                <span className="btn-inline">
                  <LinearIcon name="chevron-up" className="linear-icon" />
                  Up
                </span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => moveDown(index)}
                disabled={index === orderedIds.length - 1}
                aria-label="Move file down"
                title="Move file down"
              >
                <span className="btn-inline">
                  <LinearIcon name="chevron-down" className="linear-icon" />
                  Down
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => onStart({ inputIds: orderedIds })}>
          Run Merge
        </button>
      </div>
    </div>
  );
}
