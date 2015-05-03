// We'll need this later...
var overrideURL = document.currentScript.getAttribute("data-override-url");

// Hijack window.onload, but call the original if we think there's a problem
window.onload = (function (fallback) {
  jQuery.get("main_out.js").then(function (data) {
    // The slices are to remove the "return" from the check at the top
    data = ~data.indexOf("DOUBLE_BUFFER") ? data.slice(20,173) + data.slice(180,-18) : data.slice(15,-18);
    var s, js = data + ";document.currentScript.parentNode.removeChild(document.currentScript)";

    // Load the game
    s = document.createElement("script");
    s.appendChild(document.createTextNode(js));
    document.body.appendChild(s);

    // Override the game
    s = document.createElement("script");
    s.onload = function () { this.parentNode.removeChild(this); };
    s.src = overrideURL;
    document.body.appendChild(s);
  }, fallback);
}).bind(null, window.onload);
