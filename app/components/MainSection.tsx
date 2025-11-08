"use client";

import React from "react";
import Link from "next/link";
import { CustomConnectButton } from "./ConnectButton";

export default function MainSection() {
  return (
      <header className="header">
        <Link href="/" className="title-link">
            <h1 className="logo">The Loom</h1>
        </Link>
        <nav className="nav-links">
          <Link href="/download" className="nav-link">
            Download
          </Link>
          <Link href="/my-jobs" className="nav-link">
            My Jobs
          </Link>
          <Link href="/marketplace" className="nav-link">
            Explore Jobs
          </Link>
          <CustomConnectButton />
        </nav>
      </header>
  );
}
