// 左边组件区域
const left = document.querySelector('#left')
// 中间编辑区域
const midden = document.querySelector('#midden')
// 右边属性区域
const right = document.querySelector('#right')
// 用来全屏预览的容器
const codeBox = document.querySelector('.code')
// 右边的属性输入框
const inputs = document.querySelectorAll("#right > .item > input")
// 全屏预览按钮
const lookBtn = document.querySelector('.look')
// 下载源码按钮
const downBtn = document.querySelector('.down')
// 清除全部按钮
const clearBtn = document.querySelector('.clear')

// 记录当前操作的元素(拖拽时、选中时)
let curr = null

// 把html元素等list转成普通的Array,便于链式调用
const toArray = inp => Array.prototype.slice.call(inp)

// 移除编辑区域的元素的选中框
const clearAllselected = _ => {
  toArray(midden.children)
    .forEach(c => {
      c.classList.remove('selected')
      if (toArray(c.classList).indexOf('delbtn') !== -1) {
        // 移除掉这个删除按钮
        midden.removeChild(c)
      }
    })
}

// 给当前选中的元素加上标记框
const selectedEl = el => {
  clearAllselected()
  el.classList.add('selected')
}

// 组件进入编辑区域
const dragenter = e => {
  // 添加拖拽时的网格线样式
  midden.classList.add('drag-over');
}

// 组件经过编辑区域
const dragover = e => {
  // 取消默认事件
  e.preventDefault()
  // 设置拖拽效果
  e.dataTransfer.dropEffect = 'copy'
  // 防止事件冒泡
  e.stopPropagation()
  // 确保拖拽时的网格线样式持续显示
  midden.classList.add('drag-over');
}

// 组件离开编辑区域
const dragleave = e => {
  // 移除拖拽时的网格线样式
  midden.classList.remove('drag-over');
  // 防止事件冒泡
  e.stopPropagation()
}

// 编辑区域拖拽鼠标松开事件(大部分功能都在这里)
const drop = e => {
  if (curr) {
    // 移除拖拽时的网格线样式
    midden.classList.remove('drag-over');
    // 清除编辑区域的所有选中和删除按钮
    clearAllselected()
    // 阻止默认事件
    e.preventDefault()
    // 防止事件冒泡
    e.stopPropagation()
    // 获取编辑区域的位置信息
    const middenRect = midden.getBoundingClientRect()
    
    // 计算鼠标相对于编辑区域的位置
    const mouseX = e.clientX - middenRect.left
    const mouseY = e.clientY - middenRect.top
    
    // 获取存储的组件尺寸信息
    let componentWidth, componentHeight;
    try {
      const sizeData = JSON.parse(e.dataTransfer.getData("text/plain"));
      componentWidth = sizeData.width;
      componentHeight = sizeData.height;
    } catch (error) {
      // 如果无法获取存储的尺寸信息，则使用当前组件的尺寸
      const rect = curr.getBoundingClientRect();
      componentWidth = rect.width;
      componentHeight = rect.height;
    }
    
    // 计算组件左上角的位置（始终以鼠标位置为组件左上角）
    let top = mouseY
    let left = mouseX
    
    // 网格对齐（网格大小为20px）
    const gridSize = 20;
    top = Math.round(top / gridSize) * gridSize;
    left = Math.round(left / gridSize) * gridSize;
    
    // 确保位置不会为负数且不会超出编辑区域
    top = Math.max(0, Math.min(top, middenRect.height - componentHeight))
    left = Math.max(0, Math.min(left, middenRect.width - componentWidth))
    
    // 克隆出当前操作的元素
    const child = curr.cloneNode(true) // 使用true参数深度克隆
    // 设置必要的定位属性,父元素设置了相对定位,所以这些添加的子元素都设置绝对定位
    child.style.position = 'absolute'
    child.style.top = top + 'px'
    child.style.left = left + 'px'
    // 设置组件的固定尺寸
    child.style.width = componentWidth + 'px'
    child.style.height = componentHeight + 'px'
    // 如果是图片组件，确保完整显示图片内容
    if (child.tagName === 'IMG') {
      child.style.objectFit = 'contain'
    }
    // 特殊处理textarea组件
    if (child.tagName === 'TEXTAREA') {
      child.value = curr.value || '' // 保持textarea的值
    }
    // 特殊处理select组件
    if (child.tagName === 'SELECT') {
      // 保持select的选项和选中状态
      for (let i = 0; i < curr.options.length; i++) {
        child.options[i].selected = curr.options[i].selected
      }
    }
    // 特殊处理包含checkbox/radio的div组件
    if (child.tagName === 'DIV' && curr.querySelector('input[type="checkbox"]')) {
      const currCheckbox = curr.querySelector('input[type="checkbox"]')
      const childCheckbox = child.querySelector('input[type="checkbox"]')
      if (currCheckbox && childCheckbox) {
        childCheckbox.checked = currCheckbox.checked
      }
    }
    if (child.tagName === 'DIV' && curr.querySelector('input[type="radio"]')) {
      const currRadio = curr.querySelector('input[type="radio"]')
      const childRadio = child.querySelector('input[type="radio"]')
      if (currRadio && childRadio) {
        childRadio.checked = currRadio.checked
      }
    }
    if (child.tagName === 'DIV' && curr.querySelector('input[type="range"]')) {
      const currRange = curr.querySelector('input[type="range"]')
      const childRange = child.querySelector('input[type="range"]')
      if (currRange && childRange) {
        childRange.value = currRange.value
      }
    }
    // 填充右边属性栏的值
    const setProp = _ => {
      // 先允许所有的输入框给输入
      inputs.forEach(i => i.disabled = false)
      inputs[0].value = componentWidth
      inputs[1].value = componentHeight
      inputs[2].value = top
      inputs[3].value = left
      // 动态关闭一些输入框
      if (curr.textContent) {
        inputs[4].value = curr.textContent
        inputs[4].disabled = false
        inputs[4].readOnly = false
      } else {
        inputs[4].value = ''
        inputs[4].disabled = true
        inputs[4].readOnly = true
      }
      if (curr.getAttribute('src')) {
        inputs[5].value = curr.getAttribute('src')
        inputs[5].disabled = false
        inputs[5].readOnly = false
      } else {
        inputs[5].value = ''
        inputs[5].disabled = true
        inputs[5].readOnly = true
      }
      if (curr.style.color) {
        inputs[6].value = curr.style.color
        inputs[6].disabled = false
        inputs[6].readOnly = false
      } else {
        inputs[6].value = ''
        inputs[6].disabled = true
        inputs[6].readOnly = true
      }
      if (curr.style.fontSize) {
        inputs[7].value = curr.style.fontSize
        inputs[7].disabled = false
        inputs[7].readOnly = false
      } else {
        inputs[7].value = ''
        inputs[7].disabled = true
        inputs[7].readOnly = true
      }
      
      // 为每个输入框添加blur事件监听器
      inputs[0].onblur = function() {
        if (curr && this.value) {
          curr.style.width = this.value + 'px'
        }
      }
      inputs[1].onblur = function() {
        if (curr && this.value) {
          curr.style.height = this.value + 'px'
        }
      }
      inputs[2].onblur = function() {
        if (curr && this.value) {
          curr.style.top = this.value + 'px'
        }
      }
      inputs[3].onblur = function() {
        if (curr && this.value) {
          curr.style.left = this.value + 'px'
        }
      }
      inputs[4].onblur = function() {
        if (curr && this.value && curr.textContent) {
          curr.textContent = this.value
        }
      }
      inputs[5].onblur = function() {
        if (curr && this.value && curr.getAttribute('src')) {
          curr.src = this.value
        }
      }
      inputs[6].onblur = function() {
        if (curr && this.value && curr.style.color) {
          curr.style.color = this.value
        }
      }
      inputs[7].onblur = function() {
        if (curr && this.value && curr.style.fontSize) {
          curr.style.fontSize = this.value + 'px'
        }
      }
      
      // 为每个输入框添加回车事件监听器
      inputs[0].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value) {
          curr.style.width = this.value + 'px'
        }
      }
      inputs[1].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value) {
          curr.style.height = this.value + 'px'
        }
      }
      inputs[2].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value) {
          curr.style.top = this.value + 'px'
        }
      }
      inputs[3].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value) {
          curr.style.left = this.value + 'px'
        }
      }
      inputs[4].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value && curr.textContent) {
          curr.textContent = this.value
        }
      }
      inputs[5].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value && curr.getAttribute('src')) {
          curr.src = this.value
        }
      }
      inputs[6].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value && curr.style.color) {
          curr.style.color = this.value
        }
      }
      inputs[7].onkeypress = function(e) {
        if (e.key === 'Enter' && curr && this.value && curr.style.fontSize) {
          curr.style.fontSize = this.value + 'px'
        }
      }
    }
    // 元素点击事件
    child.onclick = function (e) {
      // 阻止冒泡事件,不然就移动不了了
      e.stopPropagation()
      curr = this
      // 给当前元素添加选中样式
      selectedEl(this)
      // 重新设置右边属性栏的属性
      setProp()
    }
    // 让元素有tabIndex属性才能监听键盘事件
    child.tabIndex = -1
    // 选中当前元素的时候监听键盘事件,按下del就删除当前元素
    child.onkeydown = function (e) {
      if (e.keyCode === 46) {
        midden.removeChild(this)
        curr = null
      }
    }
    // 取消默认的contextmenu事件
    child.oncontextmenu = function (e) {
      e.preventDefault()
    }
    // 监听鼠标按下事件
    child.onmousedown = function (e) {
      // 判断是不是按下了鼠标右键
      if (e.button === 2) {
        // 判断当前元素是不是选中状态,选中才创建删除按钮
        if (child.className === 'selected') {
          // 获取当前元素的top、left
          const top = child.style.top
          const width = componentWidth
          let left = child.style.left
          // 计算按钮的left位置 元素的 left + width - 20(删除按钮的width)
          left = parseFloat(left.substring(0, left.length - 2)) + width - 20
          // 在当前元素的右上角创建一个删除按钮
          const delbtn = document.createElement('div')
          // 给删除按钮加上一个className方便在元素移动后删除掉这些删除按钮
          delbtn.classList.add('delbtn')
          delbtn.style.position = 'absolute'
          delbtn.style.width = '20px'
          delbtn.style.height = '20px'
          delbtn.style.backgroundColor = 'red'
          delbtn.style.top = top
          delbtn.style.left = left + 'px'
          delbtn.style.textAlign = 'center'
          delbtn.style.cursor = 'pointer'
          delbtn.style.color = '#fff'
          delbtn.textContent = 'X'
          // 删除按钮点击事件
          delbtn.onclick = function () {
            midden.removeChild(curr)
            midden.removeChild(this)
            curr = null
          }
          midden.appendChild(delbtn)
        }
      }
    }
    // 先添加新元素,然后删掉之前的元素
    midden.appendChild(child)
    // 添加的时候默认选中当前的元素
    selectedEl(child)
    // 遍历预览区的所有子元素,判断有没有和当前元素是一样的,如果一样就移除掉这个子元素
    toArray(midden.children)
      .forEach(c => {
        if (curr === c) {
          midden.removeChild(c)
        }
      })
    // 设置属性到右边的属性栏
    setProp()
    // 让当前选中的元素指向刚刚创建的这个元素
    curr = child
  }
}

// 添加组件到编辑区域,编辑区域监听拖拽事件
const addComponent = (component) => {
  curr = component
  // dragenter组件进入编辑区域中
  midden.addEventListener('dragenter', dragenter)
  // dragover在目标元素中经过,必须要阻止默认行为,不然不能触发drop事件
  midden.addEventListener('dragover', dragover)
  // dragleave组件离开编辑区域
  midden.addEventListener('dragleave', dragleave)
  // drop在目标元素松开时,添加一个组件
  midden.addEventListener('drop', drop)
}

// 给组件区域的组件绑定拖动事件
toArray(left.children).forEach(component => {
  // 元素拖动事件监听
  component.ondragstart = e => {
    // 在拖拽开始时存储组件的原始尺寸信息
    const componentRect = component.getBoundingClientRect();
    
    e.dataTransfer.setData("text/plain", JSON.stringify({
      width: componentRect.width,
      height: componentRect.height
    }))
    e.dataTransfer.effectAllowed = "copy"
    // 防止事件冒泡
    e.stopPropagation()
    addComponent(component)
  }
  
  // 特别处理select包装器元素
  if (component.classList.contains('select-wrapper')) {
    // 阻止select元素的默认行为
    const select = component.querySelector('select');
    if (select) {
      select.onmousedown = e => {
        e.preventDefault(); // 阻止默认的下拉行为
      }
      
      select.onclick = e => {
        e.preventDefault(); // 阻止点击事件
      }
      
      select.onfocus = e => {
        e.preventDefault(); // 阻止获得焦点
        select.blur(); // 立即失去焦点
      }
      
      // 添加触摸事件处理
      select.ontouchstart = e => {
        e.preventDefault(); // 阻止默认的触摸行为
      }
    }
  }
  
  // 特别处理包含input的div元素，防止input干扰拖拽
  if (component.tagName === 'DIV' && component.querySelector('input') && !component.classList.contains('select-wrapper')) {
    const inputs = component.querySelectorAll('input');
    inputs.forEach(input => {
      input.onmousedown = e => {
        e.stopPropagation(); // 阻止事件冒泡到父元素
      }
      
      input.onfocus = e => {
        e.stopPropagation(); // 阻止焦点事件冒泡
      }
      
      // 添加触摸事件处理
      input.ontouchstart = e => {
        e.stopPropagation(); // 阻止触摸事件冒泡
      }
    });
  }
})

// 编辑区域点击事件
midden.onclick = _ => {
  // 取消选中的元素
  curr = null
  // 清空属性框中的值
  inputs.forEach(i => {
    i.value = ''
    i.disabled = false
  })
  // 取消组件的选中框
  clearAllselected()
}

// 生成html代码
const generateCode = code => `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览页面</title>
</head>
<body>
  <div style="position: relative; width: 100%; min-height: 100vh;">${code.replaceAll('draggable="true"', '').replaceAll('tabindex="-1"', '')}
  </div>
</body>
</html>`

// 生成源码文件
const generateCodeSource = (code, fileName) => {
  const a = document.createElement('a')
  // 下载文件的名字
  a.download = fileName
  a.style.display = 'none'
  // 把内容变成Blob数据
  const blob = new Blob([code])
  // 创建链接
  a.href = URL.createObjectURL(blob)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 全屏预览
lookBtn.onclick = _ => {
  clearAllselected()
  const code = generateCode(midden.innerHTML)
  left.style.display = 'none'
  midden.style.display = 'none'
  right.style.display = 'none'
  codeBox.style.display = 'block'
  codeBox.innerHTML = code
}

// 双击关闭预览
codeBox.ondblclick = _ => {
  codeBox.style.display = 'none'
  left.style.display = 'block'
  midden.style.display = 'block'
  right.style.display = 'block'
}

// 下载源码文件
downBtn.onclick = _ => {
  // 清除掉组件的选中框
  clearAllselected()
  // 处理生成源码,去掉允许拖拽
  const code = generateCode(midden.innerHTML)
  generateCodeSource(code, 'index.html')
}

// 清除全部
clearBtn.onclick = _ => {
  midden.innerHTML = ''
}
