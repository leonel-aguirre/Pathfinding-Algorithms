import Cell from "./Cell";

export default class Map {
  constructor(canvas) {
    this.cells = new Array(canvas.resolution);
    this.canvas = canvas;
    this.enableMazeGeneration = true;
    this.mazeGeneration = {
      walls: [],
      beginCell: undefined,
      generatingMaze: false,
    };

    // Cells array initialization.
    for (let i = 0; i < canvas.resolution; i++) {
      this.cells[i] = new Array(canvas.resolution);
      for (let j = 0; j < canvas.resolution; j++) {
        this.cells[i][j] = new Cell(i, j, Cell.PATH, canvas);
      }
    }

    this.cells[0][0].state = Cell.START; // Start cell.
    this.cells[canvas.resolution - 1][canvas.resolution - 1].state = Cell.END; // End cell.
  }

  draw() {
    for (let i = 0; i < this.cells.length; i++)
      for (let j = 0; j < this.cells[i].length; j++) this.cells[i][j].draw();

    // Highlights walls during maze generation.
    this.mazeGeneration.walls.forEach((w) => {
      let { p5, width, height, resolution } = this.canvas;
      let xStep = width / resolution;
      let yStep = height / resolution;

      p5.push();
      p5.fill("#FBB13C");
      p5.rect(w.x * xStep, w.y * yStep, xStep, yStep);
      p5.pop();
    });
  }

  update() {
    if (this.enableMazeGeneration) this.generateMaze();
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

  generateMaze() {
    let { beginCell } = this.mazeGeneration;
    let { resolution } = this.canvas;

    // Returns an array with the surounding neighbours separated by 1 cell.
    const findNeighbourCells = (cell) => {
      let neighbourCells = [];

      // Iterates through all surounding directions.
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          // Only accepts indexes between the bounds of the bidimensional array.
          if (
            cell.x + i >= 0 &&
            cell.x + i < resolution &&
            cell.y + j >= 0 &&
            cell.y + j < resolution
          ) {
            // Excludes diagonal neighbours.
            if (Math.abs(i) ^ Math.abs(j)) {
              neighbourCells.push(this.cells[cell.x + i * 2][cell.y + j * 2]);
            }
          }
        }
      }

      return neighbourCells;
    };

    // Returns a random wall from the wall set and then it is removed from the set.
    const takeRandomWall = () => {
      // A random index of the wall set.
      let index = Math.floor(Math.random() * this.mazeGeneration.walls.length);
      let wall = this.mazeGeneration.walls[index];

      // Removes that index from the set.
      this.mazeGeneration.walls.splice(index, 1);

      return wall;
    };

    // Connects the wall with a random selected neighbour path.
    const connectWallToMaze = (wall) => {
      // Gets all neighbours and filters only the ones that are a path.
      let neighbourPaths = findNeighbourCells(wall).filter(
        (c) => c.state == Cell.PATH
      );

      wall.state = Cell.PATH; // Turns the wall into a path.

      if (neighbourPaths.length > 0) {
        // Random neighbour.
        let randomNeighbourPath =
          neighbourPaths[Math.floor(Math.random() * neighbourPaths.length)];

        // Coordinates of the cell in between.
        let midCellX =
          randomNeighbourPath.x + (wall.x - randomNeighbourPath.x) / 2;
        let midCellY =
          randomNeighbourPath.y + (wall.y - randomNeighbourPath.y) / 2;

        // Turns the cell in between into a path.
        this.cells[midCellX][midCellY].state = Cell.PATH;
      }
    };

    // Initializes the generation.
    if (!this.mazeGeneration.generatingMaze) {
      // All cells become walls.
      for (let i = 0; i < this.cells.length; i++) {
        for (let j = 0; j < this.cells[i].length; j++) {
          this.cells[i][j].state = Cell.WALL;
        }
      }

      // Begin cell is top left corner.
      beginCell = this.cells[0][0];
      beginCell.state = Cell.PATH;

      // Begin cell's neighbour walls are added to the wall set.
      this.mazeGeneration.walls = findNeighbourCells(beginCell).filter(
        (c) => c.state == Cell.WALL
      );

      // Maze generation starts.
      this.mazeGeneration.generatingMaze = true;
      document
        .querySelector("#GenerateMazeButton")
        .setAttribute("disabled", "");
    }

    // While walls set is not empty.
    if (this.mazeGeneration.walls.length > 0) {
      // Takes a random wall from the walls set.
      let randomWall = takeRandomWall();

      // Connects to a random path of the maze.
      connectWallToMaze(randomWall);

      // Finds neighbour walls.
      let neighbourWalls = findNeighbourCells(randomWall).filter(
        (c) => c.state == Cell.WALL
      );

      // Adds neighbour walls to the walls set.
      this.mazeGeneration.walls = [
        ...this.mazeGeneration.walls,
        ...neighbourWalls,
      ];

      let noDuplicates = [];

      // Removes duplicated walls from wall set.
      this.mazeGeneration.walls.forEach((w) => {
        if (!noDuplicates.includes(w)) noDuplicates.push(w);
      });

      this.mazeGeneration.walls = noDuplicates;
    } else {
      // Maze generation stopped.
      this.mazeGeneration.generatingMaze = false;
      this.enableMazeGeneration = false;

      this.cells[0][0].state = Cell.START; // Start cell.
      this.cells[resolution - 1][resolution - 1].state = Cell.END; // End cell.
      document.querySelector("#GenerateMazeButton").removeAttribute("disabled");
    }
  }
}
