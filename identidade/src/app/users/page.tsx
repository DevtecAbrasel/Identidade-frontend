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

  const [users, setUsers] = useState<User[]>([]); // Lista de usuários
  const [page, setPage] = useState(1); // Página atual para paginação
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Usuário selecionado para edição
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado do modal de edição

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
        console.log("data do users: ", data);
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
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
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
        console.log("users: ", users);
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
        console.log("users: ", users);
      } catch (error) {
        console.error("Erro ao alterar status do usuário:", error);
      }
    }
  };

  return (
    <Layout>
    <div className={styles.dashboard}>

      <h1>Usuários Cadastrados</h1>
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
          {(users && users.length > 0 )? (users.map((user: User) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.origem}</td>
              <td>{user.email}</td>
              <td>{new Date(user.create_at).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => toggleAdmin(user.id)}
                  className={user.is_admin ? styles.activeButton : styles.inactiveButton}
                >
                  {user.is_admin ? "Desativar Admin" : "Ativar Admin"}
                </button>
              </td>
              <td>
                <button
                  onClick={() => toggleStatus(user.id)}
                  className={user.is_active ? styles.activeButton : styles.inactiveButton}
                >
                  {user.is_active ? "Ativo" : "Inativo"}
                </button>
              </td>
              <td>
                <button onClick={() => handleEditClick(user)} className={styles.editButton}>
                  Editar
                </button>
              </td>
            </tr>
          ))) : (
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

      {/* Modal de edição */}
      {isModalOpen && selectedUser && (
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
              <button onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>   
  </Layout>
  );
}
