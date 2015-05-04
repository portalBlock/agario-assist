(function (mapping) {
  var lookup = mapping[SIG];
  if (!lookup) return;
  for (var obfuscated in lookup) {
    if(!lookup.hasOwnProperty(obfuscated)) continue;
    var actual = lookup[obfuscated];
    Object.defineProperty(window, actual, {
      get: function () { return window[obfuscated]; },
      set: function (value) { return window[obfuscated] = value; }
    });
  }
}({
  3419680276: {
    'g': 'window',
    'v': 'jQuery',
    'ea': 'refreshRegionInfo',
    'Q': '_canvas',
    'A': 'canvas',
    'd': 'ctx',
    'R': 'mouseX',
    'S': 'mouseY',
    'ga': 'onResize',
    'U': 'draw',
    'G': 'sendTargetUpdate',
    'ua': 'think',
    'n': 'canvasWidth',
    'p': 'canvasHeight',
    'ba': 'blackTheme',
    's': 'zoom',
    'B': 'renderedScoreboard',
    'oa': 'Cell',
    'N': 'SizeCache',
    'fa': 'isMobile',
    'Fa': 'skinsNames',
    'Ea': 'getSkin',
    'ra': 'skinsEnabled',
    'O': 'hardMode',
    'da': 'namesEnabled',
    'sa': 'massEnabled',
    'ta': 'init',
    'Aa': 'calculateZoom'
  },
  2486293568: {
    'g': 'window',
    'v': 'jQuery',
    'ea': 'refreshRegionInfo',
    'Q': '_canvas',
    'B': 'canvas',
    'd': 'ctx',
    'R': 'mouseX',
    'S': 'mouseY',
    'ga': 'onResize',
    'U': 'draw',
    'G': 'sendTargetUpdate',
    'ua': 'think',
    'n': 'canvasWidth',
    'p': 'canvasHeight',
    'ba': 'blackTheme',
    's': 'zoom',
    'A': 'renderedScoreboard',
    'oa': 'Cell',
    'N': 'SizeCache',
    'fa': 'isMobile',
    'da': 'hardMode',
    'ta': 'init',
    'Aa': 'calculateZoom'
  }
}));
