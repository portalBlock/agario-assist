// Wrap everything in a try catch so that things continue working if we get lucky
try {

// Scroll to change zoom  (down = zoom out, up = zoom in)
calculateZoom = function () {};
zoom = 1;
document.addEventListener("mousewheel", function (e) { zoom *= 1 + e.wheelDelta / 1000; }, false);

// Friend-or-foe colors
var randColor = function () { return "#" + ("000000" + Math.floor(Math.random() * 0x1000000).toString(16)).slice(-6); };
Cell.prototype.draw = (function (original) {
  return function () {
    var mySize = 100;//Math.min.apply(null, myCells.map(function (x) { return x.size; })); // Size of the smallest piece of us
    if (this.isVirus) {//} || myCells.length === 0) {
      this.color = "#666666"; // Viruses are always gray, and everything is gray when dead
    } else if (~myCells.indexOf(this)) {
      this.color = "#0000FF"; // Cells we own are blue
    } else if (this.size > mySize * 2) {
      this.color = "#FF0000"; // Cells that can split on us are red
    } else if (this.size > mySize) {
      this.color = "#FF6600"; // Cells that can eat us are orange
    } else if (this.size > mySize / 2) {
      this.color = "#FFFF00"; // Cells that we can eat are yellow
    } else {
      this.color = "#00FF00"; // Cells that we can split on are green
    }
    original.apply(this, arguments);
  }
})(Cell.prototype.draw);

// Finally, start the whole process
init();

} catch (e) {
  // Something went wrong... let's just make sure the game loads
  ORIGINAL_LOAD();
}
