'use client';

import { useState } from 'react';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import styles from './InteriorGenerator.module.css';
import { PageSize, MarginPreset, CustomMargins } from '@/lib/generators/pdf-utils';
import { downloadWordSearchPDF, Difficulty as WordSearchDifficulty } from '@/lib/generators/word-search';
import { downloadMazePDF, Difficulty as MazeDifficulty, MazeShape } from '@/lib/generators/maze';
import { downloadSudokuPDF, Difficulty as SudokuDifficulty } from '@/lib/generators/sudoku';
import { downloadJournalPDF, LineSpacing } from '@/lib/generators/journal';
import { downloadDotGridPDF, DotSpacing } from '@/lib/generators/dot-grid';

type InteriorType = 'word-search' | 'maze' | 'sudoku' | 'journal' | 'dot-grid';

export default function InteriorGenerator() {
    // Clerk authentication
    const { isSignedIn } = useUser();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [interiorType, setInteriorType] = useState<InteriorType>('word-search');
    const [pageSize, setPageSize] = useState<PageSize>('8.5x11');
    const [pageCount, setPageCount] = useState(20);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [lineSpacing, setLineSpacing] = useState<LineSpacing>('medium');
    const [dotSpacing, setDotSpacing] = useState<DotSpacing>('5mm');
    const [theme, setTheme] = useState('animals');
    const [customWords, setCustomWords] = useState('');
    const [wordWarning, setWordWarning] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Custom page size state
    const [customWidth, setCustomWidth] = useState(8.5);
    const [customHeight, setCustomHeight] = useState(11);
    const [customPageError, setCustomPageError] = useState('');

    // Custom theme state
    const [customTheme, setCustomTheme] = useState('');

    // Bleed option
    const [withBleed, setWithBleed] = useState(false);

    // Maze shape
    const [mazeShape, setMazeShape] = useState<MazeShape>('square');

    // Custom maze shape dimensions
    const [customShapeWidth, setCustomShapeWidth] = useState<number>(20);
    const [customShapeHeight, setCustomShapeHeight] = useState<number>(20);

    // Margin settings
    const [marginPreset, setMarginPreset] = useState<MarginPreset>('kdp-default');
    const [customMarginInside, setCustomMarginInside] = useState<number>(0.625);
    const [customMarginOutside, setCustomMarginOutside] = useState<number>(0.5);
    const [customMarginTop, setCustomMarginTop] = useState<number>(0.5);
    const [customMarginBottom, setCustomMarginBottom] = useState<number>(0.5);

    const isPuzzle = ['word-search', 'maze', 'sudoku'].includes(interiorType);
    const isJournal = interiorType === 'journal';
    const isDotGrid = interiorType === 'dot-grid';
    const isWordSearch = interiorType === 'word-search';
    const isCustomPageSize = pageSize === 'custom';

    // Parse custom words
    const parseCustomWords = (): string[] | undefined => {
        if (!customWords.trim()) return undefined;

        // Split by comma or newline
        const words = customWords
            .split(/[,\n]+/)
            .map(w => w.trim().toUpperCase())
            .filter(w => w.length > 0);

        return words.length > 0 ? words : undefined;
    };

    // Validate custom words for page count
    const validateCustomWords = () => {
        const words = parseCustomWords();
        if (!words) {
            setWordWarning('');
            return true;
        }

        // Get words needed based on difficulty
        let wordsPerPage = 10; // medium default
        if (difficulty === 'easy') wordsPerPage = 6;
        if (difficulty === 'hard') wordsPerPage = 15;

        const totalWordsNeeded = pageCount * wordsPerPage;

        if (words.length < wordsPerPage) {
            setWordWarning(`⚠️ Need at least ${wordsPerPage} words for one page (${difficulty} difficulty). You have ${words.length}.`);
            return false;
        } else if (words.length < totalWordsNeeded) {
            setWordWarning(`ℹ️ You have ${words.length} words for ${pageCount} pages. Some words will be reused.`);
            return true; // Allow but warn
        } else {
            setWordWarning('');
            return true;
        }
    };

    // Validate custom page size
    const validateCustomPageSize = (): boolean => {
        if (pageSize !== 'custom') {
            setCustomPageError('');
            return true;
        }

        if (customWidth < 4 || customWidth > 12) {
            setCustomPageError('⚠️ Width must be between 4 and 12 inches');
            return false;
        }

        if (customHeight < 4 || customHeight > 12) {
            setCustomPageError('⚠️ Height must be between 4 and 12 inches');
            return false;
        }

        setCustomPageError('');
        return true;
    };

    const handleGenerate = async () => {
        // Check authentication FIRST - protect PDF downloads
        if (!isSignedIn) {
            setShowAuthModal(true);
            return;
        }

        // Validate custom page size
        if (!validateCustomPageSize()) {
            return;
        }

        // Validate custom words if word search
        if (isWordSearch && !validateCustomWords()) {
            return; // Don't generate if validation fails
        }

        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            // Build custom margins object if custom preset
            const customMargins: CustomMargins | undefined = marginPreset === 'custom' ? {
                inside: customMarginInside,
                outside: customMarginOutside,
                top: customMarginTop,
                bottom: customMarginBottom
            } : undefined;

            // Helper function for parsing words (assuming it's defined elsewhere or needs to be added)
            // For now, using parseCustomWords as a placeholder if customWords is used with isCustomTheme
            const parseWords = (wordsString: string) => {
                return wordsString.split(/[,\n]+/).map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
            };

            // Assuming isCustomTheme is a state variable or derived value
            const isCustomTheme = customTheme.trim() !== ''; // Placeholder for isCustomTheme logic

            if (interiorType === 'word-search') {
                const customWordList = isCustomTheme && customWords ? parseWords(customWords) : undefined;
                downloadWordSearchPDF({
                    pageSize,
                    pageCount,
                    difficulty: difficulty as WordSearchDifficulty,
                    theme: isCustomTheme ? customTheme : theme,
                    customWords: customWordList,
                    customWidth: isCustomPageSize ? customWidth : undefined,
                    customHeight: isCustomPageSize ? customHeight : undefined,
                    withBleed,
                    marginPreset,
                    customMargins
                });
            } else if (interiorType === 'maze') {
                downloadMazePDF({
                    pageSize,
                    pageCount,
                    difficulty: difficulty as MazeDifficulty,
                    shape: mazeShape,
                    customShapeWidth: mazeShape === 'custom' ? customShapeWidth : undefined,
                    customShapeHeight: mazeShape === 'custom' ? customShapeHeight : undefined,
                    customWidth: isCustomPageSize ? customWidth : undefined,
                    customHeight: isCustomPageSize ? customHeight : undefined,
                    withBleed,
                    marginPreset,
                    customMargins
                });
            } else if (interiorType === 'sudoku') {
                downloadSudokuPDF({
                    pageSize,
                    pageCount,
                    difficulty: difficulty as SudokuDifficulty,
                    customWidth: isCustomPageSize ? customWidth : undefined,
                    customHeight: isCustomPageSize ? customHeight : undefined,
                    withBleed,
                    marginPreset,
                    customMargins
                });
            } else if (interiorType === 'journal') {
                downloadJournalPDF({
                    pageSize,
                    pageCount,
                    spacing: lineSpacing,
                    customWidth: isCustomPageSize ? customWidth : undefined,
                    customHeight: isCustomPageSize ? customHeight : undefined,
                    withBleed,
                    marginPreset,
                    customMargins
                });
            } else if (interiorType === 'dot-grid') {
                downloadDotGridPDF({
                    pageSize,
                    pageCount,
                    spacing: dotSpacing,
                    customWidth: isCustomPageSize ? customWidth : undefined,
                    customHeight: isCustomPageSize ? customHeight : undefined,
                    withBleed,
                    marginPreset,
                    customMargins
                });
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                {/* Interior Type */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Interior Type</label>
                    <select
                        value={interiorType}
                        onChange={(e) => setInteriorType(e.target.value as InteriorType)}
                        className={styles.select}
                    >
                        <option value="word-search">🔍 Word Search</option>
                        <option value="maze">🌀 Maze</option>
                        <option value="sudoku">🔢 Sudoku</option>
                        <option value="journal">📔 Journal (Lined)</option>
                        <option value="dot-grid">⚫ Dot Grid</option>
                    </select>
                </div>

                {/* Page Size */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Page Size</label>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as PageSize)}
                        className={styles.select}
                    >
                        <option value="8.5x11">8.5" × 11"</option>
                        <option value="8x10">8" × 10"</option>
                        <option value="6x9">6" × 9"</option>
                        <option value="5.5x8.5">5.5" × 8.5"</option>
                        <option value="custom">📏 Custom Size</option>
                    </select>
                </div>

                {/* Custom Page Size Inputs */}
                {isCustomPageSize && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Width (inches)</label>
                            <input
                                type="number"
                                min="4"
                                max="12"
                                step="0.25"
                                value={customWidth}
                                onChange={(e) => {
                                    setCustomWidth(Number(e.target.value));
                                    setCustomPageError('');
                                }}
                                onBlur={validateCustomPageSize}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Height (inches)</label>
                            <input
                                type="number"
                                min="4"
                                max="12"
                                step="0.25"
                                value={customHeight}
                                onChange={(e) => {
                                    setCustomHeight(Number(e.target.value));
                                    setCustomPageError('');
                                }}
                                onBlur={validateCustomPageSize}
                                className={styles.input}
                            />
                        </div>
                    </>
                )}

                {/* Custom Page Size Error */}
                {customPageError && isCustomPageSize && (
                    <div className={styles.formGroupFull}>
                        <div className={styles.warning}>
                            {customPageError}
                        </div>
                    </div>
                )}

                {/* Bleed */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <input
                            type="checkbox"
                            checked={withBleed}
                            onChange={(e) => setWithBleed(e.target.checked)}
                            className={styles.checkbox}
                        />
                        Add Bleed (0.125")
                    </label>
                    <p className={styles.helpText}>Recommended for print-on-demand</p>
                </div>

                {/* Page Margins */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Page Margins</label>
                    <select
                        value={marginPreset}
                        onChange={(e) => setMarginPreset(e.target.value as MarginPreset)}
                        className={styles.select}
                    >
                        <option value="kdp-default">📘 KDP Default (Recommended)</option>
                        <option value="narrow">📏 Narrow</option>
                        <option value="wide">📖 Wide</option>
                        <option value="custom">⚙ Custom</option>
                    </select>
                </div>

                {marginPreset === 'custom' && (
                    <div className={styles.marginInputs}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Inside / Binding (in)</label>
                                <input
                                    type="number"
                                    step="0.125"
                                    min="0.25"
                                    max="2"
                                    value={customMarginInside}
                                    onChange={(e) => setCustomMarginInside(Number(e.target.value))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Outside (in)</label>
                                <input
                                    type="number"
                                    step="0.125"
                                    min="0.25"
                                    max="2"
                                    value={customMarginOutside}
                                    onChange={(e) => setCustomMarginOutside(Number(e.target.value))}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Top (in)</label>
                                <input
                                    type="number"
                                    step="0.125"
                                    min="0.25"
                                    max="2"
                                    value={customMarginTop}
                                    onChange={(e) => setCustomMarginTop(Number(e.target.value))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Bottom (in)</label>
                                <input
                                    type="number"
                                    step="0.125"
                                    min="0.25"
                                    max="2"
                                    value={customMarginBottom}
                                    onChange={(e) => setCustomMarginBottom(Number(e.target.value))}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Count */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Number of Pages</label>
                    <input
                        type="number"
                        min="10"
                        max="200"
                        value={pageCount}
                        onChange={(e) => setPageCount(Number(e.target.value))}
                        className={styles.input}
                    />
                </div>

                {/* Difficulty (for puzzles only) */}
                {isPuzzle && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                            className={styles.select}
                        >
                            <option value="easy">😊 Easy</option>
                            <option value="medium">🤔 Medium</option>
                            <option value="hard">🧠 Hard</option>
                        </select>
                    </div>
                )}

                {/* Maze Shape (for maze only) */}
                {interiorType === 'maze' && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Maze Shape (Outer Boundary)</label>
                            <select
                                value={mazeShape}
                                onChange={(e) => setMazeShape(e.target.value as MazeShape)}
                                className={styles.select}
                            >
                                <option value="square">■ Square</option>
                                <option value="circle">● Circle</option>
                                <option value="rectangle">▭ Rectangle</option>
                                <option value="portrait-rectangle">▯ Portrait Rectangle</option>
                                <option value="landscape-rectangle">▭ Landscape Rectangle</option>
                                <option value="rounded-rectangle">▭ Rounded Rectangle</option>
                                <option value="custom">⚙ Custom Dimensions</option>
                            </select>
                        </div>

                        {mazeShape === 'custom' && (
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Shape Width (cells)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="50"
                                        value={customShapeWidth}
                                        onChange={(e) => setCustomShapeWidth(Number(e.target.value))}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Shape Height (cells)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="50"
                                        value={customShapeHeight}
                                        onChange={(e) => setCustomShapeHeight(Number(e.target.value))}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Theme (for word search only) */}
                {interiorType === 'word-search' && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Theme</label>
                            <select
                                value={theme}
                                onChange={(e) => {
                                    setTheme(e.target.value);
                                    if (e.target.value !== 'custom') {
                                        setCustomTheme('');
                                    }
                                }}
                                className={styles.select}
                                disabled={!!customWords.trim()}
                            >
                                <option value="animals">🐾 Animal</option>
                                <option value="space">🚀 Space</option>
                                <option value="food">🍕 Food</option>
                                <option value="nature">🌿 Nature</option>
                                <option value="custom">✨ Custom Theme</option>
                            </select>
                        </div>

                        {/* Custom Theme Input */}
                        {theme === 'custom' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Theme Name</label>
                                <input
                                    type="text"
                                    value={customTheme}
                                    onChange={(e) => setCustomTheme(e.target.value)}
                                    placeholder="e.g., Sports, Music, Technology"
                                    className={styles.input}
                                />
                            </div>
                        )}

                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>Custom Words (Optional)</label>
                            <textarea
                                value={customWords}
                                onChange={(e) => {
                                    setCustomWords(e.target.value);
                                    // Clear warning when typing
                                    setWordWarning('');
                                }}
                                onBlur={validateCustomWords}
                                placeholder="Enter your own words separated by commas or new lines.&#10;Example: DOG, CAT, BIRD&#10;or one word per line.&#10;&#10;Leave empty to use theme words."
                                className={styles.textarea}
                                rows={4}
                            />
                            {wordWarning && (
                                <div className={wordWarning.startsWith('⚠️') ? styles.warning : styles.info}>
                                    {wordWarning}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Line Spacing (for journal only) */}
                {isJournal && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Line Spacing</label>
                        <select
                            value={lineSpacing}
                            onChange={(e) => setLineSpacing(e.target.value as LineSpacing)}
                            className={styles.select}
                        >
                            <option value="wide">Wide</option>
                            <option value="medium">Medium</option>
                            <option value="narrow">Narrow</option>
                        </select>
                    </div>
                )}

                {/* Dot Spacing (for dot grid only) */}
                {isDotGrid && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Dot Spacing</label>
                        <select
                            value={dotSpacing}
                            onChange={(e) => setDotSpacing(e.target.value as DotSpacing)}
                            className={styles.select}
                        >
                            <option value="5mm">5mm (Standard)</option>
                            <option value="6mm">6mm</option>
                            <option value="8mm">8mm</option>
                        </select>
                    </div>
                )}

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`${styles.generateBtn} ${isGenerating ? styles.generating : ''}`}
                >
                    {isGenerating ? (
                        <>
                            <span className={styles.spinner}></span>
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            📥 Generate & Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* Info Box */}
            <div className={styles.infoBox}>
                <h4>📌 What You'll Get:</h4>
                <ul>
                    <li>✅ KDP-ready PDF with proper dimensions</li>
                    <li>✅ {pageCount} pages of {interiorType.split('-').join(' ')} content</li>
                    <li>✅ Professional quality for publishing</li>
                    <li>✅ Instant download - 100% free!</li>
                </ul>
            </div>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div className={styles.authModal} onClick={() => setShowAuthModal(false)}>
                    <div className={styles.authModalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>🔐 Sign in to Download</h2>
                        <p>Create a free account to generate and download your KDP-ready PDFs</p>
                        <div className={styles.authButtons}>
                            <SignInButton mode="modal">
                                <button className={styles.authPrimaryBtn}>
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className={styles.authSecondaryBtn}>
                                    Create Free Account
                                </button>
                            </SignUpButton>
                        </div>
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className={styles.authCloseBtn}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
