import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import CanvasContainer from "./components/CanvasContainer";
import GameStatusContext from "./contexts/GameStatusContext";
import { TICK_INTERVAL, GAME_STATUS } from "./constants/GameConstants";
import GamePointsContext from "./contexts/GamePointsContext";
import GameTimeContext from "./contexts/GameTimeContext";

function App() {
  const [upTime, setUpTime] = useState(0);
  const [points, setPoints] = useState(0);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);
  const [gameRestartKey, setGameRestartKey] = useState(1);

  const gameStatusContextValues = {
    gameStatus,
    setGameStatus
  };
  const gamePointsContextValues = {
    points,
    setPoints
  };
  const gameTimeContextValues = {
    upTime,
    setUpTime
  };

  function handleRestartGame() {
    setGameRestartKey(key => (key + 1) % 10);
    setUpTime(0);
    setPoints(0);
    setGameStatus(GAME_STATUS.PLAYING);
  }

  function handlePauseGame() {
    setGameStatus(GAME_STATUS.PAUSED);
  }
  function handleResumeGame() {
    setGameStatus(GAME_STATUS.PLAYING);
  }

  return (
    <React.Fragment key={"game-" + gameRestartKey}>
      <h2>Game status: {gameStatus}</h2>
      <h2>Time: {Math.round((TICK_INTERVAL * upTime) / 1000)}</h2>
      <h2>Points: {points}</h2>
      <React.Fragment>
        <GameStatusContext.Provider value={gameStatusContextValues}>
          <GamePointsContext.Provider value={gamePointsContextValues}>
            <GameTimeContext.Provider value={gameTimeContextValues}>
              <CanvasContainer />
            </GameTimeContext.Provider>
          </GamePointsContext.Provider>
        </GameStatusContext.Provider>
      </React.Fragment>

      <div>
        <button onClick={handleRestartGame}>Restart</button>
        {gameStatus === GAME_STATUS.PLAYING && (
          <button onClick={handlePauseGame}>Pause</button>
        )}
        {gameStatus === GAME_STATUS.PAUSED && (
          <button onClick={handleResumeGame}>Resume</button>
        )}
      </div>
    </React.Fragment>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
