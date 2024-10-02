"use client";
import { useState } from 'react';
import { signIn } from "next-auth/react";
import styles from './login.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.ok) {
      // Redireciona para a home após login bem-sucedido
      window.location.href = "/home";
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className={styles.container}>
      {/* Caixa de Login */}
      <div className={styles.loginBox}>
        <div className={styles.welcome}>
          <h1>Identidade</h1>
          <p>Faça login para continuar</p>
        </div>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" placeholder="Coloque seu E-mail" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" name="password" placeholder="Coloque sua senha" required />
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? <FontAwesomeIcon icon={(faSpinner)} className={styles.icon}></FontAwesomeIcon> : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
