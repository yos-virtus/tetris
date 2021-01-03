function Tetromino() {
    this.posX = 3
    this.posY = -1
    this.type  = Object.keys(this.tetrominoTypes)[Math.floor(Math.random() * Object.keys(this.tetrominoTypes).length)]
    this.matrix = this.tetrominoTypes[this.type].matrix
}

Tetromino.prototype.tetrominoTypes = {
    'T': {
        'matrix': [
            [' ', 'T', ' '],
            ['T', 'T', 'T'],
            [' ', ' ', ' ']
        ]
    },
    'Z': {
        'matrix': [
            ['Z', 'Z', ' '],
            [' ', 'Z', 'Z'],
            [' ', ' ', ' ']
        ]
    },
    'O': {
        'matrix': [
            ['O', 'O'],
            ['O', 'O']
        ]
    },
    'I': {
        'matrix': [
            [' ', ' ', ' ', ' '],
            ['I', 'I', 'I', 'I'],
            [' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' '],
        ]
    },
    'J': {
        'matrix': [
            ['J', ' ', ' '],
            ['J', 'J', 'J'],
            [' ', ' ', ' ']
        ]
    },
    'L': {
        'matrix': [
            [' ', ' ', 'L'],
            ['L', 'L', 'L'],
            [' ', ' ', ' ']
        ]
    },
    'S': {
        'matrix': [
            [' ', 'S', 'S'],
            ['S', 'S', ' '],
            [' ', ' ', ' ']
        ]
    }
}

function Tetris() {
    const context = document.getElementById('arena').getContext('2d');
    const SCALE = 20;
    const COLS = 10;
    const ROWS = 20;
    cellColors = {
        ' ': '#f1f1f1',
        'T': '#AD4D9C',
        'Z': '#EF2029',
        'O': '#F7D308',
        'I': '#31C7EF',
        'J': '#5A65AD',
        'L': '#EF7921',
        'S': '#42B642'
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
        for (let r = 0; r < ROWS; r++) {
            matrix[r] = []
            for (let c = 0; c < COLS; c++) {
                matrix[r][c] = ' '
                drawCell(c, r, cellColors[matrix[r][c]])
            }
        }
    }

    function drawCell(posX, posY, bgColor) {
        context.fillStyle = bgColor;
        context.fillRect(posX * SCALE, posY * SCALE, SCALE, SCALE);
        context.strokeStyle = bgColor === '#f1f1f1' ? '#666666' : '#ffffff'
        context.strokeRect(posX * SCALE, posY * SCALE, SCALE, SCALE)
    }

    function drawTetromino(tetromino) {
        tetromino.matrix.forEach((row, rowIdx) => {
            row.forEach((col, colIdx) => {
                if (col !== ' ') {
                    drawCell(colIdx + tetromino.posX, rowIdx + tetromino.posY, cellColors[tetromino.type])
                }
            });
        })
    }

    function undrawTetromino(tetromino) {
        tetromino.matrix.forEach((row, rowIdx) => {
            row.forEach((col, colIdx) => {
                if (col !== ' ') {
                    drawCell(colIdx + tetromino.posX, rowIdx + tetromino.posY, cellColors[' '])
                }
            });
        })
    }
    
    function collides(tetromino, x, y) {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c <  tetromino.matrix.length; c++) {
                if (tetromino.matrix[r][c] === ' ') {
                    continue;
                }
    
                const newX = tetromino.posX + c + x;
                const newY = tetromino.posY + r + y;
    
                if (newX < 0 || newX >= COLS || newY >= ROWS || matrix[newY][newX] !== ' ') {
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
            if  (r + tetromino.posY >= ROWS) {
                break;
            }
            for (let c = 0; c < tetromino.matrix.length; c++) {
                if (tetromino.matrix[r][c] === ' ') {
                    continue
                }
                if  (c + tetromino.posX < 0) {
                    continue;
                }
                if  (c + tetromino.posX >= COLS) {
                    continue;
                }
                matrix[r + tetromino.posY][c + tetromino.posX] = tetromino.matrix[r][c]
            }            
        }
    }

    function refreshPlayfield() {
        matrix.forEach((row, rowIdx) => {
            row.forEach((_, colIdx) => {
                drawCell(colIdx, rowIdx, cellColors[matrix[rowIdx][colIdx]]);
            })
        });
    }

    function swipeFullRowsIfAny() {
        matrix.forEach((row, rowIdx) => {
            if (!row.some(c => c === ' ')) {
                matrix.unshift(matrix.splice(rowIdx, 1).flat().fill(' '));
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
        if (tetromino.posX + tetromino.matrix.length > COLS) {
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