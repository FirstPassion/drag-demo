import { HistoryState } from '../types';
import { Store } from './store';

// 撤销/重做历史管理
export class HistoryManager {
  private store: Store;
  private history: HistoryState[];
  private historyIndex: number;
  private maxHistorySize: number;
  private isUndoRedoing: boolean;

  constructor(store: Store, maxHistorySize: number = 50) {
    this.store = store;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = maxHistorySize;
    this.isUndoRedoing = false;

    // 监听状态变化，自动保存历史
    this.store.on('state:changed', () => {
      if (!this.isUndoRedoing) {
        this.push('状态变更');
      }
    });
  }

  // 保存当前状态到历史记录
  push(description: string): void {
    const snapshot = this.store.getSnapshot();

    // 如果当前不在历史末尾，截断后面的记录
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // 添加新记录
    this.history.push({
      ...snapshot,
      timestamp: Date.now(),
      description
    });

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  // 撤销
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    this.isUndoRedoing = true;
    this.historyIndex--;

    const snapshot = this.history[this.historyIndex];
    this.store.restoreSnapshot({
      components: snapshot.components,
      selectedId: snapshot.selectedId
    });

    this.isUndoRedoing = false;
    return true;
  }

  // 重做
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.isUndoRedoing = true;
    this.historyIndex++;

    const snapshot = this.history[this.historyIndex];
    this.store.restoreSnapshot({
      components: snapshot.components,
      selectedId: snapshot.selectedId
    });

    this.isUndoRedoing = false;
    return true;
  }

  // 是否可以撤销
  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  // 是否可以重做
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  // 获取历史记录列表
  getHistory(): readonly HistoryState[] {
    return this.history;
  }

  // 获取当前历史索引
  getHistoryIndex(): number {
    return this.historyIndex;
  }

  // 清空历史记录
  clear(): void {
    this.history = [];
    this.historyIndex = -1;
  }
}
