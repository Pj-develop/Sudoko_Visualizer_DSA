class Sudoku {
    constructor() {
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }
    // Clears the board
    clear() {
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }
    /**
     * The following methods check if a number can be placed in a specified square, row, column, or box.
     * @param {Number} row Row index to be checked
     * @param {Number} col Column index to be checked
     * @param {Number} number Number to test if it is possible to place
     * @returns {Boolean} True if the number can be placed, false otherwise
     */
    isNumberValid(row, col, number) {
        return this.isNumberValidRow(row, number) &&
            this.isNumberValidCol(col, number) &&
            this.isNumberValidBox(row, col, number);
    }

    isNumberValidRow(row, number) {
        for (let y = 0; y < this.board.length; y++) {
            if (this.board[row][y] === number) {
                return false;
            }
        }
        return true;
    }

    isNumberValidCol(col, number) {
        for (let x = 0; x < this.board.length; x++) {
            if (this.board[x][col] === number) {
                return false;
            }
        }
        return true;
    }

    isNumberValidBox(row, col, number) {
        let rowStart = row - row % 3;
        let rowEnd = rowStart + 3;
        let colStart = col - col % 3;
        let colEnd = colStart + 3;

        for (let x = rowStart; x < rowEnd; x++) {
            for (let y = colStart; y < colEnd; y++) {
                if (this.board[x][y] === number) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Finds the next empty cell
     * @returns {Array<Number>|null} A pair of coordinates if an empty cell was found, null otherwise
     */
    findNextEmpty() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                if (this.board[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }
}

// Constants for the simulation speed, 
// each value represents the how much the solve function will sleep in milliseconds
const solvingSpeed = {
    SLOWEST: 100,
    SLOW: 70,
    MEDIUM: 30,
    FAST: 15,
    FASTEST: 1,
    INSTANT: 0
};
// Miscellaneous Utility Object; currently only holds sleep function
const Util = {
    /**
     * Sleeps for a certain number of milliseconds
     * @param {Number} ms Number of milliseconds to sleep
     * @throws Will throw if the argument is null or undefined
     */
    sleep: async function (ms) {
        if (ms === 0) return;
        if (!ms) throw new Error('Parameter ms not defined!');

        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
}

class SudokuSolver {
    constructor(sudoku, renderCellFunc) {
        this.sudoku = sudoku;
        this.renderCell = renderCellFunc;
        this.speed = solvingSpeed.FASTEST;
        this.isSolveCanceled = false;
        this.wasCanceled = false;
        this.isBeingSolved = false;
    }

    setSudoku(sudoku) {
        this.sudoku = sudoku;
    }

    setSolvingSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Solves the sudoku puzzle by using backtracking
     * @returns {Boolean} True if the sudoku has at least 1 solution, false if unsolvable
     */
    async solve() {
        if (!this.isSolveCanceled) {
            const empty = this.sudoku.findNextEmpty();
            if (!empty) {
                this.wasCanceled = false;
                this.isBeingSolved = false;
                return true;
            }
            else {
                this.isBeingSolved = true;
                let [row, col] = empty;

                for (let possibleNum = 1; possibleNum <= 9; possibleNum++) {
                    if (this.sudoku.isNumberValid(row, col, possibleNum)) {
                        this.sudoku.board[row][col] = possibleNum;

                        this.renderCell(`cell-${row}-${col}`, possibleNum);
                        await Util.sleep(this.speed);

                        if (await this.solve()) {
                            return true;
                        }

                        this.sudoku.board[row][col] = 0;
                        this.renderCell(`cell-${row}-${col}`, '');
                    }
                }
                return false;
            }
        }
        this.isSolveCanceled = false;
        this.wasCanceled = true;
        this.isBeingSolved = false;
        return true;
    }

    cancelSolve() {
        if (this.isBeingSolved) {
            this.isSolveCanceled = true;
        }
    }
}

class SudokuRenderer {
    constructor(sudokuHTMLElement) {
        this.sudokuHTMLElement = sudokuHTMLElement;
        this.sudoku = new Sudoku();
        this.solver = new SudokuSolver(this.sudoku, this.renderCell);
    }

    /**
     * Render the sudoku on the HTML view
     */
    renderSudoku() {
        // Remove all children of the sudokuHTMLElement
        while (this.sudokuHTMLElement.firstChild) {
            this.sudokuHTMLElement.removeChild(this.sudokuHTMLElement.firstChild);
        }

        for (let i = 0; i < this.sudoku.board.length; i++) {
            let sudokuRow = document.createElement('tr');
            for (let j = 0; j < this.sudoku.board.length; j++) {
                let sudokuCell = document.createElement('td');
                let num = this.sudoku.board[i][j];

                sudokuCell.id = `cell-${i}-${j}`;

                sudokuCell.addEventListener('keydown', evt => {
                    let [row, col] = evt.target.id.match(/\d/g).map(num => parseInt(num));
                    let input = parseInt(evt.key);

                    if (evt.target.textContent.length > 0 || isNaN(input)) {
                        if (evt.key === 'Backspace') {
                            evt.target.classList.remove('given-num');
                            evt.target.classList.add('discovered-num');
                            this.sudoku.board[row][col] = 0;
                        }
                        else {
                            evt.preventDefault();
                        }
                    }
                    else {
                        if (this.sudoku.isNumberValid(row, col, input)) {
                            evt.target.classList.remove('discovered-num');
                            evt.target.classList.add('given-num');
                            this.sudoku.board[row][col] = input;
                        }
                        else {
                            evt.preventDefault();
                        }
                    }
                });

                // Highlight row, column and box where the focused cell is in
                sudokuCell.addEventListener('focusin', evt => {
                    let [row, col] = evt.target.id.match(/\d/g).map(num => parseInt(num));
                    let rowStart = row - row % 3;
                    let rowEnd = rowStart + 3;
                    let colStart = col - col % 3;
                    let colEnd = colStart + 3;

                    for (let i = 0; i < this.sudoku.board[row].length; i++) {
                        let cellRow = document.getElementById(`cell-${row}-${i}`);
                        let cellCol = document.getElementById(`cell-${i}-${col}`);
                        cellRow.classList.add('focused-cell');
                        cellCol.classList.add('focused-cell');
                    }

                    for (let x = rowStart; x < rowEnd; x++) {
                        for (let y = colStart; y < colEnd; y++) {
                            let cellBox = document.getElementById(`cell-${x}-${y}`);
                            cellBox.classList.add('focused-cell');
                        }
                    }
                });

                // Remove highlight of row, column and box where the focused cell was in
                sudokuCell.addEventListener('focusout', evt => {
                    let [row, col] = evt.target.id.match(/\d/g).map(num => parseInt(num));
                    let rowStart = row - row % 3;
                    let rowEnd = rowStart + 3;
                    let colStart = col - col % 3;
                    let colEnd = colStart + 3;

                    for (let i = 0; i < this.sudoku.board[row].length; i++) {
                        let cellRow = document.getElementById(`cell-${row}-${i}`);
                        let cellCol = document.getElementById(`cell-${i}-${col}`);
                        cellRow.classList.remove('focused-cell');
                        cellCol.classList.remove('focused-cell');
                    }

                    for (let x = rowStart; x < rowEnd; x++) {
                        for (let y = colStart; y < colEnd; y++) {
                            let cellBox = document.getElementById(`cell-${x}-${y}`);
                            cellBox.classList.remove('focused-cell');
                        }
                    }
                });

                if (num !== 0) {
                    sudokuCell.textContent = num;
                    sudokuCell.classList.add('given-num');
                }
                else {
                    sudokuCell.classList.add('discovered-num');
                }
                // add 3x3 box borders
                if (i === 2 || i === 5) {
                    sudokuCell.classList.add('box-boundary-row');
                }
                if (j === 2 || j === 5) {
                    sudokuCell.classList.add('box-boundary-col');
                }

                sudokuRow.appendChild(sudokuCell);
            }
            this.sudokuHTMLElement.appendChild(sudokuRow);
        }
    }

    /**
     * Change the text content of the cell specified by cellId 
     * @param {String} cellId The HTML id of the cell whose text context will be changed
     * @param {String|Number} value The new text/value for the cell
     */
    renderCell(cellId, value) {
        let cell = document.getElementById(cellId);
        cell.textContent = value;
    }

    async renderSolve() {
        return await this.solver.solve();
    }

    //Re-renders the sudoku

    clear() {
        this.solver.cancelSolve();
        this.sudoku.clear();
        this.renderSudoku();
    }

    setSudoku(sudoku) {
        this.sudoku = sudoku;
        this.solver.setSudoku(sudoku);
    }

    /**
     * Makes the sudoku editable or uneditable by the user
     * @param {Boolean} editable If true the sudoku can be edited by the user, otherwise it can't be edited
     */
    setEditable(editable) {
        for (let i = 0; i < this.sudoku.board.length; i++) {
            for (let j = 0; j < this.sudoku.board.length; j++) {
                let currentCell = document.getElementById(`cell-${i}-${j}`);
                currentCell.contentEditable = editable;
            }
        }
    }
    /**
     * Turns all non-given cells green. This is called after successful solve() call.
     */
    indicateSolvedBoard() {
        for (let i = 0; i < this.sudoku.board.length; i++) {
            for (let j = 0; j < this.sudoku.board.length; j++) {
                let currentCell = document.getElementById(`cell-${i}-${j}`);
                if (!(currentCell.classList.contains("given-num"))) {
                currentCell.classList.add("status-success");
                }
            }
        }
    }
}

class SudokuGenerator {
    constructor() {
        this.sudoku = new Sudoku();
    }

    /**
     * Solves the sudoku puzzle by using backtracking
     * @returns {Boolean} True if the sudoku has at least 1 solution, false if unsolvable
     */
    solve() {
        let empty = this.sudoku.findNextEmpty();
        if (!empty) {
            return true;
        }
        else {
            let [row, col] = empty;
            let possibleNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            possibleNums = _.shuffle(possibleNums); // makes use of Lodash

            for (const possibleNum of possibleNums) {
                if (this.sudoku.isNumberValid(row, col, possibleNum)) {
                    this.sudoku.board[row][col] = possibleNum;

                    if (this.solve()) {
                        return true;
                    }

                    this.sudoku.board[row][col] = 0;
                }
            }
            return false;
        }
    }
    /**
     * Solves and empty sudoku and then removes cells to generate a puzzle
     */
    generateSudoku() {
        this.solve();
        let emptyCells = Math.floor(Math.random() * 14) + 51; // Number between 51 and 64
        let cellPositions = [];

        for (let i = 0; i < this.sudoku.board.length; i++) {
            for (let j = 0; j < this.sudoku.board.length; j++) {
                cellPositions.push([i, j]);
            }
        }

        cellPositions = _.shuffle(cellPositions).slice(0, emptyCells);        

        for (let i = 0; i < emptyCells; i++) {
            let [row, col] = cellPositions[i];
            this.sudoku.board[row][col] = 0;
        }

        return this.sudoku;
    }
}

//
// driver code
//

const sudokuTblElement = document.getElementById('sudoku');
const sldSolvingSpeed = document.getElementById('sld-solving-speed');
const btnClear = document.getElementById('btn-clear');
const btnSolve = document.getElementById('btn-solve');
const btnGenerate = document.getElementById('btn-generate');
const sudokuStatus = document.getElementById('sudoku-status');

const sudokuRenderer = new SudokuRenderer(sudokuTblElement);
sudokuRenderer.renderSudoku();
sudokuRenderer.setEditable(true);

sldSolvingSpeed.addEventListener('change', evt => {
    const sliderValue = parseInt(evt.target.value);

    switch (sliderValue) {
        case 0:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.SLOWEST);
            break;
        case 1:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.SLOW);
            break;
        case 2:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.MEDIUM);
            break;
        case 3:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.FAST);
            break;
        case 4:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.FASTEST);
            break;
        case 5:
            sudokuRenderer.solver.setSolvingSpeed(solvingSpeed.INSTANT);
            break;
    }
});

btnClear.addEventListener('click', evt => {
    sudokuRenderer.clear();
    sudokuRenderer.setEditable(true);
    sudokuStatus.textContent = '';
    btnSolve.disabled = false;
});

btnSolve.addEventListener('click', async evt => {
    sudokuRenderer.setEditable(false);
    sudokuStatus.textContent = '';
    sudokuStatus.classList.value = '';
    evt.target.disabled = true;
    if (await sudokuRenderer.renderSolve()) {
        if (!sudokuRenderer.solver.wasCanceled) {
            sudokuStatus.classList.add('status-success');
            sudokuStatus.textContent = 'Solved!';
            sudokuRenderer.indicateSolvedBoard();
        }
    }
    else {
        sudokuStatus.classList.add('status-failed');
        sudokuStatus.textContent = 'Unsolvable!';
    }
    evt.target.disabled = false;
});

btnGenerate.addEventListener('click', evt => {
    const sudokuGenerator = new SudokuGenerator();
    sudokuRenderer.setSudoku(sudokuGenerator.generateSudoku());
    sudokuRenderer.renderSudoku();
    sudokuStatus.textContent = '';
    sudokuRenderer.setEditable(true); // allows user to play after generating
});