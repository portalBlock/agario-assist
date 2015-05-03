canvas = _canvas = document.getElementById('canvas')
ctx = canvas.getContext('2d')
window.onresize = onResize
canvasWidth = window.innerWidth
canvasHeight = window.innerHeight
setInterval(refreshRegionInfo, 60000)
setInterval(draw, 1000 / 60)
setInterval(sendTargetUpdate, 100)
isMobile = 'ontouchstart' in window && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
mouseX = e.clientX
mouseY = e.clientY
window.onload = init
getSkin(this.name) // On it's own line since function call replacements have to be
skin = skinsEnabled ? getSkin(this.name) : null
ctx.scale(zoom, zoom)
blackTheme ? '#111111' : '#F2FBFF'
ctx.drawImage(renderedScoreboard, canvasWidth - renderedScoreboard.width - 10, 10)
hardMode || 15 < this.size
