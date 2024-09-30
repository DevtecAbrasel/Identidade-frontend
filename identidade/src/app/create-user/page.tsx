"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./createuser.module.css";
import Layout from "../components/navBar";

export default function CreateUser() {
  const { data: session } = useSession(); // Obtemos o token da sessão do NextAuth
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [origem, setOrigem] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Verificação se o usuário é admin
  if (!session || !session.user?.is_admin) {
    return <p>Você não tem permissão para acessar essa página.</p>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4002/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`, // Incluímos o token no header
        },
        body: JSON.stringify({ name, email, password, isAdmin, origem }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Usuário criado com sucesso!");
        setName("");
        setEmail("");
        setPassword("");
        setIsAdmin(false);
        setOrigem("");
      } else {
        setMessage(`Erro ao criar usuário: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Erro na requisição: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className={styles.dashboard}>
      ...
        <h1>Criar Novo Usuário</h1>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="origem">Origem</label>
            <input
              type="text"
              id="origem"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label htmlFor="isAdmin">Administrador?</label>
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className={styles.checkbox}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Criando usuário..." : "Criar Usuário"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>
      </div>

</Layout>
);
}
