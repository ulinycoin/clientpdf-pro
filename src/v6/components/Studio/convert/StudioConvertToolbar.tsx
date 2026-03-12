import { LinearIcon } from '../../icons/linear-icon';
import type { StudioConvertToolId } from './use-studio-convert-controller';

interface StudioConvertToolbarProps {
  activeTool: StudioConvertToolId | null;
  onSelectTool: (tool: StudioConvertToolId) => void;
}

export function StudioConvertToolbar({ activeTool, onSelectTool }: StudioConvertToolbarProps) {
  const items: Array<{ tool: StudioConvertToolId; title: string; icon: 'ocr' | 'file-input' | 'image' | 'compress' }> = [
    { tool: 'ocr-pdf', title: 'OCR PDF', icon: 'ocr' },
    { tool: 'pdf-to-jpg', title: 'PDF to JPG', icon: 'file-input' },
    { tool: 'extract-images', title: 'Extract Images', icon: 'image' },
    { tool: 'compress-pdf', title: 'Compress PDF', icon: 'compress' },
  ];

  return (
    <div className="studio-convert-toolbar">
      {items.map((item) => (
        <button
          key={item.tool}
          type="button"
          className={`studio-edit-tool-btn studio-convert-tool-btn ${activeTool === item.tool ? 'active' : ''}`}
          title={item.title}
          onClick={() => onSelectTool(item.tool)}
        >
          <LinearIcon name={item.icon} size={18} />
          <span className="studio-convert-tool-label">{item.title}</span>
        </button>
      ))}
    </div>
  );
}
