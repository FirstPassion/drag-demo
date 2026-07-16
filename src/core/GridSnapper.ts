import { Position } from '../types';

/**
 * 网格对齐工具
 * 将组件的位置对齐到网格，使布局更加整齐。
 *
 * 网格大小：默认 20px
 * 对齐方式：四舍五入到最近的网格点
 *
 * 示例：
 * - 值 25 → 对齐到 20
 * - 值 35 → 对齐到 40
 * - 值 10 → 对齐到 0（或保持 10，取决于网格大小）
 */
export class GridSnapper {
  private gridSize: number;

  constructor(gridSize: number = 20) {
    this.gridSize = gridSize;
  }

  /**
   * 将单个值对齐到网格
   * @param value - 要对齐的数值
   * @returns 对齐后的数值
   *
   * 计算公式：Math.round(value / gridSize) * gridSize
   */
  snap(value: number): number {
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  /**
   * 将位置对齐到网格并限制在边界内
   * @param top - 原始 top 值
   * @param left - 原始 left 值
   * @param width - 组件宽度（用于边界计算）
   * @param height - 组件高度（用于边界计算）
   * @param boundsWidth - 边界宽度（画布宽度）
   * @param boundsHeight - 边界高度（画布高度）
   * @returns 对齐并限制后的位置
   *
   * 边界限制：
   * - top 最小值为 0，最大值为 boundsHeight - height
   * - left 最小值为 0，最大值为 boundsWidth - width
   *
   * 调用链：DragManager.handleDrop() → gridSnapper.snapPositionWithBounds()
   */
  snapPositionWithBounds(
    top: number,
    left: number,
    width: number,
    height: number,
    boundsWidth: number,
    boundsHeight: number
  ): Position {
    return {
      top: Math.max(0, Math.min(this.snap(top), boundsHeight - height)),
      left: Math.max(0, Math.min(this.snap(left), boundsWidth - width))
    };
  }
}
