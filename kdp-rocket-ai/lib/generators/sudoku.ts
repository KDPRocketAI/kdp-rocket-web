import jsPDF from 'jspdf';
import { createPDF, PageSize, PAGE_SIZES, downloadPDF, getPageDimensionsWithBleed, MarginPreset, CustomMargins } from './pdf-utils';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface SudokuConfig {
    pageSize: PageSize;
    pageCount: number;
    difficulty: Difficulty;
    customWidth?: number;
    customHeight?: number;
    withBleed?: boolean;
    marginPreset?: MarginPreset;
    customMargins?: CustomMargins;
}

// Generate a complete valid Sudoku grid
function generateCompleteSudoku(): number[][] {
    const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

    function isValid(grid: number[][], row: number, col: number, num: number): boolean {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        // Check 3x3 box
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    function fillGrid(grid: number[][]): boolean {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

                    for (const num of numbers) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;

                            if (fillGrid(grid)) {
                                return true;
                            }

                            grid[row][col] = 0;
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    fillGrid(grid);
    return grid;
}

// Remove numbers from completed grid based on difficulty
function createPuzzle(completeGrid: number[][], difficulty: Difficulty): number[][] {
    const puzzle = completeGrid.map(row => [...row]);

    let cellsToRemove = 40; // easy
    if (difficulty === 'medium') cellsToRemove = 50;
    if (difficulty === 'hard') cellsToRemove = 60;

    let removed = 0;
    const attempts = cellsToRemove * 3;

    for (let i = 0; i < attempts && removed < cellsToRemove; i++) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }

    return puzzle;
}

function drawSudoku(
    pdf: jsPDF,
    puzzle: number[][],
    pageSize: PageSize,
    pageNum: number,
    isSolution: boolean = false,
    solution?: number[][],
    customWidth?: number,
    customHeight?: number,
    withBleed: boolean = false,
    marginPreset?: MarginPreset,
    customMargins?: CustomMargins
): void {
    const dimensions = getPageDimensionsWithBleed(
        pageSize, customWidth, customHeight, withBleed,
        marginPreset || 'kdp-default',
        customMargins
    );

    // Use KDP-compliant margins
    const isOddPage = pageNum % 2 === 1;
    const leftMargin = isOddPage ? dimensions.marginInside : dimensions.marginOutside;
    const rightMargin = isOddPage ? dimensions.marginOutside : dimensions.marginInside;

    const availableWidth = dimensions.width - leftMargin - rightMargin;
    const availableHeight = dimensions.height - dimensions.marginTop - dimensions.marginBottom - 80;

    const gridSize = Math.min(availableWidth, availableHeight);
    const cellSize = gridSize / 9;

    const gridX = leftMargin + (availableWidth - gridSize) / 2;
    const gridY = dimensions.marginTop + 50;

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = isSolution ? `Sudoku Solution #${pageNum}` : `Sudoku Puzzle #${pageNum}`;
    pdf.text(title, dimensions.width / 2, dimensions.marginTop + 20, { align: 'center' });

    // Instructions
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (!isSolution) {
        pdf.text('Fill each row, column, and 3x3 box with numbers 1-9', dimensions.width / 2, dimensions.marginTop + 35, { align: 'center' });
    }

    // Use solution grid if this is a solution page
    const gridToShow = isSolution && solution ? solution : puzzle;

    // Draw grid
    pdf.setLineWidth(0.5);

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const x = gridX + j * cellSize;
            const y = gridY + i * cellSize;

            // Thicker lines for 3x3 boxes
            if (i % 3 === 0) pdf.setLineWidth(2);
            pdf.line(gridX, y, gridX + gridSize, y);
            pdf.setLineWidth(0.5);

            if (j % 3 === 0) pdf.setLineWidth(2);
            pdf.line(x, gridY, x, gridY + gridSize);
            pdf.setLineWidth(0.5);

            // Draw number if present
            if (gridToShow[i][j] !== 0) {
                pdf.setFontSize(cellSize * 0.5);

                // If solution page, show filled numbers in different color
                if (isSolution && puzzle[i][j] === 0) {
                    pdf.setTextColor(0, 100, 200); // Blue for solution numbers
                    pdf.setFont('helvetica', 'normal');
                } else {
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont('helvetica', 'bold');
                }

                pdf.text(
                    gridToShow[i][j].toString(),
                    x + cellSize / 2,
                    y + cellSize / 2 + cellSize * 0.15,
                    { align: 'center', baseline: 'middle' }
                );
            }
        }
    }

    // Bottom and right borders
    pdf.setLineWidth(2);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(gridX, gridY + gridSize, gridX + gridSize, gridY + gridSize);
    pdf.line(gridX + gridSize, gridY, gridX + gridSize, gridY + gridSize);
}

export function generateSudokuPDF(config: SudokuConfig): jsPDF {
    const pdf = createPDF(config.pageSize, config.customWidth, config.customHeight, config.withBleed);

    // Store puzzles and solutions
    const sudokuData: Array<{ puzzle: number[][], solution: number[][] }> = [];

    // Generate puzzle pages
    for (let page = 0; page < config.pageCount; page++) {
        if (page > 0) {
            pdf.addPage();
        }

        const completeGrid = generateCompleteSudoku();
        const puzzle = createPuzzle(completeGrid, config.difficulty);
        sudokuData.push({ puzzle, solution: completeGrid });

        drawSudoku(pdf, puzzle, config.pageSize, page + 1, false, undefined, config.customWidth, config.customHeight, config.withBleed, config.marginPreset, config.customMargins);
    }

    // Add solution pages
    for (let page = 0; page < sudokuData.length; page++) {
        pdf.addPage();
        const { puzzle, solution } = sudokuData[page];
        drawSudoku(pdf, puzzle, config.pageSize, page + 1, true, solution, config.customWidth, config.customHeight, config.withBleed, config.marginPreset, config.customMargins);
    }

    return pdf;
}

export function downloadSudokuPDF(config: SudokuConfig) {
    const pdf = generateSudokuPDF(config);
    downloadPDF(pdf, `sudoku-${config.difficulty}.pdf`);
}
