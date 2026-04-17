import DragHandler from './utils/dragHandler.js';
import PropertyEditor from './utils/propertyEditor.js';
import codeGenerator from './utils/codeGenerator.js';
import componentManager from './components/ComponentManager.js';
import { toArray, clearAllSelected, selectElement } from './utils/helpers.js';

class App {
  constructor() {
    this.left = document.querySelector('#left');
    this.midden = document.querySelector('#midden');
    this.right = document.querySelector('#right');
    this.codeBox = document.querySelector('.code');
    this.lookBtn = document.querySelector('.look');
    this.downBtn = document.querySelector('.down');
    this.clearBtn = document.querySelector('.clear');
    this.currentComponent = null;
    this.init();
  }

  init() {
    this.initDragHandler();
    this.initPropertyEditor();
    this.initComponentEvents();
    this.initButtonEvents();
    this.initMiddenEvents();
  }

  initDragHandler() {
    this.dragHandler = new DragHandler(this.midden, this.handleDrop.bind(this));
  }

  initPropertyEditor() {
    this.propertyEditor = new PropertyEditor(this.right);
  }

  initComponentEvents() {
    toArray(this.left.children).forEach(component => {
      component.ondragstart = e => {
        const componentRect = component.getBoundingClientRect();
        e.dataTransfer.setData('text/plain', JSON.stringify({
          width: componentRect.width,
          height: componentRect.height
        }));
        e.dataTransfer.effectAllowed = 'copy';
        this.dragHandler.setCurrentComponent(component);
      };

      if (component.classList.contains('select-wrapper')) {
        const select = component.querySelector('select');
        if (select) {
          select.onmousedown = e => e.preventDefault();
          select.onclick = e => e.preventDefault();
          select.onfocus = e => {
            e.preventDefault();
            select.blur();
          };
          select.ontouchstart = e => e.preventDefault();
        }
      }

      if (component.tagName === 'DIV' && component.querySelector('input') && !component.classList.contains('select-wrapper')) {
        const inputs = component.querySelectorAll('input');
        inputs.forEach(input => {
          input.onmousedown = e => e.stopPropagation();
          input.onfocus = e => e.stopPropagation();
          input.ontouchstart = e => e.stopPropagation();
        });
      }
    });
  }

  initButtonEvents() {
    this.lookBtn.onclick = () => {
      clearAllSelected(this.midden);
      const code = codeGenerator.generateCode(this.midden.innerHTML);
      this.left.style.display = 'none';
      this.midden.style.display = 'none';
      this.right.style.display = 'none';
      this.codeBox.style.display = 'block';
      this.codeBox.innerHTML = code;
    };

    this.codeBox.ondblclick = () => {
      this.codeBox.style.display = 'none';
      this.left.style.display = 'block';
      this.midden.style.display = 'block';
      this.right.style.display = 'block';
    };

    this.downBtn.onclick = () => {
      clearAllSelected(this.midden);
      const code = codeGenerator.generateCode(this.midden.innerHTML);
      codeGenerator.generateCodeSource(code, 'index.html');
    };

    this.clearBtn.onclick = () => {
      this.midden.innerHTML = '';
      componentManager.clearAllComponents();
      this.propertyEditor.setCurrentComponent(null);
      this.currentComponent = null;
    };
  }

  initMiddenEvents() {
    this.midden.onclick = () => {
      this.currentComponent = null;
      this.propertyEditor.setCurrentComponent(null);
      clearAllSelected(this.midden);
    };
  }

  handleDrop(component, position) {
    clearAllSelected(this.midden);
    
    // 检查是否是已有的组件（在midden中）
    const isExistingComponent = Array.from(this.midden.children).includes(component);
    
    if (isExistingComponent) {
      // 如果是已有的组件，只更新位置
      component.style.top = position.top + 'px';
      component.style.left = position.left + 'px';
      selectElement(component);
      this.currentComponent = component;
      
      // 更新组件实例的属性
      const componentInstance = componentManager.getComponent(component.dataset.id);
      if (componentInstance) {
        this.propertyEditor.setCurrentComponent(componentInstance);
      }
    } else {
      // 如果是新组件，创建并添加到midden
      const child = component.cloneNode(true);
      child.style.position = 'absolute';
      child.style.top = position.top + 'px';
      child.style.left = position.left + 'px';
      child.style.width = position.width + 'px';
      child.style.height = position.height + 'px';

      if (child.tagName === 'IMG') {
        child.style.objectFit = 'contain';
      }

      if (child.tagName === 'TEXTAREA') {
        child.value = component.value || '';
      }

      if (child.tagName === 'SELECT') {
        for (let i = 0; i < component.options.length; i++) {
          child.options[i].selected = component.options[i].selected;
        }
      }

      if (child.tagName === 'DIV' && component.querySelector('input[type="checkbox"]')) {
        const currCheckbox = component.querySelector('input[type="checkbox"]');
        const childCheckbox = child.querySelector('input[type="checkbox"]');
        if (currCheckbox && childCheckbox) {
          childCheckbox.checked = currCheckbox.checked;
        }
      }

      if (child.tagName === 'DIV' && component.querySelector('input[type="radio"]')) {
        const currRadio = component.querySelector('input[type="radio"]');
        const childRadio = child.querySelector('input[type="radio"]');
        if (currRadio && childRadio) {
          childRadio.checked = currRadio.checked;
        }
      }

      if (child.tagName === 'DIV' && component.querySelector('input[type="range"]')) {
        const currRange = component.querySelector('input[type="range"]');
        const childRange = child.querySelector('input[type="range"]');
        if (currRange && childRange) {
          childRange.value = currRange.value;
        }
      }

      child.onclick = e => {
        e.stopPropagation();
        this.currentComponent = child;
        selectElement(child);
        const componentInstance = componentManager.createComponent(child);
        this.propertyEditor.setCurrentComponent(componentInstance);
      };

      child.tabIndex = -1;

      child.onkeydown = e => {
        if (e.keyCode === 46) {
          this.midden.removeChild(child);
          componentManager.removeComponent(child.dataset.id);
          this.currentComponent = null;
          this.propertyEditor.setCurrentComponent(null);
        }
      };

      child.oncontextmenu = e => {
        e.preventDefault();
      };

      child.draggable = true;
      child.ondragstart = e => {
        const componentRect = child.getBoundingClientRect();
        e.dataTransfer.setData('text/plain', JSON.stringify({
          width: componentRect.width,
          height: componentRect.height
        }));
        e.dataTransfer.effectAllowed = 'move';
        this.dragHandler.setCurrentComponent(child);
      };

      child.onmousedown = e => {
        if (e.button === 2) {
          if (child.className === 'selected') {
            const top = child.style.top;
            const width = position.width;
            let left = child.style.left;
            left = parseFloat(left.substring(0, left.length - 2)) + width - 20;

            const delbtn = document.createElement('div');
            delbtn.classList.add('delbtn');
            delbtn.style.position = 'absolute';
            delbtn.style.width = '20px';
            delbtn.style.height = '20px';
            delbtn.style.backgroundColor = 'red';
            delbtn.style.top = top;
            delbtn.style.left = left + 'px';
            delbtn.style.textAlign = 'center';
            delbtn.style.cursor = 'pointer';
            delbtn.style.color = '#fff';
            delbtn.textContent = 'X';

            delbtn.onclick = () => {
              this.midden.removeChild(child);
              this.midden.removeChild(delbtn);
              componentManager.removeComponent(child.dataset.id);
              this.currentComponent = null;
              this.propertyEditor.setCurrentComponent(null);
            };

            this.midden.appendChild(delbtn);
          }
        }
      };

      this.midden.appendChild(child);
      selectElement(child);

      const componentInstance = componentManager.createComponent(child);
      this.propertyEditor.setCurrentComponent(componentInstance);
      this.currentComponent = child;
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new App();
});