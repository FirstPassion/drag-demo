/**
 * 自定义弹窗工具
 * 替代浏览器原生的 alert() 和 confirm()，提供更美观的 UI 体验
 */

type DialogIcon = 'success' | 'warning' | 'error' | 'info';

// 图标符号映射（模块级别，避免重复定义）
const ICON_SYMBOLS: Record<DialogIcon, string> = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ'
};

/**
 * 显示提示弹窗（替代 alert）
 * @param message - 提示消息
 * @param icon - 图标类型
 * @returns Promise，点击确定或按回车/Escape 后 resolve
 */
export function showAlert(message: string, icon: DialogIcon = 'info'): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    overlay.innerHTML = `
      <div class="dialog-box">
        <div class="dialog-icon ${icon}">${ICON_SYMBOLS[icon]}</div>
        <div class="dialog-message">${message}</div>
        <div class="dialog-buttons">
          <button class="dialog-btn primary">确定</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btn = overlay.querySelector('.dialog-btn') as HTMLButtonElement;

    // 关闭弹窗并清理事件
    const close = () => {
      document.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
      resolve();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') close();
    };

    btn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', handleKeyDown);
    btn.focus();
  });
}

/**
 * 显示确认弹窗（替代 confirm）
 * @param message - 确认消息
 * @param options - 配置选项
 * @returns Promise<boolean>，点击确定返回 true，取消或关闭返回 false
 */
export function showConfirm(
  message: string,
  options: { confirmText?: string; cancelText?: string; icon?: DialogIcon } = {}
): Promise<boolean> {
  const { confirmText = '确定', cancelText = '取消', icon = 'warning' } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    overlay.innerHTML = `
      <div class="dialog-box">
        <div class="dialog-icon ${icon}">${ICON_SYMBOLS[icon]}</div>
        <div class="dialog-message">${message}</div>
        <div class="dialog-buttons">
          <button class="dialog-btn cancel">${cancelText}</button>
          <button class="dialog-btn primary confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const confirmBtn = overlay.querySelector('.confirm') as HTMLButtonElement;
    const cancelBtn = overlay.querySelector('.cancel') as HTMLButtonElement;

    // 关闭弹窗并清理事件
    const close = (result: boolean) => {
      document.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
      resolve(result);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') close(true);
      else if (e.key === 'Escape') close(false);
    };

    confirmBtn.addEventListener('click', () => close(true));
    cancelBtn.addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', handleKeyDown);
    cancelBtn.focus();
  });
}

/** 显示成功提示 */
export function showSuccess(message: string): Promise<void> {
  return showAlert(message, 'success');
}

/** 显示错误提示 */
export function showError(message: string): Promise<void> {
  return showAlert(message, 'error');
}

/** 显示警告提示 */
export function showWarning(message: string): Promise<void> {
  return showAlert(message, 'warning');
}
