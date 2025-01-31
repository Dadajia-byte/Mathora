// 蓝湖上设计稿自定义为1920px 测量值直接写入即可
const baseSize = 16
function setRem() {
  const scale = document.documentElement.clientWidth / 1920
  document.documentElement.style.fontSize = baseSize * scale + 'px'
}
setRem()
window.onresize = function () {
  setRem()
}

