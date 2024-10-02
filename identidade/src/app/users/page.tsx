"use client";

import { useState, useEffect, FormEvent } from "react";
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

  const [users, setUsers] = useState<User[]>([]); // Lista de usuários
  const [page, setPage] = useState(1); // Página atual para paginação
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Estado do modal de criação
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado do modal de edição
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Estado do usuário selecionado para edição

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

  // Função para abrir o modal de edição
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Função para fechar o modal de edição
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Função para alternar status de admin
  const toggleAdmin = async (userId: number) => {
    const confirmed = confirm("Você deseja alterar o status de Admin?");
    if (confirmed) {
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
    }
  };

  // Função para alternar status de usuário (Ativar/Desativar)
  const toggleStatus = async (userId: number) => {
    const confirmed = confirm("Você deseja alterar o status do usuário?");
    if (confirmed) {
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
    }
  };

  const [name, setName] = useState(""); // Estado para o nome do novo usuário
  const [email, setEmail] = useState(""); // Estado para o email do novo usuário
  const [password, setPassword] = useState(""); // Estado para a senha do novo usuário
  const [origem, setOrigem] = useState(""); // Estado para a origem do novo usuário
  const [isAdmin, setIsAdmin] = useState(false); // Estado para o status de admin do novo usuário

  // Função para criar um novo usuário
  async function handleCreateUser(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    try {
      const res = await fetch(`http://localhost:4002/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          origem,
          is_admin: isAdmin,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar usuário");
      }

      const newUser = await res.json();
      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setOrigem("");
      setIsAdmin(false);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  }

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Usuários Cadastrados</h1>
          <button onClick={() => setIsCreateModalOpen(true)} className={styles.createButton}>
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
            {users && users.length > 0 ? (
              users.map((user: User) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.origem}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.create_at).toLocaleDateString()}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={user.is_admin}
                        onChange={() => toggleAdmin(user.id)}
                      />
                      <span className={`${styles.slider} ${styles.round}`}></span>
                    </label>
                  </td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        onChange={() => toggleStatus(user.id)}
                      />
                      <span className={`${styles.slider} ${styles.round}`}></span>
                    </label>
                  </td>
                  <td>
                    <button className={styles.editButton} onClick={() => handleEditClick(user)}>Editar</button>
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
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} disabled={p === page}>
              {p}
            </button>
          ))}
        </div>

        {/* Modal de Edição */}
        {isEditModalOpen && selectedUser && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Editar Usuário</h2>
              <form>
                <label>Nome</label>
                <input type="text" defaultValue={selectedUser.name} />
                <label>Email</label>
                <input type="email" defaultValue={selectedUser.email} />
                <label>Origem</label>
                <input type="text" defaultValue={selectedUser.origem} />
                <label>Status</label>
                <input type="checkbox" defaultChecked={selectedUser.is_active} />
                <label>Admin</label>
                <input type="checkbox" defaultChecked={selectedUser.is_admin} />
                <label>Senha</label>
                <input type="password" />
                <label>Confirmar Senha</label>
                <input type="password" />
                <button type="submit">Salvar</button>
                <button onClick={closeEditModal}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Criação */}
        {isCreateModalOpen && (
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
                <button type="submit">Criar</button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)}>
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
