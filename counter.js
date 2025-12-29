import {
  BLOCK_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  randomTetrominos,
  randomColor
} from "./shapesF.js";

const mainCanvas = document.querySelector("#main");
const nextCanvas = document.querySelector("#next");
const mainCTX = mainCanvas.getContext("2d");
const nextCTX = nextCanvas.getContext("2d");

export class Board {
  constructor(ctx, nextCtx) {
    this.ctx = ctx;
    this.nextCtx = nextCtx;
    // Variables de control de tiempo
    this.dropCounter = 0;
    this.dropInterval = 1000; // Caen cada 1 segundo
    this.lastTime = 0;
    this.init();
  }

  init() {
    this.grid = Array.from({ length: BOARD_HEIGHT }, () =>
      Array(BOARD_WIDTH).fill(0)
    );
    this.ctx.canvas.width = BOARD_WIDTH * BLOCK_SIZE;
    this.ctx.canvas.height = BOARD_HEIGHT * BLOCK_SIZE;
    this.ty = 0;
    this.tx = 4;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.pointsPerLine = [100, 300, 500, 800];
    this.pointsToLevelUp = 1000;
    this.next = randomTetrominos();
    this.tetrominos = randomTetrominos();
    this.color = randomColor(); // Color de la pieza actual
    this.draw();
  }

  startAnimation(time = 0) {
    // Calculamos el tiempo transcurrido
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += deltaTime;

    // Si pasó el intervalo, movemos hacia abajo automáticamente
    if (this.dropCounter > this.dropInterval) {
      this.moveTetromino("down");
      this.dropCounter = 0;
    }

    this.draw();
    requestAnimationFrame((t) => this.startAnimation(t));
  }

  update() {
    // Esta función queda disponible para lógica extra si la necesitas
  }

  draw() {
    this.clearCanvas();
    this.drawBoard();
    this.drawNext();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawNext() {
    const scale_factor = 2;
    this.nextCtx.save();
    this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
    this.nextCtx.scale(BLOCK_SIZE * scale_factor, BLOCK_SIZE * scale_factor);
    this.next.forEach((row, y) => {
      row.forEach((num, x) => {
        if (num > 0) {
          this.nextCtx.fillStyle = "#071126";
          this.nextCtx.fillRect(x, y, 1, 1);
        }
      });
    });
    this.nextCtx.restore();
  }

  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        this.ctx.strokeStyle = "#262626";
        this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        if (value !== 0) {
          this.ctx.fillStyle = value; // El valor ahora es el color string
          this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });

    this.tetrominos.forEach((row, y) => {
      row.forEach((num, x) => {
        if (num) {
          this.ctx.fillStyle = this.color;
          this.ctx.fillRect((this.tx + x) * BLOCK_SIZE, (this.ty + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }

  collision() {
    return this.tetrominos.some((row, y) => {
      return row.some((num, x) => {
        return (
          num !== 0 &&
          (this.grid[y + this.ty] === undefined || 
           this.grid[y + this.ty][x + this.tx] === undefined ||
           this.grid[y + this.ty][x + this.tx] !== 0)
        );
      });
    });
  }

  fixCollision() {
    this.tetrominos.forEach((row, y) => {
      row.forEach((num, x) => {
        if (num) {
          // Guardamos el color actual en la rejilla en lugar de un número
          this.grid[y + this.ty][x + this.tx] = this.color;
        }
      });
    });
  }

  spawnTetromino() {
    this.ty = 0;
    this.tx = 4;
    this.tetrominos = this.next;
    this.color = randomColor(); // Nueva pieza, nuevo color
    this.next = randomTetrominos();
    if (this.collision()) {
      alert("Game Over!");
      this.init();
    }
  }

  checkLevelUp() {
    if (this.score >= this.level * this.pointsToLevelUp) {
      this.level++;
      // Aumentamos la velocidad conforme sube de nivel
      this.dropInterval = Math.max(100, 1000 - (this.level * 100));
      this.updatePointes();
    }
  }

  updatePointes() {
    document.getElementById("lines").textContent = `lines: ${this.lines}`;
    document.getElementById("score").innerHTML = `Score:<br>${this.score}`;
    document.getElementById("level").textContent = `level: ${this.level}`;
  }

  addScore(lineasCleared) {
    if (lineasCleared > 0) {
      this.score = this.score + this.pointsPerLine[lineasCleared - 1];
      this.lines += lineasCleared;
      this.checkLevelUp();
      this.updatePointes();
    }
  }

  clearFullRows() {
    // Modificado para que detecte colores (strings) en lugar de solo el número 1
    const linesToClear = this.grid.reduce((count, row) => {
      return row.every((cell) => cell !== 0) ? count + 1 : count;
    }, 0);

    if (linesToClear > 0) {
      this.addScore(linesToClear);
      const newGrid = this.grid.filter(row => row.some(cell => cell === 0));
      const numRowsToAdd = BOARD_HEIGHT - newGrid.length;
      const emptyRows = Array.from({ length: numRowsToAdd }, () => Array(BOARD_WIDTH).fill(0));
      this.grid = emptyRows.concat(newGrid);
    }
  }

  rotateTetramino() {
    const newRotate = [];
    const rows = this.tetrominos.length;
    const cols = this.tetrominos[0].length;
    for (let col = 0; col < cols; col++) {
      newRotate[col] = [];
      for (let row = rows - 1; row >= 0; row--) {
        newRotate[col][rows - 1 - row] = this.tetrominos[row][col];
      }
    }
    this.tetrominos = newRotate;
  }

  moveTetromino(direction) {
    const oldTetrominos = this.tetrominos;
    if (direction === "down") {
      this.ty++;
      if (this.collision()) {
        this.ty--;
        this.fixCollision();
        this.clearFullRows();
        this.spawnTetromino();
      }
    }
    if (direction === "left") {
      this.tx--;
      if (this.collision()) this.tx++;
    }
    if (direction === "right") {
      this.tx++;
      if (this.collision()) this.tx--;
    }
    if (direction === "up") {
      this.rotateTetramino();
      if (this.collision()) {
        this.tetrominos = oldTetrominos;
      }
    }
    this.draw();
  }
}

const board = new Board(mainCTX, nextCTX);
// Arrancamos la animación pasando el tiempo inicial
board.startAnimation();

document.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowLeft": board.moveTetromino("left"); break;
    case "ArrowRight": board.moveTetromino("right"); break;
    case "ArrowDown": 
      board.moveTetromino("down");
      board.dropCounter = 0; // Reiniciamos el contador al bajar manual
      break;
    case "ArrowUp": board.moveTetromino("up"); break;
  }
});