'use client';

import { useState } from 'react';
import styles from './BookIdeaCard.module.css';
import { BookIdea } from '@/lib/book-ideas';

interface BookIdeaCardProps {
    idea: BookIdea;
}

export default function BookIdeaCard({ idea }: BookIdeaCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = `Title: ${idea.title}\n\nSubtitle: ${idea.subtitle}\n\nDescription: ${idea.description}\n\nStructure: ${idea.structure}\n\nPage Count: ${idea.pageCountRecommendation}${idea.difficulty ? `\n\nDifficulty: ${idea.difficulty}` : ''}`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{idea.title}</h3>
                <button
                    onClick={handleCopy}
                    className={styles.copyBtn}
                    title="Copy to clipboard"
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Subtitle</h4>
                    <p className={styles.text}>{idea.subtitle}</p>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Description</h4>
                    <p className={styles.text}>{idea.description}</p>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Interior Structure</h4>
                    <p className={styles.text}>{idea.structure}</p>
                </div>

                <div className={styles.footer}>
                    <div className={styles.badge}>
                        <span className={styles.badgeLabel}>Page Count:</span>
                        <span className={styles.badgeValue}>{idea.pageCountRecommendation}</span>
                    </div>
                    {idea.difficulty && (
                        <div className={styles.badge}>
                            <span className={styles.badgeLabel}>Difficulty:</span>
                            <span className={styles.badgeValue}>{idea.difficulty}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
