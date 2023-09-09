import Cell from "./Cell"

export default class SketchMap {
  constructor(canvas) {
    this.cells = new Array(canvas.resolution)
    this.canvas = canvas
    this.enableMazeGeneration = false
    this.enablePathFinding = false
    this.startCell = undefined
    this.endCell = undefined
    this.mazeGeneration = {
      walls: [],
      beginCell: undefined,
      generatingMaze: false,
    }
    this.pathFinding = {
      openSet: [],
      closedSet: [],
      findingPath: false,
      path: [],
    }

    // Cells array initialization.
    for (let i = 0; i < canvas.resolution; i++) {
      this.cells[i] = new Array(canvas.resolution)
      for (let j = 0; j < canvas.resolution; j++) {
        this.cells[i][j] = new Cell(i, j, Cell.PATH, canvas)
      }
    }

    this.startCell = this.cells[0][0]
    this.cells[0][0].state = Cell.START // Start cell.

    this.endCell = this.cells[canvas.resolution - 1][canvas.resolution - 1]
    this.cells[canvas.resolution - 1][canvas.resolution - 1].state = Cell.END // End cell.
  }

  draw() {
    for (let i = 0; i < this.cells.length; i++)
      for (let j = 0; j < this.cells[i].length; j++) this.cells[i][j].draw()

    this.pathFinding.openSet.forEach((c) => {
      this.highlightCell(c, "#57B8FF")
    })

    this.pathFinding.closedSet.forEach((c) => {
      this.highlightCell(c, "#FBB13C")
    })

    this.pathFinding.path.forEach((c) => {
      this.highlightCell(c, "#2FBF71")
    })

    // Highlights walls during maze generation.
    this.mazeGeneration.walls.forEach((w) => {
      this.highlightCell(w, "#FBB13C")
    })
  }

  update() {
    if (this.enableMazeGeneration) this.generateMaze()
    if (this.enablePathFinding) this.pathFind()
  }

  highlightCell(cell, color) {
    if (cell.state !== Cell.START && cell.state !== Cell.END) {
      let { p5, width, height, resolution } = this.canvas
      let xStep = width / resolution
      let yStep = height / resolution

      p5.push()
      p5.fill(color)
      p5.rect(cell.x * xStep, cell.y * yStep, xStep, yStep)
      p5.pop()
    }
  }

  changeSelectedCellState(newState) {
    let { p5, width, height, resolution } = this.canvas

    let xOffset = -5
    let yOffset = -5

    let x = Math.floor((p5.mouseX + xOffset) / (width / resolution))
    let y = Math.floor((p5.mouseY + yOffset) / (height / resolution))

    if (x >= 0 && x < resolution && y >= 0 && y < resolution) {
      if (newState === Cell.START) {
        this.startCell.state = Cell.PATH
        this.startCell = this.cells[x][y]
      } else if (newState === Cell.END) {
        this.endCell.state = Cell.PATH
        this.endCell = this.cells[x][y]
      }

      this.cells[x][y].changeState(newState)
    }
  }

  pathFind() {
    const calculateHeuristic = (cell) => {
      // // Option 1.
      // let h = Math.sqrt(
      //   (cell.x - this.endCell.x) ** 2 + (cell.y - this.endCell.y) ** 2
      // );

      // Option 2. (Better performance or maybe not)
      let h = (cell.x - this.endCell.x) ** 2 + (cell.y - this.endCell.y) ** 2

      // // Option 3.
      // let h =
      //   Math.abs(cell.x - this.endCell.x) + Math.abs(cell.y - this.endCell.y);

      return h
    }

    if (!this.pathFinding.findingPath) {
      this.pathFinding.closedSet = []
      this.pathFinding.openSet = []
      this.pathFinding.path = []

      this.startCell.h = calculateHeuristic(this.startCell)

      this.pathFinding.openSet.push(this.startCell)
      this.pathFinding.findingPath = true
      this.disableDOMButtons()
    }

    if (this.pathFinding.openSet.length > 0) {
      let current = this.pathFinding.openSet[0]

      this.pathFinding.openSet.forEach((c) => {
        if (c.f < current.f) current = c
      })

      if (current === this.endCell) {
        this.enablePathFinding = false
        this.pathFinding.findingPath = false
        this.enableDOMButtons()
      }

      this.pathFinding.openSet.splice(
        this.pathFinding.openSet.indexOf(current),
        1
      )
      this.pathFinding.closedSet.push(current)

      let neighbors = this.findNeighborCells(current, 1).filter(
        (n) => n.state !== Cell.WALL
      )

      neighbors.forEach((n) => {
        if (!this.pathFinding.closedSet.includes(n)) {
          let tempG = current.g + 1

          if (this.pathFinding.openSet.includes(n)) {
            n.g = n.g < tempG ? tempG : n.g
          } else {
            n.g = tempG
            this.pathFinding.openSet.push(n)
          }

          n.parent = current

          n.h = calculateHeuristic(n)
          n.f = n.g + n.h
        }
      })

      this.pathFinding.path = []

      let pathCell = current
      while (pathCell.parent !== undefined) {
        this.pathFinding.path.push(pathCell)
        pathCell = pathCell.parent
      }
    } else {
      this.enablePathFinding = false
      this.pathFinding.findingPath = false
      this.enableDOMButtons()
    }
  }

  generateMaze() {
    let { beginCell } = this.mazeGeneration
    let { resolution } = this.canvas

    // Returns a random wall from the wall set and then it is removed from the set.
    const takeRandomWall = () => {
      // A random index of the wall set.
      let index = Math.floor(Math.random() * this.mazeGeneration.walls.length)
      let wall = this.mazeGeneration.walls[index]

      // Removes that index from the set.
      this.mazeGeneration.walls.splice(index, 1)

      return wall
    }

    // Connects the wall with a random selected neighbor path.
    const connectWallToMaze = (wall) => {
      // Gets all neighbors and filters only the ones that are a path.
      let neighborPaths = this.findNeighborCells(wall, 2).filter(
        (c) => c.state === Cell.PATH
      )

      wall.state = Cell.PATH // Turns the wall into a path.

      if (neighborPaths.length > 0) {
        // Random neighbor.
        let randomNeighborPath =
          neighborPaths[Math.floor(Math.random() * neighborPaths.length)]

        // Coordinates of the cell in between.
        let midCellX =
          randomNeighborPath.x + (wall.x - randomNeighborPath.x) / 2
        let midCellY =
          randomNeighborPath.y + (wall.y - randomNeighborPath.y) / 2

        // Turns the cell in between into a path.
        this.cells[midCellX][midCellY].state = Cell.PATH
      }
    }

    // Initializes the generation.
    if (!this.mazeGeneration.generatingMaze) {
      // Reset Path-finding information.
      this.pathFinding.closedSet = []
      this.pathFinding.openSet = []
      this.pathFinding.path = []

      // All cells become walls.
      for (let i = 0; i < this.cells.length; i++) {
        for (let j = 0; j < this.cells[i].length; j++) {
          this.cells[i][j].state = Cell.WALL
        }
      }

      // Begin cell is top left corner.
      beginCell = this.cells[0][0]
      beginCell.state = Cell.PATH

      // Begin cell's neighbor walls are added to the wall set.
      this.mazeGeneration.walls = this.findNeighborCells(beginCell, 2).filter(
        (c) => c.state === Cell.WALL
      )

      // Maze generation starts.
      this.mazeGeneration.generatingMaze = true
      this.disableDOMButtons()
    }

    // While walls set is not empty.
    if (this.mazeGeneration.walls.length > 0) {
      // Takes a random wall from the walls set.
      let randomWall = takeRandomWall()

      // Connects to a random path of the maze.
      connectWallToMaze(randomWall)

      // Finds neighbor walls.
      let neighborWalls = this.findNeighborCells(randomWall, 2).filter(
        (c) => c.state === Cell.WALL
      )

      // Adds neighbor walls to the walls set.
      this.mazeGeneration.walls = [
        ...this.mazeGeneration.walls,
        ...neighborWalls,
      ]

      let noDuplicates = []

      // Removes duplicated walls from wall set.
      this.mazeGeneration.walls.forEach((w) => {
        if (!noDuplicates.includes(w)) noDuplicates.push(w)
      })

      this.mazeGeneration.walls = noDuplicates
    } else {
      // Maze generation stopped.
      this.mazeGeneration.generatingMaze = false
      this.enableMazeGeneration = false

      this.startCell.state = Cell.PATH
      this.cells[0][0].state = Cell.START // Start cell.
      this.startCell = this.cells[0][0]
      this.endCell.state = Cell.PATH
      this.cells[resolution - 1][resolution - 1].state = Cell.END // End cell.
      this.endCell = this.cells[resolution - 1][resolution - 1]

      this.enableDOMButtons()
    }
  }

  // Returns an array with the surrounding neighbors separated by 1 cell.
  findNeighborCells(cell, distance) {
    let { resolution } = this.canvas

    let neighborCells = []

    // Iterates through all surrounding directions.
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        // Only accepts indexes between the bounds of the bi-dimensional array.
        if (
          cell.x + i >= 0 &&
          cell.x + i < resolution &&
          cell.y + j >= 0 &&
          cell.y + j < resolution
        ) {
          // Excludes diagonal neighbors.
          if (Math.abs(i) ^ Math.abs(j)) {
            neighborCells.push(
              this.cells[cell.x + i * distance][cell.y + j * distance]
            )
          }
        }
      }
    }

    return neighborCells
  }

  disableDOMButtons() {
    this.canvas.generateMazeButton.current.setAttribute("disabled", "")
    this.canvas.findPathButton.current.setAttribute("disabled", "")
  }

  enableDOMButtons() {
    this.canvas.generateMazeButton.current.removeAttribute("disabled")
    this.canvas.findPathButton.current.removeAttribute("disabled")
  }
}
