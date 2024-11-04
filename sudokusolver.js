sudokuBoard = Array.from({length:9}, () => Array(9).fill(0));
rows = Array.from({length:9}, () => new Set());
cols = Array.from({length:9}, () => new Set());
grids = Array.from({length:9}, () => new Set());
function resetBoard() {
    sudokuBoard = Array.from({length:9}, () => Array(9).fill(0));
}//Resets the board back to zero if necessary.
function resetConstraints() {
    rows = Array.from({length:9}, () => new Set());
    cols = Array.from({length:9}, () => new Set());
    grids = Array.from({length:9}, () => new Set());
}
function getGridIndex(row, col) {
    return (Math.floor(row/3)*3 + Math.floor(col/3));
}
function fillBase() {
    let usedNumbers = [];
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j<3; j++) {
            let added = false;
            while(!added) {
                let random = Math.floor(Math.random() * 9) + 1;
                if (!usedNumbers.includes(random)) {
                    placeNumber(i, j, random);
                    added = true;
                    usedNumbers.push(random);
                }
            }
        }
    }//Fills the top left 3x3 cell
    usedNumbers = [];
    for(let i = 3; i < 6; i++) {
        for(let j = 3; j < 6; j++) {
            let added = false;
            while(!added) {
                let random = Math.floor(Math.random() * 9) + 1;
                if (!usedNumbers.includes(random)) {
                    placeNumber(i, j, random);
                    added = true;
                    usedNumbers.push(random);
                }
            }
        }
    }//Fills the middle 3x3 cell
    usedNumbers = [];
    for(let i = 6; i < 9; i++) {
        for(let j = 6; j < 9; j++) {
            let added = false;
            while(!added) {
                let random = Math.floor(Math.random() * 9) + 1;
                if (!usedNumbers.includes(random)) {
                    placeNumber(i, j, random);
                    added = true;
                    usedNumbers.push(random);
                }
            }
        }
    }//Fills the bottom right 3x3 cell
}//I fill in these 3 cells because they are entirely unrelated to each other, so I can just fill them with random numbers
function initializeConstraints() {
    resetConstraints();
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            let val = sudokuBoard[i][j];
            if(val != 0) {
                rows[i].add(val);
                cols[j].add(val);
                grids[getGridIndex(i,j)].add(val);
            }
        }
    }
}//If things get out of sync, this will reset the constraints and get them in line with the current state of the board
function findMostConstrained() {
    let minNum = Infinity;
    let minIdx = [-1,-1];
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(sudokuBoard[i][j] === 0) {
                let usedValues = new Set([...rows[i], ...cols[j], ...grids[getGridIndex(i,j)]]);
                let count = 9 - usedValues.size;
                if(count < minNum) {
                    minNum = count;
                    minIdx = [i,j];
                }
            }
        }
    }
    return minIdx;
}//Returns the most constrained cell (least possible values) so that the sudoku can be solved more efficiently
function placeNumber(row, col, val) {
    sudokuBoard[row][col] = val;
    rows[row].add(val);
    cols[col].add(val);
    grids[getGridIndex(row,col)].add(val);
}
function removeNumber(row, col, val) {
    sudokuBoard[row][col] = 0;
    rows[row].delete(val);
    cols[col].delete(val);
    grids[getGridIndex(row,col)].delete(val);
}//These functions allows me to update the constraints dynamically whilst adding/removing values to avoid inconsistencies between the board/constraints
function validValue(row, col, val) {
    return (!rows[row].has(val) && !cols[col].has(val) && !grids[getGridIndex(row,col)].has(val));
}//If the value is contained in the constraints, then it can't be a value in the cell 
function solve() {
    const [y,x] = findMostConstrained();
    if(y === -1 && x === -1) {
        return true;
    }//If the sudoku is full, it must be solved.  
    for(let val = 1; val < 10; val++) {
        if(validValue(y, x, val)) {   
            placeNumber(y, x, val);
            if(solve()) {
                return true;
            }
            removeNumber(y, x, val);
        }
    }
    return false;
}//Recursive function that checks for the most constrained cell, and backtracks to the problem value if one makes the sudoku unsolvable
function print() {
    for(let i = 0; i < 9; i++) {
        console.log(sudokuBoard[i].join(" "));
    }
}//Prints the board to the console
function removeXDigits(digits) {
    while(digits !== 0) {
        let i = Math.floor(Math.random() * 9);
        let j = Math.floor(Math.random() * 9);
        if(sudokuBoard[i][j] !== 0) {
            digits--;
            removeNumber(i, j, sudokuBoard[i][j]);
        }
    }
}//Removes the given amount of digits randomly from the board
async function solveSlow() {
    const [y,x] = findMostConstrained();
    if(y === -1 && x === -1) {
        return true;
    }
    for(let val = 1; val < 10; val++) {
        if(validValue(y, x, val)) {   
            placeNumber(y, x, val);
            const cellID = `R${y+1}C${x+1}`;
            document.getElementById(cellID).value = val;
            await new Promise(resolve => setTimeout(resolve, 50));
            if(await solveSlow()) {
                return true;
            }
            removeNumber(y, x, val);
        }
    }
    return false;
}//The same solve function from before, except it is asynchronous and uses await and promises to make sure the functions dont overlap, but wait on one to finish before another begins
function generateSudoku() {
    resetBoard();
    resetConstraints();
    fillBase();
    solve();
    removeXDigits(40);
    for(let i = 1; i < 10; i++) {
        for(let j = 1; j < 10; j++) {
            const cellID = `R${i}C${j}`;
            let cell = document.getElementById(cellID);
            cell.value = sudokuBoard[i-1][j-1];
            if(sudokuBoard[i-1][j-1] === 0) {
                cell.value = '';
            }
        }
    }
}//When the generate sudoku button is pressed, this runs and fills in the table with a sudoku with 40 missing digits
function solveInstantly() {
    solve();
    for(let i = 1; i < 10; i++) {
        for(let j = 1; j < 10; j++) {
            const cellID = `R${i}C${j}`;
            let cell = document.getElementById(cellID);
            cell.value = sudokuBoard[i-1][j-1];
        }
    }
}//If the check box is not checked, this runs and puts the solution into the table all at once
function solveSwitch() {
    const switched = document.getElementById("steps").checked;
    calibrateBoard();
    initializeConstraints();
    if(switched) {
        solveSlow();
    }
    else {
        solveInstantly();
    }
}//Checks if the show steps checkbox is checked, and if it is then run the slow solution, and if not run the instant solution
function constructTable() {
    if(document.getElementById("sudoku-board") !== null) {
        const board = document.getElementById("sudoku-board");
        for (let row = 1; row <= 9; row++) {
            const tr = document.createElement("tr");
            for (let col = 1; col <= 9; col++) {
                const td = document.createElement("td");
                const cellID = `R${row}C${col}`;
                td.innerHTML = `
                <label for="${cellID}" class="sr-only"> Row ${row} Cell ${col}</label>
                <input type="text" autocomplete="off" id="${cellID}" class="sudokucell" maxlength="1">
                `;
                tr.appendChild(td);
            }
        board.appendChild(tr);
        }
}
}//This constructs the table to avoid cumbersome HTML
document.addEventListener('DOMContentLoaded', constructTable);//When the HTML element is loaded, the table will be generated
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sudokucell').forEach(cell => {//Assigns these listeners to each cell of the sudoku board
    cell.addEventListener('input', function() {
        this.value = this.value.replace(/[^1-9]/g, '');
    });//Uses RegEx to make sure that anything entered into the table is 1-9 which is the only valid sudoku values
    cell.addEventListener('input', function() {
        const y = cell.id[1] - '0' - 1;
        const x = cell.id[3] - '0' - 1;
        const inputValue = parseInt(this.value, 10);
        if(sudokuBoard[y][x] !== 0) {
            removeNumber(y, x, sudokuBoard[y][x]); 
        }
        if (validValue(y, x, inputValue)) {
            placeNumber(y, x, inputValue);
            if(!solve()) {
                removeNumber(y, x, inputValue);
                this.value = '';
                cell.classList.add("wrong");
            }
            else {
                cell.classList.remove("wrong");
            }
        } else {
            this.value = '';
            cell.classList.add("wrong");
        }
    });
})
});
function calibrateBoard() {
    resetBoard();
    for(let i = 1; i < 10; i++) {
        for(let j = 1; j < 10; j++) {
            let cellID = `R${i}C${j}`;
            let value = parseInt(document.getElementById(cellID).value) || 0;
            placeNumber(i-1, j-1, value);
        }
    }
}//Makes sure that the board on the website matches the board stored in javascript, so the player can start solving the sudoku themselves then hit the solve button and watch it be solved later