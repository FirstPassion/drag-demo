import { HistoryState } from '../types';
import { Store } from './store';

/**
 * 历史记录管理器
 * 实现撤销（Undo）和重做（Redo）功能。
 *
 * 工作原理：
 * - 每次状态变化时，自动保存一个快照到 history 数组
 * - 撤销时，回退到上一个快照
 * - 重做时，前进到下一个快照
 * - 最多保存 50 条历史记录（可在构造时配置）
 */
export class HistoryManager {
  private store: Store;
  private history: HistoryState[];      // 历史记录数组
  private historyIndex: number;         // 当前历史记录的索引位置
  private maxHistorySize: number;       // 最大历史记录数量
  private isUndoRedoing: boolean;       // 标记是否正在执行撤销/重做（防止重复记录）

  constructor(store: Store, maxHistorySize: number = 50) {
    this.store = store;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = maxHistorySize;
    this.isUndoRedoing = false;

    // 监听状态变化，自动保存历史
    // 注意：撤销/重做的过程中也会触发 state:changed，所以用 isUndoRedoing 标记来跳过
    this.store.on('state:changed', () => {
      if (!this.isUndoRedoing) {
        this.push('状态变更');
      }
    });
  }

  /**
   * 保存当前状态到历史记录
   * @param description - 本次操作的描述（用于调试）
   *
   * 调用时机：每次 store 的 state:changed 事件触发时自动调用
   */
  push(description: string): void {
    const snapshot = this.store.getSnapshot();

    // 如果用户在历史中间执行了新操作，需要截断后面的记录
    // 例如：历史是 [A, B, C, D]，当前索引是 2（指向 C）
    // 如果此时执行新操作，应该变成 [A, B, C, E]，丢弃 D
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // 添加新记录
    this.history.push({
      ...snapshot,
      timestamp: Date.now(),
      description
    });

    // 限制历史记录数量，超过最大值时删除最早的记录
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();  // 删除第一条
    } else {
      this.historyIndex++;   // 移动索引
    }
  }

  /**
   * 撤销操作
   * @returns 是否成功撤销
   *
   * 调用链：用户按 Ctrl+Z → main.ts setupKeyboardShortcuts → history.undo()
   *   或：用户点击"撤销"按钮 → main.ts bindClick('.undo') → history.undo()
   */
  undo(): boolean {
    if (!this.canUndo()) return false;

    this.isUndoRedoing = true;  // 标记开始撤销，防止触发新的历史记录
    this.historyIndex--;        // 索引前移

    // 恢复到上一个历史状态
    const snapshot = this.history[this.historyIndex];
    this.store.restoreSnapshot({
      components: snapshot.components,
      selectedId: snapshot.selectedId
    });

    this.isUndoRedoing = false;  // 撤销完成
    return true;
  }

  /**
   * 重做操作
   * @returns 是否成功重做
   *
   * 调用链：用户按 Ctrl+Shift+Z → main.ts setupKeyboardShortcuts → history.redo()
   *   或：用户点击"重做"按钮 → main.ts bindClick('.redo') → history.redo()
   */
  redo(): boolean {
    if (!this.canRedo()) return false;

    this.isUndoRedoing = true;  // 标记开始重做
    this.historyIndex++;        // 索引后移

    // 恢复到下一个历史状态
    const snapshot = this.history[this.historyIndex];
    this.store.restoreSnapshot({
      components: snapshot.components,
      selectedId: snapshot.selectedId
    });

    this.isUndoRedoing = false;  // 重做完成
    return true;
  }

  // 判断是否可以撤销（索引大于 0 说明前面还有历史记录）
  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  // 判断是否可以重做（索引小于数组长度说明后面还有历史记录）
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }
}
