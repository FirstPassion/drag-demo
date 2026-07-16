import { Position, Size, Bounds } from '../types';

// 几何计算工具

// 计算放置位置（相对于目标区域）
export function calculateDropPosition(
  mouseX: number,
  mouseY: number,
  targetRect: DOMRect
): Position {
  return {
    top: mouseY - targetRect.top,
    left: mouseX - targetRect.left
  };
}

// 限制位置在边界内
export function constrainToBounds(
  position: Position,
  size: Size,
  bounds: DOMRect
): Position {
  const maxTop = bounds.height - size.height;
  const maxLeft = bounds.width - size.width;

  return {
    top: Math.max(0, Math.min(position.top, maxTop)),
    left: Math.max(0, Math.min(position.left, maxLeft))
  };
}

// 获取中心点
export function getCenter(bounds: DOMRect): Position {
  return {
    top: bounds.top + bounds.height / 2,
    left: bounds.left + bounds.width / 2
  };
}

// 计算两点之间的距离
export function distance(p1: Position, p2: Position): number {
  const dx = p1.left - p2.left;
  const dy = p1.top - p2.top;
  return Math.sqrt(dx * dx + dy * dy);
}

// 判断点是否在矩形内
export function isPointInRect(point: Position, rect: DOMRect): boolean {
  return (
    point.left >= rect.left &&
    point.left <= rect.right &&
    point.top >= rect.top &&
    point.top <= rect.bottom
  );
}

// 判断两个矩形是否相交
export function rectsIntersect(r1: DOMRect, r2: DOMRect): boolean {
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

// 获取两个矩形的交集
export function getIntersection(r1: DOMRect, r2: DOMRect): Bounds | null {
  if (!rectsIntersect(r1, r2)) return null;

  return {
    top: Math.max(r1.top, r2.top),
    left: Math.max(r1.left, r2.left),
    width: Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left),
    height: Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top)
  };
}

// 网格对齐
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

// 位置网格对齐
export function snapPositionToGrid(
  position: Position,
  gridSize: number
): Position {
  return {
    top: snapToGrid(position.top, gridSize),
    left: snapToGrid(position.left, gridSize)
  };
}
