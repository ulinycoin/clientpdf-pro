import { useState } from 'react';
import { LinearIcon } from '../../../v6/components/icons/linear-icon';

interface CompressPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

const QUALITY_LEVELS = [
  {
    id: 'low',
    label: 'Low',
    hint: 'Quality',
    description: 'Keep documentation sharp.',
    icon: 'image',
  },
  {
    id: 'medium',
    label: 'Median',
    hint: 'Balanced',
    description: 'Optimal for daily use.',
    icon: 'compress',
  },
  {
    id: 'high',
    label: 'Extreme',
    hint: 'Min Size',
    description: 'Shared via web or email.',
    icon: 'zap',
  },
] as const;

export default function CompressPdfConfig({ onStart, onBack }: CompressPdfConfigProps) {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <div className="tool-config-root compress-config-root">
      <div className="compress-config-header">
        <h3 className="compress-config-main-title">Optimization Level</h3>
        <p className="tool-config-copy">
          Our local engine will re-encode your PDF to save space without cloud dependency.
        </p>
      </div>

      <div className="compress-quality-grid">
        {QUALITY_LEVELS.map((level) => (
          <div
            key={level.id}
            className={`compress-quality-card ${quality === level.id ? 'active' : ''}`}
            onClick={() => setQuality(level.id)}
          >
            <div className="compress-card-selection">
              <div className="compress-radio-outer">
                <div className="compress-radio-inner" />
              </div>
            </div>

            <div className="compress-card-content">
              <div className="compress-card-icon-box">
                <LinearIcon name={level.icon as any} className="linear-icon icon-md" />
              </div>
              <div className="compress-card-text">
                <div className="compress-card-title-row">
                  <span className="compress-card-label">{level.label}</span>
                  <span className="compress-card-hint">{level.hint}</span>
                </div>
                <p className="compress-card-desc">{level.description}</p>
              </div>
            </div>

            {quality === level.id && (
              <div className="compress-card-glow" />
            )}
          </div>
        ))}
      </div>

      <div className="tool-config-actions premium-actions">
        <button className="btn-ghost" onClick={onBack}>
          <span className="btn-inline">
            <LinearIcon name="x" className="linear-icon" />
            Cancel
          </span>
        </button>
        <button className="btn-primary btn-premium-glow" onClick={() => onStart({ quality })}>
          <span className="btn-inline">
            <LinearIcon name="play" className="linear-icon" />
            Optimize Locally
          </span>
        </button>
      </div>
    </div>
  );
}
