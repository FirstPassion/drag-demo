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
import { showConfirm, showSuccess, showWarning } from './utils/dialog';
import './style.css';

/**
 * 应用入口
 * 页面加载完成后调用 initApp() 初始化所有模块。
 *
 * 初始化顺序：
 * 1. 创建核心模块（Store、HistoryManager、PersistenceManager）
 * 2. 获取 DOM 元素
 * 3. 创建管理器（SelectionManager、DragManager、MoveManager）
 * 4. 创建 UI 组件（Editor、PropertyPanel、ComponentLibrary）
 * 5. 初始化事件监听（拖拽、移动、工具栏按钮、键盘快捷键）
 * 6. 加载保存的状态
 *
 * 模块依赖关系：
 *   Store（中心）
 *     ├── HistoryManager（监听 state:changed）
 *     ├── SelectionManager（监听 component:selected/deselected）
 *     ├── PropertyPanel（监听 component:selected/deselected/updated）
 *     ├── Editor（监听 state:changed）
 *     ├── DragManager（调用 addComponent、selectComponent）
 *     └── MoveManager（调用 updateComponent）
 */
function initApp(): void {
  // ========== 1. 创建核心模块 ==========
  const store = new Store({ components: [], selectedId: null });  // 中央状态管理
  const history = new HistoryManager(store);                       // 撤销/重做历史
  const persistence = new PersistenceManager();                    // 本地存储
  const registry = new ComponentRegistry();                        // 组件注册表
  const gridSnapper = new GridSnapper(20);                         // 网格对齐（20px）

  // ========== 2. 获取 DOM 元素 ==========
  const leftContainer = document.querySelector('#left') as HTMLElement;      // 左侧组件库
  const editorContainer = document.querySelector('#midden') as HTMLElement;  // 中间画布
  const rightContainer = document.querySelector('#right') as HTMLElement;    // 右侧属性面板

  if (!leftContainer || !editorContainer || !rightContainer) {
    console.error('找不到必要的DOM元素');
    return;
  }

  // ========== 3. 创建管理器 ==========
  const selectionManager = new SelectionManager(store);
  const dragManager = new DragManager(store, editorContainer, gridSnapper, selectionManager, registry);
  const moveManager = new MoveManager(store, editorContainer, gridSnapper);

  // ========== 4. 创建 UI 组件 ==========
  const editor = new Editor(editorContainer, store, registry, selectionManager, moveManager);
  new PropertyPanel(rightContainer, store, registry);
  new ComponentLibrary(leftContainer, registry, dragManager);

  // ========== 5. 初始化事件监听 ==========
  dragManager.init();  // 拖拽事件（从组件库拖拽到画布）
  moveManager.init();  // 移动事件（画布上组件的位置移动）

  setupToolbarButtons(editor, persistence, store, history);  // 工具栏按钮
  setupKeyboardShortcuts(store, history, persistence);       // 键盘快捷键

  // ========== 6. 加载保存的状态 ==========
  loadSavedState(store, persistence);
}

/**
 * 绑定点击事件的辅助函数
 * @param selector - CSS 选择器
 * @param handler - 点击事件处理函数
 *
 * 使用示例：
 *   bindClick('.save', () => { persistence.save(store.getState()); });
 */
function bindClick(selector: string, handler: () => void): void {
  const el = document.querySelector(selector);
  if (el) el.addEventListener('click', handler);
}

/**
 * 设置工具栏按钮的事件绑定
 *
 * 按钮功能：
 * - .look: 全屏预览
 * - .code: 双击退出预览
 * - .down: 下载源码
 * - .clear: 清除全部
 * - .save: 保存到本地存储
 * - .load: 从本地存储加载
 * - .export: 导出为 JSON 文件
 * - .undo: 撤销
 * - .redo: 重做
 */
function setupToolbarButtons(
  editor: Editor,
  persistence: PersistenceManager,
  store: Store,
  history: HistoryManager
): void {
  // 全屏预览按钮
  bindClick('.look', () => editor.togglePreviewMode());

  // 双击预览区域退出预览模式
  const codeBox = document.querySelector('.code');
  if (codeBox) {
    codeBox.addEventListener('dblclick', () => editor.togglePreviewMode());
  }

  // 下载源码按钮
  bindClick('.down', () => editor.downloadSourceCode());

  // 清除全部按钮（需要确认）
  bindClick('.clear', async () => {
    const confirmed = await showConfirm('确定要清除所有组件吗？', {
      icon: 'warning',
      confirmText: '确定清除'
    });
    if (confirmed) editor.clear();
  });

  // 保存按钮
  bindClick('.save', async () => {
    persistence.save(store.getState());
    await showSuccess('保存成功！');
  });

  // 加载按钮
  bindClick('.load', async () => {
    const state = persistence.load();
    if (state) {
      store.setState(state);
      await showSuccess('加载成功！');
    } else {
      await showWarning('没有找到保存的数据');
    }
  });

  // 导出按钮
  bindClick('.export', () => persistence.download(store.getState()));

  // 撤销/重做按钮
  bindClick('.undo', () => history.undo());
  bindClick('.redo', () => history.redo());
}

/**
 * 设置键盘快捷键
 *
 * 快捷键：
 * - Ctrl+Z: 撤销
 * - Ctrl+Shift+Z 或 Ctrl+Y: 重做
 * - Ctrl+S: 保存
 * - Delete: 删除选中的组件
 */
function setupKeyboardShortcuts(store: Store, history: HistoryManager, persistence: PersistenceManager): void {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      history.undo();
    }
    if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      history.redo();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      persistence.save(store.getState());
    }
    if (e.key === 'Delete') {
      const selectedId = store.getSelectedId();
      if (selectedId) store.removeComponent(selectedId);
    }
  });
}

/**
 * 加载保存的状态
 * 应用启动时自动调用，从 localStorage 加载之前保存的状态
 */
function loadSavedState(store: Store, persistence: PersistenceManager): void {
  const savedState = persistence.load();
  if (savedState && savedState.components.length > 0) {
    store.setState(savedState);
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);
