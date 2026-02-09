'use client';

import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    const { isSignedIn, user } = useUser();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoRocket}>🚀</span>
                    <span className={styles.logoText}>KDP Rocket AI</span>
                </Link>

                <div className={styles.authButtons}>
                    {!isSignedIn ? (
                        <>
                            <SignInButton mode="modal">
                                <button className={styles.signInBtn}>Sign In</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className={styles.signUpBtn}>Sign Up</button>
                            </SignUpButton>
                        </>
                    ) : (
                        <div className={styles.userMenu}>
                            <span className={styles.welcomeText}>
                                Welcome, {user?.firstName || 'User'}!
                            </span>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
