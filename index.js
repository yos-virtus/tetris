function Tetromino() {
    this.posX = 3
    this.posY = -1
    const tetrominoLabels = Object.keys(this.tetrominoTypes)
    this.type = tetrominoLabels[Math.floor(Math.random() * tetrominoLabels.length)]
    this.matrix = this.tetrominoTypes[this.type]
}

Tetromino.prototype.tetrominoTypes = {
    'T': [
        [new Cell(' '), new Cell('V'), new Cell(' ')],
        [new Cell('V'), new Cell('V'), new Cell('V')],
        [new Cell(' '), new Cell(' '), new Cell(' ')]
    ],
    'Z': [
        [new Cell('R'), new Cell('R'), new Cell(' ')],
        [new Cell(' '), new Cell('R'), new Cell('R')],
        [new Cell(' '), new Cell(' '), new Cell(' ')]
    ],
    'O': [
        [new Cell('Y'), new Cell('Y')],
        [new Cell('Y'), new Cell('Y')]
    ],
    'I': [
        [new Cell(' '), new Cell(' '), new Cell(' '), new Cell(' ')],
        [new Cell('A'), new Cell('A'), new Cell('A'), new Cell('A')],
        [new Cell(' '), new Cell(' '), new Cell(' '), new Cell(' ')],
        [new Cell(' '), new Cell(' '), new Cell(' '), new Cell(' ')],
    ],
    'J': [
        [new Cell('B'), new Cell(' '), new Cell(' ')],
        [new Cell('B'), new Cell('B'), new Cell('B')],
        [new Cell(' '), new Cell(' '), new Cell(' ')]
    ],
    'L': [
        [new Cell(' '), new Cell(' '), new Cell('O')],
        [new Cell('O'), new Cell('O'), new Cell('O')],
        [new Cell(' '), new Cell(' '), new Cell(' ')]
    ],
    'S': [
        [new Cell(' '), new Cell('G'), new Cell('G')],
        [new Cell('G'), new Cell('G'), new Cell(' ')],
        [new Cell(' '), new Cell(' '), new Cell(' ')]
    ]
}

function Cell(colorLabel) {
    this.colorLabel = colorLabel !== undefined ? colorLabel : ' '
    this.color = function () {
        return this.colors[this.colorLabel]
    }
}

Cell.prototype.colors = {
    ' ': '#f1f1f1',
    'B': '#5A65AD',
    'O': '#EF7921',
    'Y': '#F7D308',
    'A': '#31C7EF',
    'G': '#42B642',
    'R': '#EF2029',
    'V': '#AD4D9C'
}

Cell.prototype.isEmpty = function () {
    return this.colorLabel === ' '
}

Cell.prototype.draw = function (posX, posY, arena) {
    const {drawingContext, SCALE} = arena
    drawingContext.fillStyle = this.color();
    drawingContext.fillRect(posX * SCALE, posY * SCALE, SCALE, SCALE);
    drawingContext.strokeStyle = this.color() === '#f1f1f1' ? '#666666' : '#ffffff'
    drawingContext.strokeRect(posX * SCALE, posY * SCALE, SCALE, SCALE)
}


function Tetris() {
    arena = {
        'drawingContext': document.getElementById('arena').getContext('2d'),
        'SCALE': 20,
        'COLS': 10,
        'ROWS': 20
    }
    matrix = []

    function init() {
        buildPlayground();
        this.currentTetromino = new Tetromino();
        drawTetromino(this.currentTetromino);

        document.addEventListener("keydown", (function(event) {
            if (event.code === "ArrowDown") {
                moveDown(this.currentTetromino)
            } else if (event.code === "ArrowRight") {
                moveRight(this.currentTetromino)
            } else if (event.code === "ArrowLeft") {
                moveLeft(this.currentTetromino)
            } else if (event.code === "ArrowUp") {
                rotate(this.currentTetromino)
            }
        }).bind(this));
    }

    function start() {
        init();
        let startTime = Date.now();

        requestAnimationFrame(function drop() {
            let delta = Date.now() - startTime
            if (delta > 1000) {
                moveDown(this.currentTetromino);
                startTime = Date.now();
            }
            requestAnimationFrame(drop);
        });
    }

    function buildPlayground() {
        [...Array(arena.ROWS).keys()].forEach(rowIdx => {
            matrix[rowIdx] = [];
            [...Array(arena.COLS).keys()].forEach(colIdx => {
                (matrix[rowIdx][colIdx] = new Cell()).draw(colIdx, rowIdx, arena)
            })
        })
    }

    function drawTetromino(tetromino) {
        tetromino.matrix.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                if (!cell.isEmpty()) {
                    cell.draw(colIdx + tetromino.posX, rowIdx + tetromino.posY, arena)
                }
            });
        })
    }

    function undrawTetromino(tetromino) {
        tetromino.matrix.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                if (!cell.isEmpty()) {
                    (new Cell()).draw(colIdx + tetromino.posX, rowIdx + tetromino.posY, arena)
                }
            });
        })
    }
    
    function collides(tetromino, x, y) {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c <  tetromino.matrix.length; c++) {
                if (tetromino.matrix[r][c].isEmpty()) {
                    continue;
                }
    
                const newX = tetromino.posX + c + x;
                const newY = tetromino.posY + r + y;
    
                if (newX < 0 || newX >= arena.COLS || newY >= arena.ROWS || !matrix[newY][newX].isEmpty()) {
                    return true;
                }
    
                if (newY < 0) {
                    continue;
                }
            }
        }
        return false;
    }

    function freeze(tetromino) {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            if (r + tetromino.posY >= arena.ROWS) {
                break;
            }
            tetromino.matrix[r].forEach((cell, colIdx) => {
                if (!cell.isEmpty() && colIdx + tetromino.posX >= 0 && colIdx + tetromino.posX < arena.COLS) {
                    matrix[r + tetromino.posY][colIdx + tetromino.posX] = tetromino.matrix[r][colIdx]
                }
            })            
        }
    }

    function refreshPlayfield() {
        matrix.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                cell.draw(colIdx, rowIdx, arena);
            })
        });
    }

    function swipeFullRowsIfAny() {
        matrix.forEach((row, rowIdx) => {
            if (!row.some(c => c.isEmpty())) {
                matrix.unshift(matrix.splice(rowIdx, 1).flat().fill(new Cell()));
                refreshPlayfield()
            } 
        });
    }

    function moveDown(tetromino) {
        undrawTetromino(tetromino);
        if (collides(tetromino, 0, 1)) {
            drawTetromino(tetromino);
            freeze(tetromino);
            if (tetromino.posY <= 0) {
                return;
            }
            swipeFullRowsIfAny();
            currentTetromino = new Tetromino();
            return;
        }
        tetromino.posY++;  
        drawTetromino(tetromino);
    }

    function moveRight(tetromino) {
        undrawTetromino(tetromino);
        if (! collides(tetromino, 1, 0)) {
            tetromino.posX++;
        }
        drawTetromino(tetromino);
    }

    function moveLeft(tetromino) {
        undrawTetromino(tetromino);
        if (! collides(tetromino, -1, 0)) {
            tetromino.posX--;            
        }
        drawTetromino(tetromino);
    }

    function rotate(tetromino) {
        undrawTetromino(tetromino);

        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c < r; c++) {
                [
                    tetromino.matrix[c][r],
                    tetromino.matrix[r][c]
                ] = [
                    tetromino.matrix[r][c],
                    tetromino.matrix[c][r]
                ]
            }
        }

        tetromino.matrix.reverse();

        if (tetromino.posX < 0) {
            tetromino.posX++
        }
        if (tetromino.posX + tetromino.matrix.length > arena.COLS) {
            tetromino.posX--
        }

        drawTetromino(tetromino);
    }

    return {
        start,
    }
}

const tetris = new Tetris();

tetris.start();