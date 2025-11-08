'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
  metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets'; // Importar as carteiras que queremos adicionar
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  scrollSepolia, // Rede da Scroll!
  baseSepolia
} from '@wagmi/core/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Obtenha o Project ID no WalletConnect Cloud (https://cloud.walletconnect.com)
const projectId = 'c8aa9e6ff39993515a1f075a38ac75ef'; // NÃO SE ESQUEÇA DE TROCAR

// ESTA É A FORMA CORRETA E SIMPLIFICADA
const config = getDefaultConfig({
  appName: 'The Loom',
  projectId: projectId,
  
  // O `getDefaultConfig` já inclui as carteiras padrão (MetaMask, WalletConnect, Rainbow, Coinbase Wallet).
  // A propriedade 'wallets' abaixo serve para *adicionar* mais carteiras a essa lista.
  wallets: [
    {
      groupName: 'Suggested', // Um grupo extra que você quer mostrar
      wallets: [argentWallet, trustWallet, ledgerWallet, metaMaskWallet],
    },
  ],
  
  chains: [ // Rede principal do seu projeto
    baseSepolia,
    base,
    sepolia,
    mainnet,
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // O config simplificado vai direto no WagmiProvider
    <WagmiProvider config={config}> 
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#fff",
            accentColorForeground: "#2f2e2eff"
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}