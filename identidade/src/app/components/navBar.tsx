"use client";

import { useSession, signOut } from "next-auth/react";
import styles from '../home/home.module.css';
import { useState, ReactNode } from "react";
import { useRouter } from 'next/navigation';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCogs, faClipboardList, faUsers, faSignOut } from "@fortawesome/free-solid-svg-icons";


interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(true);
  const router = useRouter();

  if (status === "loading") {
    return <div className={styles.container}>Carregando...</div>;
  }

  if (!session) {
    router.push('/login'); // Redireciona para login se não estiver autenticado
    return null;
  }

  return (
    <div className={styles.dashboard}>
      {/* Botão de alternar menu - fixo para ser sempre visível */}
      <button onClick={() => setMenuOpen(!menuOpen)} className={styles.menuToggle}>
        ☰
      </button>

      {/* Menu Lateral */}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : styles.closed}`}>
        <nav className={styles.nav}>
          <ul>
            <li><a onClick={() => router.push('/home')}>
            <FontAwesomeIcon icon={faHome} className={styles.icon} />
            {menuOpen && <span>Home</span>}
            </a></li>

            <li><a onClick={() => router.push('/applications')}>
            <FontAwesomeIcon icon={faCogs} className={styles.icon} />
            {menuOpen && <span>Aplicações</span>}
            </a></li>
            <li><a onClick={() => router.push('/logs')}>
            <FontAwesomeIcon icon={faClipboardList} className={styles.icon} />
            {menuOpen && <span>Logs</span>}
            </a></li>
            <li><a onClick={() => router.push('/users')}>
            <FontAwesomeIcon icon={faUsers} className={styles.icon} />
            {menuOpen && <span>Usuários</span>}
            </a></li>
          </ul>
        </nav>
        <div className={styles.logoutContainer}>
          <button onClick={() => signOut()} className={styles.logoutButton}>
            <FontAwesomeIcon icon={faSignOut} className={styles.icon} />
          </button>
        </div>
      </aside>

      {/* Painel Principal */}
      <main className={styles.main}>
        <header className={styles.header}>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
