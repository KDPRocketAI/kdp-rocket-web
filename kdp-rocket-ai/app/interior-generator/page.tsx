import InteriorGenerator from '@/components/InteriorGenerator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Interior Generator | KDP Rocket AI',
    description: 'Generate KDP-ready interior PDFs for word search, maze, sudoku, journal, and dot grid books.',
};

export default function InteriorGeneratorPage() {
    return (
        <main style={{ minHeight: '100vh', padding: '2rem 0' }}>
            <InteriorGenerator />
        </main>
    );
}
