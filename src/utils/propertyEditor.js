class PropertyEditor {
  constructor(rightPanel) {
    this.rightPanel = rightPanel;
    this.inputs = this.rightPanel.querySelectorAll('.item > input');
    this.currentComponent = null;
    this.init();
  }

  init() {
    this.inputs.forEach((input, index) => {
      input.addEventListener('blur', this.handleInputBlur.bind(this, index));
      input.addEventListener('keypress', this.handleInputKeypress.bind(this, index));
    });
  }

  setCurrentComponent(component) {
    this.currentComponent = component;
    if (component) {
      this.fillProperties();
    } else {
      this.clearProperties();
    }
  }

  fillProperties() {
    if (!this.currentComponent) return;

    const properties = this.currentComponent.getProperties();
    
    // 启用所有输入框
    this.inputs.forEach(input => {
      input.disabled = false;
      input.readOnly = false;
    });

    // 填充属性值
    this.inputs[0].value = parseInt(properties.width) || '';
    this.inputs[1].value = parseInt(properties.height) || '';
    this.inputs[2].value = parseInt(properties.top) || '';
    this.inputs[3].value = parseInt(properties.left) || '';
    
    // 处理文本属性
    if (this.currentComponent.element.textContent) {
      this.inputs[4].value = properties.text;
      this.inputs[4].disabled = false;
    } else {
      this.inputs[4].value = '';
      this.inputs[4].disabled = true;
    }

    // 处理图片 src 属性
    if (this.currentComponent.element.getAttribute('src')) {
      this.inputs[5].value = properties.src;
      this.inputs[5].disabled = false;
    } else {
      this.inputs[5].value = '';
      this.inputs[5].disabled = true;
    }

    // 处理颜色属性
    if (this.currentComponent.element.style.color) {
      this.inputs[6].value = properties.color;
      this.inputs[6].disabled = false;
    } else {
      this.inputs[6].value = '';
      this.inputs[6].disabled = true;
    }

    // 处理字体大小属性
    if (this.currentComponent.element.style.fontSize) {
      this.inputs[7].value = parseInt(properties.fontSize) || '';
      this.inputs[7].disabled = false;
    } else {
      this.inputs[7].value = '';
      this.inputs[7].disabled = true;
    }
  }

  clearProperties() {
    this.inputs.forEach(input => {
      input.value = '';
      input.disabled = false;
    });
  }

  handleInputBlur(index, e) {
    if (!this.currentComponent) return;

    const value = e.target.value;
    if (!value) return;

    const properties = {};
    switch (index) {
      case 0: // width
        properties.width = parseInt(value);
        break;
      case 1: // height
        properties.height = parseInt(value);
        break;
      case 2: // top
        properties.top = parseInt(value);
        break;
      case 3: // left
        properties.left = parseInt(value);
        break;
      case 4: // text
        if (this.currentComponent.element.textContent) {
          properties.text = value;
        }
        break;
      case 5: // src
        if (this.currentComponent.element.getAttribute('src')) {
          properties.src = value;
        }
        break;
      case 6: // color
        properties.color = value;
        break;
      case 7: // fontSize
        properties.fontSize = parseInt(value);
        break;
    }

    this.currentComponent.setProperties(properties);
  }

  handleInputKeypress(index, e) {
    if (e.key === 'Enter') {
      this.handleInputBlur(index, e);
    }
  }

  cleanup() {
    this.inputs.forEach((input, index) => {
      input.removeEventListener('blur', this.handleInputBlur.bind(this, index));
      input.removeEventListener('keypress', this.handleInputKeypress.bind(this, index));
    });
  }
}

export default PropertyEditor;