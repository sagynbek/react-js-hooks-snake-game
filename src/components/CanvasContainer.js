import React, { useRef, useEffect, useState, useContext } from "react";
import ReactDOM from "react-dom";
import {
  ALL_DIRECTIONS,
  SNAKE_DIMENSION,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LUCKY_BALL_RADIUS,
  SNAKE_WIN_LENGTH,
  TICK_INTERVAL,
  GAME_STATUS
} from "../constants/GameConstants";
import GameStatusContext from "../contexts/GameStatusContext";
import GameTimeContext from "../contexts/GameTimeContext";
import GamePointsContext from "../contexts/GamePointsContext";

function CanvasContainer() {
  const gameCanvasRef = useRef(null);
  const [canvasInstance, setCanvasInstance] = useState(null);
  const [direction, setDirection] = useState(ALL_DIRECTIONS.R);
  const [allMoves, setAllMoves] = useState([{ x: 0, y: 0 }]);
  const [snakeLength, setSnakeLength] = useState(20);
  const [luckyBall, setLuckyBall] = useState(getCoordinatesForBall());
  const { gameStatus, setGameStatus } = useContext(GameStatusContext);
  const { upTime, setUpTime } = useContext(GameTimeContext);
  const { points, setPoints } = useContext(GamePointsContext);

  function getCoordinatesForBall() {
    return {
      x: Math.random() * 250 + 25,
      y: Math.random() * 250 + 25
    };
  }

  useEffect(() => {
    function handleKeyPress(e) {
      if (direction === ALL_DIRECTIONS.R || direction === ALL_DIRECTIONS.L) {
        // UP
        if (e.keyCode === 87) {
          setDirection(ALL_DIRECTIONS.U);
        }
        // DOWN
        if (e.keyCode === 83) {
          setDirection(ALL_DIRECTIONS.D);
        }
      } else {
        // LEFT
        if (e.keyCode === 65) {
          setDirection(ALL_DIRECTIONS.L);
        }
        // RIGHT
        if (e.keyCode === 68) {
          setDirection(ALL_DIRECTIONS.R);
        }
      }
    }

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [direction]);

  useEffect(() => {
    function drawSnake() {
      allMoves.forEach(move => {
        canvasInstance.beginPath();
        canvasInstance.rect(move.x, move.y, SNAKE_DIMENSION, SNAKE_DIMENSION);
        canvasInstance.lineWidth = 0;
        canvasInstance.strokeStyle = "green";
        canvasInstance.fillStyle = "green";
        canvasInstance.fill();
        canvasInstance.stroke();
      });
    }

    function drawLuckyBall() {
      canvasInstance.beginPath();
      canvasInstance.arc(
        luckyBall.x,
        luckyBall.y,
        LUCKY_BALL_RADIUS,
        0,
        2 * Math.PI
      );
      canvasInstance.strokeStyle = "red";
      canvasInstance.fillStyle = "red";
      canvasInstance.fill();
      canvasInstance.stroke();
    }

    function redraw() {
      canvasInstance.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawSnake();
      drawLuckyBall();
    }
    function checkLuckyBallWon() {
      function isPointInBall(x, y) {
        const distance = Math.sqrt(
          Math.pow(x - luckyBall.x, 2) + Math.pow(y - luckyBall.y, 2)
        );
        return distance <= LUCKY_BALL_RADIUS + SNAKE_DIMENSION / 2;
      }

      const hasTouchedBall = allMoves.find(move => {
        return isPointInBall(
          move.x + SNAKE_DIMENSION / 2,
          move.y + SNAKE_DIMENSION / 2
        );
      });

      if (hasTouchedBall) {
        setPoints(points => (points += 10));
        setSnakeLength(length => (length += SNAKE_WIN_LENGTH));
        setLuckyBall(getCoordinatesForBall());
      }
    }

    function checkSnakeCrash() {
      const x = allMoves[allMoves.length - 1].x;
      const y = allMoves[allMoves.length - 1].y;
      if (x < 0 || x > CANVAS_WIDTH || y < 0 || y > CANVAS_HEIGHT) {
        setGameStatus(GAME_STATUS.OVER);
      }
    }

    if (canvasInstance !== null) {
      let horizontal = 0;
      let vertical = 0;

      switch (direction) {
        case ALL_DIRECTIONS.U:
          vertical--;
          break;
        case ALL_DIRECTIONS.D:
          vertical++;
          break;
        case ALL_DIRECTIONS.L:
          horizontal--;
          break;
        case ALL_DIRECTIONS.R:
          horizontal++;
          break;
        default:
          break;
      }

      const x = allMoves[allMoves.length - 1].x + horizontal;
      const y = allMoves[allMoves.length - 1].y + vertical;
      allMoves.push({ x, y });
      if (allMoves.length > snakeLength) {
        canvasInstance.beginPath();
        allMoves.splice(0, 1);
      }
      setAllMoves(allMoves);

      checkLuckyBallWon();
      checkSnakeCrash();
      redraw();
    }
  }, [
    upTime,
    canvasInstance,
    direction,
    allMoves,
    snakeLength,
    luckyBall,
    setGameStatus,
    setPoints
  ]);

  useEffect(() => {
    const tmpCanvasInstance = gameCanvasRef.current.getContext("2d");
    setCanvasInstance(tmpCanvasInstance);

    function handleTick() {
      gameStatus === GAME_STATUS.PLAYING && setUpTime(upTime => upTime + 1);
    }

    const mySnakeInterval = setInterval(() => {
      handleTick();
    }, TICK_INTERVAL);

    return () => {
      clearInterval(mySnakeInterval);
    };
  }, [gameCanvasRef, gameStatus, setUpTime]);

  return (
    <canvas
      ref={gameCanvasRef}
      id="gameCanvas"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ border: "1px solid #d3d3d3" }}
    />
  );
}

export default CanvasContainer;
