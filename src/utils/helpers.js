// 将类数组对象转换为数组
export const toArray = inp => Array.prototype.slice.call(inp);

// 清除编辑区域所有元素的选中状态
export const clearAllSelected = (container) => {
  toArray(container.children).forEach(c => {
    c.classList.remove('selected');
    if (toArray(c.classList).indexOf('delbtn') !== -1) {
      container.removeChild(c);
    }
  });
};

// 给元素添加选中状态
export const selectElement = (element) => {
  element.classList.add('selected');
};

// 生成唯一ID
export const generateId = () => {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};