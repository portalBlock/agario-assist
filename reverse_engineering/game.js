(function (window, jQuery) {
  var $, Ba, D, E, Ea, F, Fa, H, I, J, K, L, M, O, P, V, W, X, Y, Z, _canvas, aa, blackTheme, ca, canvas, canvasHeight, canvasWidth, ctx, h, hardMode, isMobile, m, mouseX, mouseY, pa, q, qa, r, ra, renderedScoreboard, sa, w, x, y, z, zoom;

  function init() {
    var a, b, c;
    refreshRegionInfo();
    setInterval(refreshRegionInfo, 180000);
    canvas = _canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.onmousedown = function (e) {
      var b, c;
      if (isMobile) {
        b = e.clientX - (5 + canvasWidth / 5 / 2);
        c = e.clientY - (5 + canvasWidth / 5 / 2);
        if (Math.sqrt(b * b + c * c) <= canvasWidth / 5 / 2) {
          sendTargetUpdate();
          C(17);
          return;
        }
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      T();
      sendTargetUpdate();
    };
    canvas.onmousemove = function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      T();
    };
    canvas.onmouseup = function (e) {};
    a = false;
    b = false;
    c = false;
    window.onkeydown = function (e) {
      if (!(32 != e.keyCode || a)) {
        sendTargetUpdate();
        C(17);
        a = true;
      };
      if (!(81 != e.keyCode || b)) {
        C(18);
        b = true;
      };
      if (!(87 != e.keyCode || c)) {
        sendTargetUpdate();
        C(21);
        c = true;
      };
    };
    window.onkeyup = function (e) {
      if (32 == e.keyCode) {
        a = false;
      };
      if (87 == e.keyCode) {
        c = false;
      };
      if (81 == e.keyCode && b) {
        C(19);
        b = false;
      };
    };
    window.onblur = function (e) {
      C(19);
      c = b = a = false;
    };
    window.onresize = onResize;
    onResize();
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(ha);
    } else {
      setInterval(draw, 1000 / 60);
    };
    setInterval(sendTargetUpdate, 100);
    ia(jQuery('#region').val());
  }

  function think() {
    var a, b, c, d, e, f;
    a = Number.POSITIVE_INFINITY;
    b = Number.POSITIVE_INFINITY;
    c = Number.NEGATIVE_INFINITY;
    f = Number.NEGATIVE_INFINITY;
    d = 0;
    for (e = 0; e < r.length; e++) {
      d = Math.max(r[e].size, d);
      a = Math.min(r[e].x, a);
      b = Math.min(r[e].y, b);
      c = Math.max(r[e].x, c);
      f = Math.max(r[e].y, f);
    }
    V = QUAD.init({
      minX: a - (d + 100),
      minY: b - (d + 100),
      maxX: c + (d + 100),
      maxY: f + (d + 100)
    });
    for (e = 0; e < r.length; e++) {
      a = r[e];
      if (a.shouldRender()) {
        for (b = 0; b < a.points.length; ++b) {
          V.insert(a.points[b]);
        }
      }
    }
  }

  function T() {
    J = (mouseX - canvasWidth / 2) / zoom + w;
    K = (mouseY - canvasHeight / 2) / zoom + x;
  }

  function refreshRegionInfo() {
    if (null == L) {
      L = {};
      jQuery('#region').children().each(function () {
        var a, b;
        a = jQuery(this);
        b = a.val();
        if (b) {
          L[b] = a.text();
        };
      });
    };
    jQuery.get('http://m.agar.io/info', function (a) {
      var b;
      for (b in a.regions) {
        jQuery('#region option[value="' + b + '"]').text(L[b] + ' (' + a.regions[b].numPlayers + ' players)');
      }
    }, 'json');
  }

  function ia(a) {
    if (a && a != W) {
      W = a;
      ja();
    };
  }

  function ka() {
    jQuery.ajax('http://m.agar.io/', {
      error: function () {
        setTimeout(ka, 1000);
      },
      success: function (a) {
        a = a.split('\n');
        la('ws://' + a[0]);
      },
      dataType: 'text',
      method: 'POST',
      cache: false,
      crossDomain: true,
      data: W || '?'
    });
  }

  function ja() {
    jQuery('#connecting').show();
    ka();
  }

  function la(a) {
    if (h) {
      h.onopen = null;
      h.onmessage = null;
      h.onclose = null;
      h.close();
      h = null;
    };
    D = [];
    m = [];
    y = {};
    r = [];
    E = [];
    z = [];
    console.log('Connecting to ' + a);
    h = new WebSocket(a);
    h.binaryType = 'arraybuffer';
    h.onopen = va;
    h.onmessage = wa;
    h.onclose = xa;
    h.onerror = function (e) {
      console.log('socket error');
    };
  }

  function va(a) {
    var b;
    jQuery('#connecting').hide();
    console.log('socket open');
    a = new ArrayBuffer(5);
    b = new DataView(a);
    b.setUint8(0, 255);
    b.setUint32(1, 1, true);
    h.send(a);
    ma();
  }

  function xa(a) {
    console.log('socket close');
    setTimeout(ja, 500);
  }

  function wa(a) {
    var c, f;

    function b() {
      var a, b;
      for (a = '';;) {
        b = f.getUint16(c, true);
        c += 2;
        if (0 == b) {
          break;
        }
        a += String.fromCharCode(b);
      }
      return a;
    }
    c = 1;
    f = new DataView(a.data);
    switch (f.getUint8(0)) {
    case 16:
      ya(f);
      break;
    case 20:
      m = [];
      D = [];
      break;
    case 32:
      D.push(f.getUint32(1, true));
      break;
    case 48:
      for (z = []; c < f.byteLength;) {
        z.push(b());
      }
      za();
      break;
    case 64:
      X = f.getFloat64(1, true);
      Y = f.getFloat64(9, true);
      Z = f.getFloat64(17, true);
      $ = f.getFloat64(25, true);
      if (0 == m.length) {
        w = (Z + X) / 2;
        x = ($ + Y) / 2;
      };
    }
  }

  function ya(a) {
    var b, c, d, e, f, g, h, k, l, n, p, q, s, t, u;
    F = +new Date();
    b = Math.random();
    c = 1;
    aa = false;
    f = a.getUint16(c, true);
    c = c + 2;
    for (d = 0; d < f; ++d) {
      e = y[a.getUint32(c, true)];
      t = y[a.getUint32(c + 4, true)];
      c = c + 8;
      if (e && t) {
        t.destroy();
        t.ox = t.x;
        t.oy = t.y;
        t.oSize = t.size;
        t.nx = e.x;
        t.ny = e.y;
        t.nSize = t.size;
        t.updateTime = F;
      };
    }
    for (;;) {
      f = a.getUint32(c, true);
      c += 4;
      if (0 == f) {
        break;
      }
      d = a.getFloat64(c, true);
      c = c + 8;
      e = a.getFloat64(c, true);
      c = c + 8;
      t = a.getFloat64(c, true);
      c = c + 8;
      l = a.getUint8(c++);
      h = false;
      if (0 == l) {
        h = true;
        l = '#33FF33';
      } else {
        if (255 == l) {
          h = a.getUint8(c++);
          l = a.getUint8(c++);
          g = a.getUint8(c++);
          l = na(h << 16 | l << 8 | g);
          g = a.getUint8(c++);
          h = !!(g & 1);
          if (g & 2) {
            c += 4;
          };
          if (g & 4) {
            c += 8;
          };
          if (g & 8) {
            c += 16;
          };
        } else {
          l = 63487 | l << 16;
          k = (l >> 16 & 255) / 255 * 360;
          n = (l >> 8 & 255) / 255;
          l = (l >> 0 & 255) / 255;
          if (0 == n) {
            l = l << 16 | l << 8 | l << 0;
          } else {
            k = k / 60;
            g = ~~k;
            u = k - g;
            k = l * (1 - n);
            s = l * (1 - n * u);
            n = l * (1 - n * (1 - u));
            p = u = 0;
            q = 0;
            switch (g % 6) {
            case 0:
              u = l;
              p = n;
              q = k;
              break;
            case 1:
              u = s;
              p = l;
              q = k;
              break;
            case 2:
              u = k;
              p = l;
              q = n;
              break;
            case 3:
              u = k;
              p = s;
              q = l;
              break;
            case 4:
              u = n;
              p = k;
              q = l;
              break;
            case 5:
              u = l;
              p = k;
              q = s;
            }
            u = ~~(255 * u) & 255;
            p = ~~(255 * p) & 255;
            q = ~~(255 * q) & 255;
            l = u << 16 | p << 8 | q;
          }
          l = na(l);
        }
      }
      for (g = '';;) {
        k = a.getUint16(c, true);
        c += 2;
        if (0 == k) {
          break;
        }
        g += String.fromCharCode(k);
      }
      k = null;
      if (y.hasOwnProperty(f)) {
        k = y[f];
        k.updatePos();
        k.ox = k.x;
        k.oy = k.y;
        k.oSize = k.size;
        k.color = l;
      } else {
        k = new Cell(f, d, e, t, l, h, g);
        k.pX = d;
        k.pY = e;
      };
      k.nx = d;
      k.ny = e;
      k.nSize = t;
      k.updateCode = b;
      k.updateTime = F;
      if (-1 != D.indexOf(f) && -1 == m.indexOf(k)) {
        document.getElementById('overlays').style.display = 'none';
        m.push(k);
        if (1 == m.length) {
          w = k.x;
          x = k.y;
        };
      };
    }
    a.getUint16(c, true);
    c += 2;
    e = a.getUint32(c, true);
    c += 4;
    for (d = 0; d < e; d++) {
      f = a.getUint32(c, true);
      c += 4;
      if (y[f]) {
        y[f].updateCode = b;
      };
    }
    for (d = 0; d < r.length; d++) {
      if (r[d].updateCode != b) {
        r[d--].destroy();
      };
    }
    if (aa && 0 == m.length) {
      jQuery('#overlays').fadeIn(3000);
    };
  }

  function sendTargetUpdate() {
    var a, b;
    if (null != h && h.readyState == h.OPEN && (pa != J || qa != K)) {
      pa = J;
      qa = K;
      a = new ArrayBuffer(21);
      b = new DataView(a);
      b.setUint8(0, 16);
      b.setFloat64(1, J, true);
      b.setFloat64(9, K, true);
      b.setUint32(17, 0, true);
      h.send(a);
    }
  }

  function ma() {
    var a, b, c;
    if (null != h && h.readyState == h.OPEN && null != H) {
      a = new ArrayBuffer(1 + 2 * H.length);
      b = new DataView(a);
      b.setUint8(0, 0);
      for (c = 0; c < H.length; ++c) {
        b.setUint16(1 + 2 * c, H.charCodeAt(c), true);
      }
      h.send(a);
    }
  }

  function C(a) {
    var b;
    if (null != h && h.readyState == h.OPEN) {
      b = new ArrayBuffer(1);
      new DataView(b).setUint8(0, a);
      h.send(b);
    }
  }

  function ha() {
    draw();
    window.requestAnimationFrame(ha);
  }

  function onResize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    _canvas.width = canvas.width = canvasWidth;
    _canvas.height = canvas.height = canvasHeight;
    draw();
  }

  function calculateZoom() {
    var b, sizeFactor;
    sizeFactor = 0;
    for (b = 0; b < m.length; b++) {
      sizeFactor += m[b].size;
    }
    sizeFactor = Math.pow(Math.min(64 / sizeFactor, 1), 0.4) * Math.max(canvasHeight / 965, canvasWidth / 1920);
    zoom = (9 * zoom + sizeFactor) / 10;
  }

  function draw() {
    var a, b, c, f;
    a = +new Date();
    ++Ba;
    calculateZoom();
    F = +new Date();
    think();
    if (0 < m.length) {
      b = 0;
      c = 0;
      for (f = 0; f < m.length; f++) {
        m[f].updatePos();
        b += m[f].x / m.length;
        c += m[f].y / m.length;
      }
      w = (w + b) / 2;
      x = (x + c) / 2;
    }
    T();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = blackTheme ? '#111111' : '#F2FBFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    ctx.strokeStyle = blackTheme ? '#AAAAAA' : '#000000';
    ctx.globalAlpha = 0.2;
    ctx.scale(zoom, zoom);
    b = canvasWidth / zoom;
    c = canvasHeight / zoom;
    for (f = -0.5 + (-w + b / 2) % 50; f < b; f += 50) {
      ctx.beginPath();
      ctx.moveTo(f, 0);
      ctx.lineTo(f, c);
      ctx.stroke();
    }
    for (f = -0.5 + (-x + c / 2) % 50; f < c; f += 50) {
      ctx.beginPath();
      ctx.moveTo(0, f);
      ctx.lineTo(b, f);
      ctx.stroke();
    }
    ctx.restore();
    r.sort(function (a, b) {
      return a.size == b.size ? a.id - b.id : a.size - b.size;
    });
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-w, -x);
    for (f = 0; f < E.length; f++) {
      E[f].draw();
    }
    for (f = 0; f < r.length; f++) {
      r[f].draw();
    }
    ctx.restore();
    if (renderedScoreboard && 0 != z.length) {
      ctx.drawImage(renderedScoreboard, canvasWidth - renderedScoreboard.width - 10, 10);
    };
    I = Math.max(I, Ca());
    if (0 != I) {
      if (null == M) {
        M = new SizeCache(24, '#FFFFFF');
      };
      M.setValue('Score: ' + ~~(I / 100));
      c = M.render();
      b = c.width;
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000000';
      ctx.fillRect(10, canvasHeight - 10 - 24 - 10, b + 10, 34);
      ctx.globalAlpha = 1;
      ctx.drawImage(c, 15, canvasHeight - 10 - 24 - 5);
    };
    Da();
    a = +new Date() - a;
    if (a > 1000 / 60) {
      q -= 0.01;
    } else {
      if (a < 1000 / 65) {
        q += 0.01;
      };
    };
    if (0.4 > q) {
      q = 0.4;
    };
    if (1 < q) {
      q = 1;
    };
  }

  function Da() {
    var a;
    if (isMobile && ca.width) {
      a = canvasWidth / 5;
      ctx.drawImage(ca, 5, 5, a, a);
    }
  }

  function Ca() {
    var a, b;
    a = 0;
    for (b = 0; b < m.length; b++) {
      a += m[b].nSize * m[b].nSize;
    }
    return a;
  }

  function za() {
    var a, b, c;
    if (0 != z.length) {
      if (O) {
        renderedScoreboard = document.createElement('canvas');
        a = renderedScoreboard.getContext('2d');
        b = 60 + 24 * z.length;
        c = Math.min(200, 0.3 * canvasWidth) / 200;
        renderedScoreboard.width = 200 * c;
        renderedScoreboard.height = b * c;
        a.scale(c, c);
        a.globalAlpha = 0.4;
        a.fillStyle = '#000000';
        a.fillRect(0, 0, 200, b);
        a.globalAlpha = 1;
        a.fillStyle = '#FFFFFF';
        c = null;
        c = 'Leaderboard';
        a.font = '30px Ubuntu';
        a.fillText(c, 100 - a.measureText(c).width / 2, 40);
        a.font = '20px Ubuntu';
        for (b = 0; b < z.length; ++b) {
          c = z[b] || 'An unnamed cell';
          if (!(O || 0 != m.length && m[0].name == c)) {
            c = 'An unnamed cell';
          };
          c = b + 1 + '. ' + c;
          a.fillText(c, 100 - a.measureText(c).width / 2, 70 + 24 * b);
        }
      } else {
        renderedScoreboard = null;
      }
    }
  }

  function Cell(id, x, y, size, color, isVirus, name) {
    r.push(this);
    y[id] = this;
    this.id = id;
    this.ox = this.x = x;
    this.oy = this.y = y;
    this.oSize = this.size = size;
    this.color = color;
    this.isVirus = isVirus;
    this.points = [];
    this.pointsAcc = [];
    this.createPoints();
    this.setName(name);
  }

  function na(a) {
    for (a = a.toString(16); 6 > a.length;) {
      a = '0' + a;
    }
    return '#' + a;
  }

  function SizeCache(size, color, stroke, strokeColor) {
    if (size) {
      this._size = size;
    };
    if (color) {
      this._color = color;
    };
    this._stroke = !!stroke;
    if (strokeColor) {
      this._strokeColor = strokeColor;
    };
  }
  if ('agar.io' != window.location.hostname && 'localhost' != window.location.hostname && '10.10.2.13' != window.location.hostname) {
    window.location = 'http://agar.io/';
  } else {
    V = null;
    h = null;
    w = 0;
    x = 0;
    D = [];
    m = [];
    y = {};
    r = [];
    E = [];
    z = [];
    mouseX = 0;
    mouseY = 0;
    J = -1;
    K = -1;
    Ba = 0;
    F = 0;
    H = null;
    X = 0;
    Y = 0;
    Z = 10000;
    $ = 10000;
    zoom = 1;
    W = null;
    ra = true;
    O = true;
    hardMode = false;
    aa = false;
    I = 0;
    blackTheme = false;
    sa = false;
    isMobile = 'ontouchstart' in window && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    ca = new Image();
    ca.src = 'img/split.png';
    L = null;
    window.setNick = function (e) {
      jQuery('#adsBottom').hide();
      H = e;
      ma();
      jQuery('#overlays').hide();
      I = 0;
    };
    window.setRegion = ia;
    window.setSkins = function (e) {
      ra = e;
    };
    window.setNames = function (e) {
      O = e;
    };
    window.setDarkTheme = function (e) {
      blackTheme = e;
    };
    window.setColors = function (e) {
      hardMode = e;
    };
    window.setShowMass = function (e) {
      sa = e;
    };
    window.connect = la;
    pa = -1;
    qa = -1;
    renderedScoreboard = null;
    q = 1;
    M = null;
    P = {};
    Ea = 'poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;ussr;pewdiepie;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;nazi;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;m\'blob'.split(';');
    Fa = ['m\'blob'];
    Cell.prototype = {
      id: 0,
      points: null,
      pointsAcc: null,
      name: null,
      nameCache: null,
      sizeCache: null,
      x: 0,
      y: 0,
      size: 0,
      ox: 0,
      oy: 0,
      oSize: 0,
      nx: 0,
      ny: 0,
      nSize: 0,
      updateTime: 0,
      updateCode: 0,
      drawTime: 0,
      destroyed: false,
      isVirus: false,
      destroy: function () {
        var a;
        for (a = 0; a < r.length; a++) {
          if (r[a] == this) {
            r.splice(a, 1);
            break;
          }
        }
        delete y[this.id];
        a = m.indexOf(this);
        if (-1 != a) {
          aa = true;
          m.splice(a, 1);
        };
        a = D.indexOf(this.id);
        if (-1 != a) {
          D.splice(a, 1);
        };
        this.destroyed = true;
        E.push(this);
      },
      getNameSize: function () {
        return Math.max(~~(0.3 * this.size), 24);
      },
      setName: function (a) {
        if (this.name = a) {
          if (null == this.nameCache) {
            this.nameCache = new SizeCache(this.getNameSize(), '#FFFFFF', true, '#000000');
          } else {
            this.nameCache.setSize(this.getNameSize());
          };
          this.nameCache.setValue(this.name);
        }
      },
      createPoints: function () {
        var a, b, c;
        for (a = this.getNumPoints(); this.points.length > a;) {
          b = ~~(Math.random() * this.points.length);
          this.points.splice(b, 1);
          this.pointsAcc.splice(b, 1);
        }
        if (0 == this.points.length && 0 < a) {
          this.points.push({
            c: this,
            v: this.size,
            x: this.x,
            y: this.y
          });
          this.pointsAcc.push(Math.random() - 0.5);
        };
        for (; this.points.length < a;) {
          b = ~~(Math.random() * this.points.length);
          c = this.points[b];
          this.points.splice(b, 0, {
            c: this,
            v: c.v,
            x: c.x,
            y: c.y
          });
          this.pointsAcc.splice(b, 0, this.pointsAcc[b]);
        }
      },
      getNumPoints: function () {
        return ~~Math.max(this.size * zoom * (this.isVirus ? Math.min(2 * q, 1) : q), this.isVirus ? 10 : 5);
      },
      movePoints: function () {
        var a, b, c, d, e, g, h, k, l, m, n, p;
        this.createPoints();
        a = this.points;
        b = this.pointsAcc;
        c = b.concat();
        d = a.concat();
        g = d.length;
        for (e = 0; e < g; ++e) {
          h = c[(e - 1 + g) % g];
          l = c[(e + 1) % g];
          b[e] += Math.random() - 0.5;
          b[e] *= 0.7;
          if (10 < b[e]) {
            b[e] = 10;
          };
          if (-10 > b[e]) {
            b[e] = -10;
          };
          b[e] = (h + l + 8 * b[e]) / 10;
        }
        n = this;
        for (e = 0; e < g; ++e) {
          c = d[e].v;
          h = d[(e - 1 + g) % g].v;
          l = d[(e + 1) % g].v;
          if (15 < this.size) {
            m = false;
            k = a[e].x;
            p = a[e].y;
            V.retrieve2(k - 5, p - 5, 10, 10, function (a) {
              if (a.c != n && 25 > (k - a.x) * (k - a.x) + (p - a.y) * (p - a.y)) {
                m = true;
              };
            });
            if (!m && (a[e].x < X || a[e].y < Y || a[e].x > Z || a[e].y > $)) {
              m = true;
            };
            if (m) {
              if (0 < b[e]) {
                b[e] = 0;
              };
              b[e] -= 1;
            };
          }
          c += b[e];
          if (0 > c) {
            c = 0;
          };
          c = (12 * c + this.size) / 13;
          a[e].v = (h + l + 8 * c) / 10;
          h = 2 * Math.PI / g;
          l = this.points[e].v;
          if (this.isVirus && 0 == e % 2) {
            l += 5;
          };
          a[e].x = this.x + Math.cos(h * e) * l;
          a[e].y = this.y + Math.sin(h * e) * l;
        }
      },
      updatePos: function () {
        var a, b, c;
        a = (F - this.updateTime) / 120;
        a = 0 > a ? 0 : 1 < a ? 1 : a;
        a = a * a * (3 - 2 * a);
        b = this.getNameSize();
        if (this.destroyed && 1 <= a) {
          c = E.indexOf(this);
          if (-1 != c) {
            E.splice(c, 1);
          };
        }
        this.x = a * (this.nx - this.ox) + this.ox;
        this.y = a * (this.ny - this.oy) + this.oy;
        this.size = a * (this.nSize - this.oSize) + this.oSize;
        if (!(this.destroyed || b == this.getNameSize())) {
          this.setName(this.name);
        };
        return a;
      },
      shouldRender: function () {
        return this.x + this.size + 40 < w - canvasWidth / 2 / zoom || this.y + this.size + 40 < x - canvasHeight / 2 / zoom || this.x - this.size - 40 > w + canvasWidth / 2 / zoom || this.y - this.size - 40 > x + canvasHeight / 2 / zoom ? false : true;
      },
      draw: function () {
        var a, b, c;
        if (this.shouldRender()) {
          ctx.save();
          this.drawTime = F;
          a = this.updatePos();
          if (this.destroyed) {
            ctx.globalAlpha *= 1 - a;
          };
          this.movePoints();
          if (hardMode) {
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#AAAAAA';
          } else {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;
          };
          ctx.beginPath();
          ctx.lineWidth = 10;
          ctx.lineCap = 'round';
          ctx.lineJoin = this.isVirus ? 'mitter' : 'round';
          a = this.getNumPoints();
          ctx.moveTo(this.points[0].x, this.points[0].y);
          for (b = 1; b <= a; ++b) {
            c = b % a;
            ctx.lineTo(this.points[c].x, this.points[c].y);
          }
          ctx.closePath();
          a = this.name.toLowerCase();
          if (ra) {
            if (-1 != Ea.indexOf(a)) {
              if (!P.hasOwnProperty(a)) {
                P[a] = new Image();
                P[a].src = 'skins/' + a + '.png';
              };
              b = P[a];
            } else {
              b = null;
            };
          } else {
            b = null;
          };
          a = b ? -1 != Fa.indexOf(a) : false;
          ctx.stroke();
          ctx.fill();
          if (null != b && 0 < b.width && !a) {
            ctx.save();
            ctx.clip();
            ctx.drawImage(b, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
            ctx.restore();
          };
          if (hardMode || 15 < this.size) {
            ctx.strokeStyle = '#000000';
            ctx.globalAlpha *= 0.1;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          if (null != b && 0 < b.width && a) {
            ctx.drawImage(b, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
          };
          a = -1 != m.indexOf(this);
          b = ~~this.y;
          if ((O || a) && this.name && this.nameCache) {
            c = this.nameCache.render();
            ctx.drawImage(c, ~~this.x - ~~(c.width / 2), b - ~~(c.height / 2));
            b += c.height / 2 + 4;
          };
          if (sa && a) {
            if (null == this.sizeCache) {
              this.sizeCache = new SizeCache(this.getNameSize() / 2, '#FFFFFF', true, '#000000');
            };
            this.sizeCache.setSize(this.getNameSize() / 2);
            this.sizeCache.setValue(~~(this.size * this.size / 100));
            c = this.sizeCache.render();
            ctx.drawImage(c, ~~this.x - ~~(c.width / 2), b - ~~(c.height / 2));
          };
          ctx.restore();
        }
      }
    };
    SizeCache.prototype = {
      _value: '',
      _color: '#000000',
      _stroke: false,
      _strokeColor: '#000000',
      _size: 16,
      _canvas: null,
      _ctx: null,
      _dirty: false,
      setSize: function (a) {
        if (this._size != a) {
          this._size = a;
          this._dirty = true;
        };
      },
      setColor: function (a) {
        if (this._color != a) {
          this._color = a;
          this._dirty = true;
        };
      },
      setStroke: function (a) {
        if (this._stroke != a) {
          this._stroke = a;
          this._dirty = true;
        };
      },
      setStrokeColor: function (a) {
        if (this._strokeColor != a) {
          this._strokeColor = a;
          this._dirty = true;
        };
      },
      setValue: function (a) {
        if (a != this._value) {
          this._value = a;
          this._dirty = true;
        };
      },
      render: function () {
        var a, b, c, d, e, g, h;
        if (null == this._canvas) {
          this._canvas = document.createElement('canvas');
          this._ctx = this._canvas.getContext('2d');
        };
        if (this._dirty) {
          a = this._canvas;
          b = this._ctx;
          c = this._value;
          d = this._size;
          g = d + 'px Ubuntu';
          b.font = g;
          e = b.measureText(c).width;
          h = ~~(0.2 * d);
          a.width = e + 6;
          a.height = d + h;
          b.font = g;
          b.globalAlpha = 1;
          b.lineWidth = 3;
          b.strokeStyle = this._strokeColor;
          b.fillStyle = this._color;
          if (this._stroke) {
            b.strokeText(c, 3, d - h / 2);
          };
          b.fillText(c, 3, d - h / 2);
        }
        return this._canvas;
      }
    };
    window.onload = init;
  }
}(window, jQuery));
