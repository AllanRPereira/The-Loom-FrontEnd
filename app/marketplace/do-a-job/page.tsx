"use client";

import React, { useState, useEffect } from 'react';
import MainSection from '../../components/MainSection';
import '../../styles/do-a-job.css';
import '../../styles/home.css';
import { useSearchParams } from 'next/navigation';
import { useAccount, useWalletClient } from 'wagmi';
import Link from 'next/link';

const backendUrl = "http://elon.local:3002";

export default function DoAJobPage() {
  const search = useSearchParams();
  const job = search.get('job');
  const initialJobData = job ? JSON.parse(job as string) : null;
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Use local state to track the current job data
  const [currentJobData, setCurrentJobData] = useState(initialJobData);

  // Modal and acceptance state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [showSlugModal, setShowSlugModal] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState(false);

  // Check if the current user is the job creator
  const isMyJob = (currentJobData && address && 
    currentJobData.wallet_address === address) || !address;

  // Get actual project data (either from currentJobData.raw or currentJobData itself)
  const projectData = currentJobData?.raw || currentJobData;

  // Check if job is already accepted by current user
  const isAcceptedByMe = address && (projectData?.wallet_address_secondary === address);
  const isJobAccepted = projectData?.wallet_address_secondary && !isAcceptedByMe;

  // Build requirements list from database fields
  const getRequirements = () => {
    const requirements = [];

    // Hardware requirements
    if (projectData?.cpu === 1) {
      requirements.push('CPU Processing Required');
    }
    if (projectData?.gpu === 1) {
      requirements.push('GPU Processing Required');
    }
    if (projectData?.ram) {
      requirements.push(`Minimum ${projectData.ram}GB RAM`);
    }
    if (projectData?.vram) {
      requirements.push(`Minimum ${projectData.vram}GB VRAM`);
    }

    // Software requirements
    const softwareLabels: Record<string, string> = {
      vray: 'V-Ray (CPU Mode)',
      openfoam: 'OpenFOAM',
      bullet: 'Bullet Physics',
      python: 'Python',
      compileProject: 'Compile Project',
      blender: 'Blender',
      octane: 'Octane Render',
      autoDesk3DMax: 'Autodesk 3ds Max',
      zbrush: 'ZBrush'
    };

    Object.entries(softwareLabels).forEach(([key, label]) => {
      if (projectData?.[key] === 1) {
        requirements.push(label);
      }
    });

    return requirements.length > 0 ? requirements : ['No specific requirements listed'];
  };

  const requirements = getRequirements();

  // Buscar slug se o job foi aceito pelo usuário atual
  const fetchCurrentSlug = async () => {
    if (!projectData?.id || !isAcceptedByMe) {
      return;
    }

    setLoadingSlug(true);
    try {
      const response = await fetch(`/api/projects/${projectData.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.slug) {
          setCurrentSlug(data.slug);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar slug:', error);
    } finally {
      setLoadingSlug(false);
    }
  };

  // Buscar slug quando o componente monta e o job foi aceito
  useEffect(() => {
    if (isAcceptedByMe && projectData?.id) {
      fetchCurrentSlug();
    }
  }, [isAcceptedByMe, projectData?.id]);

  const handleAcceptJob = async () => {
    if (!address) {
      alert('Por favor, conecte sua carteira primeiro');
      return;
    }

    setAccepting(true);
    setAcceptError(null);

    try {
      const backendResponse = await fetch(`${backendUrl}/api/jobs/${projectData.transaction_hash}/prepare-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      
      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Erro ao preparar a transação de aceitação');
      }
      
      const txDetails = await backendResponse.json();
      const txHash = await walletClient?.sendTransaction({
        to: txDetails.to,
        data: txDetails.data,
      });

      const res = await fetch(`/api/projects/${projectData.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: address }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao aceitar o job');
      }

      // Update local state with the updated project
      const updatedJobData = {
        ...currentJobData,
        wallet_address_secondary: address,
        status: 'WORKING',
        raw: {
          ...projectData,
          wallet_address_secondary: address,
          status: 'WORKING'
        }
      };
      
      setCurrentJobData(updatedJobData);
      setShowConfirmModal(false);
      
      // Mostrar popup com o slug se foi gerado
      if (data.slug) {
        setGeneratedSlug(data.slug);
        setCurrentSlug(data.slug); // Também define como slug atual
        setShowSlugModal(true);
      }
    } catch (err: any) {
      console.error('Error accepting job:', err);
      setAcceptError(err.message || 'Erro ao aceitar o job');
    } finally {
      setAccepting(false);
    }
  };

  const handleCompleteJob = () => {
    // TODO: Implement complete job logic
    alert('Funcionalidade de conclusão será implementada');
  };

  return (
    <div className="do-a-job-page">
      <MainSection />
      
      <div className="do-a-job-container">
        {/* Back Button */}
        <Link href="/marketplace" className="back-link">
          <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Explore
        </Link>

        {/* Project Header */}
        <div className="project-header">
          <div className="project-title-section">
            <h1 className="project-main-title">{currentJobData ? currentJobData.title : 'Project Title'}</h1>
            <span className="status-badge">Active</span>
          </div>
          
          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">Posted by:</span>
              <span className="meta-value">
                {projectData?.wallet_address 
                  ? `${projectData.wallet_address.slice(0, 6)}...${projectData.wallet_address.slice(-4)}`
                  : 'Unknown'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Posted:</span>
              <span className="meta-value">
                {projectData?.created_at 
                  ? new Date(projectData.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="project-section">
          <h2 className="section-title">Description</h2>
          <div className="section-content">
            <p>
              {currentJobData ? currentJobData.description : 'Lorem ipsum dolor sit amet...'}
            </p>
          </div>
        </div>

        {/* Budget Section */}
        <div className="project-section">
          <h2 className="section-title">Budget</h2>
          <div className="budget-section">
            <div className="budget-amount">{currentJobData ? currentJobData.price : '3000.00 ETH'}</div>
            <div className="budget-meta">
              <div className="budget-meta-item">
                <span className="budget-meta-label">Estimated Time:</span>
                <span className="budget-meta-value">6 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="project-section">
          <h2 className="section-title">Requirements</h2>
          <ul className="requirements-list">
            {requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Project Assets */}
        {(projectData?.cloud_link || projectData?.script_path) && (
          <div className="project-section">
            <h2 className="section-title">Project Assets</h2>
            <div className="section-content">
              {projectData?.cloud_link && (
                <div className="asset-link-item">
                  <span className="asset-label">Assets Link:</span>
                  <a 
                    href={projectData.cloud_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="asset-link"
                  >
                    {projectData.cloud_link}
                  </a>
                </div>
              )}
              {projectData?.script_path && (
                <div className="asset-link-item">
                  <span className="asset-label">Script File:</span>
                  <a 
                    href={projectData.script_path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="asset-link"
                  >
                    Download Script
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slug Section - só aparece se o usuário aceitou o job */}
        {isAcceptedByMe && (
          <div className="project-section slug-section">
            <h2 className="section-title">
              Job Access Code
            </h2>
            <div className="section-content">
              {loadingSlug ? (
                <p className="slug-loading">Loading code...</p>
              ) : currentSlug ? (
                <>
                  <p className="slug-instructions">
                    Use this code on <strong>The Loom Desktop App</strong> to start working:
                  </p>
                  <div className="slug-code-container">
                    <code className="slug-code">
                      {currentSlug}
                    </code>
                  </div>
                  <div className="slug-actions">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentSlug).then(() => {
                          alert('Code copied to clipboard!');
                        }).catch((err) => {
                          console.error('Failed to copy code: ', err);
                        });
                      }}
                      className="btn-secondary"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={fetchCurrentSlug}
                      className="btn-secondary"
                    >
                      Generate new code
                    </button>
                  </div>
                  <p className="slug-warning">
                    <strong>Attention:</strong> The code expires in 5 minutes after being generated.
                  </p>
                </>
              ) : (
                <div className="slug-empty">
                  <p>No active code at the moment.</p>
                  <button
                    onClick={fetchCurrentSlug}
                    className="btn-primary"
                  >
                    Generate Code
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!isMyJob && !isJobAccepted && !isAcceptedByMe ? (
            <button className="btn-primary" onClick={() => setShowConfirmModal(true)}>
              Accept Job
            </button>
          ) : isAcceptedByMe ? (
            <button className="btn-primary" onClick={handleCompleteJob}>
              Complete Job
            </button>
          ) : isJobAccepted ? (
            <div className="job-taken-message">
              This job has already been accepted by another user
            </div>
          ) : null}
          <button className="btn-secondary">Save for Later</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">Confirm & Commit</h2>
            
            <p className="confirm-modal-text">
              By clicking "Accept," you are committing your hardware to this task. The Loom 
              Client on your desktop must be running and connected. Failure to process the 
              task may affect your provider rating and eligibility for rewards.
            </p>

            {acceptError && (
              <div className="confirm-modal-error">
                {acceptError}
              </div>
            )}

            <div className="confirm-modal-actions">
              <button 
                className="btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={accepting}
              >
                Cancel
              </button>
              <button 
                className="btn-modal-accept"
                onClick={handleAcceptJob}
                disabled={accepting}
              >
                {accepting ? 'Processing...' : 'Accept & Commit Hardware'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slug Modal */}
      {showSlugModal && generatedSlug && (
        <div className="confirm-modal-overlay" onClick={() => setShowSlugModal(false)}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">Job accepted with success!</h2>
            
            <p className="confirm-modal-text">
              Use this code in the <strong>The Loom Desktop App</strong> to start working on the job:
            </p>

            <div style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              margin: '20px 0',
              border: '2px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <code style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                letterSpacing: '1px',
                userSelect: 'all'
              }}>
                {generatedSlug}
              </code>
            </div>

            <p className="confirm-modal-text" style={{ fontSize: '14px', color: '#666' }}>
              <strong>Important:</strong> This code expires in 5 minutes. 
              Copy it and paste it into the desktop app to download the job files and start processing.
            </p>

            <div className="confirm-modal-actions">
              <button 
                className="btn-modal-accept"
                onClick={() => {
                  navigator.clipboard.writeText(generatedSlug);
                  alert('Slug copiado para a área de transferência!');
                }}
                style={{ marginRight: '10px' }}
              >
                Copy Code
              </button>
              <button 
                className="btn-modal-cancel"
                onClick={() => setShowSlugModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}