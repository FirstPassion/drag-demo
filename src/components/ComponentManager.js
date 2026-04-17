import ComponentBase from './ComponentBase.js';

class ComponentManager {
  constructor() {
    this.components = new Map();
  }

  createComponent(element, options = {}) {
    const component = new ComponentBase(element, options);
    this.components.set(component.id, component);
    return component;
  }

  getComponent(id) {
    return this.components.get(id);
  }

  removeComponent(id) {
    this.components.delete(id);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  clearAllComponents() {
    this.components.clear();
  }
}

// 导出单例实例
const componentManager = new ComponentManager();
export default componentManager;