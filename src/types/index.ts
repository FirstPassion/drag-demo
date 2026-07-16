import { ComponentInstance } from './component';

/**
 * 应用状态接口
 * 定义了整个应用的核心状态结构
 */
export interface AppState {
  components: ComponentInstance[];  // 画布上所有组件的列表
  selectedId: string | null;       // 当前选中的组件 ID，null 表示没有选中
}

/**
 * 历史记录状态接口
 * 用于撤销/重做功能，记录每个状态快照
 */
export interface HistoryState {
  components: ComponentInstance[];  // 组件列表快照
  selectedId: string | null;       // 选中状态快照
  timestamp: number;               // 记录时间戳
  description: string;             // 操作描述（用于调试）
}

/**
 * 应用事件类型
 * Store 通过事件通知其他模块状态变化
 *
 * 事件列表：
 * - component:added: 新组件添加到画布
 * - component:removed: 组件从画布移除
 * - component:updated: 组件属性被修改
 * - component:selected: 组件被选中
 * - component:deselected: 取消选中
 * - state:changed: 状态发生变化（最通用的事件）
 */
export type AppEventType =
  | 'component:added'
  | 'component:removed'
  | 'component:updated'
  | 'component:selected'
  | 'component:deselected'
  | 'state:changed';

/**
 * 事件处理器类型
 * @param T - 事件数据的类型
 */
export type AppEventHandler<T = unknown> = (payload: T) => void;

/**
 * 位置接口
 * 表示元素在画布上的位置
 */
export interface Position {
  top: number;   // 距离顶部的像素值
  left: number;  // 距离左边的像素值
}
