import { AppState } from '../types';

// 持久化存储（保存/加载状态）
export class PersistenceManager {
  private storageKey: string;

  constructor(storageKey: string = 'drag-demo') {
    this.storageKey = storageKey;
  }

  // 保存状态到 localStorage
  save(state: AppState, name: string = 'default'): void {
    try {
      const data = {
        state,
        savedAt: Date.now()
      };
      localStorage.setItem(`${this.storageKey}:${name}`, JSON.stringify(data));
    } catch (error) {
      console.error('保存状态失败:', error);
    }
  }

  // 从 localStorage 加载状态
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

  // 列出所有保存的项目
  list(): string[] {
    const projects: string[] = [];
    const prefix = `${this.storageKey}:`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        projects.push(key.slice(prefix.length));
      }
    }

    return projects;
  }

  // 删除保存的项目
  delete(name: string): void {
    localStorage.removeItem(`${this.storageKey}:${name}`);
  }

  // 导出为 JSON 字符串
  export(state: AppState): string {
    return JSON.stringify({
      version: '1.0.0',
      state,
      exportedAt: Date.now()
    }, null, 2);
  }

  // 从 JSON 字符串导入
  import(json: string): AppState | null {
    try {
      const data = JSON.parse(json);
      if (data.state && data.state.components) {
        return data.state as AppState;
      }
      return null;
    } catch (error) {
      console.error('导入状态失败:', error);
      return null;
    }
  }

  // 下载为文件
  download(state: AppState, filename: string = 'project.json'): void {
    const json = this.export(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
