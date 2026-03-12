import { LinearIcon } from '../../icons/linear-icon';
import type { EditorToolId } from '../editor-types';

interface StudioEditToolbarProps {
    ui: any;
    tool: EditorToolId | null;
    onSelectTool: (tool: EditorToolId) => void;
}

export function StudioEditToolbar({ ui, tool, onSelectTool }: StudioEditToolbarProps) {
    return (
        <div className="studio-editor-left-toolbar" style={{
            display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 6px',
            pointerEvents: 'auto'
        }}>
            <button
                className={`studio-edit-tool-btn ${tool === 'text' ? 'active' : ''}`}
                onClick={() => { onSelectTool('text'); }}
                title={ui.text}
            >
                <LinearIcon name="text" size={22} />
            </button>
            <button
                className={`studio-edit-tool-btn ${tool === 'annotate' ? 'active' : ''}`}
                onClick={() => { onSelectTool('annotate'); }}
                title={ui.annotate}
            >
                <LinearIcon name="highlighter" size={22} />
            </button>
            <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px auto' }} />
            <button
                className={`studio-edit-tool-btn ${tool === 'whiteout' ? 'active' : ''}`}
                onClick={() => onSelectTool('whiteout')}
                title={ui.whiteout}
            >
                <LinearIcon name="eraser" size={22} />
            </button>
            <button
                className={`studio-edit-tool-btn ${tool === 'watermark' ? 'active' : ''}`}
                onClick={() => onSelectTool('watermark')}
                title={ui.watermark}
            >
                <LinearIcon name="stamp" size={22} />
            </button>
            <button
                className={`studio-edit-tool-btn ${tool === 'sign' ? 'active' : ''}`}
                onClick={() => { onSelectTool('sign'); }}
                title={ui.sign}
            >
                <LinearIcon name="signature" size={22} />
            </button>
            <button
                className={`studio-edit-tool-btn ${tool === 'forms' ? 'active' : ''}`}
                onClick={() => onSelectTool('forms')}
                title={ui.forms}
            >
                <LinearIcon name="file-input" size={22} />
            </button>
            <button
                className={`studio-edit-tool-btn ${tool === 'protect' ? 'active' : ''}`}
                onClick={() => onSelectTool('protect')}
                title={ui.protect}
                >
                <LinearIcon name="lock" size={22} />
            </button>
        </div>
    );
}
