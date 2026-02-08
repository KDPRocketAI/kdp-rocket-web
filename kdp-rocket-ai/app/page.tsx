import styles from './page.module.css';
import BookIdeaGenerator from '@/components/BookIdeaGenerator';
import InteriorGenerator from '@/components/InteriorGenerator';
import Header from '@/components/Header';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container">
        {/* Book Idea Generator Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>✨ Generate Book Ideas</h2>
            <p>Get instant book ideas with titles, subtitles, and descriptions</p>
          </div>
          <BookIdeaGenerator />
        </section>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Interior Generator Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>🎨 Generate KDP Interiors</h2>
            <p>Create professional KDP-ready PDFs for your books</p>
          </div>
          <InteriorGenerator />
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>Built with ❤️ for KDP Publishers • 100% Free • No Login Required</p>
        </footer>
      </div>
    </main>
  );
}
