import { NextResponse } from 'next/server';
import { getQuery, runQuery } from '../../../../../database.js';

const isValidWalletAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

// POST /api/projects/:id/accept - aceita um job e atribui wallet_address_secondary
export async function POST(request: Request, context: any) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Endereço da carteira é obrigatório' },
        { status: 400 }
      );
    }

    if (!isValidWalletAddress(wallet_address)) {
      return NextResponse.json(
        { success: false, error: 'Endereço de carteira inválido' },
        { status: 400 }
      );
    }

    const project = await getQuery('SELECT * FROM projects WHERE id = ?', [id]);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o job já foi aceito
    if (project.wallet_address_secondary) {
      return NextResponse.json(
        { success: false, error: 'Este job já foi aceito por outro usuário' },
        { status: 400 }
      );
    }

    // Verifica se quem está aceitando não é o criador do job
    if (project.wallet_address === wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Você não pode aceitar seu próprio job' },
        { status: 400 }
      );
    }

    // Atualiza o projeto com o endereço de quem aceitou e muda o status para WORKING
    const result: any = await runQuery(
      `UPDATE projects SET wallet_address_secondary = ?, status = 'WORKING' WHERE id = ?`,
      [wallet_address, id]
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: 'Erro ao aceitar o job' },
        { status: 500 }
      );
    }

    const updated = await getQuery('SELECT * FROM projects WHERE id = ?', [id]);
    
    // Gerar slug através da rota /claim
    let slug = null;
    try {
      const claimResponse = await fetch(`/api/projects/${id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (claimResponse.ok) {
        const claimData = await claimResponse.json();
        if (claimData.success && claimData.slug) {
          slug = claimData.slug;
        }
      }
    } catch (claimError) {
      console.error('Erro ao gerar slug de claim:', claimError);
      // Não falha a operação se o slug não puder ser gerado
    }
    
    return NextResponse.json({
      success: true,
      message: 'Job aceito com sucesso',
      project: updated,
      slug: slug
    });
  } catch (error: any) {
    console.error('POST /api/projects/[id]/accept error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao aceitar o job' },
      { status: 500 }
    );
  }
}
