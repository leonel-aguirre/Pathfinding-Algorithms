require("./styles.scss");
const p5 = require("p5");

let width = 500;
let height = 500;

const sketch = (p5) => {
  p5.setup = () => {
    let canvas = p5.createCanvas(width, height);
    canvas.parent("Canvas");
  };

  p5.draw = () => {
    p5.background(200);
  };
};

new p5(sketch);
