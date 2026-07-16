// 简单的事件总线实现
type EventHandler = (...args: unknown[]) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>>;

  constructor() {
    this.handlers = new Map();
  }

  // 订阅事件
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // 返回取消订阅函数
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  // 一次性订阅
  once(event: string, handler: EventHandler): () => void {
    const wrapper = (...args: unknown[]) => {
      handler(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  // 取消订阅
  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  // 触发事件
  emit(event: string, ...args: unknown[]): void {
    this.handlers.get(event)?.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  // 清除所有事件处理器
  clear(): void {
    this.handlers.clear();
  }
}
