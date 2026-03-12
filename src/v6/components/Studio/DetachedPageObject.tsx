import React from 'react';
import { Group, Image, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import useImage from 'use-image';
import { DetachedPageItem, StudioState, useStudioStore } from './studio-store';

interface DetachedPageObjectProps {
    page: DetachedPageItem;
}

export const DetachedPageObject: React.FC<DetachedPageObjectProps> = ({ page }) => {
    const [image] = useImage(page.thumbnailUrl);
    const attachDetachedPage = useStudioStore((s: StudioState) => s.attachDetachedPage);
    const moveDetachedPage = useStudioStore((s: StudioState) => s.moveDetachedPage);
    const removeDetachedPage = useStudioStore((s: StudioState) => s.removeDetachedPage);
    const activeDocumentId = useStudioStore((s: StudioState) => s.activeDocumentId);
    const gridColumns = useStudioStore((s: StudioState) => s.gridColumns);

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        const node = e.target;
        const stage = node.getStage();
        if (!stage) {
            return;
        }
        const pos = stage.getPointerPosition();
        if (!pos) {
            return;
        }

        let targetDocId: string | null = null;
        let targetDocNode: Konva.Group | null = null;

        const CARD_WIDTH = 200;
        const CARD_HEIGHT = 280;
        const GAP_X = 20;
        const GAP_Y = 30;
        const STEP_X = CARD_WIDTH + GAP_X;
        const STEP_Y = CARD_HEIGHT + GAP_Y;

        const stageScale = stage.scaleX() || 1;
        const absPos = node.absolutePosition();
        // Detached page is visually 180x250, so center is 90x125
        const centerPos = {
            x: absPos.x + 90 * stageScale,
            y: absPos.y + 125 * stageScale
        };

        const documentNodes = stage.find('.document');
        for (const node of documentNodes) {
            const docId = node.id();
            const doc = useStudioStore.getState().documents.find(d => d.id === docId);
            if (!doc) continue;

            const transform = node.getAbsoluteTransform().copy().invert();
            const localPos = transform.point(centerPos);

            const cols = Math.min(doc.pages.length || 1, gridColumns);
            const rows = Math.ceil(doc.pages.length / cols) || 1;
            const width = Math.max(STEP_X, cols * STEP_X);
            const height = Math.max(STEP_Y, rows * STEP_Y);

            if (localPos.x >= -30 && localPos.x <= width + 30 && localPos.y >= -50 && localPos.y <= height + 50) {
                targetDocId = docId;
                targetDocNode = node as Konva.Group;
                break;
            }
        }

        if (targetDocId && targetDocNode) {
            const transform = targetDocNode.getAbsoluteTransform().copy().invert();
            const localPos = transform.point(centerPos);
            const targetCol = Math.max(0, Math.min(gridColumns - 1, Math.round(localPos.x / STEP_X)));
            const targetRow = Math.max(0, Math.round(localPos.y / STEP_Y));
            const targetIndex = targetRow * gridColumns + targetCol;

            attachDetachedPage(page.id, targetDocId, targetIndex);
            return;
        }

        const inverseTransform = stage.getAbsoluteTransform().copy().invert();
        const worldDropPos = inverseTransform.point(absPos);
        moveDetachedPage(page.id, worldDropPos.x, worldDropPos.y);
    };

    return (
        <Group
            id={`detached-${page.id}`}
            name="detached-page-object"
            x={page.x}
            y={page.y}
            draggable
            onClick={(e) => {
                e.cancelBubble = true;
                if (!activeDocumentId) {
                    return;
                }
                attachDetachedPage(page.id, activeDocumentId);
            }}
            onDragStart={(e) => {
                e.cancelBubble = true;
                e.target.moveToTop();
            }}
            onDragEnd={handleDragEnd}
            rotation={page.rotation}
        >
            <Rect width={180} height={250} fill="white" shadowBlur={10} shadowOpacity={0.3} cornerRadius={4} />
            {image && (() => {
                const imgRatio = image.width / image.height;
                const boxRatio = 180 / 250;
                let drawWidth = 180;
                let drawHeight = 250;
                let offsetX = 0;
                let offsetY = 0;

                if (imgRatio > boxRatio) {
                    drawWidth = 180;
                    drawHeight = 180 / imgRatio;
                    offsetY = (250 - drawHeight) / 2;
                } else {
                    drawHeight = 250;
                    drawWidth = 250 * imgRatio;
                    offsetX = (180 - drawWidth) / 2;
                }

                return (
                    <Image
                        image={image}
                        width={drawWidth}
                        height={drawHeight}
                        x={offsetX}
                        y={offsetY}
                        imageSmoothingEnabled={false}
                        cornerRadius={4}
                    />
                );
            })()}
            <Group x={0} y={-24}>
                <Rect width={180} height={20} fill="rgba(15, 23, 42, 0.75)" cornerRadius={4} />
                <Text text="Detached page" fill="#dbeafe" fontSize={11} x={8} y={4} />
            </Group>

            <Group
                x={162}
                y={-8}
                onClick={(e) => {
                    e.cancelBubble = true;
                    removeDetachedPage(page.id);
                }}
                onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                }}
            >
                <Rect width={24} height={24} fill="#ef4444" cornerRadius={12} shadowBlur={4} shadowOpacity={0.3} x={-12} y={-12} />
                <Text text="✕" fill="white" fontSize={14} fontStyle="bold" x={-6} y={-7} />
            </Group>
            <Rect
                width={180}
                height={250}
                fill="transparent"
                stroke="rgba(147, 197, 253, 0.8)"
                strokeWidth={1.5}
                dash={[7, 5]}
                cornerRadius={4}
            />
        </Group>
    );
};
