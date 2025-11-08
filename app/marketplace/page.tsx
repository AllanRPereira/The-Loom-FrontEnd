"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; 
import MainSection from '../components/MainSection';
import '../styles/marketplace.css';
import '../styles/home.css';

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [minEth, setMinEth] = useState('')
  const [maxEth, setMaxEth] = useState('')
  const [cpuChecked, setCpuChecked] = useState(false)
  const [gpuChecked, setGpuChecked] = useState(false)

  // Função para resetar todos os filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinEth('');
    setMaxEth('');
    setCpuChecked(false);
    setGpuChecked(false);
  };

  const categories = [
    'All',
    'AI / Machine Learning',
    '3D Rendering',
    'Physics Simulation',
    'Video Processing'
  ]

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para filtrar jobs
  const filteredJobs = jobs.filter((job) => {
    // Filtro de busca por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.tags.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro de categoria
    if (selectedCategory !== 'All') {
      const jobType = job.raw?.type || '';
      const categoryMap: Record<string, string[]> = {
        'AI / Machine Learning': ['AI', 'ML', 'Machine Learning', 'Neural Network'],
        '3D Rendering': ['3D', 'Rendering', 'Blender', 'Maya', '3ds Max'],
        'Physics Simulation': ['Physics', 'Simulation', 'Bullet', 'OpenFOAM'],
        'Video Processing': ['Video', 'Encoding', 'Processing', 'FFmpeg']
      };

      const categoryKeywords = categoryMap[selectedCategory] || [];
      const matchesCategory = categoryKeywords.some(keyword => 
        jobType.toLowerCase().includes(keyword.toLowerCase()) ||
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!matchesCategory) return false;
    }

    // Filtro de preço (ETH/valor)
    if (minEth || maxEth) {
      const priceString = job.price.replace(/[^0-9.]/g, ''); // Remove símbolos
      const jobPrice = parseFloat(priceString) || 0;

      if (minEth) {
        const minPrice = parseFloat(minEth);
        if (!isNaN(minPrice) && jobPrice < minPrice) return false;
      }

      if (maxEth) {
        const maxPrice = parseFloat(maxEth);
        if (!isNaN(maxPrice) && jobPrice > maxPrice) return false;
      }
    }

    // Filtro de CPU
    if (cpuChecked && !job.raw?.cpu) {
      return false;
    }

    // Filtro de GPU
    if (gpuChecked && !job.raw?.gpu) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        if (data && data.success && Array.isArray(data.projects)) {
          // Map backend project shape to UI-friendly shape
          const mapped = data.projects.map((p: any) => ({
            id: p.id,
            title: p.title || 'Untitled project',
            description: p.description || '',
            tags: Array.isArray(p.external_links) ? p.external_links.join(' | ') : p.type || '',
            price: typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : (p.price || '$0.00'),
            posted: p.created_at ? `Posted ${new Date(p.created_at).toLocaleString()}` : 'Posted recently',
            wallet_address: p.wallet_address, // Include wallet_address for job creator check
            wallet_address_secondary: p.wallet_address_secondary || '', // secondary address if any
            raw: p
          }));

          setJobs(mapped);
        } else if (data && data.success && data.project) {
          // single inserted project
          setJobs([data.project]);
        } else {
          setJobs([]);
        }
      } catch (err: any) {
        console.error('Failed to load projects', err);
        setError(err.message || 'Erro ao carregar projetos');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProjects();
    return () => { mounted = false };
  }, []);

  return (
    <div className="marketplace-page">
      {/* Header */}
      <MainSection />

      <div className="marketplace-container">
        <div className="content-wrapper">
          {/* Sidebar com Filtros */}
          <aside className="sidebar">
            <div className="filter-section">
              <h3 className="filter-title">Project Categories</h3>
              <div className="categories-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider"></div>

            <div className="filter-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="filter-title" style={{ marginBottom: 0 }}>Filters</h3>
                <button 
                  onClick={resetFilters}
                  className="reset-filters-btn"
                  title="Reset all filters"
                >
                  Clear
                </button>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">Reward</label>
                <div className="eth-inputs">
                  <input
                    type="text"
                    placeholder="Min ETH"
                    className="eth-input"
                    value={minEth}
                    onChange={(e) => setMinEth(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Max ETH"
                    className="eth-input"
                    value={maxEth}
                    onChange={(e) => setMaxEth(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={cpuChecked}
                      onChange={(e) => setCpuChecked(e.target.checked)}
                    />
                    <span>CPU</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={gpuChecked}
                      onChange={(e) => setGpuChecked(e.target.checked)}
                    />
                    <span>GPU</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Search Bar */}
            <div className="search-section">
              <div className="search-bar">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search keywords"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Jobs Title */}
            <h2 className="jobs-title">
              Available Jobs {filteredJobs.length !== jobs.length && `(${filteredJobs.length} of ${jobs.length})`}
            </h2>

            {/* Jobs List */}
            {loading ? (
              <div className="loading-message">Loading jobs...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : filteredJobs.length === 0 ? (
              <div className="no-jobs-message">
                {jobs.length === 0 
                  ? 'No jobs available at the moment.' 
                  : 'No jobs match your filters. Try adjusting your search criteria.'}
              </div>
            ) : (
              <div className="jobs-list">
                {filteredJobs.map((job) => (
                  <article key={job.id} className="job-card">
                    <div className="job-content">
                      <div className="job-header">
                        <Link className="job-link" href={{ pathname: '/marketplace/do-a-job', query: { job: JSON.stringify(job) } }}>
                          <h3 className="job-title">{job.title}</h3>
                        </Link>
                        <div className="job-price">{job.price}</div>
                      </div>
                      <p className="job-tags">Tags: {job.tags}</p>
                      <p className="job-description">{job.description}</p>
                      
                      <div className="job-footer">
                        <span className="job-posted">{job.posted}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
