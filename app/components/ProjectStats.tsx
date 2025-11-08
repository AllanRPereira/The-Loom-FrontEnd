"use client";

import React from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  type: 'IA' | 'GRAFICA';
  price: number;
  wallet_address: string;
  status: 'PENDING' | 'WORKING' | 'COMPLETED';
  progress: number;
  created_at: string;
}

export default function ProjectStats({ projects }: { projects: Project[] }) {
  const total = projects?.length || 0;
  const working = projects?.filter((p) => p.status === 'WORKING').length || 0;
  const completed = projects?.filter((p) => p.status === 'COMPLETED').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total de Projetos</h3>
        <p className="text-3xl font-bold text-blue-600">{total}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Projetos Ativos</h3>
        <p className="text-3xl font-bold text-yellow-600">{working}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Concluídos</h3>
        <p className="text-3xl font-bold text-green-600">{completed}</p>
      </div>
    </div>
  );
}
