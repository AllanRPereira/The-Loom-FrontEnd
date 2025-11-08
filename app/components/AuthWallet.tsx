'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

const BACKEND_API_URL = '/api/user/connect'; // Altere para o endpoint real da sua API

// Função que realmente faz a chamada para a API
async function syncUserWithBackend(address: string) {
  try {
    const response = await fetch(BACKEND_API_URL, { // Endpoint da sua API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: address }),
    });

    if (!response.ok) {
      throw new Error('Falha ao sincronizar usuário com o backend');
    }

    const data = await response.json();
    console.log('Usuário sincronizado com sucesso:', data);
    // Aqui você pode, por exemplo, salvar dados do usuário (como um JWT)
    // que o backend retornou.
    
  } catch (error) {
    console.error('Erro de sincronização:', error);
  }
}

/**
 * Este é um componente "invisível" que escuta o estado da conta
 * e dispara a sincronização com o backend quando o usuário conecta.
 */
export function AuthSyncer() {
  const { address, isConnected, isDisconnected } = useAccount();
  
  // Usamos useRef para garantir que a sincronização só ocorra uma vez por conexão
  const hasSynced = useRef(false);

  useEffect(() => {

    if (isConnected && address && !hasSynced.current) {
      console.log('Usuário conectado, ', address);
      hasSynced.current = true;
    } 

    else if (isDisconnected) {
      hasSynced.current = false;
      console.log('Usuário desconectado, pronto para nova sincronização.');
    }
  }, [isConnected, address, isDisconnected]); // O useEffect roda sempre que esses valores mudam

  // Este componente não renderiza nada na tela
  return null;
}