/**
 * 自定义弹窗工具
 * 替代浏览器原生的 alert() 和 confirm()，提供更美观的 UI 体验
 *
 * 使用示例：
 *   await showAlert('保存成功！', 'success');
 *   const confirmed = await showConfirm('确定要删除吗？');
 */

type DialogIcon = 'success' | 'warning' | 'error' | 'info';

/**
 * 显示提示弹窗（替代 alert）
 * @param message - 提示消息
 * @param icon - 图标类型：success（成功）、warning（警告）、error（错误）、info（信息）
 * @returns Promise，点击确定后 resolve
 *
 * 调用示例：
 *   await showAlert('保存成功！', 'success');
 *   await showAlert('操作失败', 'error');
 */
export function showAlert(message: string, icon: DialogIcon = 'info'): Promise<void> {
  return new Promise((resolve) => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    // 创建弹窗内容
    const iconSymbols: Record<DialogIcon, string> = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };

    overlay.innerHTML = `
      <div class="dialog-box">
        <div class="dialog-icon ${icon}">${iconSymbols[icon]}</div>
        <div class="dialog-message">${message}</div>
        <div class="dialog-buttons">
          <button class="dialog-btn primary">确定</button>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(overlay);

    // 点击确定按钮关闭
    const btn = overlay.querySelector('.dialog-btn') as HTMLButtonElement;
    btn.addEventListener('click', () => {
      overlay.remove();
      resolve();
    });

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve();
      }
    });

    // 按回车键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleKeyDown);
        resolve();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 自动聚焦确定按钮
    btn.focus();
  });
}

/**
 * 显示确认弹窗（替代 confirm）
 * @param message - 确认消息
 * @param options - 配置选项
 * @param options.confirmText - 确认按钮文字，默认"确定"
 * @param options.cancelText - 取消按钮文字，默认"取消"
 * @param options.icon - 图标类型，默认"warning"
 * @returns Promise<boolean>，点击确定返回 true，点击取消或关闭返回 false
 *
 * 调用示例：
 *   const confirmed = await showConfirm('确定要删除吗？');
 *   if (confirmed) { // 执行删除 }
 */
export function showConfirm(
  message: string,
  options: {
    confirmText?: string;
    cancelText?: string;
    icon?: DialogIcon;
  } = {}
): Promise<boolean> {
  const {
    confirmText = '确定',
    cancelText = '取消',
    icon = 'warning'
  } = options;

  return new Promise((resolve) => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    // 创建弹窗内容
    const iconSymbols: Record<DialogIcon, string> = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };

    overlay.innerHTML = `
      <div class="dialog-box">
        <div class="dialog-icon ${icon}">${iconSymbols[icon]}</div>
        <div class="dialog-message">${message}</div>
        <div class="dialog-buttons">
          <button class="dialog-btn cancel">${cancelText}</button>
          <button class="dialog-btn primary confirm">${confirmText}</button>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(overlay);

    // 获取按钮元素
    const confirmBtn = overlay.querySelector('.confirm') as HTMLButtonElement;
    const cancelBtn = overlay.querySelector('.cancel') as HTMLButtonElement;

    // 关闭弹窗的函数
    const close = (result: boolean) => {
      overlay.remove();
      resolve(result);
    };

    // 点击确定按钮
    confirmBtn.addEventListener('click', () => close(true));

    // 点击取消按钮
    cancelBtn.addEventListener('click', () => close(false));

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    // 按键处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        close(true);
      } else if (e.key === 'Escape') {
        close(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 清理事件监听器
    const originalClose = close;
    const wrappedClose = (result: boolean) => {
      document.removeEventListener('keydown', handleKeyDown);
      originalClose(result);
    };

    // 重新绑定按钮事件
    confirmBtn.onclick = () => wrappedClose(true);
    cancelBtn.onclick = () => wrappedClose(false);

    // 自动聚焦取消按钮（更安全的默认行为）
    cancelBtn.focus();
  });
}

/**
 * 显示成功提示
 * @param message - 提示消息
 */
export function showSuccess(message: string): Promise<void> {
  return showAlert(message, 'success');
}

/**
 * 显示错误提示
 * @param message - 提示消息
 */
export function showError(message: string): Promise<void> {
  return showAlert(message, 'error');
}

/**
 * 显示警告提示
 * @param message - 提示消息
 */
export function showWarning(message: string): Promise<void> {
  return showAlert(message, 'warning');
}
