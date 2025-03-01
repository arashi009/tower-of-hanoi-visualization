# Tower of Hanoi Visualization

This is an interactive web application that visualizes the recursive algorithm for solving the Tower of Hanoi puzzle.

## What is the Tower of Hanoi?

The Tower of Hanoi is a classic mathematical puzzle that consists of three rods and a number of disks of different sizes. The puzzle starts with all disks stacked on one rod in order of decreasing size, with the smallest at the top. The objective is to move the entire stack to another rod, following these rules:

1. Only one disk can be moved at a time.
2. Each move consists of taking the upper disk from one of the stacks and placing it on top of another stack or on an empty rod.
3. No disk may be placed on top of a smaller disk.

## How to Use This Visualization

1. Open `index.html` in a web browser.
2. Choose a mode:
   - **Auto-solve**: Watch the algorithm solve the puzzle automatically
   - **Step-by-step**: Control the execution one step at a time
   - **Manual**: Try to solve the puzzle yourself
3. Use the number input to select how many disks you want (1-8).
4. Click the "Start" button to begin the visualization (in Auto or Step modes).
5. Use the speed slider to adjust how fast the animation runs.
6. Use the "Pause/Resume" button to control the animation flow.
7. In Step mode, use the "Step" button to advance one move at a time.
8. Click the "Reset" button to reset the towers with the current number of disks.
9. Toggle dark/light mode using the button in the footer.

## Features

- **Multiple Interaction Modes**:
  - Auto-solve: Watch the algorithm solve the puzzle automatically
  - Step-by-step: Control the execution one step at a time
  - Manual: Try to solve the puzzle yourself and compare to the optimal solution

- **Enhanced Visualization**:
  - Recursion tree visualization showing the call stack
  - Active node highlighting in the recursion tree
  - Algorithm line highlighting
  - Numbered execution steps
  - Minimum moves counter (2^n - 1)

- **Educational Content**:
  - Time & space complexity information
  - Fun facts about the Tower of Hanoi
  - Detailed algorithm explanation

- **Interactive Features**:
  - Manual puzzle solving
  - Move counter for user moves
  - Disk selection with visual feedback
  - Invalid move detection
  - Collapsible information sections

- **UI/UX Improvements**:
  - Dark/light mode toggle
  - Responsive design
  - Animation speed control
  - Pause/resume functionality
  - Timer to track solving time
  - Statistics panel

## The Algorithm

The visualization implements the following recursive algorithm for solving the Tower of Hanoi puzzle:

```
HanoiTowers(int n, char S, char temp, char D):
    if n = 1 then 
        print("move disk from %c to %c\n", S, D)
    else
        HanoiTowers(n-1, S, D, temp)
        print("move disk from %c to %c", S, D)
        HanoiTowers(n-1, temp, S, D)
```

Where:
- `n` is the number of disks
- `S` is the source rod (where disks start)
- `temp` is the auxiliary rod (used as temporary storage)
- `D` is the destination rod (where disks should end up)

## Mathematical Properties

- The minimum number of moves required to solve a Tower of Hanoi puzzle is 2^n - 1, where n is the number of disks.
- Time complexity: O(2^n)
- Space complexity: O(n) due to the recursion stack

## Technical Details

This application is built using:
- HTML5
- CSS3 (with CSS variables for theming)
- JavaScript (ES6+)
- Font Awesome for icons

No external JavaScript libraries or frameworks are used.

## Fun Facts

- With 64 disks, it would take 2^64-1 moves, which is over 18 quintillion moves!
- If you could move one disk per second, it would take over 584 billion years to complete.
- The puzzle was invented by the French mathematician Édouard Lucas in 1883.
- There's a legend that says monks in a temple are solving this puzzle with 64 golden disks, and when they finish, the world will end. 