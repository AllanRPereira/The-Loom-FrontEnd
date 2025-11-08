'use client';

import '../styles/download.css';
import '../styles/home.css';
import MainSection from '../components/MainSection';
import { useEffect, useState } from 'react';

export default function DownloadPage() {
  const [userOS, setUserOS] = useState<string>('');

  useEffect(() => {
    // Função para detectar o SO
    const detectOS = () => {
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.indexOf('mac') !== -1 || platform.indexOf('mac') !== -1) {
        return 'Mac';
      }
      if (userAgent.indexOf('win') !== -1 || platform.indexOf('win') !== -1) {
        return 'Windows';
      }
      if (userAgent.indexOf('linux') !== -1 || platform.indexOf('linux') !== -1) {
        return 'Linux';
      }
      return 'Unknown';
    };

    setUserOS(detectOS());
  }, []);
  return (
    <div className="download-page">
        <MainSection />
      
      <main className="download-content">
        <section className="step">
          <div className="step-number">01.</div>
          <h1 className="step-title">Download the Client</h1>
          <p className="step-description">
            To ensure security and package your project&apos;s dependencies, all tasks are submitted via the Loom Client. 
            This application securely bundles your AI model or encrypted 3D file, connect and uploads the job to the decentralized Network
          </p>

          <button className="download-button">
            Download Loom Client {userOS !== 'Unknown' ? `(${userOS})` : ''}
          </button>
          
          <div className="download-options">
            {userOS !== 'Windows' && (
              <span className="download-option">Download for Windows</span>
            )}
            {userOS !== 'Linux' && (
              <span className="download-option">Download for Linux</span>
            )}
            {userOS !== 'Mac' && (
              <span className="download-option">Download for Mac</span>
            )}
          </div>
        </section>

        <section className="step">
          <div className="step-number">02.</div>
          <h2 className="step-title">Define &amp; Package</h2>
          <p className="step-description">
            Open the client. Define your job&apos;s parameters, set the budget, and point to your project files. 
            The client will package everything for you.
          </p>
        </section>

        <section className="step">
          <div className="step-number">03.</div>
          <h2 className="step-title">Submit &amp; Monitor</h2>
          <p className="step-description">
            Submit your packaged job from the client. Once it&apos;s on the network, 
            you can track its status live from your Dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}
