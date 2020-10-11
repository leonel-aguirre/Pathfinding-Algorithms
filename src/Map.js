import Cell from "./Cell";

export default class Map {
  constructor(canvas) {
    this.cells = new Array(canvas.resolution);
    this.canvas = canvas;

    for (let i = 0; i < canvas.resolution; i++) {
      this.cells[i] = new Array(canvas.resolution);
      for (let j = 0; j < canvas.resolution; j++) {
        this.cells[i][j] = new Cell(i, j, canvas);
      }
    }

    this.cells[0][0].state = Cell.START;
    this.cells[canvas.resolution - 1][canvas.resolution - 1].state = Cell.END;
  }

  draw() {
    for (let i = 0; i < this.cells.length; i++)
      for (let j = 0; j < this.cells[i].length; j++) this.cells[i][j].draw();
  }

  changeSelectedCellState(newState) {
    let { p5, width, height, resolution } = this.canvas;

    let xOffset = -5;
    let yOffset = -5;

    let x = Math.floor((p5.mouseX + xOffset) / (width / resolution));
    let y = Math.floor((p5.mouseY + yOffset) / (height / resolution));

    if (x >= 0 && x < resolution && y >= 0 && y < resolution)
      this.cells[x][y].changeState(newState);
  }
}
