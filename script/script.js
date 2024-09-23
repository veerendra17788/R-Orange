// Global variables
let arrayOfStates = [];
let array = [];
let rows, cols;
let counter;

// Initialize the game
function initializeGame() {
    counter = document.getElementById("counter");
    counter.textContent = "0";
    
    cols = parseInt(document.getElementById('cols').value);
    rows = parseInt(document.getElementById('rows').value);
    
    if (isNaN(cols) || isNaN(rows) || cols <= 0 || rows <= 0) {
        alert("Please enter valid positive numbers for rows and columns.");
        return false;
    }

    const gridContainer = document.getElementById('matrix');
    array = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Clear previous grid
    gridContainer.innerHTML = '';

    // Set up grid layout
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, auto)`;

    // Create grid items
    for (let i = 0; i < rows * cols; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'col';
        gridItem.dataset.index = i;
        gridContainer.appendChild(gridItem);
    }

    // Reset array of states
    arrayOfStates = [JSON.parse(JSON.stringify(array))];

    setupEventListeners();
    return true;
}

// Set up event listeners
function setupEventListeners() {
    const matrix = document.getElementById('matrix');
    const healthyOrange = document.getElementById('healthy-orange');
    const rottenOrange = document.getElementById('rotten-orange');

    matrix.addEventListener('dragover', handleDragOver);
    matrix.addEventListener('drop', handleDrop);
    healthyOrange.addEventListener('dragstart', handleDragStart);
    rottenOrange.addEventListener('dragstart', handleDragStart);

    document.getElementById("save").addEventListener('click', saveState);
    document.getElementById("prev").addEventListener('click', goToPreviousState);
    document.getElementById("next").addEventListener('click', goToNextState);
}

// Drag and drop event handlers
function handleDragOver(e) {
    e.preventDefault();
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.target.closest('.col');
    if (!target) return;

    const draggedId = e.dataTransfer.getData('text');
    const draggedElement = document.getElementById(draggedId);

    if (draggedElement) {
        target.innerHTML = '';
        target.appendChild(draggedElement.cloneNode(true));
        updateArrayFromGrid();
    }
}

// Update the underlying array based on the grid state
function updateArrayFromGrid() {
    const gridItems = document.querySelectorAll('#matrix .col');
    gridItems.forEach((item, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        if (item.firstChild && item.firstChild.id === 'img-h-orange') {
            array[row][col] = 1; // Healthy orange
        } else if (item.firstChild && item.firstChild.id === 'img-r-orange') {
            array[row][col] = 2; // Rotten orange
        } else {
            array[row][col] = 0; // Empty cell
        }
    });
}

// Update the grid based on the underlying array
function updateGrid() {
    const gridItems = document.querySelectorAll('#matrix .col');
    const imgHOrange = document.getElementById('img-h-orange').outerHTML;
    const imgROrange = document.getElementById('img-r-orange').outerHTML;
    
    gridItems.forEach((item, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        if (array[row][col] === 2) {
            item.innerHTML = imgROrange;
        } else if (array[row][col] === 1) {
            item.innerHTML = imgHOrange;
        } else {
            item.innerHTML = '';
        }
    });
}

// Save the current state
function saveState() {
    updateArrayFromGrid();
    arrayOfStates.push(JSON.parse(JSON.stringify(array)));
    console.log("State saved:", array);
}

// Go to the previous state
function goToPreviousState() {
    if (arrayOfStates.length > 1) {
        arrayOfStates.pop(); // Remove the current state
        array = JSON.parse(JSON.stringify(arrayOfStates[arrayOfStates.length - 1]));
        updateGrid();
        counter.textContent = (parseInt(counter.textContent) - 1).toString();
        console.log("Reverted to previous state:", array);
    } else {
        console.log("No previous state available");
    }
}

// Go to the next state (simulate rot spreading)
function goToNextState() {
    let newArray = JSON.parse(JSON.stringify(array));
    let changed = false;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (array[i][j] === 2) { // Rotten orange
                [[i-1, j], [i+1, j], [i, j-1], [i, j+1]].forEach(([ni, nj]) => {
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && array[ni][nj] === 1) {
                        newArray[ni][nj] = 2;
                        changed = true;
                    }
                });
            }
        }
    }
    
    if (changed) {
        array = newArray;
        updateGrid();
        counter.textContent = (parseInt(counter.textContent) + 1).toString();
        arrayOfStates.push(JSON.parse(JSON.stringify(array)));
        console.log("Advanced to next state:", array);
    } else {
        console.log("No changes in the next state");
    }
}

// Event listener for form submission
document.getElementById('gridForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    if (initializeGame()) {
        updateGrid();
    }
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Any initial setup can go here
});