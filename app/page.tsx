"use client";

import React from "react";
import Image from "next/image";
import './styles/home.css';
import MainSection from './components/MainSection';

const IMG = (img: string) => {
  return `/${img}.png`;
};

export default function Home() {
  return (
    <div className="home-container">
      <div className="main-section">
        <MainSection />

        {/* Hero Section */}
        <section className="hero-section">
          <h2 className="hero-title">WEAVING COMPUTER THREADS.</h2>
          <p className="hero-subtitle">
            The decentralized supercomputer for AI models and 3D rendering.
          </p>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <h3 className="section-title">How It Works</h3>

          <div className="table-container">
            <div className="table-headers">
              <div className="table-header">For Requesters</div>
              <div className="table-header">For Providers</div>
            </div>

            <div className="table-content">
              <div className="table-cell">
                <h5 className="step-title">Define Your Task</h5>
                <p className="step-description">
                  Submit your AI model, 3D project, or computational job to the network.
                  Define your requirements and set your reward.
                </p>
              </div>
              <div className="table-cell">
                <h5 className="step-title">Connect your Hardware</h5>
                <p className="step-description">
                  Download the secure Loom client. Connect your idle GPU or CPU to
                  our decentralized network with a few clicks
                </p>
              </div>
            </div>

            <div className="table-content">
              <div className="table-cell">
                <h5 className="step-title">The Network Connects</h5>
                <p className="step-description">
                  Our smart contracts broadcast your task, matching it with verified
                  providers who have the idle hardware you need.
                </p>
              </div>
              <div className="table-cell">
                <h5 className="step-title">Receive & Process</h5>
                <p className="step-description">
                  The client automatically receives tasks that match your hardware's
                  capabilities. Your machine processes the task securely in the
                  background.
                </p>
              </div>
            </div>

            <div className="table-content">
              <div className="table-cell">
                <h5 className="step-title">Receive Your Output</h5>
                <p className="step-description">
                  The provider's hardware securely executes your task. Once complete,
                  the results are verified and delivered to you.
                </p>
              </div>
              <div className="table-cell">
                <h5 className="step-title">Earn Rewards</h5>
                <p className="step-description">
                  After the task is completed and verified, your connected wallet
                  is credited instantly. Turn your idle time into profit.
                </p>
              </div>
            </div>
          </div>
        </section>

        
      </div>
      {/* Sponsors Section */}
        <section className="sponsors-section">
          <h3 className="sponsors-title">Sponsors</h3>
          <div className="sponsors-grid">
            <div className="sponsor-logo">
              <Image src={IMG('chainlink')} width={100} height={100} alt="Chainlink" />
            </div>
            <div className="sponsor-logo">
              <Image src={IMG('fhenix')} width={100} height={100} alt="Fhenix" />
            </div>
            <div className="sponsor-logo">
              <Image src={IMG('arbitrum')} width={100} height={100} alt="Arbitrum" />
            </div>
            <div className="sponsor-logo">
              <Image src={IMG('ETH.Build')} width={100} height={100} alt="ETH.Build" />
            </div>
            <div className="sponsor-logo">
              <Image src={IMG('flow')} width={100} height={100} alt="Flow" />
            </div>
            <div className="sponsor-logo">
              <Image src={IMG('zama')} width={100} height={100} alt="ZAMA" />
            </div>
            <div className="sponsor-logo">
              <Image src={IMG('base')} width={100} height={100} alt="Base" />
            </div>
          </div>
        </section>
    </div>
  );
}
