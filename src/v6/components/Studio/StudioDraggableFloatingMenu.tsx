import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LinearIcon } from '../icons/linear-icon';
import { clamp, type FontFamilyId } from './inline-text-utils';
import { EditElement, TextElement } from './editor-types';

export interface StudioFloatingMenuProps {
    element: EditElement;
    onUpdate: (patch: Partial<EditElement>) => void;
    onDelete?: () => void;
    onDuplicate: () => void;
    onDeselect?: () => void;
    onActivateMove?: () => void;
    bgColor?: string;
    onBgColorChange?: (color: string) => void;
}

export function DraggableFloatingMenu({ element, onUpdate, onDelete, onDuplicate: _onDuplicate, onDeselect, onActivateMove, bgColor, onBgColorChange }: StudioFloatingMenuProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isAnchoredToText = element.type === 'text';
    const [position, setPosition] = useState(() => ({
        x: Math.max(20, window.innerWidth / 2 - 200),
        y: Math.max(20, window.innerHeight - 120)
    }));
    const isDraggingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!isAnchoredToText) {
            return;
        }
        let frame = 0;
        const updateAnchoredPosition = () => {
            const selector = `[data-editor-element-id="${element.id}"]`;
            const anchor = document.querySelector(selector) as HTMLElement | null;
            const menuNode = menuRef.current;
            if (anchor && menuNode) {
                const anchorRect = anchor.getBoundingClientRect();
                const menuRect = menuNode.getBoundingClientRect();
                const nextX = Math.min(
                    Math.max(12, anchorRect.left + anchorRect.width / 2 - menuRect.width / 2),
                    Math.max(12, window.innerWidth - menuRect.width - 12),
                );
                const nextY = Math.max(12, anchorRect.top - menuRect.height - 10);
                setPosition({ x: nextX, y: nextY });
            }
            frame = window.requestAnimationFrame(updateAnchoredPosition);
        };
        frame = window.requestAnimationFrame(updateAnchoredPosition);
        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [element.id, isAnchoredToText]);

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            if (!isDraggingRef.current) return;
            setPosition(prev => ({
                x: prev.x + (e.clientX - startPosRef.current.x),
                y: prev.y + (e.clientY - startPosRef.current.y)
            }));
            startPosRef.current = { x: e.clientX, y: e.clientY };
        };
        const onPointerUp = () => { isDraggingRef.current = false; };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, []);

    const handleDragStart = (e: React.PointerEvent) => {
        if (isAnchoredToText) {
            return;
        }
        if ((e.target as HTMLElement).closest('button, input, select')) return;
        e.stopPropagation();
        isDraggingRef.current = true;
        startPosRef.current = { x: e.clientX, y: e.clientY };
        try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch (err) { }
    };

    const renderContent = () => {
        if (element.type !== 'text') {
            return (
                <div
                    ref={menuRef}
                    className="studio-floating-properties-panel"
                    style={{ left: position.x, top: position.y, cursor: 'grab' }}
                    onPointerDown={handleDragStart}
                >
                    {onDelete && (
                        <button type="button" className="studio-floating-btn delete" onClick={onDelete} title="Delete">
                            <LinearIcon name="x" />
                        </button>
                    )}
                </div>
            );
        }

        const textElem = element as TextElement;

        return (
            <div
                ref={menuRef}
                className="studio-floating-properties-panel"
                style={{ left: position.x, top: position.y, cursor: isAnchoredToText ? 'default' : 'grab' }}
                onPointerDown={handleDragStart}
            >

                <div className="studio-floating-group">
                    <button
                        type="button"
                        className={`studio-floating-btn ${textElem.fontWeight === 'bold' ? 'active' : ''}`}
                        onClick={() => onUpdate({ fontWeight: textElem.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        title="Bold"
                    >
                        <span className="font-icon-b" style={{ fontWeight: 700 }}>B</span>
                    </button>
                    <button
                        type="button"
                        className={`studio-floating-btn ${textElem.fontStyle === 'italic' ? 'active' : ''}`}
                        onClick={() => onUpdate({ fontStyle: textElem.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        title="Italic"
                    >
                        <span className="font-icon-i" style={{ fontStyle: 'italic' }}>I</span>
                    </button>
                </div>

                <div className="studio-floating-divider" />

                <div className="studio-floating-group">
                    <select
                        className="studio-floating-select font-family"
                        aria-label="Font family"
                        title="Font family"
                        value={textElem.fontFamily}
                        onChange={(e) => onUpdate({ fontFamily: e.target.value as FontFamilyId })}
                    >
                        <option value="roboto" style={{ fontWeight: 600 }}>Roboto (Latin/Cyrillic)</option>
                        <option value="noto">Noto Sans (International)</option>
                        <option value="noto-arabic">Noto Sans Arabic</option>
                        <option value="noto-cjk">Noto Sans CJK</option>
                        <option value="noto-devanagari">Noto Sans Devanagari</option>
                        <option value="sora">Helvetica</option>
                        <option value="times">Times New Roman</option>
                        <option value="mono">Courier</option>
                    </select>
                    <div className="studio-floating-input-wrap">
                        <input
                            type="number"
                            className="studio-floating-input"
                            data-testid="studio-floating-font-size"
                            aria-label="Font size"
                            title="Font size"
                            value={textElem.fontSize}
                            min={8}
                            max={96}
                            onChange={(e) => onUpdate({ fontSize: clamp(Number(e.target.value) || 16, 8, 96) })}
                        />
                    </div>
                    <div className="studio-floating-input-wrap">
                        <input
                            type="number"
                            className="studio-floating-input"
                            data-testid="studio-floating-line-height"
                            aria-label="Line height"
                            value={textElem.lineHeight}
                            min={0.8}
                            max={3}
                            step={0.05}
                            title="Line height"
                            onChange={(e) => onUpdate({ lineHeight: clamp(Number(e.target.value) || 1.2, 0.8, 3) })}
                        />
                    </div>
                    <div className="studio-floating-input-wrap">
                        <input
                            type="number"
                            className="studio-floating-input"
                            data-testid="studio-floating-letter-spacing"
                            aria-label="Letter spacing"
                            value={textElem.letterSpacing}
                            min={-2}
                            max={20}
                            step={0.2}
                            title="Letter spacing"
                            onChange={(e) => onUpdate({ letterSpacing: clamp(Number(e.target.value) || 0, -2, 20) })}
                        />
                    </div>
                </div>

                <div className="studio-floating-divider" />

                <div className="studio-floating-group">
                    <div className="studio-floating-color-wrap">
                        <input
                            type="color"
                            className="studio-floating-color"
                            value={textElem.color}
                            onChange={(e) => onUpdate({ color: e.target.value })}
                            title="Text Color"
                        />
                    </div>
                    {onBgColorChange && (
                        <div className="studio-floating-color-wrap">
                            <input
                                type="color"
                                className="studio-floating-color"
                                value={bgColor || '#ffffff'}
                                onChange={(e) => onBgColorChange(e.target.value)}
                                title="Background Color"
                            />
                        </div>
                    )}
                </div>

                <div className="studio-floating-divider" />
                <div className="studio-floating-group">
                    <button
                        type="button"
                        className="studio-floating-btn"
                        onClick={() => {
                            if (onActivateMove) {
                                onActivateMove();
                                return;
                            }
                            onDeselect?.();
                        }}
                        title="Move text"
                    >
                        <LinearIcon name="move-horizontal" size={18} />
                    </button>
                </div>
            </div>
        );
    };

    return createPortal(renderContent(), document.body);
}
