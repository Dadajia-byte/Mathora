// 蓝湖上设计稿自定义为1920px 测量值直接写入即可

const baseSize = 192; //设计稿宽度%10 比如 1920 

// 设置rem 函数
function setRem() {
//计算出 比例来 当前分辨率的宽%设计稿宽度
  const scale = window.screen.width / 1920;
  // 给根元素设置font-size
  document.documentElement.style.fontSize =
    baseSize * Math.min(scale, 2) + "px";
}
 setRem();
  window.onresize = function () {
    setRem();
  };
