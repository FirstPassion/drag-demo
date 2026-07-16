import { Position } from '../types';

// 网格对齐工具
export class GridSnapper {
  private gridSize: number;

  constructor(gridSize: number = 20) {
    this.gridSize = gridSize;
  }

  // 将值对齐到网格
  snap(value: number): number {
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  // 将位置对齐到网格
  snapPosition(top: number, left: number): Position {
    return {
      top: this.snap(top),
      left: this.snap(left)
    };
  }

  // 将位置对齐到网格并限制在边界内
  snapPositionWithBounds(
    top: number,
    left: number,
    width: number,
    height: number,
    boundsWidth: number,
    boundsHeight: number
  ): Position {
    let snappedTop = this.snap(top);
    let snappedLeft = this.snap(left);

    // 限制在边界内
    snappedTop = Math.max(0, Math.min(snappedTop, boundsHeight - height));
    snappedLeft = Math.max(0, Math.min(snappedLeft, boundsWidth - width));

    return {
      top: snappedTop,
      left: snappedLeft
    };
  }

  // 获取网格大小
  getGridSize(): number {
    return this.gridSize;
  }

  // 设置网格大小
  setGridSize(size: number): void {
    this.gridSize = size;
  }
}
