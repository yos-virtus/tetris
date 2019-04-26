function Tetromino() {
    this.posX = 3;
    this.posY = 0;
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
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        },
        'O': {
            'color': '#F7D308',
            'matrix': [
                [1, 1],
                [1, 1]
            ]
        },
        'I': {
            'color': '#31C7EF',
            'matrix': [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]
        },
        'J': {
            'color': '#5A65AD',
            'matrix': [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ]
        },
        'L': {
            'color': '#EF7921',
            'matrix': [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]
        },
        'S': {
            'color': '#42B642',
            'matrix': [
                [0, 1, 1],
                [1, 1, 0],
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
    color = '#f1f1f1'
    color1 = '#666'

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
                drawCell(c, r, color, color1)
            }
        }
    }

    function drawCell(posX, posY, color, color1) {
        context.fillStyle = color;
        context.fillRect(posX * SCALE, posY * SCALE, SCALE, SCALE);
        context.strokeStyle = color1
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
                    drawCell(c + tetromino.posX, r + tetromino.posY, color, color1)
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
    
                if (newX < 0 || newX >= COLS || newY >= ROWS || matrix[newY][newX] === 1) {
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
                    drawCell(c, r, color, color1);
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
                const row = matrix.splice(r, 1).fill(0);
                matrix.unshift(row);
                refreshPlayfield()
            }
        }
    }

    function moveDown(tetromino) {
        undrawTetromino(tetromino);
        if (collides(tetromino, 0, 1)) {
            drawTetromino(tetromino);
            freeze(tetromino);
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
        start: start,
    }
}

const tetris = new Tetris();

tetris.start();