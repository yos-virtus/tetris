function Tetromino() {
    this.posX = 3;
    this.posY = -1;
    tetrominoTypes = {
        'T': {
            'color': '#AD4D9C',
            'matrix': [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ]
        },
        'Z': {
            'color': '#EF2029',
            'matrix': [
                [2, 2, 0],
                [0, 2, 2],
                [0, 0, 0]
            ]
        },
        'O': {
            'color': '#F7D308',
            'matrix': [
                [3, 3],
                [3, 3]
            ]
        },
        'I': {
            'color': '#31C7EF',
            'matrix': [
                [0, 0, 0, 0],
                [4, 4, 4, 4],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]
        },
        'J': {
            'color': '#5A65AD',
            'matrix': [
                [5, 0, 0],
                [5, 5, 5],
                [0, 0, 0]
            ]
        },
        'L': {
            'color': '#EF7921',
            'matrix': [
                [0, 0, 6],
                [6, 6, 6],
                [0, 0, 0]
            ]
        },
        'S': {
            'color': '#42B642',
            'matrix': [
                [0, 7, 7],
                [7, 7, 0],
                [0, 0, 0]
            ]
        }
    }
    let randomType = 'IJLOTSZ'[Math.floor(Math.random() * 7)];
    this.matrix = tetrominoTypes[randomType].matrix
    this.color =  tetrominoTypes[randomType].color
}

function Tetris() {
    let context = document.getElementById('arena').getContext('2d');
    const SCALE = 20;
    const COLS = 10;
    const ROWS = 20;
    matrix = []
    colors = {
        0: '#f1f1f1',
        1: '#AD4D9C',
        2: '#EF2029',
        3: '#F7D308',
        4: '#31C7EF',
        5: '#5A65AD',
        6: '#EF7921',
        7: '#42B642',
    }

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
                matrix[r][c] = 0
                drawCell(c, r, this.colors[0], '#666666')
            }
        }
    }

    function drawCell(posX, posY, bgColor, outlineColor) {
        context.fillStyle = bgColor;
        context.fillRect(posX * SCALE, posY * SCALE, SCALE, SCALE);
        context.strokeStyle = outlineColor
        context.strokeRect(posX * SCALE, posY * SCALE, SCALE, SCALE)
    }

    function drawTetromino(tetromino) {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c < tetromino.matrix.length; c++) {
                if (tetromino.matrix[r][c]) {
                    drawCell(c + tetromino.posX, r + tetromino.posY, tetromino.color, 'white')
                }
            }
        }
    }

    function undrawTetromino(tetromino) {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c < tetromino.matrix.length; c++) {
                if (tetromino.matrix[r][c]) {
                    drawCell(c + tetromino.posX, r + tetromino.posY, this.colors[0], '#666666')
                }
            }
        }
    }
    
    function collides(tetromino, x, y) {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c <  tetromino.matrix.length; c++) {
                if (!tetromino.matrix[r][c]) {
                    continue;
                }
    
                let newX = tetromino.posX + c + x;
                let newY = tetromino.posY + r + y;
    
                if (newX < 0 || newX >= COLS || newY >= ROWS || matrix[newY][newX] !== 0) {
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
                if (! tetromino.matrix[r][c]) {
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
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!matrix[r][c]) {
                    drawCell(c, r, this.colors[matrix[r][c]], '#666666');
                } else {
                    drawCell(c, r, this.colors[matrix[r][c]], 'white');
                }
            }
        }
    }

    function swipeFullRowsIfAny() {
        for (let r = 0; r < ROWS; r++) {
            let isFull = true;
            for (let c = 0; c < COLS; c++) {
                isFull = isFull && matrix[r][c];
            }
            if (isFull) {
                const emptyRow = matrix.splice(r, 1).flat().fill(0);
                matrix.unshift(emptyRow);
                refreshPlayfield()
            }
        }
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
            this.currentTetromino = new Tetromino();
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