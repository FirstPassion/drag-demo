import { Store } from './state/store';
import { HistoryManager } from './state/history';
import { PersistenceManager } from './state/persistence';
import { ComponentRegistry } from './components/ComponentRegistry';
import { Editor } from './components/Editor';
import { PropertyPanel } from './components/PropertyPanel';
import { ComponentLibrary } from './components/ComponentLibrary';
import { DragManager } from './core/DragManager';
import { SelectionManager } from './core/SelectionManager';
import { GridSnapper } from './core/GridSnapper';
import { MoveManager } from './core/MoveManager';
import './style.css';

// 初始化应用
function initApp(): void {
  // 创建状态管理器
  const store = new Store({
    components: [],
    selectedId: null
  });

  // 创建历史管理器
  const history = new HistoryManager(store);

  // 创建持久化管理器
  const persistence = new PersistenceManager();

  // 创建组件注册表
  const registry = new ComponentRegistry();

  // 创建网格对齐器
  const gridSnapper = new GridSnapper(20);

  // 获取DOM元素
  const leftContainer = document.querySelector('#left') as HTMLElement;
  const editorContainer = document.querySelector('#midden') as HTMLElement;
  const rightContainer = document.querySelector('#right') as HTMLElement;

  if (!leftContainer || !editorContainer || !rightContainer) {
    console.error('找不到必要的DOM元素');
    return;
  }

  // 创建选中状态管理器
  const selectionManager = new SelectionManager(store);

  // 创建拖拽管理器
  const dragManager = new DragManager(
    store,
    editorContainer,
    gridSnapper,
    selectionManager,
    registry
  );

  // 创建移动管理器
  const moveManager = new MoveManager(store, editorContainer, gridSnapper);

  // 创建编辑器
  const editor = new Editor(editorContainer, store, registry, selectionManager, moveManager);

  // 创建属性面板（内部设置事件监听器）
  new PropertyPanel(rightContainer, store, registry);

  // 创建组件库（内部设置事件监听器）
  new ComponentLibrary(leftContainer, registry, dragManager);

  // 初始化拖拽事件
  dragManager.init();

  // 初始化移动事件
  moveManager.init();

  // 绑定工具栏按钮
  setupToolbarButtons(editor, persistence, store, history);

  // 绑定快捷键
  setupKeyboardShortcuts(store, history);

  // 加载保存的状态
  loadSavedState(store, persistence);

  console.log('拖拽演示应用初始化完成');
}

// 设置工具栏按钮
function setupToolbarButtons(
  editor: Editor,
  persistence: PersistenceManager,
  store: Store,
  history: HistoryManager
): void {
  // 全屏预览按钮
  const lookBtn = document.querySelector('.look');
  if (lookBtn) {
    lookBtn.addEventListener('click', () => {
      editor.enterPreviewMode();
    });
  }

  // 双击关闭预览
  const codeBox = document.querySelector('.code');
  if (codeBox) {
    codeBox.addEventListener('dblclick', () => {
      editor.exitPreviewMode();
    });
  }

  // 下载源码按钮
  const downBtn = document.querySelector('.down');
  if (downBtn) {
    downBtn.addEventListener('click', () => {
      editor.downloadSourceCode();
    });
  }

  // 清除全部按钮
  const clearBtn = document.querySelector('.clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('确定要清除所有组件吗？')) {
        editor.clear();
      }
    });
  }

  // 保存按钮（如果存在）
  const saveBtn = document.querySelector('.save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const state = store.getState();
      persistence.save(state);
      alert('保存成功！');
    });
  }

  // 加载按钮（如果存在）
  const loadBtn = document.querySelector('.load');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const state = persistence.load();
      if (state) {
        store.setState(state);
        alert('加载成功！');
      } else {
        alert('没有找到保存的数据');
      }
    });
  }

  // 导出按钮（如果存在）
  const exportBtn = document.querySelector('.export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const state = store.getState();
      persistence.download(state);
    });
  }

  // 撤销按钮（如果存在）
  const undoBtn = document.querySelector('.undo');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      history.undo();
    });
  }

  // 重做按钮（如果存在）
  const redoBtn = document.querySelector('.redo');
  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      history.redo();
    });
  }
}

// 设置键盘快捷键
function setupKeyboardShortcuts(store: Store, history: HistoryManager): void {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Z: 撤销
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      history.undo();
    }

    // Ctrl+Shift+Z 或 Ctrl+Y: 重做
    if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      history.redo();
    }

    // Ctrl+S: 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      const persistence = new PersistenceManager();
      const state = store.getState();
      persistence.save(state);
    }

    // Delete: 删除选中的组件
    if (e.key === 'Delete') {
      const selectedId = store.getSelectedId();
      if (selectedId) {
        store.removeComponent(selectedId);
      }
    }
  });
}

// 加载保存的状态
function loadSavedState(store: Store, persistence: PersistenceManager): void {
  const savedState = persistence.load();
  if (savedState && savedState.components.length > 0) {
    store.setState(savedState);
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);
