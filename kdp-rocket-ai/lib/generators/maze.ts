import jsPDF from 'jspdf';
import { createPDF, PageSize, getPageDimensionsWithBleed, downloadPDF, MarginPreset, CustomMargins } from './pdf-utils';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type MazeShape = 'square' | 'circle' | 'rectangle' | 'portrait-rectangle' | 'landscape-rectangle' | 'rounded-rectangle' | 'custom';

interface MazeConfig {
    pageSize: PageSize;
    pageCount: number;
    difficulty: Difficulty;
    shape?: MazeShape;
    customShapeWidth?: number;
    customShapeHeight?: number;
    customWidth?: number;
    customHeight?: number;
    withBleed?: boolean;
    marginPreset?: MarginPreset;
    customMargins?: CustomMargins;
}

function getMazeSize(difficulty: Difficulty): number {
    switch (difficulty) {
        case 'easy': return 15;
        case 'medium': return 25;
        case 'hard': return 35;
    }
}

function getMinimumPathLength(difficulty: Difficulty, gridSize: number): number {
    switch (difficulty) {
        case 'easy': return Math.floor(gridSize * 1.5);
        case 'medium': return Math.floor(gridSize * 2);
        case 'hard': return Math.floor(gridSize * 2.5);
    }
}

interface Position {
    x: number;
    y: number;
}

// Seeded random number generator for reproducible but varied mazes
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    nextInt(max: number): number {
        return Math.floor(this.next() * max);
    }

    shuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.nextInt(i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

// Check if a cell is inside the selected shape boundary
function isInsideShape(x: number, y: number, gridWidth: number, gridHeight: number, shape: MazeShape): boolean {
    const cx = gridWidth / 2;
    const cy = gridHeight / 2;

    switch (shape) {
        case 'square':
            return true;

        case 'circle': {
            const dx = x - cx;
            const dy = y - cy;
            const radius = Math.min(gridWidth, gridHeight) / 2 - 1;
            return (dx * dx + dy * dy) <= (radius * radius);
        }

        case 'rectangle':
        case 'portrait-rectangle':
        case 'landscape-rectangle':
        case 'custom':
            return true;

        case 'rounded-rectangle': {
            const cornerRadius = Math.min(gridWidth, gridHeight) * 0.2;
            const dx = Math.abs(x - cx);
            const dy = Math.abs(y - cy);
            const cornerX = gridWidth / 2 - cornerRadius;
            const cornerY = gridHeight / 2 - cornerRadius;

            if (dx <= cornerX || dy <= cornerY) {
                return true;
            }

            const cornerDx = dx - cornerX;
            const cornerDy = dy - cornerY;
            return (cornerDx * cornerDx + cornerDy * cornerDy) <= (cornerRadius * cornerRadius);
        }
    }

    return true;
}

// Get grid dimensions based on shape
function getGridDimensions(baseSize: number, shape: MazeShape, customWidth?: number, customHeight?: number): { width: number, height: number } {
    switch (shape) {
        case 'square':
        case 'circle':
        case 'rounded-rectangle':
            return { width: baseSize, height: baseSize };

        case 'rectangle':
            return { width: baseSize, height: Math.floor(baseSize * 1.4) };

        case 'portrait-rectangle':
            return { width: Math.floor(baseSize * 0.7), height: baseSize };

        case 'landscape-rectangle':
            return { width: baseSize, height: Math.floor(baseSize * 0.7) };

        case 'custom':
            if (customWidth && customHeight) {
                return { width: customWidth, height: customHeight };
            }
            return { width: baseSize, height: baseSize };
    }
}

// Get valid edge positions for start/finish
function getValidEdgePositions(gridWidth: number, gridHeight: number, shape: MazeShape, rng: SeededRandom): Position[] {
    const positions: Position[] = [];

    // Top edge
    for (let x = 1; x < gridWidth - 1; x++) {
        if (isInsideShape(x, 1, gridWidth, gridHeight, shape)) {
            positions.push({ x, y: 0 });
        }
    }

    // Bottom edge
    for (let x = 1; x < gridWidth - 1; x++) {
        if (isInsideShape(x, gridHeight - 2, gridWidth, gridHeight, shape)) {
            positions.push({ x, y: gridHeight - 1 });
        }
    }

    // Left edge
    for (let y = 1; y < gridHeight - 1; y++) {
        if (isInsideShape(1, y, gridWidth, gridHeight, shape)) {
            positions.push({ x: 0, y });
        }
    }

    // Right edge
    for (let y = 1; y < gridHeight - 1; y++) {
        if (isInsideShape(gridWidth - 2, y, gridWidth, gridHeight, shape)) {
            positions.push({ x: gridWidth - 1, y });
        }
    }

    return positions;
}

// Recursive backtracking maze generation with seeded randomness
function generateMaze(gridWidth: number, gridHeight: number, shape: MazeShape, difficulty: Difficulty, seed: number): { maze: boolean[][], solution: Position[], start: Position, end: Position } {
    const rng = new SeededRandom(seed);
    const maze: boolean[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));
    const visited: boolean[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));
    const minPathLength = getMinimumPathLength(difficulty, Math.max(gridWidth, gridHeight));

    // Recursive backtracker with more branching
    function carve(x: number, y: number) {
        if (!isInsideShape(x, y, gridWidth, gridHeight, shape)) {
            return;
        }

        visited[y][x] = true;
        maze[y][x] = true;

        const directions = rng.shuffle([
            [0, -1], [1, 0], [0, 1], [-1, 0]
        ]);

        for (const [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight &&
                !visited[ny][nx] && isInsideShape(nx, ny, gridWidth, gridHeight, shape)) {
                const mx = x + dx;
                const my = y + dy;
                if (isInsideShape(mx, my, gridWidth, gridHeight, shape)) {
                    maze[my][mx] = true;
                    carve(nx, ny);
                }
            }
        }

        // Add extra branching for harder difficulties
        if (difficulty !== 'easy' && rng.next() > 0.7) {
            const extraDirections = rng.shuffle([
                [0, -1], [1, 0], [0, 1], [-1, 0]
            ]);

            for (const [dx, dy] of extraDirections) {
                const nx = x + dx * 2;
                const ny = y + dy * 2;

                if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight &&
                    maze[ny]?.[nx] && isInsideShape(nx, ny, gridWidth, gridHeight, shape)) {
                    const mx = x + dx;
                    const my = y + dy;
                    if (isInsideShape(mx, my, gridWidth, gridHeight, shape) && !maze[my][mx]) {
                        maze[my][mx] = true;
                        break;
                    }
                }
            }
        }
    }

    // Start from a random interior position
    const centerX = Math.floor(gridWidth / 2) + rng.nextInt(3) - 1;
    const centerY = Math.floor(gridHeight / 2) + rng.nextInt(3) - 1;
    carve(centerX, centerY);

    // Get valid edge positions and select random start/end
    const edgePositions = getValidEdgePositions(gridWidth, gridHeight, shape, rng);

    if (edgePositions.length < 2) {
        // Fallback if not enough edge positions
        const start = { x: 1, y: 0 };
        const end = { x: gridWidth - 2, y: gridHeight - 1 };
        maze[start.y][start.x] = true;
        maze[end.y][end.x] = true;
        const solution = findSolution(maze, start, end);
        return { maze, solution, start, end };
    }

    // Try to find start and end positions with sufficient path length
    let attempts = 0;
    let bestSolution: Position[] = [];
    let bestStart: Position = edgePositions[0];
    let bestEnd: Position = edgePositions[edgePositions.length - 1];

    while (attempts < 20 && bestSolution.length < minPathLength) {
        const startIdx = rng.nextInt(edgePositions.length);
        let endIdx = rng.nextInt(edgePositions.length);

        // Ensure start and end are different and reasonably far apart
        while (endIdx === startIdx ||
            Math.abs(edgePositions[endIdx].x - edgePositions[startIdx].x) +
            Math.abs(edgePositions[endIdx].y - edgePositions[startIdx].y) < Math.min(gridWidth, gridHeight) / 2) {
            endIdx = rng.nextInt(edgePositions.length);
        }

        const start = edgePositions[startIdx];
        const end = edgePositions[endIdx];

        maze[start.y][start.x] = true;
        maze[end.y][end.x] = true;

        // Connect to interior
        const startNeighbor = getNeighborInMaze(start, maze, gridWidth, gridHeight, shape);
        if (startNeighbor) {
            maze[startNeighbor.y][startNeighbor.x] = true;
        }

        const endNeighbor = getNeighborInMaze(end, maze, gridWidth, gridHeight, shape);
        if (endNeighbor) {
            maze[endNeighbor.y][endNeighbor.x] = true;
        }

        const solution = findSolution(maze, start, end);

        if (solution.length > bestSolution.length) {
            bestSolution = solution;
            bestStart = start;
            bestEnd = end;
        }

        attempts++;
    }

    // Ensure final positions are open
    maze[bestStart.y][bestStart.x] = true;
    maze[bestEnd.y][bestEnd.x] = true;

    return { maze, solution: bestSolution, start: bestStart, end: bestEnd };
}

// Get a neighboring cell that's in the maze
function getNeighborInMaze(pos: Position, maze: boolean[][], gridWidth: number, gridHeight: number, shape: MazeShape): Position | null {
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    for (const [dx, dy] of directions) {
        const nx = pos.x + dx;
        const ny = pos.y + dy;

        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight &&
            isInsideShape(nx, ny, gridWidth, gridHeight, shape) && maze[ny][nx]) {
            return { x: nx, y: ny };
        }
    }

    return null;
}

// Find solution path from start to end using BFS
function findSolution(maze: boolean[][], start: Position, end: Position): Position[] {
    const height = maze.length;
    const width = maze[0]?.length || 0;
    const queue: { pos: Position, path: Position[] }[] = [{ pos: start, path: [start] }];
    const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
    visited[start.y][start.x] = true;

    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

    while (queue.length > 0) {
        const { pos, path } = queue.shift()!;

        if (pos.x === end.x && pos.y === end.y) {
            return path;
        }

        for (const [dx, dy] of directions) {
            const nx = pos.x + dx;
            const ny = pos.y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
                maze[ny][nx] && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({ pos: { x: nx, y: ny }, path: [...path, { x: nx, y: ny }] });
            }
        }
    }

    return [];
}

function drawMaze(
    pdf: jsPDF,
    maze: boolean[][],
    pageSize: PageSize,
    pageNum: number,
    shape: MazeShape,
    start: Position,
    end: Position,
    isSolution: boolean = false,
    solution?: Position[],
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
    const gridHeight = maze.length;
    const gridWidth = maze[0]?.length || 0;

    // Use KDP-compliant margins
    const isOddPage = pageNum % 2 === 1;
    const leftMargin = isOddPage ? dimensions.marginInside : dimensions.marginOutside;
    const rightMargin = isOddPage ? dimensions.marginOutside : dimensions.marginInside;

    const availableWidth = dimensions.width - leftMargin - rightMargin;
    const availableHeight = dimensions.height - dimensions.marginTop - dimensions.marginBottom - 80;

    const cellSize = Math.min(availableWidth / gridWidth, availableHeight / gridHeight);
    const mazeWidth = cellSize * gridWidth;
    const mazeHeight = cellSize * gridHeight;

    const mazeX = leftMargin + (availableWidth - mazeWidth) / 2;
    const mazeY = dimensions.marginTop + 50;

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = isSolution ? `Maze Solution #${pageNum}` : `Maze Puzzle #${pageNum}`;
    pdf.text(title, dimensions.width / 2, dimensions.marginTop + 20, { align: 'center' });

    // Instructions
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const instruction = isSolution ? 'Solution path shown in red' : 'Find the path from START to FINISH';
    pdf.text(instruction, dimensions.width / 2, dimensions.marginTop + 35, { align: 'center' });

    // Draw maze cells - walls are black, paths are white
    // For shaped mazes, cells outside the shape are also drawn as walls
    pdf.setFillColor(0, 0, 0);
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const insideShape = isInsideShape(x, y, gridWidth, gridHeight, shape);

            // Draw black wall if:
            // 1. Cell is outside the shape (makes the shape boundary)
            // 2. Cell is inside the shape but is a wall (!maze[y][x])
            if (!insideShape || (insideShape && !maze[y][x])) {
                pdf.rect(mazeX + x * cellSize, mazeY + y * cellSize, cellSize, cellSize, 'F');
            }
        }
    }

    // Draw solution path if this is a solution page
    if (isSolution && solution && solution.length > 0) {
        pdf.setDrawColor(255, 0, 0);
        pdf.setLineWidth(2);

        for (let i = 0; i < solution.length - 1; i++) {
            const from = solution[i];
            const to = solution[i + 1];

            const fromX = mazeX + from.x * cellSize + cellSize / 2;
            const fromY = mazeY + from.y * cellSize + cellSize / 2;
            const toX = mazeX + to.x * cellSize + cellSize / 2;
            const toY = mazeY + to.y * cellSize + cellSize / 2;

            pdf.line(fromX, fromY, toX, toY);
        }
    }

    // Mark entrance and exit
    pdf.setFontSize(8);
    pdf.setTextColor(0, 150, 0);
    const startX = mazeX + start.x * cellSize + cellSize / 2;
    const startY = mazeY + start.y * cellSize + cellSize / 2;
    pdf.text('START', startX, startY - 5, { align: 'center' });

    pdf.setTextColor(200, 0, 0);
    const endX = mazeX + end.x * cellSize + cellSize / 2;
    const endY = mazeY + end.y * cellSize + cellSize / 2;
    pdf.text('FINISH', endX, endY + 12, { align: 'center' });

    pdf.setTextColor(0, 0, 0);
}

export function generateMazePDF(config: MazeConfig): jsPDF {
    const pdf = createPDF(config.pageSize, config.customWidth, config.customHeight, config.withBleed);
    const baseSize = getMazeSize(config.difficulty);
    const shape = config.shape || 'square';
    const { width: gridWidth, height: gridHeight } = getGridDimensions(
        baseSize,
        shape,
        config.customShapeWidth,
        config.customShapeHeight
    );

    // Store mazes and solutions
    const mazeData: Array<{ maze: boolean[][], solution: Position[], start: Position, end: Position }> = [];

    // Generate puzzle pages with unique seeds
    for (let page = 0; page < config.pageCount; page++) {
        if (page > 0) {
            pdf.addPage();
        }

        // Use page number and timestamp for unique seed
        const seed = Date.now() + page * 1000 + Math.random() * 10000;
        const { maze, solution, start, end } = generateMaze(gridWidth, gridHeight, shape, config.difficulty, seed);
        mazeData.push({ maze, solution, start, end });

        drawMaze(pdf, maze, config.pageSize, page + 1, shape, start, end, false, undefined, config.customWidth, config.customHeight, config.withBleed);
    }

    // Add solution pages
    for (let page = 0; page < mazeData.length; page++) {
        pdf.addPage();
        const { maze, solution, start, end } = mazeData[page];
        drawMaze(pdf, maze, config.pageSize, page + 1, shape, start, end, true, solution, config.customWidth, config.customHeight, config.withBleed);
    }

    return pdf;
}

export function downloadMazePDF(config: MazeConfig) {
    const pdf = generateMazePDF(config);
    downloadPDF(pdf, `maze-${config.difficulty}.pdf`);
}
