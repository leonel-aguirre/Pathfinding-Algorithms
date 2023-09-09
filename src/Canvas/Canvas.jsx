import "./Canvas.scss"

import { useEffect, useRef } from "react"
import p5 from "p5"

import SketchMap from "../p5/SketchMap"
import Cell from "../p5/Cell"

let selectedCellType = Cell.WALL

const Canvas = ({
  generateMazeButton,
  findPathButton,
  stateSelectorRadios,
}) => {
  const canvasContainer = useRef(null)
  const width = 600
  const height = 600
  const resolution = 31

  useEffect(() => {
    let map

    const addListeners = () => {
      stateSelectorRadios.forEach((radio) => {
        radio.current?.addEventListener(
          "input",
          (event) => (selectedCellType = Number(event.target.value))
        )
      })

      generateMazeButton.current?.addEventListener("click", () => {
        map.enableMazeGeneration = true
      })

      findPathButton.current?.addEventListener("click", () => {
        map.enablePathFinding = true
      })
    }

    const sketch = (p) => {
      p.setup = () => {
        let canvas = p.createCanvas(width, height)
        canvas.parent(canvasContainer.current)

        map = new SketchMap({
          p5: p,
          width,
          height,
          resolution,
          generateMazeButton,
          findPathButton,
        })

        canvasContainer.current.style.width = `${width}px`
        canvasContainer.current.style.height = `${height}px`

        addListeners()
      }

      p.draw = () => {
        p.background(200)
        map.draw()
        map.update()
      }

      p.mouseDragged = () => {
        map.changeSelectedCellState(selectedCellType)
      }

      p.mouseClicked = () => {
        map.changeSelectedCellState(selectedCellType)
      }
    }

    let instance = new p5(sketch)

    return () => {
      instance.remove()
    }
  }, [])

  return <div ref={canvasContainer} className="canvas"></div>
}

export default Canvas
