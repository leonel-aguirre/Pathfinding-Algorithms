require("./styles.scss");
const p5 = require("p5");
import Cell from "./Cell";
import Map from "./Map";

let width = 500;
let height = 500;
let resolution = 25;

let map;

let changeCellTo = Cell.WALL;

const sketch = (p5) => {
  p5.setup = () => {
    let canvas = p5.createCanvas(width, height);
    canvas.parent("Canvas");

    map = new Map({ p5, width, height, resolution });
  };

  p5.draw = () => {
    p5.background(200);
    map.draw();
  };

  p5.mouseDragged = () => {
    map.changeSelectedCellState(changeCellTo);
  };

  p5.mouseClicked = () => {
    map.changeSelectedCellState(changeCellTo);
  };
};

new p5(sketch);
