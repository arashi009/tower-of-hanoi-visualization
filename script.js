document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const diskCountInput = document.getElementById('disk-count');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepBtn = document.getElementById('step-btn');
    const resetBtn = document.getElementById('reset-btn');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const stepsLog = document.getElementById('steps-log');
    const towerA = document.getElementById('tower-a');
    const towerB = document.getElementById('tower-b');
    const towerC = document.getElementById('tower-c');
    const algorithmCode = document.querySelector('.algorithm-code');
    const totalMovesElement = document.getElementById('total-moves');
    const currentMoveElement = document.getElementById('current-move');
    const elapsedTimeElement = document.getElementById('elapsed-time');
    const minMovesElement = document.getElementById('min-moves');
    const themeToggle = document.getElementById('theme-toggle');
    const toggleAlgorithm = document.getElementById('toggle-algorithm');
    const toggleInfo = document.getElementById('toggle-info');
    const algorithmContent = document.querySelector('.algorithm-content');
    const infoContent = document.querySelector('.info-content');
    const incrementBtn = document.querySelector('.increment');
    const decrementBtn = document.querySelector('.decrement');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const manualControls = document.querySelector('.manual-controls');
    const userMovesElement = document.getElementById('user-moves');
    const treeContainer = document.querySelector('.tree-container');

    // Tower objects for easy reference
    const towers = {
        'A': towerA,
        'B': towerB,
        'C': towerC
    };

    // Animation variables
    let animationSpeed = 500; // Default speed in ms
    let animationQueue = [];
    let isAnimating = false;
    let isPaused = false;
    let animationTimeout;
    let totalMoves = 0;
    let currentMove = 0;
    let userMoves = 0;
    let startTime;
    let timerInterval;
    let selectedDisk = null;
    let selectedTower = null;
    let currentMode = 'auto';
    let recursionTreeNodes = [];

    // Initialize the towers with disks
    function initializeTowers(numDisks) {
        // Clear all towers
        clearTowers();
        
        // Add disks to tower A (largest to smallest, bottom to top)
        for (let i = numDisks; i >= 1; i--) {
            const disk = createDisk(i, numDisks);
            towerA.insertBefore(disk, towerA.firstChild);
        }
        
        // Update minimum moves
        const minMoves = Math.pow(2, numDisks) - 1;
        minMovesElement.textContent = minMoves;
    }

    // Create a disk element
    function createDisk(size, maxSize) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = size;
        
        // Calculate width based on size (larger number = larger disk)
        const width = 30 + (size / maxSize) * 150;
        disk.style.width = `${width}px`;
        
        // Add the disk number for clarity
        disk.textContent = size;
        
        // Add event listener for manual mode
        disk.addEventListener('click', handleDiskClick);
        
        return disk;
    }

    // Clear all towers
    function clearTowers() {
        for (const tower of Object.values(towers)) {
            // Remove all disks but keep the pole and base
            const pole = tower.querySelector('.pole');
            const base = tower.querySelector('.base');
            
            while (tower.firstChild) {
                tower.removeChild(tower.firstChild);
            }
            
            tower.appendChild(pole);
            tower.appendChild(base);
        }
        
        // Clear the steps log
        stepsLog.innerHTML = '';
        
        // Clear any ongoing animations
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        
        // Reset algorithm highlighting
        resetAlgorithmHighlighting();
        
        // Reset recursion tree
        treeContainer.innerHTML = '';
        recursionTreeNodes = [];
        
        // Reset stats
        totalMoves = 0;
        currentMove = 0;
        userMoves = 0;
        updateStats();
        
        // Stop timer
        stopTimer();
        
        // Reset buttons
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        stepBtn.disabled = true;
        isPaused = false;
        
        // Reset manual mode variables
        selectedDisk = null;
        selectedTower = null;
        clearTowerSelection();
        
        animationQueue = [];
        isAnimating = false;
    }

    // Solve Tower of Hanoi recursively and build animation queue
    function solveHanoi(n, source, auxiliary, destination, depth = 0, parentNodeId = null) {
        const nodeId = `node-${recursionTreeNodes.length}`;
        const nodeContent = `HanoiTowers(${n}, ${source}, ${auxiliary}, ${destination})`;
        
        // Add node to recursion tree data
        recursionTreeNodes.push({
            id: nodeId,
            content: nodeContent,
            parentId: parentNodeId,
            children: []
        });
        
        // If parent exists, add this node as a child
        if (parentNodeId) {
            const parentNode = recursionTreeNodes.find(node => node.id === parentNodeId);
            if (parentNode) {
                parentNode.children.push(nodeId);
            }
        }
        
        if (n === 1) {
            // Move disk from source to destination
            animationQueue.push({
                from: source,
                to: destination,
                step: `Move disk 1 from ${source} to ${destination}`,
                lineNumber: 2, // Line number in the algorithm display
                depth: depth,
                nodeId: nodeId
            });
        } else {
            // Move n-1 disks from source to auxiliary using destination as temporary
            solveHanoi(n - 1, source, destination, auxiliary, depth + 1, nodeId);
            
            // Move the nth disk from source to destination
            animationQueue.push({
                from: source,
                to: destination,
                step: `Move disk ${n} from ${source} to ${destination}`,
                lineNumber: 5, // Line number in the algorithm display
                depth: depth,
                nodeId: nodeId
            });
            
            // Move n-1 disks from auxiliary to destination using source as temporary
            solveHanoi(n - 1, auxiliary, source, destination, depth + 1, nodeId);
        }
    }

    // Build recursion tree visualization
    function buildRecursionTree() {
        treeContainer.innerHTML = '';
        
        // Find root nodes (nodes without parents)
        const rootNodes = recursionTreeNodes.filter(node => !node.parentId);
        
        // Recursively build tree
        rootNodes.forEach(node => {
            const treeNode = createTreeNode(node);
            treeContainer.appendChild(treeNode);
        });
    }

    // Create a tree node element
    function createTreeNode(node) {
        const treeNode = document.createElement('div');
        treeNode.className = 'tree-node';
        treeNode.id = node.id;
        
        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';
        nodeContent.textContent = node.content;
        treeNode.appendChild(nodeContent);
        
        if (node.children.length > 0) {
            const nodeChildren = document.createElement('div');
            nodeChildren.className = 'node-children';
            
            node.children.forEach(childId => {
                const childNode = recursionTreeNodes.find(n => n.id === childId);
                if (childNode) {
                    const childElement = createTreeNode(childNode);
                    nodeChildren.appendChild(childElement);
                }
            });
            
            treeNode.appendChild(nodeChildren);
        }
        
        return treeNode;
    }

    // Highlight node in recursion tree
    function highlightTreeNode(nodeId) {
        // Reset all nodes
        const allNodes = document.querySelectorAll('.node-content');
        allNodes.forEach(node => node.classList.remove('active'));
        
        // Highlight current node
        if (nodeId) {
            const node = document.getElementById(nodeId);
            if (node) {
                const nodeContent = node.querySelector('.node-content');
                if (nodeContent) {
                    nodeContent.classList.add('active');
                    
                    // Scroll to node
                    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }

    // Highlight the current line in the algorithm
    function highlightAlgorithmLine(lineNumber, depth) {
        // Reset previous highlighting
        resetAlgorithmHighlighting();
        
        // Create the algorithm HTML with the current line highlighted
        let algorithmHTML = `HanoiTowers(int n, char S, char temp, char D):<br>`;
        
        // Indent based on recursion depth
        const indent = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(depth + 1);
        
        // Line 1
        if (lineNumber === 1) {
            algorithmHTML += `<span class="current-line">${indent}if n = 1 then</span><br>`;
        } else {
            algorithmHTML += `${indent}if n = 1 then<br>`;
        }
        
        // Line 2
        if (lineNumber === 2) {
            algorithmHTML += `<span class="current-line">${indent}&nbsp;&nbsp;&nbsp;&nbsp;print("move disk from %c to %c\\n", S, D)</span><br>`;
        } else {
            algorithmHTML += `${indent}&nbsp;&nbsp;&nbsp;&nbsp;print("move disk from %c to %c\\n", S, D)<br>`;
        }
        
        // Line 3
        if (lineNumber === 3) {
            algorithmHTML += `<span class="current-line">${indent}else</span><br>`;
        } else {
            algorithmHTML += `${indent}else<br>`;
        }
        
        // Line 4
        if (lineNumber === 4) {
            algorithmHTML += `<span class="current-line">${indent}&nbsp;&nbsp;&nbsp;&nbsp;HanoiTowers(n-1, S, D, temp)</span><br>`;
        } else {
            algorithmHTML += `${indent}&nbsp;&nbsp;&nbsp;&nbsp;HanoiTowers(n-1, S, D, temp)<br>`;
        }
        
        // Line 5
        if (lineNumber === 5) {
            algorithmHTML += `<span class="current-line">${indent}&nbsp;&nbsp;&nbsp;&nbsp;print("move disk from %c to %c", S, D)</span><br>`;
        } else {
            algorithmHTML += `${indent}&nbsp;&nbsp;&nbsp;&nbsp;print("move disk from %c to %c", S, D)<br>`;
        }
        
        // Line 6
        if (lineNumber === 6) {
            algorithmHTML += `<span class="current-line">${indent}&nbsp;&nbsp;&nbsp;&nbsp;HanoiTowers(n-1, temp, S, D)</span>`;
        } else {
            algorithmHTML += `${indent}&nbsp;&nbsp;&nbsp;&nbsp;HanoiTowers(n-1, temp, S, D)`;
        }
        
        algorithmCode.innerHTML = algorithmHTML;
    }

    // Reset algorithm highlighting
    function resetAlgorithmHighlighting() {
        let algorithmHTML = `HanoiTowers(int n, char S, char temp, char D):<br>`;
        algorithmHTML += `&nbsp;&nbsp;&nbsp;&nbsp;if n = 1 then<br>`;
        algorithmHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print("move disk from %c to %c\\n", S, D)<br>`;
        algorithmHTML += `&nbsp;&nbsp;&nbsp;&nbsp;else<br>`;
        algorithmHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HanoiTowers(n-1, S, D, temp)<br>`;
        algorithmHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print("move disk from %c to %c", S, D)<br>`;
        algorithmHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HanoiTowers(n-1, temp, S, D)`;
        
        algorithmCode.innerHTML = algorithmHTML;
    }

    // Animate the solution
    function animateSolution() {
        if (animationQueue.length === 0 || isAnimating || isPaused) {
            if (animationQueue.length === 0) {
                isAnimating = false;
                resetAlgorithmHighlighting();
                highlightTreeNode(null);
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                stepBtn.disabled = true;
                stopTimer();
            }
            return;
        }
        
        isAnimating = true;
        const move = animationQueue.shift();
        
        // Update current move
        currentMove++;
        updateStats();
        
        // Highlight the current line in the algorithm
        highlightAlgorithmLine(move.lineNumber, move.depth);
        
        // Highlight the current node in the recursion tree
        highlightTreeNode(move.nodeId);
        
        // Add step to log
        const stepElement = document.createElement('div');
        stepElement.className = 'step current-step';
        stepElement.textContent = `${currentMove}. ${move.step}`;
        stepsLog.appendChild(stepElement);
        stepsLog.scrollTop = stepsLog.scrollHeight;
        
        // Get the towers
        const sourceTower = towers[move.from];
        const destTower = towers[move.to];
        
        // Get the top disk from source tower
        const disk = sourceTower.querySelector('.disk:first-child');
        
        if (!disk) {
            console.error('No disk found on source tower');
            return;
        }
        
        // Animate the move
        // 1. Move up
        disk.style.transform = 'translateY(-150px)';
        
        animationTimeout = setTimeout(() => {
            // 2. Move horizontally (remove from source, add to destination)
            sourceTower.removeChild(disk);
            destTower.insertBefore(disk, destTower.firstChild);
            disk.style.transform = 'translateY(-150px)';
            
            animationTimeout = setTimeout(() => {
                // 3. Move down
                disk.style.transform = 'translateY(0)';
                
                // Mark step as completed
                stepElement.classList.remove('current-step');
                stepElement.classList.add('completed-step');
                
                // Continue with next move
                animationTimeout = setTimeout(() => {
                    isAnimating = false;
                    
                    // If in step mode, don't continue automatically
                    if (currentMode !== 'step') {
                        animateSolution();
                    } else {
                        stepBtn.disabled = false;
                    }
                }, animationSpeed / 2);
            }, animationSpeed / 2);
        }, animationSpeed);
    }

    // Handle disk click in manual mode
    function handleDiskClick(event) {
        if (currentMode !== 'manual') return;
        
        const disk = event.target;
        
        // If no disk is selected, select this one if it's the top disk
        if (!selectedDisk) {
            const tower = disk.parentElement;
            const topDisk = tower.querySelector('.disk:first-child');
            
            if (disk === topDisk) {
                selectedDisk = disk;
                disk.classList.add('selected');
            }
        }
    }

    // Handle tower click in manual mode
    function handleTowerClick(event) {
        if (currentMode !== 'manual') return;
        
        let tower = event.target;
        
        // If clicked on a disk or pole or base, get the parent tower
        if (!tower.classList.contains('tower')) {
            tower = tower.closest('.tower');
        }
        
        // If a disk is selected, try to move it to this tower
        if (selectedDisk) {
            const sourceTower = selectedDisk.parentElement;
            
            // Can't move to the same tower
            if (sourceTower === tower) {
                selectedDisk.classList.remove('selected');
                selectedDisk = null;
                return;
            }
            
            // Check if move is valid (can't place larger disk on smaller disk)
            const topDisk = tower.querySelector('.disk:first-child');
            if (topDisk && parseInt(selectedDisk.dataset.size) > parseInt(topDisk.dataset.size)) {
                // Invalid move - flash the disk red
                selectedDisk.style.backgroundColor = 'red';
                setTimeout(() => {
                    selectedDisk.style.backgroundColor = '';
                }, 500);
                return;
            }
            
            // Valid move - perform it
            sourceTower.removeChild(selectedDisk);
            tower.insertBefore(selectedDisk, tower.firstChild);
            selectedDisk.classList.remove('selected');
            selectedDisk.style.transform = '';
            selectedDisk = null;
            
            // Increment user moves
            userMoves++;
            userMovesElement.textContent = userMoves;
            
            // Check if puzzle is solved
            checkPuzzleSolved();
        }
    }

    // Check if the puzzle is solved in manual mode
    function checkPuzzleSolved() {
        const numDisks = parseInt(diskCountInput.value);
        const destinationTower = towerC;
        
        // Check if all disks are on the destination tower
        if (destinationTower.querySelectorAll('.disk').length === numDisks) {
            // Check if they're in the correct order
            let isCorrect = true;
            let disks = destinationTower.querySelectorAll('.disk');
            
            for (let i = 0; i < disks.length; i++) {
                if (parseInt(disks[i].dataset.size) !== (disks.length - i)) {
                    isCorrect = false;
                    break;
                }
            }
            
            if (isCorrect) {
                setTimeout(() => {
                    alert(`Congratulations! You solved the puzzle in ${userMoves} moves. The minimum possible is ${minMovesElement.textContent} moves.`);
                }, 500);
            }
        }
    }

    // Clear tower selection
    function clearTowerSelection() {
        Object.values(towers).forEach(tower => {
            tower.classList.remove('active');
        });
    }

    // Update stats display
    function updateStats() {
        totalMovesElement.textContent = totalMoves;
        currentMoveElement.textContent = currentMove;
    }

    // Start timer
    function startTimer() {
        startTime = new Date();
        elapsedTimeElement.textContent = '00:00';
        
        timerInterval = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            elapsedTimeElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    // Stop timer
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        elapsedTimeElement.textContent = '00:00';
    }

    // Update speed display
    function updateSpeedDisplay() {
        const speedVal = parseInt(speedSlider.value);
        let speedText;
        
        if (speedVal <= 2) {
            speedText = 'Very Slow';
        } else if (speedVal <= 4) {
            speedText = 'Slow';
        } else if (speedVal <= 6) {
            speedText = 'Medium';
        } else if (speedVal <= 8) {
            speedText = 'Fast';
        } else {
            speedText = 'Very Fast';
        }
        
        speedValue.textContent = speedText;
    }

    // Toggle section visibility
    function toggleSection(toggleBtn, content) {
        toggleBtn.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
    }

    // Update UI based on selected mode
    function updateModeUI() {
        // Reset everything
        clearTowers();
        
        // Update button states based on mode
        if (currentMode === 'auto') {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            manualControls.classList.remove('active');
        } else if (currentMode === 'step') {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            manualControls.classList.remove('active');
        } else if (currentMode === 'manual') {
            startBtn.disabled = true;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            manualControls.classList.add('active');
            userMovesElement.textContent = '0';
        }
        
        // Initialize towers
        initializeTowers(parseInt(diskCountInput.value));
    }

    // Event listeners
    startBtn.addEventListener('click', () => {
        const numDisks = parseInt(diskCountInput.value);
        
        if (isNaN(numDisks) || numDisks < 1 || numDisks > 8) {
            alert('Please enter a valid number of disks (1-8)');
            return;
        }
        
        // Initialize towers
        initializeTowers(numDisks);
        
        // Calculate solution
        animationQueue = [];
        recursionTreeNodes = [];
        solveHanoi(numDisks, 'A', 'B', 'C');
        
        // Build recursion tree
        buildRecursionTree();
        
        // Set total moves
        totalMoves = animationQueue.length;
        currentMove = 0;
        updateStats();
        
        // Update animation speed based on slider
        animationSpeed = 1100 - (speedSlider.value * 100);
        
        // Start timer
        startTimer();
        
        // Update button states
        startBtn.disabled = true;
        
        if (currentMode === 'auto') {
            pauseBtn.disabled = false;
            stepBtn.disabled = true;
            
            // Start animation
            setTimeout(() => {
                animateSolution();
            }, 500);
        } else if (currentMode === 'step') {
            pauseBtn.disabled = true;
            stepBtn.disabled = false;
        }
    });

    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        
        if (isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            // Pause timer
            clearInterval(timerInterval);
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            // Resume timer
            startTimer();
            // Resume animation
            animateSolution();
        }
    });

    stepBtn.addEventListener('click', () => {
        if (currentMode === 'step' && !isAnimating) {
            animateSolution();
        }
    });

    resetBtn.addEventListener('click', () => {
        const numDisks = parseInt(diskCountInput.value);
        
        if (isNaN(numDisks) || numDisks < 1 || numDisks > 8) {
            alert('Please enter a valid number of disks (1-8)');
            return;
        }
        
        clearTowers();
        initializeTowers(numDisks);
    });

    speedSlider.addEventListener('input', () => {
        animationSpeed = 1100 - (speedSlider.value * 100);
        updateSpeedDisplay();
    });

    // Disk count increment/decrement
    incrementBtn.addEventListener('click', () => {
        const currentValue = parseInt(diskCountInput.value);
        if (currentValue < 8) {
            diskCountInput.value = currentValue + 1;
            initializeTowers(currentValue + 1);
        }
    });

    decrementBtn.addEventListener('click', () => {
        const currentValue = parseInt(diskCountInput.value);
        if (currentValue > 1) {
            diskCountInput.value = currentValue - 1;
            initializeTowers(currentValue - 1);
        }
    });

    // Mode selection
    modeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                currentMode = radio.value;
                updateModeUI();
            }
        });
    });

    // Add tower click listeners for manual mode
    Object.values(towers).forEach(tower => {
        tower.addEventListener('click', handleTowerClick);
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    });

    // Section toggles
    toggleAlgorithm.addEventListener('click', () => {
        toggleSection(toggleAlgorithm, algorithmContent);
    });

    toggleInfo.addEventListener('click', () => {
        toggleSection(toggleInfo, infoContent);
    });

    // Initialize with default number of disks
    initializeTowers(parseInt(diskCountInput.value));
    updateSpeedDisplay();
}); 