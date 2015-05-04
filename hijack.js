// We'll need this later...
var mappingURL = document.currentScript.getAttribute("data-mapping-url");
var overrideURL = document.currentScript.getAttribute("data-override-url");

// Hijack window.onload, but call the original if we think there's a problem
window.onload = (function (fallback) {
  ORIGINAL_LOAD = fallback;
  jQuery.get("main_out.js").then(function (data) {
    // The slices are to remove the "return" from the check at the top
    SIG = hash(data);
    data = ~data.indexOf("DOUBLE_BUFFER") ? data.slice(20,173) + data.slice(180,-18) : data.slice(15,-18);
    var s, js = data + ";document.currentScript.parentNode.removeChild(document.currentScript)";

    // Load the game
    s = document.createElement("script");
    s.appendChild(document.createTextNode(js));
    document.body.appendChild(s);

    // Unobfusicate the game
    s = document.createElement("script");
    s.onload = function () { this.parentNode.removeChild(this); };
    s.src = mappingURL;
    document.body.appendChild(s);

    // Override the game
    s = document.createElement("script");
    s.onload = function () { this.parentNode.removeChild(this); };
    s.src = overrideURL;
    document.body.appendChild(s);
  }, ORIGINAL_LOAD);
}).bind(null, window.onload);

// Extremely basic string hasher
// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
function hash(str) {
    for (var hash = 0, len = str.length, i = 0; i < len; ++i)
      hash = hash * 31 + str.charCodeAt(i) | 0
    return hash >>> 0
}
