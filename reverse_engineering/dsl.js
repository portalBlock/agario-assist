// Exported stuff
window.onresize = onResize
window.onload = init

// Functions
getSkin(this.name)
setInterval(refreshRegionInfo, 180000)
setInterval(draw, 1000 / 60)
setInterval(sendTargetUpdate, 100)
function think() { QUAD.init }
function calculateZoom() { zoom = (9 * zoom + sizeFactor) / 10.0 }
function Cell(id, x, y, size, color, isVirus, name) { this.points = [] }
function SizeCache(size, color, stroke, strokeColor) { this._strokeColor }

// Variables
canvas = _canvas = document.getElementById('canvas')
ctx = canvas.getContext('2d')
canvasWidth = window.innerWidth
canvasHeight = window.innerHeight
isMobile = 'ontouchstart' in window && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
mouseX = e.clientX
mouseY = e.clientY
ctx.scale(zoom, zoom)
blackTheme ? '#111111' : '#F2FBFF'
hardMode || 15 < this.size
skin = skinsEnabled ? getSkin(this.name) : null // skin is a local variable
namesEnabled || skin
massEnabled && skin
//skin = -1 != myCells.indexOf(this) // Doesn't work, can't do member operations (yet?)
ctx.drawImage(renderedScoreboard, canvasWidth - renderedScoreboard.width - 10, 10)
skinsNames = 'poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;ussr;pewdiepie;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;nazi;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina'.split(';')

// Random, mostly to help the definitions above run
sizeFactor = Math.pow(Math.min(64 / sizeFactor, 1), 0.4) * Math.max(canvasHeight / 965, canvasWidth / 1920)
