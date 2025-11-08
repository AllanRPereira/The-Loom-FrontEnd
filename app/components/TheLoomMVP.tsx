"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useDisconnect } from 'wagmi';
import ProjectStats from './ProjectStats';
import CreateProject from './CreateProject';
import ProjectList from './ProjectList';

// Types simples
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
  cloud_link?: string;
  script_path?: string;
  external_links?: string[];
  attachment_info?: string;
}

interface CreateProjectData {
  title: string;
  description: string;
  type: 'IA' | 'GRAFICA';
  price: number;
  wallet_address: string;
  cloud_link: string;
  external_links?: string[];
  attachment_info?: string;
}

// Hook para buscar projetos
const fetchProjects = async (): Promise<{ success: boolean; projects: Project[] }> => {
  const response = await fetch('/api/projects');
  if (!response.ok) throw new Error('Erro ao carregar projetos');
  return response.json();
};

// Hook para criar projeto
// Hook para criar projeto (ATUALIZADO PARA FORMDATA)
const createProject = async ({ payload, file }: { payload: CreateProjectData, file: File | null }) => {
  const formData = new FormData();

  // Adiciona todos os campos de texto
  Object.keys(payload).forEach(key => {
    formData.append(key, (payload as any)[key]);
  });

  // Adiciona o arquivo se ele existir
  if (file) {
    formData.append('script_file', file, file.name);
  }

  const response = await fetch('/api/projects', {
    method: 'POST',
    // NÃO defina Content-Type, o browser faz isso por você com FormData
    body: formData, 
  });
  if (!response.ok) throw new Error('Erro ao criar projeto');
  return response.json();
};

// Hook para atualizar projeto
const updateProject = async ({ id, data }: { id: number; data: Partial<Project> }) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar projeto');
  return response.json();
};

// Hook para deletar projeto
const deleteProject = async (id: number) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao deletar projeto');
  return response.json();
};

export default function TheLoomMVP() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    type: 'IA',
    price: 0,
    wallet_address: '',
    cloud_link: '',
    external_links: [],
    attachment_info: ''
  });

  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  // Guarda interval IDs para evitar leaks quando navegar fora do componente
  const intervalsRef = useRef<Record<number, number>>({});

  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach((id) => clearInterval(id));
      intervalsRef.current = {};
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: createProject, // Agora usa a função de FormData
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      // Limpa o formulário com o campo novo
      setFormData({ title: '', description: '', type: 'IA', price: 0, wallet_address: '', cloud_link: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      wallet_address: address || '',
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: dataToSend });
    } else {
      // Pass both payload and file as required by the createProject function
      createMutation.mutate({ payload: dataToSend, file: null });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    // ATUALIZADO para incluir cloud_link
    setFormData({
      title: project.title,
      description: project.description,
      type: project.type,
      price: project.price,
      wallet_address: project.wallet_address,
      cloud_link: project.cloud_link || '', // Adicionado
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este projeto?')) {
      deleteMutation.mutate(id);
    }
  };

  const startProject = (project: Project) => {
    if (project.status === 'PENDING') {
      // Evita closure sobre project.progress usando variável local
      let progress = typeof project.progress === 'number' ? project.progress : 0;
      const projId = project.id;

      // dispara estado WORKING imediatamente
      updateMutation.mutate({ id: projId, data: { status: 'WORKING', progress } });

      const intervalId = window.setInterval(() => {
        progress = Math.min(progress + 10, 100);

        updateMutation.mutate({
          id: projId,
          data: {
            status: progress >= 100 ? 'COMPLETED' : 'WORKING',
            progress
          }
        });

        if (progress >= 100) {
          clearInterval(intervalsRef.current[projId]);
          delete intervalsRef.current[projId];
        }
      }, 2000);

      intervalsRef.current[projId] = intervalId as unknown as number;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'WORKING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'IA' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">🚀 Carregando The Loom...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-red-600">❌ Erro ao carregar projetos</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... (Header) ... */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <ProjectStats projects={data?.projects || []} />

        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={() => {
              setEditingProject(null);
              // Reset form data with all fields
              setFormData({
                title: '',
                description: '',
                type: 'IA',
                price: 0,
                wallet_address: '',
                cloud_link: '',
                external_links: [],
                attachment_info: ''
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ➕ Novo Projeto
          </button>
        </div>

        <ProjectList
          projects={data?.projects || []}
          onEdit={handleEdit}
          onStart={startProject}
          onDelete={handleDelete}
        />
      </main>

      {/* Modal with extracted CreateProject component */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <CreateProject
            initial={editingProject || undefined}
            onCancel={() => setIsModalOpen(false)}
            
            // --- ESTA É A MUDANÇA PRINCIPAL ---
            // O onSubmit agora passa (payload, file)
            onSubmit={(payload, file) => {
              const dataToSend = { ...payload, wallet_address: payload.wallet_address || address || '' };
              if (editingProject) {
                // (Nota: a edição de arquivo é mais complexa, focando na criação por enquanto)
                updateMutation.mutate({ id: editingProject.id, data: dataToSend });
              } else {
                // Envia o payload E o file para a mutação
                createMutation.mutate({ payload: dataToSend, file });
              }
            }}
            // --- FIM DA MUDANÇA ---

            loading={createMutation.isPending || updateMutation.isPending}
            isEditing={!!editingProject}
          />
        </div>
      )}
    </div>
  );
}