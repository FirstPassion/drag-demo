// DOM 操作工具

// 获取单个元素
export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

// 获取多个元素
export function $$(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}

// 创建元素
export function createElement(
  tag: string,
  attrs?: Record<string, string>,
  children?: (Node | string)[]
): HTMLElement {
  const element = document.createElement(tag);

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

// 清除子元素
export function removeChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// HTMLCollection 转数组
export function toArray(collection: HTMLCollection | NodeList): HTMLElement[] {
  return Array.from(collection) as HTMLElement[];
}

// 检查元素是否包含某个类名
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

// 添加事件监听器的便捷方法
export function on<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void
): () => void {
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
}

// 阻止事件冒泡
export function stopPropagation(e: Event): void {
  e.stopPropagation();
}

// 阻止默认行为
export function preventDefault(e: Event): void {
  e.preventDefault();
}
