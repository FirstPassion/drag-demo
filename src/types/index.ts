import { ComponentInstance } from './component';

// 应用状态接口
export interface AppState {
  components: ComponentInstance[];
  selectedId: string | null;
}

// 历史记录状态接口
export interface HistoryState {
  components: ComponentInstance[];
  selectedId: string | null;
  timestamp: number;
  description: string;
}

// 完整状态（包含历史记录）
export interface FullState {
  components: ComponentInstance[];
  selectedId: string | null;
  history: HistoryState[];
  historyIndex: number;
}

// 事件类型
export type AppEventType =
  | 'component:added'
  | 'component:removed'
  | 'component:updated'
  | 'component:selected'
  | 'component:deselected'
  | 'state:changed'
  | 'history:changed';

// 事件处理器类型
export type AppEventHandler<T = unknown> = (payload: T) => void;

// DOM 位置接口
export interface Position {
  top: number;
  left: number;
}

// DOM 尺寸接口
export interface Size {
  width: number;
  height: number;
}

// DOM 边界接口
export interface Bounds extends Position, Size {}
