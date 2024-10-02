// src/app/home/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/navBar';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HomePage() {
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  useEffect(() => {
    // Função para buscar dados de usuários da API
    const fetchUserStats = async () => {
      try {
        const res = await fetch('http://localhost:4002/users/count', {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const data = await res.json();
        setUserStats({
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          inactiveUsers: data.inactiveUsers,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas de usuários:', error);
      }
    };

    if (session?.accessToken) {
      fetchUserStats();
    }
  }, [session]);

  // Verifica se está carregando ou se o usuário não está autenticado
  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return <div>Você não está autenticado. Faça login.</div>;
  }

  // Dados para o gráfico de total de usuários


  // Dados para o gráfico de ativos e inativos
  const activeInactiveData = {
    labels: ['Ativos', 'Inativos'],
    datasets: [
      {
        label: 'Status dos Usuários',
        data: [userStats.activeUsers, userStats.inactiveUsers],
        backgroundColor: ['#28a745', '#dc3545'],
      },
    ],
  };

  return (
    <Layout>
      <div>
        <h2>Bem-vindo ao Dashboard</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>

          {/* Gráfico de usuários ativos e inativos */}
          <div style={{ width: '20%' }}>
            <h3>Usuários Ativos/Inativo</h3>
            <Pie data={activeInactiveData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
