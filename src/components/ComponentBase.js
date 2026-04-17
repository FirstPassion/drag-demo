class ComponentBase {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    this.id = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.element.dataset.id = this.id;
  }

  getProperties() {
    const style = window.getComputedStyle(this.element);
    return {
      width: this.element.style.width || style.width,
      height: this.element.style.height || style.height,
      top: this.element.style.top || '0px',
      left: this.element.style.left || '0px',
      text: this.element.textContent || '',
      src: this.element.getAttribute('src') || '',
      color: this.element.style.color || style.color,
      fontSize: this.element.style.fontSize || style.fontSize
    };
  }

  setProperties(properties) {
    if (properties.width) {
      this.element.style.width = properties.width + 'px';
    }
    if (properties.height) {
      this.element.style.height = properties.height + 'px';
    }
    if (properties.top) {
      this.element.style.top = properties.top + 'px';
    }
    if (properties.left) {
      this.element.style.left = properties.left + 'px';
    }
    if (properties.text && this.element.textContent) {
      this.element.textContent = properties.text;
    }
    if (properties.src && this.element.getAttribute('src')) {
      this.element.src = properties.src;
    }
    if (properties.color) {
      this.element.style.color = properties.color;
    }
    if (properties.fontSize) {
      this.element.style.fontSize = properties.fontSize + 'px';
    }
  }

  render() {
    return this.element;
  }
}

export default ComponentBase;