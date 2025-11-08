"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainSection from '../../components/MainSection';
import '../../styles/create-a-job.css';
import '../../styles/home.css';
import { useAccount, useWalletClient } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';

const backendAPI = "http://elon.local:3002"; // Adjust as needed

export default function CreateAJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  // Step 3 - Hardware Requirements
  const [hardwareRequirements, setHardwareRequirements] = useState({
    cpu: false,
    gpu: false,
    minimumRam: '16',
    minimumVram: '16',
  });

  // Step 3 - Software Requirements
  const [softwareRequirements, setSoftwareRequirements] = useState({
    vray: false,
    openfoam: false,
    bullet: false,
    python: false,
    compileProject: false,
    blender: false,
    octane: false,
    autoDesk3DMax: false,
    zbrush: false,
  });

  // Step 4 - Budget & Assets
  const [budgetAssets, setBudgetAssets] = useState({
    budget: '',
    assetsLink: '',
    scriptUrl: '',
  });

  const jobTypes = [
    { id: 'ai', label: 'AI / Machine Learning' },
    { id: '3d', label: '3D Rendering' },
    { id: 'data', label: 'Data Simulation' },
    { id: 'video', label: 'Video Processing' },
  ];

  const ramOptions = ['16', '32', '64', '128', '256'];
  const vramOptions = ['16', '24', '32', '48', '64'];

  const handleJobTypeSelect = (typeId: string) => {
    setSelectedJobType(typeId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHardwareChange = (hardware: 'cpu' | 'gpu') => {
    setHardwareRequirements(prev => ({
      ...prev,
      [hardware]: !prev[hardware]
    }));
  };

  const handleRamVramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHardwareRequirements(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSoftwareChange = (software: keyof typeof softwareRequirements) => {
    setSoftwareRequirements(prev => ({
      ...prev,
      [software]: !prev[software]
    }));
  };

  const handleBudgetAssetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBudgetAssets(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedJobType) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formData.title && formData.description) {
      setCurrentStep(3);
    } else if (currentStep === 3 && (hardwareRequirements.cpu || hardwareRequirements.gpu)) {
      setCurrentStep(4);
    } else if (currentStep === 4 && budgetAssets.budget && budgetAssets.assetsLink) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Final submission
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    // delega para o async submit handler
    submitToServer();
  };

  const { address, isConnected } = useAccount();
  const { data: WalletClient } = useWalletClient();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Map our internal job type ids to the API expected values
  const mapJobType = (id: string) => {
    switch (id) {
      case 'ai':
        return 'AI';
      case '3d':
      case '3D':
        return '3D Rendering';
      case 'data':
        return 'Data Simulation';
      case 'video':
        return 'Video Processing';
      default:
        return 'AI';
    }
  };

  const submitToServer = async () => {
    try {
      setSubmitError(null);
      setSubmitting(true);

      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description || '');
      fd.append('type', mapJobType(selectedJobType));
      fd.append('price', String(budgetAssets.budget || '0'));
      // prefer connected wallet address when available
      if (address) fd.append('wallet_address', address);
      if (budgetAssets.assetsLink) fd.append('cloud_link', budgetAssets.assetsLink);

      // external_links as an array (here we only include assetsLink if present)
      const external = budgetAssets.assetsLink ? [budgetAssets.assetsLink] : [];
      fd.append('external_links', JSON.stringify(external));

      // Hardware
      if (hardwareRequirements.cpu) fd.append('cpu', '1');
      if (hardwareRequirements.gpu) fd.append('gpu', '1');
      if (hardwareRequirements.minimumRam) fd.append('ram', String(hardwareRequirements.minimumRam));
      if (hardwareRequirements.minimumVram) fd.append('vram', String(hardwareRequirements.minimumVram));

      // Software
      Object.entries(softwareRequirements).forEach(([key, val]) => {
        if (val) fd.append(key, '1');
      });

      // Script URL
      if (budgetAssets.scriptUrl) {
        fd.append('script_path', budgetAssets.scriptUrl);
      }

      const backResponse = await fetch(`${backendAPI}/api/jobs/prepare-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: budgetAssets.assetsLink,
          scriptUrl: budgetAssets.scriptUrl,
          usdAmount: budgetAssets.budget
        })
      });
      const txDetails = await backResponse.json();

      if (!backResponse.ok) {
        throw new Error("Wasn't able to prepare the job on blockchain");
      }

      const txHash = await WalletClient?.sendTransaction({
        to: txDetails.to,
        value: BigInt(txDetails.value),
        data: txDetails.data
      });

      if (!txHash) {
        throw new Error("Wasn't able to send the transaction from wallet");
      }

      fd.append('transaction_hash', txHash);

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: fd
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(json?.error || 'Erro ao criar projeto');
        setSubmitting(false);
        return;
      }


      // success -> redirect to my-jobs
      router.push('/my-jobs');
    } catch (err: any) {
      console.error('submit error', err);
      setSubmitError(err?.message || 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  // If the wallet becomes disconnected while on this page, redirect to home
  useEffect(() => {
    if (typeof isConnected !== 'undefined' && !isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Determinar quais softwares mostrar baseado no hardware selecionado
  const showCpuSoftware = hardwareRequirements.cpu;
  const showGpuSoftware = hardwareRequirements.gpu;

  return (
    <div className="create-job-page">
      <MainSection />
      
      <div className="create-job-container">
        {/* Step 1: Job Type Selection */}
        {currentStep === 1 && (
          <>
            <div className="step-header">
              <h1 className="create-job-title">Create a New Job</h1>
              <p className="step-question">First, what kind of job is this?</p>
            </div>

            <div className="job-types-grid">
              {jobTypes.map((type) => (
                <button
                  key={type.id}
                  className={`job-type-card ${selectedJobType === type.id ? 'selected' : ''}`}
                  onClick={() => handleJobTypeSelect(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="step-navigation">
              <button 
                className="btn-next"
                onClick={handleNext}
                disabled={!selectedJobType}
              >
                Next: Details
              </button>
            </div>
          </>
        )}

        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <>
            <div className="step-header">
              <h1 className="create-job-title">Create a New Job</h1>
              <p className="step-question">Tell us more about your project</p>
            </div>

            <div className="form-section">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Type your Title"
                className="form-input"
              />
            </div>

            <div className="form-section">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Type your project description"
                className="form-textarea"
              />
            </div>

            <div className="step-navigation">
              <button 
                className="btn-back"
                onClick={handleBack}
              >
                Back: Type
              </button>
              <button 
                className="btn-next"
                onClick={handleNext}
                disabled={!formData.title || !formData.description}
              >
                Next: Requirements
              </button>
            </div>
          </>
        )}

        {/* Step 3: Requirements */}
        {currentStep === 3 && (
          <>
            <div className="step-header">
              <h1 className="create-job-title">Create a New Job</h1>
              <p className="step-question">Now, the technical specifications</p>
            </div>

            {/* Hardware Requirements */}
            <div className="requirements-section">
              <h2 className="section-subtitle">Hardware requirements</h2>
              
              <div className="hardware-options">
                <div className="hardware-checkbox">
                  <input
                    type="checkbox"
                    id="cpu"
                    checked={hardwareRequirements.cpu}
                    onChange={() => handleHardwareChange('cpu')}
                  />
                  <label htmlFor="cpu">CPU</label>
                </div>
                <div className="hardware-checkbox">
                  <input
                    type="checkbox"
                    id="gpu"
                    checked={hardwareRequirements.gpu}
                    onChange={() => handleHardwareChange('gpu')}
                  />
                  <label htmlFor="gpu">GPU</label>
                </div>
              </div>

              {/* RAM/VRAM Selects */}
              <div className="ram-vram-section">
                <div className="select-group">
                  <label className="select-label">Minimum RAM</label>
                  <div className={`custom-select ${!hardwareRequirements.cpu && !hardwareRequirements.gpu ? 'disabled' : ''}`}>
                    <select
                      name="minimumRam"
                      value={hardwareRequirements.minimumRam}
                      onChange={handleRamVramChange}
                      disabled={!hardwareRequirements.cpu && !hardwareRequirements.gpu}
                    >
                      {ramOptions.map(ram => (
                        <option key={ram} value={ram}>{ram} GB</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="select-group">
                  <label className="select-label">Minimum VRAM</label>
                  <div className={`custom-select ${!hardwareRequirements.gpu ? 'disabled' : ''}`}>
                    <select
                      name="minimumVram"
                      value={hardwareRequirements.minimumVram}
                      onChange={handleRamVramChange}
                      disabled={!hardwareRequirements.gpu}
                    >
                      {vramOptions.map(vram => (
                        <option key={vram} value={vram}>{vram} GB</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Renderer / Software */}
            {(showCpuSoftware || showGpuSoftware) && (
              <div className="software-section">
                <h2 className="section-subtitle">Renderer / Software</h2>
                <div className="software-checkboxes">
                  {/* CPU Software */}
                  {showCpuSoftware && (
                    <>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="vray"
                          checked={softwareRequirements.vray}
                          onChange={() => handleSoftwareChange('vray')}
                        />
                        <label htmlFor="vray">V-Ray (CPU Mode)</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="openfoam"
                          checked={softwareRequirements.openfoam}
                          onChange={() => handleSoftwareChange('openfoam')}
                        />
                        <label htmlFor="openfoam">OpenFOAM</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="bullet"
                          checked={softwareRequirements.bullet}
                          onChange={() => handleSoftwareChange('bullet')}
                        />
                        <label htmlFor="bullet">Bullet</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="python"
                          checked={softwareRequirements.python}
                          onChange={() => handleSoftwareChange('python')}
                        />
                        <label htmlFor="python">Python</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="compileProject"
                          checked={softwareRequirements.compileProject}
                          onChange={() => handleSoftwareChange('compileProject')}
                        />
                        <label htmlFor="compileProject">Compile project</label>
                      </div>
                    </>
                  )}

                  {/* GPU Software */}
                  {showGpuSoftware && (
                    <>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="blender"
                          checked={softwareRequirements.blender}
                          onChange={() => handleSoftwareChange('blender')}
                        />
                        <label htmlFor="blender">Blender</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="octane"
                          checked={softwareRequirements.octane}
                          onChange={() => handleSoftwareChange('octane')}
                        />
                        <label htmlFor="octane">Octane</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="autoDesk3DMax"
                          checked={softwareRequirements.autoDesk3DMax}
                          onChange={() => handleSoftwareChange('autoDesk3DMax')}
                        />
                        <label htmlFor="autoDesk3DMax">AutoDesk 3D Max</label>
                      </div>
                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          id="zbrush"
                          checked={softwareRequirements.zbrush}
                          onChange={() => handleSoftwareChange('zbrush')}
                        />
                        <label htmlFor="zbrush">ZBrush</label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="step-navigation">
              <button 
                className="btn-back"
                onClick={handleBack}
              >
                Back: Type
              </button>
              <button 
                className="btn-next"
                onClick={handleNext}
                disabled={!hardwareRequirements.cpu && !hardwareRequirements.gpu}
              >
                Next: Budget & Assets
              </button>
            </div>
          </>
        )}

        {/* Step 4: Budget & Assets */}
        {currentStep === 4 && (
          <>
            <div className="step-header">
              <h1 className="create-job-title">Create a New Job</h1>
              <p className="step-question">Almost there. Define the reward and link your files.</p>
            </div>

            {/* Budget and Project Assets */}
            <div className="budget-assets-grid">
              {/* Budget */}
              <div className="budget-input-group">
                <label className="section-subtitle">Budget</label>
                <div className="budget-input-wrapper">
                  <input
                    type="number"
                    name="budget"
                    value={budgetAssets.budget}
                    onChange={handleBudgetAssetsChange}
                    placeholder="16"
                    className="budget-input"
                    min="0"
                    step="0.01"
                  />
                  <span className="currency-label">USD</span>
                </div>
              </div>

              {/* Project Assets */}
              <div className="assets-input-group">
                <label className="section-subtitle">Project Assets</label>
                <input
                  type="text"
                  name="assetsLink"
                  value={budgetAssets.assetsLink}
                  onChange={handleBudgetAssetsChange}
                  placeholder="Link of your assets (IPFS Link)"
                  className="assets-input"
                />
              </div>
            </div>

            {/* Note */}
            <p className="budget-note">
              Note: This amount will be locked in an escrow smart contract. Your wallet will prompt for confirmation upon submission
            </p>

            {/* Project Script URL */}
            <div className="script-url-section">
              <h2 className="section-subtitle">Project Script URL</h2>
              <input
                type="text"
                name="scriptUrl"
                value={budgetAssets.scriptUrl}
                onChange={handleBudgetAssetsChange}
                placeholder="Enter the URL of your script file"
                className="assets-input"
              />
            </div>

            <div className="step-navigation">
              <button 
                className="btn-back"
                onClick={handleBack}
              >
                Back: Requirements
              </button>
              <button 
                className="btn-submit"
                onClick={handleNext}
                disabled={!budgetAssets.budget || !budgetAssets.assetsLink || !budgetAssets.scriptUrl || submitting}
              >
                Review & Submit
              </button>
            </div>
          </>
        )}

        {/* Step 5: Review Your Job */}
        {currentStep === 5 && (
          <>
            <div className="step-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h1 className="review-page-title">Review Your Job</h1>
              <p className="review-subtitle">
                Please confirm the details below. This will lock the budget in escrow.
              </p>
            </div>

            {/* Job Details Section */}
            <div className="review-section">
              <h2 className="review-section-title">Job Details</h2>
              <div className="review-grid">
                <span className="review-label">Job Title</span>
                <span className="review-value">{formData.title}</span>

                <span className="review-label">Category</span>
                <span className="review-value">
                  {jobTypes.find(type => type.id === selectedJobType)?.label}
                </span>

                <span className="review-label">Description</span>
                <span className="review-value">{formData.description}</span>

                <span className="review-label">Description</span>
                <span className="review-value">
                  {Object.entries(softwareRequirements)
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      const labels: Record<string, string> = {
                        vray: 'V-Ray (CPU Mode)',
                        openfoam: 'OpenFOAM',
                        bullet: 'Bullet',
                        python: 'Python',
                        compileProject: 'Compile project',
                        blender: 'Blender',
                        octane: 'Octane',
                        autoDesk3DMax: 'AutoDesk 3D Max',
                        zbrush: 'ZBrush'
                      };
                      return labels[key];
                    })
                    .join(', ') || 'None'}
                </span>
              </div>
            </div>

            {/* Technical Requirements Section */}
            <div className="review-section">
              <h2 className="review-section-title">Technical Requirements</h2>
              <div className="review-grid">
                <span className="review-label">Hardware</span>
                <span className="review-value">
                  {[
                    hardwareRequirements.cpu && 'CPU',
                    hardwareRequirements.gpu && 'GPU'
                  ].filter(Boolean).join(', ')}
                </span>

                {(hardwareRequirements.cpu || hardwareRequirements.gpu) && (
                  <>
                    <span className="review-label">Minimum VRAM</span>
                    <span className="review-value">{hardwareRequirements.minimumVram}GB</span>

                    <span className="review-label">Minimum RAM</span>
                    <span className="review-value">{hardwareRequirements.minimumRam}GB</span>
                  </>
                )}

                <span className="review-label">Tags</span>
                <span className="review-value">
                  {Object.entries(softwareRequirements)
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      const labels: Record<string, string> = {
                        vray: 'V-Ray',
                        openfoam: 'OpenFOAM',
                        bullet: 'Bullet',
                        python: 'Python',
                        compileProject: 'Compile',
                        blender: 'Blender',
                        octane: 'Octane',
                        autoDesk3DMax: '3D Max',
                        zbrush: 'ZBrush'
                      };
                      return labels[key];
                    })
                    .join(', ') || 'None'}
                </span>
              </div>
            </div>

            {/* Project Assets Section */}
            <div className="review-section">
              <h2 className="review-section-title">Project Assets</h2>
              <div className="review-grid">
                <span className="review-label">Budget</span>
                <span className="review-value">${budgetAssets.budget} USD</span>

                <span className="review-label">Script URL</span>
                <span className="review-value">
                  {budgetAssets.scriptUrl || '(No URL provided)'}
                </span>

                <span className="review-label">Assets llink</span>
                <span className="review-value">{budgetAssets.assetsLink}</span>
              </div>
            </div>

            {/* Final Actions */}
            <div className="final-actions">
              <button 
                className="btn-final-back"
                onClick={handleBack}
              >
                Back: Budget and Assets
              </button>
              <button 
                className="btn-final-submit"
                onClick={handleNext}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Job'}
              </button>
            </div>
            {submitError && (
              <div className="submit-error" style={{ marginTop: 12, color: 'var(--danger, #ff4d4f)' }}>
                {submitError}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}