"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./users.module.css";
import Layout from "../components/navBar";

// Componente de listagem de usuários
export default function UsersPage() {
  const { data: session } = useSession();
  
  interface User {
    id: number;
    name: string;
    origem: string;
    email: string;
    create_at: string;
    is_admin: boolean;
    is_active: boolean;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [origem, setOrigem] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Função para buscar usuários da API
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:4002/users`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const data = await res.json();
        setUsers(data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    if (session?.accessToken) {
      fetchUsers();
    }
  }, [page, session]);

  // Função para alternar status de admin
  const toggleAdmin = async (userId: number) => {
    try {
      await fetch(`http://localhost:4002/users/${userId}/admin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_admin: !u.is_admin } : u)));
    } catch (error) {
      console.error("Erro ao alterar status de Admin:", error);
    }
  };

  // Função para alternar status de usuário (Ativar/Desativar)
  const toggleStatus = async (userId: number) => {
    try {
      await fetch(`http://localhost:4002/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)));
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error);
    }
  };

  // Função para abrir o modal de criação de novo usuário
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4002/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ name, email, password, isAdmin, origem }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Usuário criado com sucesso!");
        setUsers([...users, data]);
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
      setNewUserModalOpen(false);
    }
  };

  const handleEditClick = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setOrigem(user.origem);
    setIsAdmin(user.is_admin);
    setNewUserModalOpen(true);
  };

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Usuários Cadastrados</h1>
          <button
            onClick={() => setNewUserModalOpen(true)}
            className={styles.newUserButton}
          >
            Criar Novo Usuário
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Unidade</th>
              <th>Email</th>
              <th>Criado quando</th>
              <th>Admin</th>
              <th>Status</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.origem}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.create_at).toLocaleDateString()}</td>
                  <td>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={user.is_admin}
                        onChange={() => toggleAdmin(user.id)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        onChange={() => toggleStatus(user.id)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditClick(user)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} disabled={p === page}>
              {p}
            </button>
          ))}
        </div>

        {/* Modal de Criação de Novo Usuário */}
        {newUserModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Criar Novo Usuário</h2>
              <form onSubmit={handleCreateUser}>
                <label>Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label>Origem</label>
                <input
                  type="text"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  required
                />
                <label>Administrador?</label>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Criando usuário..." : "Criar Usuário"}
                </button>
                <button type="button" onClick={() => setNewUserModalOpen(false)}>
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
