import { AppState } from '../types';

/**
 * 持久化管理器
 * 负责将应用状态保存到浏览器的 localStorage，以及从 localStorage 加载状态。
 * 还支持将状态导出为 JSON 文件供用户下载。
 */
export class PersistenceManager {
  // localStorage 中存储数据的键名前缀，所有数据都以 "drag-demo:" 开头
  private storageKey: string;

  constructor(storageKey: string = 'drag-demo') {
    this.storageKey = storageKey;
  }

  /**
   * 保存状态到 localStorage
   * @param state - 要保存的应用状态
   * @param name - 保存的项目名称，默认为 "default"
   *
   * 调用链：用户点击"保存"按钮 → main.ts bindClick('.save') → persistence.save(store.getState())
   *   或：用户按 Ctrl+S → main.ts setupKeyboardShortcuts → persistence.save(store.getState())
   */
  save(state: AppState, name: string = 'default'): void {
    try {
      const data = {
        state,
        savedAt: Date.now()  // 记录保存时间
      };
      localStorage.setItem(`${this.storageKey}:${name}`, JSON.stringify(data));
    } catch (error) {
      console.error('保存状态失败:', error);
    }
  }

  /**
   * 从 localStorage 加载状态
   * @param name - 要加载的项目名称，默认为 "default"
   * @returns 加载成功返回 AppState，失败或无数据返回 null
   *
   * 调用链：应用启动时 → main.ts loadSavedState() → persistence.load() → store.setState()
   *   或：用户点击"加载"按钮 → main.ts bindClick('.load') → persistence.load() → store.setState()
   */
  load(name: string = 'default'): AppState | null {
    try {
      const data = localStorage.getItem(`${this.storageKey}:${name}`);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return parsed.state as AppState;
    } catch (error) {
      console.error('加载状态失败:', error);
      return null;
    }
  }

  /** 将状态导出为 JSON 字符串（内部使用） */
  private export(state: AppState): string {
    return JSON.stringify({
      version: '1.0.0',
      state,
      exportedAt: Date.now()
    }, null, 2);
  }

  /**
   * 将状态下载为 JSON 文件
   * @param state - 要下载的应用状态
   * @param filename - 下载的文件名，默认为 "project.json"
   *
   * 调用链：用户点击"导出"按钮 → main.ts bindClick('.export') → persistence.download(store.getState())
   *
   * 实现原理：
   * 1. 将状态转为 JSON 字符串
   * 2. 创建 Blob 对象
   * 3. 生成临时下载链接
   * 4. 模拟点击触发下载
   * 5. 清理临时资源
   */
  download(state: AppState, filename: string = 'project.json'): void {
    const json = this.export(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 创建隐藏的 <a> 标签来触发下载
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();  // 模拟点击
    document.body.removeChild(a);
    URL.revokeObjectURL(url);  // 释放临时 URL
  }
}
