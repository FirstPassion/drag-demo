import { ComponentInstance } from './component';

/** 应用状态接口 */
export interface AppState {
  components: ComponentInstance[];
  selectedId: string | null;
}

/** 历史记录状态接口 */
export interface HistoryState {
  components: ComponentInstance[];
  selectedId: string | null;
  timestamp: number;
  description: string;
}

/** 应用事件类型 */
export type AppEventType =
  | 'component:updated'
  | 'component:selected'
  | 'component:deselected'
  | 'state:changed';

/** 事件处理器类型 */
export type AppEventHandler<T = unknown> = (payload: T) => void;

/** 位置接口 */
export interface Position {
  top: number;
  left: number;
}
