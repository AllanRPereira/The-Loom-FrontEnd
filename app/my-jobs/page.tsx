"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { CustomConnectButton } from '../components/ConnectButton';
import Link from 'next/link';
import MainSection from '../components/MainSection';
import '../styles/my-jobs.css';
import '../styles/home.css';

export default function MyJobsPage() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Projects fetched from backend filtered by connected wallet
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isConnected || !address) {
        setProjects([]);
        return;
      }
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        const all = Array.isArray(data.projects) ? data.projects : [];
        const filtered = all.filter((p: any) => {
          // Compare wallet addresses case-insensitive; allow empty/null guard
          const pAddr = (p.wallet_address || '').toString().toLowerCase();
          const me = (address || '').toString().toLowerCase();
          return pAddr && me && pAddr === me;
        });

        setProjects(filtered);
      } catch (err: any) {
        console.error('Error loading projects for my-jobs:', err);
        setProjectsError(err.message || 'Erro ao carregar projetos');
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    }

    load();
    return () => { mounted = false };
  }, [isConnected, address]);

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    if (!confirm(`Tem certeza que deseja deletar o projeto "${selectedProject.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao deletar projeto');

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setSelectedProject(null);
      alert('Projeto deletado com sucesso!');
    } catch (err: any) {
      console.error('Error deleting project:', err);
      alert(err.message || 'Erro ao deletar projeto');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente',
      'WORKING': 'Em Progresso',
      'COMPLETED': 'Completo'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': '#ff9800',
      'WORKING': '#2196f3',
      'COMPLETED': '#4caf50'
    };
    return colors[status] || '#666';
  };

  // Filter projects based on active tab
  const filteredProjects = projects.filter((project) => {
    if (activeTab === 'all') return true;
    
    if (activeTab === 'active') {
      return project.status === 'PENDING';
    }
    
    if (activeTab === 'complete') {
      return project.status === 'COMPLETED';
    }
    
    if (activeTab === 'pending') {
      return project.status === 'WORKING';
    }
    
    return true;
  });

  // If user is not connected, show a friendly CTA to connect the wallet
  if (!isConnected) {
    return (
      <div className="my-jobs-page">
        <MainSection />

        <main className="my-jobs-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', padding: '2rem', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Conecte sua carteira para ver seus projetos</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Acesse suas tarefas, crie novos jobs e veja o progresso.</p>
            <CustomConnectButton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="my-jobs-page">
      <MainSection />

      {/* Menu Toggle para Mobile */}
      <button 
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Overlay para Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="my-jobs-container">
        {/* Sidebar */}
        <aside className={`my-jobs-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Avatar */}
          <div className="sidebar-avatar"></div>

          {/* Navegação */}
          <nav className="sidebar-nav">
            <a href="/my-jobs" className="sidebar-nav-item active">
              My Projects
            </a>
            <a href="/hardware" className="sidebar-nav-item">
              Hardware
            </a>
            <a href="/notifications" className="sidebar-nav-item">
              Notifications
            </a>
            <a href="/settings" className="sidebar-nav-item">
              Settings
            </a>
          </nav>

          {/* Log out */}
          <div className="sidebar-logout">
            <button className="logout-btn">Log out</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="my-jobs-main">
          <div className="projects-header">
            <h1 className="projects-title">
              Projects {filteredProjects.length !== projects.length && `(${filteredProjects.length} of ${projects.length})`}
            </h1>

            <div className="projects-controls">
              {/* Tabs */}
              <div className="projects-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All projects
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'complete' ? 'active' : ''}`}
                  onClick={() => setActiveTab('complete')}
                >
                  Complete
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                </button>
              </div>

              {/* Create Job Button */}
              <Link href="/my-jobs/create-a-job" className="create-job-btn">
                Create Job
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid">
            {loadingProjects ? (
              <div style={{ padding: 20 }}>Loading projects...</div>
            ) : projectsError ? (
              <div style={{ padding: 20, color: 'red' }}>Erro: {projectsError}</div>
            ) : projects.length === 0 ? (
              <div className="no-projects-cta">
                  <h3>No project found!</h3>
                  <p>You haven't created any projects with this wallet yet.</p>
                  <Link href="/my-jobs/create-a-job" className="create-job-btn">Create Job</Link>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="no-projects-cta">
                  <h3>No {activeTab} projects found!</h3>
                  <p>You don't have any projects with this status.</p>
                  <button 
                    onClick={() => setActiveTab('all')}
                    className="create-job-btn"
                  >
                    View All Projects
                  </button>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="project-image"></div>
                  <div className="project-info">
                    <h3 className="project-card-title">{project.title}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedProject.title}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedProject(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Status Badge */}
              <div className="modal-section">
                <div 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(selectedProject.status),
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  {getStatusLabel(selectedProject.status)}
                </div>
              </div>

              {/* Description */}
              <div className="modal-section">
                    <h3 className="modal-section-title">Description</h3>
                <p className="modal-text">{selectedProject.description || 'No description'}</p>
              </div>

              {/* Type and Price */}
              <div className="modal-section modal-grid">
                <div>
                  <h3 className="modal-section-title">Type</h3>
                  <p className="modal-text">{selectedProject.type}</p>
                </div>
                <div>
                  <h3 className="modal-section-title">Budget</h3>
                  <p className="modal-text">${selectedProject.price} ETH</p>
                </div>
              </div>

              {/* Progress */}
              {selectedProject.status === 'WORKING' && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Working</h3>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="modal-text" style={{ marginTop: '8px', fontSize: '14px' }}>
                    {selectedProject.progress || 0}% Complete
                  </p>
                </div>
              )}

              {/* Hardware Requirements */}
              {(selectedProject.cpu || selectedProject.gpu) && (
                <div className="modal-section">
                    <h3 className="modal-section-title">Hardware Requirements</h3>
                  <div className="requirements-tags">
                    {selectedProject.cpu === 1 && <span className="req-tag">CPU</span>}
                    {selectedProject.gpu === 1 && <span className="req-tag">GPU</span>}
                    {selectedProject.ram && <span className="req-tag">RAM: {selectedProject.ram}GB</span>}
                    {selectedProject.vram && <span className="req-tag">VRAM: {selectedProject.vram}GB</span>}
                  </div>
                </div>
              )}

              {/* Software Requirements */}
              {(selectedProject.vray || selectedProject.blender || selectedProject.python || 
                selectedProject.openfoam || selectedProject.bullet || selectedProject.octane ||
                selectedProject.autoDesk3DMax || selectedProject.zbrush || selectedProject.compileProject) && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Software</h3>
                  <div className="requirements-tags">
                    {selectedProject.vray === 1 && <span className="req-tag">V-Ray</span>}
                    {selectedProject.blender === 1 && <span className="req-tag">Blender</span>}
                    {selectedProject.python === 1 && <span className="req-tag">Python</span>}
                    {selectedProject.openfoam === 1 && <span className="req-tag">OpenFOAM</span>}
                    {selectedProject.bullet === 1 && <span className="req-tag">Bullet</span>}
                    {selectedProject.octane === 1 && <span className="req-tag">Octane</span>}
                    {selectedProject.autoDesk3DMax === 1 && <span className="req-tag">3D Max</span>}
                    {selectedProject.zbrush === 1 && <span className="req-tag">ZBrush</span>}
                    {selectedProject.compileProject === 1 && <span className="req-tag">Compile</span>}
                  </div>
                </div>
              )}

              {/* Links */}
              {selectedProject.cloud_link && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Assets Link</h3>
                  <a 
                    href={selectedProject.cloud_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="modal-link"
                  >
                    {selectedProject.cloud_link}
                  </a>
                </div>
              )}

              {/* Script File */}
              {selectedProject.script_path && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Script File</h3>
                  <a 
                    href={selectedProject.script_path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="modal-link"
                  >
                    Download Script
                  </a>
                </div>
              )}

              {/* Created Date */}
              <div className="modal-section">
                <h3 className="modal-section-title">Created At</h3>
                <p className="modal-text">
                  {new Date(selectedProject.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-delete-project"
                onClick={handleDeleteProject}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
              <button 
                className="btn-close-modal"
                onClick={() => setSelectedProject(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}