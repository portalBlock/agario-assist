(function (h, v) {
  function qa() {
    ca();
    setInterval(ca, 6E4);
    A = O = document.getElementById("canvas");
    d = A.getContext("2d");
    A.onmousedown = function (a) {
      if (da) {
        var b = a.clientX - (5 + m / 5 / 2),
          c = a.clientY - (5 + m / 5 / 2);
        if (Math.sqrt(b * b + c * c) <= m / 5 / 2) {
          G();
          C(17);
          return
        }
      }
      P = a.clientX;
      Q = a.clientY;
      R();
      G()
    };
    A.onmousemove = function (a) {
      P = a.clientX;
      Q = a.clientY;
      R()
    };
    A.onmouseup = function (a) {};
    var a = !1,
      c = !1,
      b = !1;
    h.onkeydown = function (f) {
      32 != f.keyCode || a || (G(), C(17), a = !0);
      81 != f.keyCode || c || (C(18), c = !0);
      87 != f.keyCode || b || (G(), C(21), b = !0)
    };
    h.onkeyup = function (f) {
      32 == f.keyCode && (a = !1);
      87 == f.keyCode && (b = !1);
      81 == f.keyCode && c && (C(19), c = !1)
    };
    h.onblur = function () {
      C(19);
      b = c = a = !1
    };
    h.onresize = ea;
    ea();
    h.requestAnimationFrame ? h.requestAnimationFrame(fa) : setInterval(S, 1E3 / 60);
    setInterval(G, 100);
    ga(v("#region").val())
  }

  function ra() {
    for (var a = Number.POSITIVE_INFINITY, c = Number.POSITIVE_INFINITY, b = Number.NEGATIVE_INFINITY, f = Number.NEGATIVE_INFINITY, d = 0, e = 0; e < r.length; e++) d = Math.max(r[e].size, d), a = Math.min(r[e].x, a), c = Math.min(r[e].y, c), b = Math.max(r[e].x, b), f = Math.max(r[e].y, f);
    T = QUAD.init({
      minX: a - (d + 100),
      minY: c - (d + 100),
      maxX: b + (d + 100),
      maxY: f + (d + 100)
    });
    for (e = 0; e < r.length; e++)
      if (a = r[e], a.shouldRender())
        for (c = 0; c < a.points.length; ++c) T.insert(a.points[c])
  }

  function R() {
    J = (P - m / 2) / s + w;
    K = (Q - p / 2) / s + x
  }

  function ca() {
    null == L && (L = {}, v("#region").children().each(function () {
      var a = v(this),
        c = a.val();
      c && (L[c] = a.text())
    }));
    v.get("http://m.agar.io/info", function (a) {
        for (var c in a.regions) v('#region option[value="' + c + '"]').text(L[c] + " (" + a.regions[c].numPlayers + " players)")
      },
      "json")
  }

  function ga(a) {
    a && a != U && (U = a, ha())
  }

  function ia() {
    v.ajax("http://m.agar.io/", {
      error: function () {
        setTimeout(ia, 1E3)
      },
      success: function (a) {
        a = a.split("\n");
        ja("ws://" + a[0])
      },
      dataType: "text",
      method: "POST",
      cache: !1,
      crossDomain: !0,
      data: U || "?"
    })
  }

  function ha() {
    v("#connecting").show();
    ia()
  }

  function ja(a) {
    g && (g.onopen = null, g.onmessage = null, g.onclose = null, g.close(), g = null);
    D = [];
    n = [];
    y = {};
    r = [];
    E = [];
    z = [];
    console.log("Connecting to " + a);
    g = new WebSocket(a);
    g.binaryType = "arraybuffer";
    g.onopen = sa;
    g.onmessage = ta;
    g.onclose = ua;
    g.onerror = function () {
      console.log("socket error")
    }
  }

  function sa(a) {
    v("#connecting").hide();
    console.log("socket open");
    a = new ArrayBuffer(5);
    var c = new DataView(a);
    c.setUint8(0, 255);
    c.setUint32(1, 1, !0);
    g.send(a);
    ka()
  }

  function ua(a) {
    console.log("socket close");
    setTimeout(ha, 500)
  }

  function ta(a) {
    function c() {
      for (var a = "";;) {
        var c = f.getUint16(b, !0);
        b += 2;
        if (0 == c) break;
        a += String.fromCharCode(c)
      }
      return a
    }
    var b = 1,
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
      D.push(f.getUint32(1, !0));
      break;
    case 48:
      for (z = []; b < f.byteLength;) z.push(c());
      wa();
      break;
    case 64:
      V = f.getFloat64(1, !0), W = f.getFloat64(9, !0), X = f.getFloat64(17, !0), Y = f.getFloat64(25, !0), 0 == n.length && (w = (X + V) / 2, x = (Y + W) / 2)
    }
  }

  function va(a) {
    F = +new Date;
    var c = Math.random(),
      b = 1;
    Z = !1;
    for (var f = a.getUint16(b, !0), b = b + 2, d = 0; d < f; ++d) {
      var e = y[a.getUint32(b, !0)],
        t = y[a.getUint32(b + 4, !0)],
        b = b + 8;
      e && t && (t.destroy(), t.ox = t.x, t.oy = t.y, t.oSize = t.size, t.nx = e.x, t.ny = e.y, t.nSize = t.size, t.updateTime = F)
    }
    for (;;) {
      f =
        a.getUint32(b, !0);
      b += 4;
      if (0 == f) break;
      var d = a.getFloat64(b, !0),
        b = b + 8,
        e = a.getFloat64(b, !0),
        b = b + 8,
        t = a.getFloat64(b, !0),
        b = b + 8,
        k = a.getUint8(b++),
        g = !1;
      if (0 == k) g = !0, k = "#33FF33";
      else if (255 == k) var g = a.getUint8(b++),
        k = a.getUint8(b++),
        h = a.getUint8(b++),
        k = la(g << 16 | k << 8 | h),
        g = !!(a.getUint8(b++) & 1);
      else {
        var k = 63487 | k << 16,
          l = (k >> 16 & 255) / 255 * 360,
          m = (k >> 8 & 255) / 255,
          k = (k >> 0 & 255) / 255;
        if (0 == m) k = k << 16 | k << 8 | k << 0;
        else {
          var l = l / 60,
            h = ~~l,
            u = l - h,
            l = k * (1 - m),
            s = k * (1 - m * u),
            m = k * (1 - m * (1 - u)),
            p = u = 0,
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
            u = k, p = l, q = s
          }
          u = ~~(255 * u) & 255;
          p = ~~(255 * p) & 255;
          q = ~~(255 * q) & 255;
          k = u << 16 | p << 8 | q
        }
        k = la(k)
      }
      for (h = "";;) {
        l = a.getUint16(b, !0);
        b += 2;
        if (0 == l) break;
        h += String.fromCharCode(l)
      }
      l = null;
      y.hasOwnProperty(f) ? (l = y[f], l.updatePos(), l.ox = l.x, l.oy = l.y, l.oSize = l.size, l.color = k) : l = new ma(f, d, e, t, k, g, h);
      l.nx = d;
      l.ny = e;
      l.nSize = t;
      l.updateCode = c;
      l.updateTime = F; - 1 != D.indexOf(f) && -1 == n.indexOf(l) && (document.getElementById("overlays").style.display = "none", n.push(l), 1 == n.length && (w = l.x, x = l.y))
    }
    a.getUint16(b, !0);
    b += 2;
    e = a.getUint32(b, !0);
    b += 4;
    for (d = 0; d < e; d++) f = a.getUint32(b, !0), b += 4, y[f] && (y[f].updateCode = c);
    for (d = 0; d < r.length; d++) r[d].updateCode != c && r[d--].destroy();
    Z && 0 == n.length && v("#overlays").fadeIn(3E3)
  }

  function G() {
    if (null != g && g.readyState == g.OPEN && (na != J || oa != K)) {
      na = J;
      oa = K;
      var a = new ArrayBuffer(21),
        c = new DataView(a);
      c.setUint8(0, 16);
      c.setFloat64(1, J, !0);
      c.setFloat64(9, K, !0);
      c.setUint32(17, 0, !0);
      g.send(a)
    }
  }

  function ka() {
    if (null != g && g.readyState == g.OPEN && null != H) {
      var a = new ArrayBuffer(1 + 2 * H.length),
        c = new DataView(a);
      c.setUint8(0, 0);
      for (var b = 0; b < H.length; ++b) c.setUint16(1 + 2 * b, H.charCodeAt(b), !0);
      g.send(a)
    }
  }

  function C(a) {
    if (null != g && g.readyState == g.OPEN) {
      var c = new ArrayBuffer(1);
      (new DataView(c)).setUint8(0, a);
      g.send(c)
    }
  }

  function fa() {
    S();
    h.requestAnimationFrame(fa)
  }

  function ea() {
    m = h.innerWidth;
    p = h.innerHeight;
    O.width = A.width = m;
    O.height = A.height = p;
    S()
  }

  function xa() {
    for (var a = 0, c = 0; c < n.length; c++) a += n[c].size;
    a = Math.pow(Math.min(64 / a, 1), .4) * Math.max(p / 965, m / 1920);
    s = (9 * s + a) / 10
  }

  function S() {
    var a = +new Date;
    ++ya;
    xa();
    F = +new Date;
    ra();
    if (0 < n.length) {
      for (var c = 0, b = 0, f = 0; f < n.length; f++) n[f].updatePos(), c += n[f].x / n.length, b += n[f].y / n.length;
      w = (w + c) / 2;
      x = (x + b) / 2
    }
    R();
    d.clearRect(0, 0, m, p);
    d.fillStyle = $ ? "#111111" : "#F2FBFF";
    d.fillRect(0, 0, m, p);
    d.save();
    d.strokeStyle = $ ? "#AAAAAA" : "#000000";
    d.globalAlpha = .2;
    d.scale(s, s);
    c = m / s;
    b = p / s;
    for (f = -.5 + (-w + c / 2) % 50; f < c; f += 50) d.beginPath(), d.moveTo(f, 0), d.lineTo(f, b), d.stroke();
    for (f = -.5 + (-x + b / 2) % 50; f < b; f += 50) d.beginPath(),
      d.moveTo(0, f), d.lineTo(c, f), d.stroke();
    d.restore();
    r.sort(function (a, b) {
      return a.size == b.size ? a.id - b.id : a.size - b.size
    });
    d.save();
    d.translate(m / 2, p / 2);
    d.scale(s, s);
    d.translate(-w, -x);
    for (f = 0; f < E.length; f++) E[f].draw();
    for (f = 0; f < r.length; f++) r[f].draw();
    d.restore();
    B && 0 != z.length && d.drawImage(B, m - B.width - 10, 10);
    I = Math.max(I, za());
    0 != I && (b = "Score: " + ~~(I / 100), d.font = "24px Ubuntu", d.fillStyle = "#000000", d.globalAlpha = .2, c = d.measureText(b).width, d.fillRect(m / 2 - c / 2 - 5, p - 10 - 24 - 10, c + 10, 34), d.globalAlpha = 1, d.fillStyle = "#FFFFFF", d.fillText(b, m / 2 - c / 2, p - 10 - 8));
    Aa();
    a = +new Date - a;
    a > 1E3 / 60 ? q -= .01 : a < 1E3 / 65 && (q += .01);.4 > q && (q = .4);
    1 < q && (q = 1)
  }

  function Aa() {
    if (da && aa.width) {
      var a = m / 5;
      d.drawImage(aa, 5, 5, a, a)
    }
  }

  function za() {
    for (var a = 0, c = 0; c < n.length; c++) a += n[c].nSize * n[c].nSize;
    return a
  }

  function wa() {
    if (0 != z.length) {
      B = document.createElement("canvas");
      var a = B.getContext("2d"),
        c = 60 + 24 * z.length,
        b = Math.min(200, .3 * m) / 200;
      B.width = 200 * b;
      B.height = c * b;
      a.scale(b, b);
      a.globalAlpha = .4;
      a.fillStyle = "#000000";
      a.fillRect(0, 0,
        200, c);
      a.globalAlpha = 1;
      a.fillStyle = "#FFFFFF";
      b = null;
      b = "Leaderboard";
      a.font = "30px Ubuntu";
      a.fillText(b, 100 - a.measureText(b).width / 2, 40);
      a.font = "20px Ubuntu";
      for (c = 0; c < z.length; ++c) b = z[c] || "An unnamed cell", ba || 0 != n.length && n[0].name == b || (b = "An unnamed cell"), b = c + 1 + ". " + b, a.fillText(b, 100 - a.measureText(b).width / 2, 70 + 24 * c)
    }
  }

  function Ba(a) {
    if (M) return null;
    a = a.toLowerCase();
    if (-1 == Ca.indexOf(a)) return null;
    N.hasOwnProperty(a) || (N[a] = new Image, N[a].src = "skins/" + a + ".png");
    return N[a]
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
    this.setName(g)
  }

  function la(a) {
    for (a = a.toString(16); 6 > a.length;) a = "0" + a;
    return "#" + a
  }
  if ("agar.io" != h.location.hostname && "localhost" != h.location.hostname && "10.10.2.13" != h.location.hostname) h.location = "http://agar.io/";
  else {
    var O, d, A, m, p, T = null,
      g = null,
      w = 0,
      x = 0,
      D = [],
      n = [],
      y = {},
      r = [],
      E = [],
      z = [],
      P = 0,
      Q = 0,
      J = -1,
      K = -1,
      ya = 0,
      F = 0,
      H = null,
      V = 0,
      W = 0,
      X = 1E4,
      Y = 1E4,
      s = 1,
      U = null,
      pa = !0,
      ba = !0,
      M = !1,
      Z = !1,
      I = 0,
      $ = !1,
      da = "ontouchstart" in h && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      aa = new Image;
    aa.src = "img/split.png";
    var L = null;
    h.setNick = function (a) {
      v("#adsBottom").hide();
      H = a;
      ka();
      v("#overlays").hide();
      I = 0
    };
    h.setRegion = ga;
    h.setSkins = function (a) {
      pa = a
    };
    h.setNames = function (a) {
      ba = a
    };
    h.setDarkTheme = function (a) {
      $ = a
    };
    h.setColors = function (a) {
      M = a
    };
    h.connect = ja;
    var na = -1,
      oa = -1,
      B = null,
      q = 1,
      N = {},
      Ca = "poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;ussr;pewdiepie;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;nazi;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin".split(";");
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
      destroyed: !1,
      isVirus: !1,
      destroy: function () {
        var a;
        for (a = 0; a < r.length; a++)
          if (r[a] == this) {
            r.splice(a, 1);
            break
          }
        delete y[this.id];
        a = n.indexOf(this); - 1 != a && (Z = !0, n.splice(a, 1));
        a = D.indexOf(this.id); - 1 != a && D.splice(a, 1);
        this.destroyed = !0;
        E.push(this)
      },
      getNameSize: function () {
        return Math.max(~~(.3 * this.size), 24)
      },
      setName: function (a) {
        if (this.name = a) {
          var c = document.createElement("canvas"),
            b = c.getContext("2d"),
            d = this.getNameSize(),
            h = d - 2 + "px Ubuntu";
          b.font = h;
          var e = b.measureText(a).width,
            g = ~~(.2 * d);
          c.width = e + 6;
          c.height = d + g;
          b.font = h;
          b.globalAlpha = 1;
          b.lineWidth = 3;
          b.strokeStyle = "#000000";
          b.fillStyle = "#FFFFFF";
          b.strokeText(a, 3, d - g / 2);
          b.fillText(a, 3, d - g / 2);
          this.cachedName = c
        }
      },
      createPoints: function () {
        for (var a = this.getNumPoints(); this.points.length > a;) {
          var c = ~~(Math.random() * this.points.length);
          this.points.splice(c, 1);
          this.pointsAcc.splice(c, 1)
        }
        0 == this.points.length && 0 < a && (this.points.push({
          c: this,
          v: this.size,
          x: this.x,
          y: this.y
        }), this.pointsAcc.push(Math.random() - .5));
        for (; this.points.length < a;) {
          var c = ~~(Math.random() * this.points.length),
            b = this.points[c];
          this.points.splice(c, 0, {
            c: this,
            v: b.v,
            x: b.x,
            y: b.y
          });
          this.pointsAcc.splice(c, 0, this.pointsAcc[c])
        }
      },
      getNumPoints: function () {
        return ~~Math.max(this.size * s * (this.isVirus ? Math.min(2 * q, 1) : q), this.isVirus ? 10 : 5)
      },
      movePoints: function () {
        this.createPoints();
        for (var a = this.points, c = this.pointsAcc, b = c.concat(), d = a.concat(), g = d.length, e = 0; e < g; ++e) {
          var h = b[(e - 1 + g) % g],
            k = b[(e + 1) % g];
          c[e] += Math.random() - .5;
          c[e] *= .7;
          10 < c[e] && (c[e] = 10); - 10 > c[e] && (c[e] = -10);
          c[e] = (h + k + 8 * c[e]) / 10
        }
        for (var m = this, e = 0; e < g; ++e) {
          b = d[e].v;
          h = d[(e - 1 + g) % g].v;
          k = d[(e + 1) % g].v;
          if (15 < this.size) {
            var n = !1,
              l = a[e].x,
              p = a[e].y;
            T.retrieve2(l - 5, p - 5, 10, 10, function (a) {
              a.c != m && 25 > (l - a.x) * (l - a.x) + (p - a.y) * (p - a.y) && (n = !0)
            });
            !n && (a[e].x < V || a[e].y < W || a[e].x > X || a[e].y > Y) && (n = !0);
            n && (0 < c[e] && (c[e] = 0), c[e] -= 1)
          }
          b += c[e];
          0 > b && (b = 0);
          b = (12 * b + this.size) / 13;
          a[e].v = (h + k + 8 * b) / 10;
          h = 2 *
            Math.PI / g;
          k = this.points[e].v;
          this.isVirus && 0 == e % 2 && (k += 5);
          a[e].x = this.x + Math.cos(h * e) * k;
          a[e].y = this.y + Math.sin(h * e) * k
        }
      },
      updatePos: function () {
        var a;
        a = (F - this.updateTime) / 120;
        a = 0 > a ? 0 : 1 < a ? 1 : a;
        a = a * a * (3 - 2 * a);
        var c = this.getNameSize();
        if (this.destroyed && 1 <= a) {
          var b = E.indexOf(this); - 1 != b && E.splice(b, 1)
        }
        this.x = a * (this.nx - this.ox) + this.ox;
        this.y = a * (this.ny - this.oy) + this.oy;
        this.size = a * (this.nSize - this.oSize) + this.oSize;
        this.destroyed || c == this.getNameSize() || this.setName(this.name);
        return a
      },
      shouldRender: function () {
        return this.x +
          this.size + 40 < w - m / 2 / s || this.y + this.size + 40 < x - p / 2 / s || this.x - this.size - 40 > w + m / 2 / s || this.y - this.size - 40 > x + p / 2 / s ? !1 : !0
      },
      draw: function () {
        if (this.shouldRender()) {
          d.save();
          this.drawTime = F;
          var a = this.updatePos();
          this.destroyed && (d.globalAlpha *= 1 - a);
          this.movePoints();
          M ? (d.fillStyle = "#FFFFFF", d.strokeStyle = "#AAAAAA") : (d.fillStyle = this.color, d.strokeStyle = this.color);
          d.beginPath();
          d.lineWidth = 10;
          d.lineCap = "round";
          d.lineJoin = this.isVirus ? "mitter" : "round";
          for (var a = this.getNumPoints(), c = 0; c <= a; ++c) {
            var b = c % a;
            0 == c ? d.moveTo(this.points[b].x, this.points[b].y) : d.lineTo(this.points[b].x, this.points[b].y)
          }
          d.closePath();
          a = pa ? Ba(this.name) : null;
          d.stroke();
          d.fill();
          null != a && 0 < a.width && (d.save(), d.clip(), d.drawImage(a, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size), d.restore());
          if (M || 15 < this.size) d.strokeStyle = "#000000", d.globalAlpha *= .1, d.stroke();
          (ba || -1 != n.indexOf(this)) && this.name && this.cachedName && (d.globalAlpha = 1, d.drawImage(this.cachedName, ~~this.x - ~~(this.cachedName.width / 2), ~~this.y - ~~(this.cachedName.height /
            2)));
          d.restore()
        }
      }
    };
    h.onload = qa
  }
})(window, jQuery);
