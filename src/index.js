require("./styles.scss");
const p5 = require("p5");
import Cell from "./Cell";
import Map from "./Map";

let width = 600;
let height = 600;
let resolution = 61;

let map;

let changeCellTo = Cell.WALL;

// DOM ELEMENTS +++

let canvasContainer;
let generateMazeButton;
let findPathButton;

// DOM ELEMENTS ---

window.onload = () => {
  canvasContainer = document.querySelector("#Canvas");

  generateMazeButton = document.querySelector("#GenerateMazeButton");
  findPathButton = document.querySelector("#FindPathButton");

  const sketch = (p5) => {
    p5.setup = () => {
      let canvas = p5.createCanvas(width, height);
      canvas.parent("Canvas");

      map = new Map({ p5, width, height, resolution });

      canvasContainer.style.width = `${width}px`;
      canvasContainer.style.height = `${height}px`;

      addListeners();
    };

    p5.draw = () => {
      p5.background(200);
      map.draw();
      map.update();
    };

    p5.mouseDragged = () => {
      map.changeSelectedCellState(changeCellTo);
    };

    p5.mouseClicked = () => {
      map.changeSelectedCellState(changeCellTo);
    };
  };

  new p5(sketch);
};

function addListeners() {
  let stateSelectorRadios = Array.from(
    document.querySelectorAll("#CellStateSelector input")
  );

  stateSelectorRadios.forEach((radio) => {
    radio.addEventListener(
      "input",
      (e) => (changeCellTo = parseInt(e.target.value))
    );
  });

  generateMazeButton.addEventListener("click", () => {
    map.enableMazeGeneration = true;
  });

  findPathButton.addEventListener("click", () => {
    map.enablePathFinding = true;
  });
}
