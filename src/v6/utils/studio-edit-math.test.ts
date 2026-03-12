import { describe, test } from 'node:test';
import * as assert from 'node:assert';
import {
    clamp01,
    toWorldPointByRect,
    getStrokeBounds,
    moveStrokePoints,
    resizeStrokePoints
} from './studio-edit-math';
import type React from 'react';

describe('studio-edit-math', () => {
    test('clamp01', () => {
        assert.strictEqual(clamp01(-1), 0);
        assert.strictEqual(clamp01(0.5), 0.5);
        assert.strictEqual(clamp01(1.5), 1);
        assert.strictEqual(clamp01(0), 0);
        assert.strictEqual(clamp01(1), 1);
    });

    test('toWorldPointByRect', () => {
        const rect = { left: 10, top: 20, width: 100, height: 200 } as DOMRect;
        const event = { clientX: 60, clientY: 120 } as React.PointerEvent<HTMLElement>;
        const point = toWorldPointByRect(event, rect);

        assert.strictEqual(point.x, 0.5);
        assert.strictEqual(point.y, 0.5);

        const outOfBoundsEvent = { clientX: -10, clientY: 500 } as any;
        const clampedPoint = toWorldPointByRect(outOfBoundsEvent, rect);
        assert.strictEqual(clampedPoint.x, 0);
        assert.strictEqual(clampedPoint.y, 1);
    });

    test('getStrokeBounds', () => {
        const points = [0.1, 0.2, 0.5, 0.6, 0.3, 0.1];
        const bounds = getStrokeBounds(points);
        assert.ok(Math.abs(bounds.minX - 0.1) < 0.0001);
        assert.ok(Math.abs(bounds.maxX - 0.5) < 0.0001);
        assert.ok(Math.abs(bounds.minY - 0.1) < 0.0001);
        assert.ok(Math.abs(bounds.maxY - 0.6) < 0.0001);
    });

    test('moveStrokePoints', () => {
        const points = [0.1, 0.2, 0.5, 0.6];
        const dx = 0.1;
        const dy = -0.1;
        const moved = moveStrokePoints(points, dx, dy);
        assert.ok(Math.abs(moved[0] - 0.2) < 0.0001);
        assert.ok(Math.abs(moved[1] - 0.1) < 0.0001);
        assert.ok(Math.abs(moved[2] - 0.6) < 0.0001);
        assert.ok(Math.abs(moved[3] - 0.5) < 0.0001);

        const clamped = moveStrokePoints(points, 2.0, -2.0);
        assert.strictEqual(clamped[0], 1);
        assert.strictEqual(clamped[1], 0);
    });

    test('resizeStrokePoints', () => {
        const points = [0.1, 0.1, 0.5, 0.5];
        const bounds = getStrokeBounds(points);

        const resized = resizeStrokePoints(points, bounds, 2, 2);
        assert.ok(Math.abs(resized[0] - 0.1) < 0.0001);
        assert.ok(Math.abs(resized[1] - 0.1) < 0.0001);

        assert.ok(Math.abs(resized[2] - 0.9) < 0.0001);
        assert.ok(Math.abs(resized[3] - 0.9) < 0.0001);
    });
});
