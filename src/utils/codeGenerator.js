class CodeGenerator {
  generateCode(content) {
    return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览页面</title>
</head>
<body>
  <div style="position: relative; width: 100%; min-height: 100vh;">${content.replaceAll('draggable="true"', '').replaceAll('tabindex="-1"', '')}
  </div>
</body>
</html>`;
  }

  generateCodeSource(code, fileName) {
    const a = document.createElement('a');
    a.download = fileName;
    a.style.display = 'none';
    const blob = new Blob([code]);
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// 导出单例实例
const codeGenerator = new CodeGenerator();
export default codeGenerator;