// shapesF.js
export const BLOCK_SIZE = 30;
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;


export const TETROMINOS = [
    [ // I
      [1, 1, 1, 1],
    ],
  [ // J
    [1, 0, 0],
    [1, 1, 1],
  ],
  [ // L
    [0, 0, 1],
    [1, 1, 1],
  ],
  [ // O
    [1, 1],
    [1, 1]
  ],
  [ // S
    [0, 1, 1],
    [1, 1, 0],
  ],
  [ // T
    [0, 1, 0],
    [1, 1, 1],
  ],
  [ // Z
    [1, 1, 0],
    [0, 1, 1],
  ]
]


const colors = [
  "#FF0000", // Rojo
  "#00FF00", // Verde
  "#0000FF", // Azul
  "#FFFF00", // Amarillo
  "#FFA500", // Naranja
  "#800080", // Púrpura
  "#00FFFF", // Cian
  "#FFC0CB", // Rosa
  "#A52A2A", // Marrón
  "#000000", // Negro
  "#FFFFFF", // Blanco
];

export const randomColor =() => {
  return colors[Math.floor(Math.random()* colors.length)]
}

export const randomTetrominos = () => { 
  return TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)]
}