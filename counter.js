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
    this.color = randomColor()
    this.draw();
  }

  startAnimation() {
    const animate = () => {
      this.update();
      this.draw();
      requestAnimationFrame(animate); 
    };
    requestAnimationFrame(animate);
  }
  update() {
    this.ty++;
  }

   draw() {
    this.clearCanvas();
    this.drawBoard();
    this.drawNext()
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
  drawNext (){
    const scale_factor = 2
    this.nextCtx.save(); 
    this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
    this.nextCtx.scale(BLOCK_SIZE * scale_factor, BLOCK_SIZE * scale_factor);
    this.next.forEach((row, y)=> {
      row.forEach((num, x) => {
        if(num > 0){
          this.nextCtx.fillStyle = "#071126";
          this.nextCtx.fillRect(x, y,1,1)
        }
      })
    })
    this.nextCtx.restore();
  }
  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((num, x) => {
        this.ctx.strokeStyle = "#26";
        this.ctx.strokeRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        if (num > 0) {
          this.ctx.fillStyle = "red";
          this.ctx.fillRect(
            x * BLOCK_SIZE,
            y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        } 
      });
    });

    this.tetrominos.forEach((row, y) => {
      row.forEach((num, x) => {
        if (num) {
          this.ctx.fillStyle = "red";
          this.ctx.fillRect((this.tx + x) * BLOCK_SIZE, (this.ty + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
  collision(){
    return this.tetrominos.find((row, y) => {
      return row.find((num, x) => {
        return (num !== 0 && this.grid[y + this.ty]?.[x + this.tx] !== 0)
      });
    });
  }
  fixCollision(){
    this.tetrominos.forEach((row, y) => {
      row.forEach((num, x) => {
        if(num){
          this.grid[y + this.ty][x + this.tx] = num;
          this.ctx.fillStyle = "red";
          this.ctx.fillRect((this.tx + x) * BLOCK_SIZE, (this.ty + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
  spawnTetromino(){
    this.ty = 0;
    this.tx = 4;
    this.tetrominos = this.next;
    this.next = randomTetrominos();
    if (this.collision()) {
      // Game over condition
      alert("Game Over!");
      this.init();
    }
  }
  checkLevelUp(){
    if(this.score >= this.level * this.pointsToLevelUp){
      this.level++
      this.updatePointes()
    }
  }
  updatePointes(){
    document.getElementById("lines").textContent = `lines: ${this.lines}`
    document.getElementById("score").innerHTML = `Score:<br>${this.score}`;
    document.getElementById("level").textContent = `level: ${this.level}`
  }
  addScore(lineasCleared){
    if(lineasCleared > 0){
      this.score = this.score + this.pointsPerLine[lineasCleared - 1]
      this.lines+=lineasCleared
      this.checkLevelUp()
      this.updatePointes()
    }
  }
  clearFullRows(){
    const nwt = this.grid.reduce((count, row) => {
      return row.every((num) =>  num === 1) ? count + 1 : count;
    }, 0)
    if(nwt > 0){
      this.addScore(nwt)
      const newGrid = this.grid.filter(row => row.some(num => num === 0));
      const numRowsToAdd = BOARD_HEIGHT - newGrid.length;
      const emptyRows = Array.from({ length: numRowsToAdd }, () => Array(BOARD_WIDTH).fill(0));
      this.grid = emptyRows.concat(newGrid);
    }
  }
  rotateTetramino(){
    const newRotate = []
    const rows = this.tetrominos.length
    const cols = this.tetrominos[0].length
    for(let col = 0; col < cols; col++){
      newRotate[col] = []
      for(let row = rows - 1; row >= 0; row--){
        newRotate[col][rows - 1 - row] = this.tetrominos[row][col]
      }
    }
    this.tetrominos = newRotate

  }
  moveTetromino(direction) {
    const oldTetrominos = this.tetrominos;
    if(direction === "down"){
      this.ty++;
    if(this.collision()){
      this.ty--
      this.fixCollision()
      this.spawnTetromino();
      this.clearFullRows()
    }
   }
   if(direction === "left"){
    this.tx--;
    if(this.collision()){
      this.tx++
    }
   }
   if(direction === "right"){
    this.tx++;
    if(this.collision()){
      this.tx--
    }
   }
   if(direction === "up"){
    this.rotateTetramino()
    if(this.collision()){
      this.tx--
      this.tetrominos = oldTetrominos
    }
   }
   this.draw()
  }
}

const board = new Board(mainCTX, nextCTX);
// console.log(board);

document.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowLeft":
      board.moveTetromino("left");
      break;
    case "ArrowRight":
      board.moveTetromino("right");
      break;
    case "ArrowDown":
      board.moveTetromino("down");
      break;
    case "ArrowUp":
      board.moveTetromino("up");
      break;
  }
});
