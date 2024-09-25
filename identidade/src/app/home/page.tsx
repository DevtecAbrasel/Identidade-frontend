"use client";

import { useSession, signOut } from "next-auth/react";
import styles from './home.module.css';
import { useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(true); // Estado para controlar o menu lateral
  const [showPopup, setShowPopup] = useState(false); // Estado para mostrar o popup
  const [loadingLogout, setLoadingLogout] = useState(false); // Estado para o carregamento do logout

  if (status === "loading") {
    return <div className={styles.container}>Carregando...</div>;
  }

  if (!session) {
    return <div className={styles.container}>Você não está autenticado. Faça login.</div>;
  }

  // Função para confirmar logout
  const handleLogout = async () => {
    setLoadingLogout(true);
    await signOut({ redirect: false }); // Evita o redirecionamento automático
    setLoadingLogout(false);
    window.location.href = '/login'; // Redireciona para a página de login
  };

  return (
    <div className={styles.dashboard}>
      {/* Menu Lateral */}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : styles.closed}`}>

        <nav className={styles.nav}>
          <ul>
            <li><a href="/users">Dashboard</a></li>
            <li><a href="/create-user">Usuários</a></li>
            <li><a href="/applications">Aplicações</a></li>
            <li><a href="/logs">Logs de Usuários</a></li>
            <li><a href="#">Configurações</a></li>
          </ul>
        </nav>
        <div className={styles.logoutContainer}>
          <button onClick={() => setShowPopup(true)} className={styles.logoutButton}>Sair</button>
        </div>
      </aside>

      {/* Painel Principal */}
      <main className={styles.main}>
        <header className={styles.header}>
          <button onClick={() => setMenuOpen(!menuOpen)} className={styles.menuToggle}>
            ☰
          </button>
          <h1>Dashboard</h1>
        </header>

        <section className={styles.cards}>
          <div className={styles.card}>
            <h3>Total de Usuários</h3>
            <p>1000</p>
          </div>
          <div className={styles.card}>
            <h3>Aplicações mais acessadas</h3>
            {/* Aqui entraria o gráfico */}
            <div className={styles.barChart}></div>
          </div>
          <div className={styles.card}>
            <h3>Acessos Recentes</h3>
            <ul>
              <li>Usuário 1 acessou Aplicação 1</li>
              <li>Usuário 2 acessou Aplicação 2</li>
              <li>Usuário 3 acessou Aplicação 3</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Popup de Confirmação de Logout */}
      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>Confirmar Logout</h2>
            <p>Tem certeza de que deseja sair?</p>
            <div className={styles.popupActions}>
              <button onClick={handleLogout} className={styles.confirmButton}>
                {loadingLogout ? "Saindo..." : "Confirmar"}
              </button>
              <button onClick={() => setShowPopup(false)} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
