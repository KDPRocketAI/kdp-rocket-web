import jsPDF from 'jspdf';
import { PageSize, PAGE_SIZES, getCustomPageDimensions, getPageDimensionsWithBleed, MarginPreset, CustomMargins } from './pdf-utils';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface WordSearchConfig {
    pageSize: PageSize;
    pageCount: number;
    difficulty: Difficulty;
    theme: string;
    customWords?: string[];
    customWidth?: number;
    customHeight?: number;
    withBleed?: boolean;
    marginPreset?: MarginPreset;
    customMargins?: CustomMargins;
}

// Theme-based word lists - expanded
const THEME_WORDS: Record<string, string[]> = {
    animals: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'TIGER', 'BEAR', 'ELEPHANT', 'MONKEY', 'ZEBRA', 'GIRAFFE', 'RABBIT', 'MOUSE', 'HORSE', 'COW', 'PIG', 'SHEEP', 'DUCK', 'HEN', 'GOAT', 'WOLF', 'FOX', 'DEER', 'MOOSE', 'RACCOON', 'SQUIRREL', 'CHIPMUNK', 'BEAVER', 'OTTER', 'SEAL', 'WHALE', 'DOLPHIN', 'SHARK', 'OCTOPUS', 'CRAB', 'LOBSTER', 'PENGUIN', 'FLAMINGO', 'PEACOCK', 'PARROT', 'OWL', 'EAGLE', 'HAWK', 'RAVEN', 'CROW', 'SWAN', 'PELICAN', 'TOUCAN', 'EMU', 'OSTRICH'],
    space: ['STAR', 'MOON', 'SUN', 'PLANET', 'ROCKET', 'COMET', 'GALAXY', 'ORBIT', 'MARS', 'VENUS', 'EARTH', 'SATURN', 'JUPITER', 'METEOR', 'ALIEN', 'ASTRONAUT', 'NEBULA', 'ASTEROID', 'COSMOS', 'UNIVERSE', 'PLUTO', 'MERCURY', 'URANUS', 'NEPTUNE', 'ECLIPSE', 'GRAVITY', 'SHUTTLE', 'STATION', 'TELESCOPE', 'LUNAR', 'SOLAR', 'COSMIC', 'MILKY WAY', 'CRATER', 'LAUNCH', 'APOLLO', 'VOYAGER', 'HUBBLE', 'AURORA', 'SATELLITE'],
    food: ['PIZZA', 'PASTA', 'BREAD', 'CHEESE', 'APPLE', 'ORANGE', 'BANANA', 'GRAPE', 'CARROT', 'TOMATO', 'POTATO', 'SALAD', 'SOUP', 'RICE', 'CHICKEN', 'BEEF', 'PORK', 'FISH', 'SHRIMP', 'BURGER', 'TACO', 'BURRITO', 'SANDWICH', 'DONUT', 'CAKE', 'COOKIE', 'PIE', 'ICE CREAM', 'CHOCOLATE', 'CANDY', 'HONEY', 'SUGAR', 'SALT', 'PEPPER', 'GARLIC', 'ONION', 'LETTUCE', 'CUCUMBER', 'BROCCOLI', 'SPINACH', 'CORN', 'BEANS', 'PEAS', 'STRAWBERRY', 'BLUEBERRY', 'RASPBERRY', 'PEACH', 'PEAR', 'MANGO', 'PINEAPPLE'],
    nature: ['TREE', 'FLOWER', 'GRASS', 'MOUNTAIN', 'RIVER', 'OCEAN', 'LAKE', 'FOREST', 'DESERT', 'RAIN', 'WIND', 'CLOUD', 'LEAF', 'BRANCH', 'ROCK', 'SOIL', 'VALLEY', 'HILL', 'WATERFALL', 'STREAM', 'MEADOW', 'PRAIRIE', 'JUNGLE', 'CANYON', 'CLIFF', 'ISLAND', 'BAY', 'SHORE', 'BEACH', 'REEF', 'MOSS', 'FERN', 'VINE', 'ROOT', 'SEED', 'BLOOM', 'BUD', 'PETAL', 'STEM', 'THORN', 'SUNRISE', 'SUNSET', 'RAINBOW', 'THUNDER', 'LIGHTNING', 'STORM', 'BREEZE', 'MIST', 'DEW', 'FROST'],
    // Generic fallback words for custom themes
    default: ['PUZZLE', 'WORD', 'SEARCH', 'FIND', 'HIDDEN', 'GAME', 'FUN', 'BRAIN', 'THINK', 'CHALLENGE', 'SOLVE', 'HUNT', 'DISCOVER', 'LOCATE', 'SPOT', 'SEEK', 'EXPLORE', 'QUEST', 'MYSTERY', 'CLUE']
};

function getGridSize(difficulty: Difficulty): number {
    switch (difficulty) {
        case 'easy': return 10;
        case 'medium': return 15;
        case 'hard': return 20;
    }
}

function getWordCount(difficulty: Difficulty): number {
    switch (difficulty) {
        case 'easy': return 6;
        case 'medium': return 10;
        case 'hard': return 15;
    }
}

function createEmptyGrid(size: number): string[][] {
    return Array(size).fill(null).map(() => Array(size).fill(''));
}

// Get all available words from theme or custom words
function getAllWords(theme: string, customWords?: string[]): string[] {
    if (customWords && customWords.length > 0) {
        return customWords.map(w => w.toUpperCase().trim()).filter(w => w.length > 0);
    }
    // Check if theme exists, otherwise use default
    const normalizedTheme = theme.toLowerCase();
    return THEME_WORDS[normalizedTheme] || THEME_WORDS.default;
}

// Distribute words across pages - ensures no repetition
function distributeWords(allWords: string[], pageCount: number, wordsPerPage: number): string[][] {
    const totalWordsNeeded = pageCount * wordsPerPage;
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);

    // If we don't have enough unique words, we'll need to reuse some
    const wordPool: string[] = [];
    while (wordPool.length < totalWordsNeeded) {
        wordPool.push(...shuffled);
    }

    // Split into pages
    const pages: string[][] = [];
    for (let i = 0; i < pageCount; i++) {
        pages.push(wordPool.slice(i * wordsPerPage, (i + 1) * wordsPerPage));
    }

    return pages;
}

function canPlaceWord(grid: string[][], word: string, row: number, col: number, dRow: number, dCol: number): boolean {
    const size = grid.length;

    for (let i = 0; i < word.length; i++) {
        const newRow = row + i * dRow;
        const newCol = col + i * dCol;

        if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
            return false;
        }

        const cell = grid[newRow][newCol];
        if (cell !== '' && cell !== word[i]) {
            return false;
        }
    }

    return true;
}

interface WordPlacement {
    word: string;
    row: number;
    col: number;
    dRow: number;
    dCol: number;
}

function placeWord(grid: string[][], word: string, row: number, col: number, dRow: number, dCol: number): void {
    for (let i = 0; i < word.length; i++) {
        grid[row + i * dRow][col + i * dCol] = word[i];
    }
}

function placeWordsInGrid(grid: string[][], words: string[], difficulty: Difficulty): WordPlacement[] {
    // Directions: horizontal, vertical, and diagonal for medium/hard
    const directions = difficulty === 'easy'
        ? [[0, 1], [1, 0]] // horizontal and vertical only
        : [[0, 1], [1, 0], [1, 1], [1, -1]]; // add diagonals

    const placements: WordPlacement[] = [];

    for (const word of words) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            const row = Math.floor(Math.random() * grid.length);
            const col = Math.floor(Math.random() * grid.length);
            const [dRow, dCol] = directions[Math.floor(Math.random() * directions.length)];

            if (canPlaceWord(grid, word, row, col, dRow, dCol)) {
                placeWord(grid, word, row, col, dRow, dCol);
                placements.push({ word, row, col, dRow, dCol });
                placed = true;
            }

            attempts++;
        }
    }

    return placements;
}

function fillEmptyCells(grid: string[][]): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function drawWordSearchPage(
    pdf: jsPDF,
    grid: string[][],
    words: string[],
    pageSize: PageSize,
    pageNum: number,
    theme: string,
    isSolution: boolean = false,
    placements?: WordPlacement[],
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

    const gridSize = grid.length;

    // Use KDP-compliant margins - left margin for odd pages, right for even
    const isOddPage = pageNum % 2 === 1;
    const leftMargin = isOddPage ? dimensions.marginInside : dimensions.marginOutside;
    const rightMargin = isOddPage ? dimensions.marginOutside : dimensions.marginInside;

    // Calculate available space
    const availableWidth = dimensions.width - leftMargin - rightMargin;
    const availableHeight = dimensions.height - dimensions.marginTop - dimensions.marginBottom - 100;

    // Grid dimensions
    const cellSize = Math.min(availableWidth / gridSize, availableHeight / gridSize);
    const gridWidth = cellSize * gridSize;
    const gridHeight = cellSize * gridSize;

    // Center the grid horizontally in available space
    const gridX = leftMargin + (availableWidth - gridWidth) / 2;
    const gridY = dimensions.marginTop + 50;

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = isSolution
        ? `Word Search Solution #${pageNum}`
        : `${theme.charAt(0).toUpperCase() + theme.slice(1)} Word Search #${pageNum}`;
    pdf.text(title, dimensions.width / 2, dimensions.marginTop + 20, { align: 'center' });

    // Draw grid
    pdf.setFontSize(Math.max(8, cellSize * 0.4));
    pdf.setFont('helvetica', 'normal');

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x = gridX + j * cellSize;
            const y = gridY + i * cellSize;

            // If solution, highlight found words
            if (isSolution && placements) {
                let isPartOfWord = false;
                for (const placement of placements) {
                    for (let k = 0; k < placement.word.length; k++) {
                        const wordRow = placement.row + k * placement.dRow;
                        const wordCol = placement.col + k * placement.dCol;
                        if (wordRow === i && wordCol === j) {
                            isPartOfWord = true;
                            break;
                        }
                    }
                    if (isPartOfWord) break;
                }

                if (isPartOfWord) {
                    pdf.setFillColor(255, 255, 200); // Light yellow highlight
                    pdf.rect(x, y, cellSize, cellSize, 'F');
                }
            }

            // Draw cell border
            pdf.setDrawColor(100, 100, 100);
            pdf.rect(x, y, cellSize, cellSize);

            // Draw letter
            pdf.setTextColor(0, 0, 0);
            pdf.text(grid[i][j], x + cellSize / 2, y + cellSize / 2 + 2, { align: 'center', baseline: 'middle' });
        }
    }

    // Word list (only on puzzle pages, not solutions)
    if (!isSolution) {
        const wordListY = gridY + gridHeight + 30;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Find these words:', leftMargin, wordListY);

        pdf.setFont('helvetica', 'normal');
        const wordsPerRow = Math.floor(availableWidth / 120);
        let wordX = leftMargin;
        let wordY = wordListY + 20;

        words.forEach((word, index) => {
            if (index > 0 && index % wordsPerRow === 0) {
                wordY += 20;
                wordX = leftMargin;
            }

            pdf.text(word, wordX, wordY);
            wordX += 120;
        });
    }
}

export function generateWordSearchPDF(config: WordSearchConfig): jsPDF {
    const pdf = config.pageSize === 'custom' && config.customWidth && config.customHeight
        ? new jsPDF({
            orientation: (config.customWidth < config.customHeight) ? 'portrait' : 'landscape',
            unit: 'pt',
            format: [config.customWidth * 72, config.customHeight * 72]
        })
        : new jsPDF({
            orientation: PAGE_SIZES[config.pageSize as Exclude<PageSize, 'custom'>].width < PAGE_SIZES[config.pageSize as Exclude<PageSize, 'custom'>].height ? 'portrait' : 'landscape',
            unit: 'pt',
            format: [
                PAGE_SIZES[config.pageSize as Exclude<PageSize, 'custom'>].width,
                PAGE_SIZES[config.pageSize as Exclude<PageSize, 'custom'>].height
            ]
        });

    const gridSize = getGridSize(config.difficulty);
    const wordCount = getWordCount(config.difficulty);

    // Get all available words
    const allWords = getAllWords(config.theme, config.customWords);

    // Distribute words across pages ensuring no repetition
    const pageWords = distributeWords(allWords, config.pageCount, wordCount);

    // Store grids and placements for solution pages
    const puzzleData: Array<{ grid: string[][], words: string[], placements: WordPlacement[] }> = [];

    // Generate puzzle pages
    for (let page = 0; page < config.pageCount; page++) {
        if (page > 0) {
            pdf.addPage();
        }

        // Create puzzle
        const grid = createEmptyGrid(gridSize);
        const words = pageWords[page];
        const placements = placeWordsInGrid(grid, words, config.difficulty);
        fillEmptyCells(grid);

        // Store for solutions
        puzzleData.push({ grid, words, placements });

        // Draw puzzle page
        drawWordSearchPage(pdf, grid, words, config.pageSize, page + 1, config.theme, false, undefined, config.customWidth, config.customHeight, config.withBleed, config.marginPreset, config.customMargins);
    }

    // Add solution pages
    for (let page = 0; page < puzzleData.length; page++) {
        pdf.addPage();
        const { grid, words, placements } = puzzleData[page];
        drawWordSearchPage(pdf, grid, words, config.pageSize, page + 1, config.theme, true, placements, config.customWidth, config.customHeight, config.withBleed, config.marginPreset, config.customMargins);
    }

    return pdf;
}

export function downloadWordSearchPDF(config: WordSearchConfig) {
    const pdf = generateWordSearchPDF(config);
    const themeSlug = config.theme.toLowerCase().replace(/\s+/g, '-');
    const fileName = config.customWords
        ? `word-search-custom-${config.difficulty}.pdf`
        : `word-search-${themeSlug}-${config.difficulty}.pdf`;
    pdf.save(fileName);
}
