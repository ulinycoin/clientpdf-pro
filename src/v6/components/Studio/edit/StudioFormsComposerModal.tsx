import { useEffect, useMemo, useState } from 'react';

type FormFieldType = 'text' | 'multiline' | 'checkbox' | 'radio' | 'dropdown';

interface StudioFormsComposerModalProps {
    open: boolean;
    ui: any;
    onClose: () => void;
    onInsertFormField: (type: FormFieldType) => void;
}

const FIELD_OPTIONS: Array<{ type: FormFieldType; title: string; description: string }> = [
    { type: 'text', title: 'Text field', description: 'Single-line input field.' },
    { type: 'multiline', title: 'Multiline', description: 'Multi-line text area.' },
    { type: 'checkbox', title: 'Checkbox', description: 'Binary on/off value.' },
    { type: 'radio', title: 'Radio', description: 'One option from a group.' },
    { type: 'dropdown', title: 'Dropdown', description: 'Selectable list of options.' },
];

export function StudioFormsComposerModal({ open, ui, onClose, onInsertFormField }: StudioFormsComposerModalProps) {
    const [selectedType, setSelectedType] = useState<FormFieldType>('text');
    const title = useMemo(() => ui?.forms || 'Forms', [ui]);

    useEffect(() => {
        if (!open) return;
        setSelectedType('text');
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div className="studio-sign-modal-backdrop" onClick={onClose}>
            <div className="studio-sign-modal" onClick={(event) => event.stopPropagation()}>
                <div className="studio-sign-modal-head">
                    <h3>{title}</h3>
                    <div className="studio-sign-head-actions">
                        <button type="button" className="studio-sign-close" onClick={onClose} aria-label="Close">
                            ×
                        </button>
                    </div>
                </div>

                <div className="studio-sign-content">
                    <div className="studio-forms-type-grid">
                        {FIELD_OPTIONS.map((option) => (
                            <button
                                key={option.type}
                                type="button"
                                className={`studio-forms-type-card ${selectedType === option.type ? 'active' : ''}`}
                                onClick={() => setSelectedType(option.type)}
                            >
                                <span className="studio-forms-type-title">{option.title}</span>
                                <span className="studio-forms-type-description">{option.description}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="studio-sign-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={() => {
                        onInsertFormField(selectedType);
                        onClose();
                    }}>
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
}
