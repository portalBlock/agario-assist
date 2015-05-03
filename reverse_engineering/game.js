(function (window, jQuery) {
  var Ca, D, E, F, H, I, J, K, L, N, T, U, V, W, X, Y, Z, _canvas, aa, ba, blackTheme, canvas, canvasHeight, canvasWidth, ctx, g, hardMode, isMobile, mouseX, mouseY, n, na, oa, q, r, renderedScoreboard, skinsEnabled, w, x, y, ya, z, zoom;

  function init() {
    var a, b, c;
    refreshRegionInfo();
    setInterval(refreshRegionInfo, 60000);
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
      R();
      sendTargetUpdate();
    };
    canvas.onmousemove = function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      R();
    };
    canvas.onmouseup = function (e) {};
    a = false;
    c = false;
    b = false;
    window.onkeydown = function (e) {
      if (!(32 != e.keyCode || a)) {
        sendTargetUpdate();
        C(17);
        a = true;
      };
      if (!(81 != e.keyCode || c)) {
        C(18);
        c = true;
      };
      if (!(87 != e.keyCode || b)) {
        sendTargetUpdate();
        C(21);
        b = true;
      };
    };
    window.onkeyup = function (e) {
      if (32 == e.keyCode) {
        a = false;
      };
      if (87 == e.keyCode) {
        b = false;
      };
      if (81 == e.keyCode && c) {
        C(19);
        c = false;
      };
    };
    window.onblur = function (e) {
      C(19);
      b = c = a = false;
    };
    window.onresize = onResize;
    onResize();
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(fa);
    } else {
      setInterval(draw, 1000 / 60);
    };
    setInterval(sendTargetUpdate, 100);
    ga(jQuery('#region').val());
  }

  function ra() {
    var a, b, c, d, e, f;
    a = Number.POSITIVE_INFINITY;
    c = Number.POSITIVE_INFINITY;
    b = Number.NEGATIVE_INFINITY;
    f = Number.NEGATIVE_INFINITY;
    d = 0;
    for (e = 0; e < r.length; e++) {
      d = Math.max(r[e].size, d);
      a = Math.min(r[e].x, a);
      c = Math.min(r[e].y, c);
      b = Math.max(r[e].x, b);
      f = Math.max(r[e].y, f);
    }
    T = QUAD.init({
      minX: a - (d + 100),
      minY: c - (d + 100),
      maxX: b + (d + 100),
      maxY: f + (d + 100)
    });
    for (e = 0; e < r.length; e++) {
      a = r[e];
      if (a.shouldRender()) {
        for (c = 0; c < a.points.length; ++c) {
          T.insert(a.points[c]);
        }
      }
    }
  }

  function R() {
    J = (mouseX - canvasWidth / 2) / zoom + w;
    K = (mouseY - canvasHeight / 2) / zoom + x;
  }

  function refreshRegionInfo() {
    if (null == L) {
      L = {};
      jQuery('#region').children().each(function () {
        var a, c;
        a = jQuery(this);
        c = a.val();
        if (c) {
          L[c] = a.text();
        };
      });
    };
    jQuery.get('http://m.agar.io/info', function (a) {
      var c;
      for (c in a.regions) {
        jQuery('#region option[value="' + c + '"]').text(L[c] + ' (' + a.regions[c].numPlayers + ' players)');
      }
    }, 'json');
  }

  function ga(a) {
    if (a && a != U) {
      U = a;
      ha();
    };
  }

  function ia() {
    jQuery.ajax('http://m.agar.io/', {
      error: function () {
        setTimeout(ia, 1000);
      },
      success: function (a) {
        a = a.split('\n');
        ja('ws://' + a[0]);
      },
      dataType: 'text',
      method: 'POST',
      cache: false,
      crossDomain: true,
      data: U || '?'
    });
  }

  function ha() {
    jQuery('#connecting').show();
    ia();
  }

  function ja(a) {
    if (g) {
      g.onopen = null;
      g.onmessage = null;
      g.onclose = null;
      g.close();
      g = null;
    };
    D = [];
    n = [];
    y = {};
    r = [];
    E = [];
    z = [];
    console.log('Connecting to ' + a);
    g = new WebSocket(a);
    g.binaryType = 'arraybuffer';
    g.onopen = sa;
    g.onmessage = ta;
    g.onclose = ua;
    g.onerror = function (e) {
      console.log('socket error');
    };
  }

  function sa(a) {
    var c;
    jQuery('#connecting').hide();
    console.log('socket open');
    a = new ArrayBuffer(5);
    c = new DataView(a);
    c.setUint8(0, 255);
    c.setUint32(1, 1, true);
    g.send(a);
    ka();
  }

  function ua(a) {
    console.log('socket close');
    setTimeout(ha, 500);
  }

  function ta(a) {
    var b, f;

    function c() {
      var a, c;
      for (a = '';;) {
        c = f.getUint16(b, true);
        b += 2;
        if (0 == c) {
          break;
        }
        a += String.fromCharCode(c);
      }
      return a;
    }
    b = 1;
    f = new DataView(a.data);
    switch (f.getUint8(0)) {
    case 16:
      va(f);
      break;
    case 20:
      n = [];
      D = [];
      break;
    case 32:
      D.push(f.getUint32(1, true));
      break;
    case 48:
      for (z = []; b < f.byteLength;) {
        z.push(c());
      }
      wa();
      break;
    case 64:
      V = f.getFloat64(1, true);
      W = f.getFloat64(9, true);
      X = f.getFloat64(17, true);
      Y = f.getFloat64(25, true);
      if (0 == n.length) {
        w = (X + V) / 2;
        x = (Y + W) / 2;
      };
    }
  }

  function va(a) {
    var b, c, d, e, f, g, h, k, l, m, p, q, s, t, u;
    F = +new Date();
    c = Math.random();
    b = 1;
    Z = false;
    f = a.getUint16(b, true);
    b = b + 2;
    for (d = 0; d < f; ++d) {
      e = y[a.getUint32(b, true)];
      t = y[a.getUint32(b + 4, true)];
      b = b + 8;
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
      f = a.getUint32(b, true);
      b += 4;
      if (0 == f) {
        break;
      }
      d = a.getFloat64(b, true);
      b = b + 8;
      e = a.getFloat64(b, true);
      b = b + 8;
      t = a.getFloat64(b, true);
      b = b + 8;
      k = a.getUint8(b++);
      g = false;
      if (0 == k) {
        g = true;
        k = '#33FF33';
      } else {
        if (255 == k) {
          g = a.getUint8(b++);
          k = a.getUint8(b++);
          h = a.getUint8(b++);
          k = la(g << 16 | k << 8 | h);
          g = !!(a.getUint8(b++) & 1);
        } else {
          k = 63487 | k << 16;
          l = (k >> 16 & 255) / 255 * 360;
          m = (k >> 8 & 255) / 255;
          k = (k >> 0 & 255) / 255;
          if (0 == m) {
            k = k << 16 | k << 8 | k << 0;
          } else {
            l = l / 60;
            h = ~~l;
            u = l - h;
            l = k * (1 - m);
            s = k * (1 - m * u);
            m = k * (1 - m * (1 - u));
            p = u = 0;
            q = 0;
            switch (h % 6) {
            case 0:
              u = k;
              p = m;
              q = l;
              break;
            case 1:
              u = s;
              p = k;
              q = l;
              break;
            case 2:
              u = l;
              p = k;
              q = m;
              break;
            case 3:
              u = l;
              p = s;
              q = k;
              break;
            case 4:
              u = m;
              p = l;
              q = k;
              break;
            case 5:
              u = k;
              p = l;
              q = s;
            }
            u = ~~(255 * u) & 255;
            p = ~~(255 * p) & 255;
            q = ~~(255 * q) & 255;
            k = u << 16 | p << 8 | q;
          }
          k = la(k);
        }
      }
      for (h = '';;) {
        l = a.getUint16(b, true);
        b += 2;
        if (0 == l) {
          break;
        }
        h += String.fromCharCode(l);
      }
      l = null;
      if (y.hasOwnProperty(f)) {
        l = y[f];
        l.updatePos();
        l.ox = l.x;
        l.oy = l.y;
        l.oSize = l.size;
        l.color = k;
      } else {
        l = new ma(f, d, e, t, k, g, h);
      };
      l.nx = d;
      l.ny = e;
      l.nSize = t;
      l.updateCode = c;
      l.updateTime = F;
      if (-1 != D.indexOf(f) && -1 == n.indexOf(l)) {
        document.getElementById('overlays').style.display = 'none';
        n.push(l);
        if (1 == n.length) {
          w = l.x;
          x = l.y;
        };
      };
    }
    a.getUint16(b, true);
    b += 2;
    e = a.getUint32(b, true);
    b += 4;
    for (d = 0; d < e; d++) {
      f = a.getUint32(b, true);
      b += 4;
      if (y[f]) {
        y[f].updateCode = c;
      };
    }
    for (d = 0; d < r.length; d++) {
      if (r[d].updateCode != c) {
        r[d--].destroy();
      };
    }
    if (Z && 0 == n.length) {
      jQuery('#overlays').fadeIn(3000);
    };
  }

  function sendTargetUpdate() {
    var a, c;
    if (null != g && g.readyState == g.OPEN && (na != J || oa != K)) {
      na = J;
      oa = K;
      a = new ArrayBuffer(21);
      c = new DataView(a);
      c.setUint8(0, 16);
      c.setFloat64(1, J, true);
      c.setFloat64(9, K, true);
      c.setUint32(17, 0, true);
      g.send(a);
    }
  }

  function ka() {
    var a, b, c;
    if (null != g && g.readyState == g.OPEN && null != H) {
      a = new ArrayBuffer(1 + 2 * H.length);
      c = new DataView(a);
      c.setUint8(0, 0);
      for (b = 0; b < H.length; ++b) {
        c.setUint16(1 + 2 * b, H.charCodeAt(b), true);
      }
      g.send(a);
    }
  }

  function C(a) {
    var c;
    if (null != g && g.readyState == g.OPEN) {
      c = new ArrayBuffer(1);
      new DataView(c).setUint8(0, a);
      g.send(c);
    }
  }

  function fa() {
    draw();
    window.requestAnimationFrame(fa);
  }

  function onResize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    _canvas.width = canvas.width = canvasWidth;
    _canvas.height = canvas.height = canvasHeight;
    draw();
  }

  function xa() {
    var a, c;
    a = 0;
    for (c = 0; c < n.length; c++) {
      a += n[c].size;
    }
    a = Math.pow(Math.min(64 / a, 1), 0.4) * Math.max(canvasHeight / 965, canvasWidth / 1920);
    zoom = (9 * zoom + a) / 10;
  }

  function draw() {
    var a, b, c, f;
    a = +new Date();
    ++ya;
    xa();
    F = +new Date();
    ra();
    if (0 < n.length) {
      c = 0;
      b = 0;
      for (f = 0; f < n.length; f++) {
        n[f].updatePos();
        c += n[f].x / n.length;
        b += n[f].y / n.length;
      }
      w = (w + c) / 2;
      x = (x + b) / 2;
    }
    R();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = blackTheme ? '#111111' : '#F2FBFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    ctx.strokeStyle = blackTheme ? '#AAAAAA' : '#000000';
    ctx.globalAlpha = 0.2;
    ctx.scale(zoom, zoom);
    c = canvasWidth / zoom;
    b = canvasHeight / zoom;
    for (f = -0.5 + (-w + c / 2) % 50; f < c; f += 50) {
      ctx.beginPath();
      ctx.moveTo(f, 0);
      ctx.lineTo(f, b);
      ctx.stroke();
    }
    for (f = -0.5 + (-x + b / 2) % 50; f < b; f += 50) {
      ctx.beginPath();
      ctx.moveTo(0, f);
      ctx.lineTo(c, f);
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
    I = Math.max(I, za());
    if (0 != I) {
      b = 'Score: ' + ~~(I / 100);
      ctx.font = '24px Ubuntu';
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.2;
      c = ctx.measureText(b).width;
      ctx.fillRect(canvasWidth / 2 - c / 2 - 5, canvasHeight - 10 - 24 - 10, c + 10, 34);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(b, canvasWidth / 2 - c / 2, canvasHeight - 10 - 8);
    };
    Aa();
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

  function Aa() {
    var a;
    if (isMobile && aa.width) {
      a = canvasWidth / 5;
      ctx.drawImage(aa, 5, 5, a, a);
    }
  }

  function za() {
    var a, c;
    a = 0;
    for (c = 0; c < n.length; c++) {
      a += n[c].nSize * n[c].nSize;
    }
    return a;
  }

  function wa() {
    var a, b, c;
    if (0 != z.length) {
      renderedScoreboard = document.createElement('canvas');
      a = renderedScoreboard.getContext('2d');
      c = 60 + 24 * z.length;
      b = Math.min(200, 0.3 * canvasWidth) / 200;
      renderedScoreboard.width = 200 * b;
      renderedScoreboard.height = c * b;
      a.scale(b, b);
      a.globalAlpha = 0.4;
      a.fillStyle = '#000000';
      a.fillRect(0, 0, 200, c);
      a.globalAlpha = 1;
      a.fillStyle = '#FFFFFF';
      b = null;
      b = 'Leaderboard';
      a.font = '30px Ubuntu';
      a.fillText(b, 100 - a.measureText(b).width / 2, 40);
      a.font = '20px Ubuntu';
      for (c = 0; c < z.length; ++c) {
        b = z[c] || 'An unnamed cell';
        if (!(ba || 0 != n.length && n[0].name == b)) {
          b = 'An unnamed cell';
        };
        b = c + 1 + '. ' + b;
        a.fillText(b, 100 - a.measureText(b).width / 2, 70 + 24 * c);
      }
    }
  }

  function getSkin(a) {
    if (hardMode) {
      return null;
    }
    a = a.toLowerCase();
    if (-1 == Ca.indexOf(a)) {
      return null;
    }
    if (!N.hasOwnProperty(a)) {
      N[a] = new Image();
      N[a].src = 'skins/' + a + '.png';
    };
    return N[a];
  }

  function ma(a, c, b, d, h, e, g) {
    r.push(this);
    y[a] = this;
    this.id = a;
    this.ox = this.x = c;
    this.oy = this.y = b;
    this.oSize = this.size = d;
    this.color = h;
    this.isVirus = e;
    this.points = [];
    this.pointsAcc = [];
    this.createPoints();
    this.setName(g);
  }

  function la(a) {
    for (a = a.toString(16); 6 > a.length;) {
      a = '0' + a;
    }
    return '#' + a;
  }
  if ('agar.io' != window.location.hostname && 'localhost' != window.location.hostname && '10.10.2.13' != window.location.hostname) {
    window.location = 'http://agar.io/';
  } else {
    T = null;
    g = null;
    w = 0;
    x = 0;
    D = [];
    n = [];
    y = {};
    r = [];
    E = [];
    z = [];
    mouseX = 0;
    mouseY = 0;
    J = -1;
    K = -1;
    ya = 0;
    F = 0;
    H = null;
    V = 0;
    W = 0;
    X = 10000;
    Y = 10000;
    zoom = 1;
    U = null;
    skinsEnabled = true;
    ba = true;
    hardMode = false;
    Z = false;
    I = 0;
    blackTheme = false;
    isMobile = 'ontouchstart' in window && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    aa = new Image();
    aa.src = 'img/split.png';
    L = null;
    window.setNick = function (e) {
      jQuery('#adsBottom').hide();
      H = e;
      ka();
      jQuery('#overlays').hide();
      I = 0;
    };
    window.setRegion = ga;
    window.setSkins = function (e) {
      skinsEnabled = e;
    };
    window.setNames = function (e) {
      ba = e;
    };
    window.setDarkTheme = function (e) {
      blackTheme = e;
    };
    window.setColors = function (e) {
      hardMode = e;
    };
    window.connect = ja;
    na = -1;
    oa = -1;
    renderedScoreboard = null;
    q = 1;
    N = {};
    Ca = 'poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;ussr;pewdiepie;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;nazi;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin'.split(';');
    ma.prototype = {
      id: 0,
      points: null,
      pointsAcc: null,
      name: null,
      cachedName: null,
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
        a = n.indexOf(this);
        if (-1 != a) {
          Z = true;
          n.splice(a, 1);
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
        var b, c, d, e, g, h;
        if (this.name = a) {
          c = document.createElement('canvas');
          b = c.getContext('2d');
          d = this.getNameSize();
          h = d - 2 + 'px Ubuntu';
          b.font = h;
          e = b.measureText(a).width;
          g = ~~(0.2 * d);
          c.width = e + 6;
          c.height = d + g;
          b.font = h;
          b.globalAlpha = 1;
          b.lineWidth = 3;
          b.strokeStyle = '#000000';
          b.fillStyle = '#FFFFFF';
          b.strokeText(a, 3, d - g / 2);
          b.fillText(a, 3, d - g / 2);
          this.cachedName = c;
        }
      },
      createPoints: function () {
        var a, b, c;
        for (a = this.getNumPoints(); this.points.length > a;) {
          c = ~~(Math.random() * this.points.length);
          this.points.splice(c, 1);
          this.pointsAcc.splice(c, 1);
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
          c = ~~(Math.random() * this.points.length);
          b = this.points[c];
          this.points.splice(c, 0, {
            c: this,
            v: b.v,
            x: b.x,
            y: b.y
          });
          this.pointsAcc.splice(c, 0, this.pointsAcc[c]);
        }
      },
      getNumPoints: function () {
        return ~~Math.max(this.size * zoom * (this.isVirus ? Math.min(2 * q, 1) : q), this.isVirus ? 10 : 5);
      },
      movePoints: function () {
        var a, b, c, d, e, g, h, k, l, m, n, p;
        this.createPoints();
        a = this.points;
        c = this.pointsAcc;
        b = c.concat();
        d = a.concat();
        g = d.length;
        for (e = 0; e < g; ++e) {
          h = b[(e - 1 + g) % g];
          k = b[(e + 1) % g];
          c[e] += Math.random() - 0.5;
          c[e] *= 0.7;
          if (10 < c[e]) {
            c[e] = 10;
          };
          if (-10 > c[e]) {
            c[e] = -10;
          };
          c[e] = (h + k + 8 * c[e]) / 10;
        }
        m = this;
        for (e = 0; e < g; ++e) {
          b = d[e].v;
          h = d[(e - 1 + g) % g].v;
          k = d[(e + 1) % g].v;
          if (15 < this.size) {
            n = false;
            l = a[e].x;
            p = a[e].y;
            T.retrieve2(l - 5, p - 5, 10, 10, function (a) {
              if (a.c != m && 25 > (l - a.x) * (l - a.x) + (p - a.y) * (p - a.y)) {
                n = true;
              };
            });
            if (!n && (a[e].x < V || a[e].y < W || a[e].x > X || a[e].y > Y)) {
              n = true;
            };
            if (n) {
              if (0 < c[e]) {
                c[e] = 0;
              };
              c[e] -= 1;
            };
          }
          b += c[e];
          if (0 > b) {
            b = 0;
          };
          b = (12 * b + this.size) / 13;
          a[e].v = (h + k + 8 * b) / 10;
          h = 2 * Math.PI / g;
          k = this.points[e].v;
          if (this.isVirus && 0 == e % 2) {
            k += 5;
          };
          a[e].x = this.x + Math.cos(h * e) * k;
          a[e].y = this.y + Math.sin(h * e) * k;
        }
      },
      updatePos: function () {
        var a, b, c;
        a = (F - this.updateTime) / 120;
        a = 0 > a ? 0 : 1 < a ? 1 : a;
        a = a * a * (3 - 2 * a);
        c = this.getNameSize();
        if (this.destroyed && 1 <= a) {
          b = E.indexOf(this);
          if (-1 != b) {
            E.splice(b, 1);
          };
        }
        this.x = a * (this.nx - this.ox) + this.ox;
        this.y = a * (this.ny - this.oy) + this.oy;
        this.size = a * (this.nSize - this.oSize) + this.oSize;
        if (!(this.destroyed || c == this.getNameSize())) {
          this.setName(this.name);
        };
        return a;
      },
      shouldRender: function () {
        return this.x + this.size + 40 < w - canvasWidth / 2 / zoom || this.y + this.size + 40 < x - canvasHeight / 2 / zoom || this.x - this.size - 40 > w + canvasWidth / 2 / zoom || this.y - this.size - 40 > x + canvasHeight / 2 / zoom ? false : true;
      },
      draw: function () {
        var b, c, skin;
        if (this.shouldRender()) {
          ctx.save();
          this.drawTime = F;
          skin = this.updatePos();
          if (this.destroyed) {
            ctx.globalAlpha *= 1 - skin;
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
          skin = this.getNumPoints();
          for (c = 0; c <= skin; ++c) {
            b = c % skin;
            if (0 == c) {
              ctx.moveTo(this.points[b].x, this.points[b].y);
            } else {
              ctx.lineTo(this.points[b].x, this.points[b].y);
            };
          }
          ctx.closePath();
          skin = skinsEnabled ? getSkin(this.name) : null;
          ctx.stroke();
          ctx.fill();
          if (null != skin && 0 < skin.width) {
            ctx.save();
            ctx.clip();
            ctx.drawImage(skin, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
            ctx.restore();
          };
          if (hardMode || 15 < this.size) {
            ctx.strokeStyle = '#000000';
            ctx.globalAlpha *= 0.1;
            ctx.stroke();
          }
          if ((ba || -1 != n.indexOf(this)) && this.name && this.cachedName) {
            ctx.globalAlpha = 1;
            ctx.drawImage(this.cachedName, ~~this.x - ~~(this.cachedName.width / 2), ~~this.y - ~~(this.cachedName.height / 2));
          };
          ctx.restore();
        }
      }
    };
    window.onload = init;
  }
}(window, jQuery));
