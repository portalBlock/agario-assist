var s = document.createElement("script");
s.onload = function () { this.parentNode.removeChild(this); };
s.src = chrome.extension.getURL("hijack.js");
s.setAttribute("data-mapping-url", chrome.extension.getURL("mapping.js"));
s.setAttribute("data-override-url", chrome.extension.getURL("override.js"));
document.body.appendChild(s);
