'use client';

import { useState } from 'react';
import styles from './BookIdeaGenerator.module.css';
import {
    generateBookIdea,
    BOOK_TYPE_LABELS,
    AUDIENCE_LABELS,
    THEME_LABELS,
    BookType,
    Audience,
    Theme,
    BookIdea
} from '@/lib/book-ideas';
import BookIdeaCard from './BookIdeaCard';

export default function BookIdeaGenerator() {
    const [bookType, setBookType] = useState<BookType>('word-search');
    const [audience, setAudience] = useState<Audience>('kids-6-8');
    const [theme, setTheme] = useState<Theme>('animals');
    const [generatedIdea, setGeneratedIdea] = useState<BookIdea | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);

        // Simulate a brief loading state for better UX
        setTimeout(() => {
            const idea = generateBookIdea(bookType, audience, theme);
            setGeneratedIdea(idea);
            setIsGenerating(false);
        }, 600);
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                {/* Book Type Selector */}
                <div className={styles.formGroup}>
                    <label htmlFor="bookType" className={styles.label}>
                        Book Type
                    </label>
                    <select
                        id="bookType"
                        value={bookType}
                        onChange={(e) => setBookType(e.target.value as BookType)}
                        className={styles.select}
                    >
                        {Object.entries(BOOK_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Audience Selector */}
                <div className={styles.formGroup}>
                    <label htmlFor="audience" className={styles.label}>
                        Target Audience
                    </label>
                    <select
                        id="audience"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as Audience)}
                        className={styles.select}
                    >
                        {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Theme Selector */}
                <div className={styles.formGroup}>
                    <label htmlFor="theme" className={styles.label}>
                        Theme
                    </label>
                    <select
                        id="theme"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as Theme)}
                        className={styles.select}
                    >
                        {Object.entries(THEME_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`${styles.generateBtn} ${isGenerating ? styles.generating : ''}`}
                >
                    {isGenerating ? (
                        <>
                            <span className={styles.spinner}></span>
                            Generating...
                        </>
                    ) : (
                        <>
                            ✨ Generate Book Idea
                        </>
                    )}
                </button>
            </div>

            {/* Results */}
            {generatedIdea && (
                <div className={styles.results}>
                    <BookIdeaCard idea={generatedIdea} />
                </div>
            )}
        </div>
    );
}
