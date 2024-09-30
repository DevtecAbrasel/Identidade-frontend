"use client";

import { useSession, signOut } from "next-auth/react";
import styles from '../home/home.module.css';
import { useState, ReactNode } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
        <div className={styles.profile}>
          <Image
            src="/profile.jpg"
            alt="Profile Picture"
            width={100}
            height={100}
            className={styles.profilePic}
          />
          <h3>{session.user?.name}</h3>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li><a onClick={() => router.push('/home')}>Home</a></li>
            <li><a onClick={() => router.push('/create-user')}>Criação de usuário</a></li>
            <li><a onClick={() => router.push('/applications')}>Aplicações</a></li>
            <li><a onClick={() => router.push('/logs')}>Logs de usuários</a></li>
            <li><a onClick={() => router.push('/users')}>Gerenciamento de usuário</a></li>
          </ul>
        </nav>
        <div className={styles.logoutContainer}>
          <button onClick={() => signOut()} className={styles.logoutButton}>Sair</button>
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
