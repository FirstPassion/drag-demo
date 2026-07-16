import { ComponentInstance } from '../types/component';

// 代码生成器

// 生成预览HTML
export function generatePreviewHTML(components: ComponentInstance[]): string {
  const content = components
    .map(comp => generateComponentHTML(comp))
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览页面</title>
</head>
<body>
  <div style="position: relative; width: 100%; min-height: 100vh;">
    ${content}
  </div>
</body>
</html>`;
}

// 生成单个组件的HTML
function generateComponentHTML(instance: ComponentInstance): string {
  const { type, props } = instance;
  const style = generateStyleString(props);

  switch (type) {
    case 'text':
      return `<p style="${style}">${props.text || ''}</p>`;

    case 'button':
      return `<button style="${style}">${props.text || ''}</button>`;

    case 'input':
      return `<input type="text" placeholder="${props.placeholder || ''}" style="${style}">`;

    case 'image':
      return `<img src="${props.src || ''}" alt="图片" style="${style}; object-fit: contain;">`;

    case 'textarea':
      return `<textarea placeholder="${props.placeholder || ''}" style="${style}"></textarea>`;

    case 'select': {
      const options = (props.options || [])
        .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
        .join('\n        ');
      return `<select style="${style}">
        ${options}
      </select>`;
    }

    case 'checkbox':
      return `<div style="${style}">
        <input type="checkbox" ${props.checked ? 'checked' : ''}>
        <label>${props.text || ''}</label>
      </div>`;

    case 'radio':
      return `<div style="${style}">
        <input type="radio" ${props.checked ? 'checked' : ''}>
        <label>${props.text || ''}</label>
      </div>`;

    case 'range':
      return `<div style="${style}">
        <input type="range" min="0" max="100" value="${props.value || 50}">
        <span>滑块</span>
      </div>`;

    default:
      return `<div style="${style}"></div>`;
  }
}

// 生成样式字符串
function generateStyleString(props: ComponentInstance['props']): string {
  const styles: string[] = [
    `position: absolute`,
    `top: ${props.top}px`,
    `left: ${props.left}px`,
    `width: ${props.width}px`,
    `height: ${props.height}px`
  ];

  if (props.color) {
    styles.push(`color: ${props.color}`);
  }
  if (props.fontSize) {
    styles.push(`font-size: ${props.fontSize}`);
  }

  return styles.join('; ');
}

// 下载文件
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
