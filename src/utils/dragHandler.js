class DragHandler {
  constructor(midden, onDrop) {
    this.midden = midden;
    this.onDrop = onDrop;
    this.currentComponent = null;
    this.init();
  }

  init() {
    this.midden.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.midden.addEventListener('dragover', this.handleDragOver.bind(this));
    this.midden.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.midden.addEventListener('drop', this.handleDrop.bind(this));
  }

  handleDragEnter(e) {
    e.preventDefault();
    this.midden.classList.add('drag-over');
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.midden.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.midden.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    this.midden.classList.remove('drag-over');

    if (this.currentComponent) {
      const middenRect = this.midden.getBoundingClientRect();
      const mouseX = e.clientX - middenRect.left;
      const mouseY = e.clientY - middenRect.top;

      let componentWidth, componentHeight;
      try {
        const sizeData = JSON.parse(e.dataTransfer.getData('text/plain'));
        componentWidth = sizeData.width;
        componentHeight = sizeData.height;
      } catch (error) {
        const rect = this.currentComponent.getBoundingClientRect();
        componentWidth = rect.width;
        componentHeight = rect.height;
      }

      const gridSize = 20;
      let top = Math.round(mouseY / gridSize) * gridSize;
      let left = Math.round(mouseX / gridSize) * gridSize;

      top = Math.max(0, Math.min(top, middenRect.height - componentHeight));
      left = Math.max(0, Math.min(left, middenRect.width - componentWidth));

      if (this.onDrop) {
        this.onDrop(this.currentComponent, { top, left, width: componentWidth, height: componentHeight });
      }

      this.currentComponent = null;
    }
  }

  setCurrentComponent(component) {
    this.currentComponent = component;
  }

  cleanup() {
    this.midden.removeEventListener('dragenter', this.handleDragEnter.bind(this));
    this.midden.removeEventListener('dragover', this.handleDragOver.bind(this));
    this.midden.removeEventListener('dragleave', this.handleDragLeave.bind(this));
    this.midden.removeEventListener('drop', this.handleDrop.bind(this));
  }
}

export default DragHandler;