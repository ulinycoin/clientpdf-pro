import type { FormFieldElement } from '../editor-types';
import { LinearIcon } from '../../icons/linear-icon';

interface StudioFormsQuickBarProps {
    onAddField: (type: 'text' | 'multiline' | 'checkbox' | 'radio' | 'dropdown') => void;
    selectedField: FormFieldElement | null;
    onUpdateSelectedField: (patch: Partial<FormFieldElement>) => void;
    canvasWidth: number;
    canvasHeight: number;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

const FIELD_BUTTONS: Array<{ type: 'text' | 'multiline' | 'checkbox' | 'radio' | 'dropdown'; label: string }> = [
    { type: 'text', label: 'Text' },
    { type: 'multiline', label: 'Multiline' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio' },
    { type: 'dropdown', label: 'Dropdown' },
];

export function StudioFormsQuickBar({
    onAddField,
    selectedField,
    onUpdateSelectedField,
    canvasWidth,
    canvasHeight,
    onDelete,
    onDuplicate,
}: StudioFormsQuickBarProps) {
    const pageWidthPx = Math.max(1, Math.round(canvasWidth));
    const pageHeightPx = Math.max(1, Math.round(canvasHeight));
    const widthPx = selectedField ? Math.max(1, Math.round(selectedField.w * pageWidthPx)) : 0;
    const heightPx = selectedField ? Math.max(1, Math.round(selectedField.h * pageHeightPx)) : 0;
    const dropdownOptionsCount = selectedField?.formType === 'dropdown' ? (selectedField.options?.length ?? 0) : 0;
    const dropdownOptions = selectedField?.formType === 'dropdown'
        ? (selectedField.options && selectedField.options.length > 0 ? selectedField.options : ['Option 1'])
        : [];

    return (
        <div className="studio-forms-quickbar-wrap">
            <div className="studio-forms-quickbar">
                <span className="studio-forms-quickbar-label">Add Field:</span>
                <div className="studio-forms-quickbar-actions">
                    {FIELD_BUTTONS.map((button) => (
                        <button
                            key={button.type}
                            type="button"
                            className="studio-forms-quickbar-btn"
                            onClick={() => onAddField(button.type)}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>

                {onDuplicate && (
                    <button
                        type="button"
                        className="studio-floating-btn"
                        onClick={onDuplicate}
                        title="Duplicate"
                        style={{ width: 32, height: 32, marginLeft: 8 }}
                    >
                        <LinearIcon name="copy" />
                    </button>
                )}

                {onDelete && (
                    <>
                        <div className="studio-floating-divider" style={{ margin: '0 12px' }} />
                        <button
                            type="button"
                            className="studio-floating-btn delete"
                            onClick={onDelete}
                            title="Delete"
                            style={{ width: 32, height: 32, color: '#ef4444' }}
                        >
                            <LinearIcon name="x" />
                        </button>
                    </>
                )}
            </div>
            {selectedField && (
                <div className="studio-forms-field-controls">
                    <label className="studio-forms-field-label">
                        <span>Name</span>
                        <input
                            className="tool-config-input"
                            value={selectedField.name}
                            onChange={(event) => onUpdateSelectedField({ name: event.target.value })}
                            placeholder="field_name"
                        />
                    </label>
                    <label className="studio-forms-field-label">
                        <span>Width</span>
                        <input
                            className="tool-config-input"
                            type="number"
                            min={12}
                            max={pageWidthPx}
                            value={widthPx}
                            onChange={(event) => {
                                const raw = Number(event.target.value);
                                if (!Number.isFinite(raw)) return;
                                onUpdateSelectedField({ w: Math.max(0.02, Math.min(0.95, raw / pageWidthPx)) });
                            }}
                        />
                    </label>
                    <label className="studio-forms-field-label">
                        <span>Height</span>
                        <input
                            className="tool-config-input"
                            type="number"
                            min={12}
                            max={Math.round(pageHeightPx * 0.6)}
                            value={heightPx}
                            onChange={(event) => {
                                const raw = Number(event.target.value);
                                if (!Number.isFinite(raw)) return;
                                onUpdateSelectedField({ h: Math.max(0.02, Math.min(0.6, raw / pageHeightPx)) });
                            }}
                        />
                    </label>
                    {selectedField.formType === 'dropdown' && (
                        <>
                            <label className="studio-forms-field-label">
                                <span>Options count</span>
                                <input
                                    className="tool-config-input"
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={dropdownOptionsCount || 1}
                                    onChange={(event) => {
                                        const raw = Number(event.target.value);
                                        if (!Number.isFinite(raw)) return;
                                        const count = Math.max(1, Math.min(50, Math.round(raw)));
                                        const nextOptions = Array.from({ length: count }, (_, index) =>
                                            selectedField.options?.[index] ?? `Option ${index + 1}`
                                        );
                                        const nextDefaultValue = nextOptions.includes(selectedField.defaultValue)
                                            ? selectedField.defaultValue
                                            : (nextOptions[0] ?? '');
                                        onUpdateSelectedField({
                                            options: nextOptions,
                                            defaultValue: nextDefaultValue,
                                        });
                                    }}
                                />
                            </label>
                            <div className="studio-forms-options-editor">
                                {dropdownOptions.map((option, index) => (
                                    <label key={`dropdown-option-${index}`} className="studio-forms-field-label">
                                        <span>{`Option ${index + 1}`}</span>
                                        <input
                                            className="tool-config-input"
                                            value={option}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                const nextOptions = dropdownOptions.map((item, itemIndex) => (
                                                    itemIndex === index ? value : item
                                                ));
                                                const sanitizedOptions = nextOptions.map((item, itemIndex) => (
                                                    item.trim().length > 0 ? item : `Option ${itemIndex + 1}`
                                                ));
                                                const nextDefaultValue = sanitizedOptions.includes(selectedField.defaultValue)
                                                    ? selectedField.defaultValue
                                                    : (sanitizedOptions[0] ?? '');
                                                onUpdateSelectedField({
                                                    options: sanitizedOptions,
                                                    defaultValue: nextDefaultValue,
                                                });
                                            }}
                                        />
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
