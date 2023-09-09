import { useRef } from "react"
import "./App.scss"

import Canvas from "./Canvas/Canvas"
import Cell from "./p5/Cell"

const App = () => {
  const generateMazeButton = useRef(null)
  const findPathButton = useRef(null)
  const radioWall = useRef(null)
  const radioPath = useRef(null)
  const radioStart = useRef(null)
  const radioEnd = useRef(null)

  return (
    <div className="app">
      <div className="app__container">
        <Canvas
          generateMazeButton={generateMazeButton}
          findPathButton={findPathButton}
          stateSelectorRadios={[radioWall, radioStart, radioPath, radioEnd]}
        />
        <div className="app__controls">
          <div className="app__cell-state-selector">
            <p className="app__cell-state-selector-description">
              Change cell to:
            </p>
            <div className="app__radio-wrapper">
              <input
                ref={radioWall}
                id="RadioWall"
                type="radio"
                className="app__radio-wall"
                name="cellState"
                value={Cell.WALL}
                defaultChecked={true}
              />
              <label htmlFor="RadioWall" className="app__radio-label">
                Wall
              </label>
            </div>
            <div className="app__radio-wrapper">
              <input
                ref={radioPath}
                id="RadioPath"
                type="radio"
                className="app__radio-path"
                name="cellState"
                value={Cell.PATH}
              />
              <label htmlFor="RadioPath" className="app__radio-label">
                Path
              </label>
            </div>
            <div className="app__radio-wrapper">
              <input
                ref={radioStart}
                id="RadioStart"
                type="radio"
                className="app__radio-start"
                name="cellState"
                value={Cell.START}
              />
              <label htmlFor="RadioStart" className="app__radio-label">
                Start
              </label>
            </div>
            <div className="app__radio-wrapper">
              <input
                ref={radioEnd}
                id="RadioEnd"
                type="radio"
                className="app__radio-end"
                name="cellState"
                value={Cell.END}
              />
              <label htmlFor="RadioEnd" className="app__radio-label">
                End
              </label>
            </div>
          </div>
          <button
            ref={generateMazeButton}
            id="GenerateMazeButton"
            className="app__generate-maze-button"
          >
            GENERATE MAZE
          </button>
          <button
            ref={findPathButton}
            id="FindPathButton"
            className="app__find-path-button"
          >
            FIND PATH
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
