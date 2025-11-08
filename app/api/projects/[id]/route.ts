import { NextResponse } from 'next/server';
import { getQuery, runQuery } from '../../../../database.js';

const isValidWalletAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

// GET /api/projects/:id
export async function GET(request: Request, context: any) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    const project = await getQuery('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar projeto' }, { status: 500 });
  }
}

// PUT /api/projects/:id - atualiza parciamente
export async function PUT(request: Request, context: any) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    const body = await request.json();

    const project = await getQuery('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });

    // Merge dos campos (aceita parciais)
    const title = body.title !== undefined ? String(body.title).trim() : project.title;
    const description = body.description !== undefined ? String(body.description) : project.description;
    const type = body.type !== undefined ? body.type : project.type;
    const price = body.price !== undefined ? Number(body.price) : project.price;
    const wallet_address = body.wallet_address !== undefined ? body.wallet_address : project.wallet_address;
    const wallet_address_secondary = body.wallet_address_secondary !== undefined ? body.wallet_address_secondary : project.wallet_address_secondary;
    const status = body.status !== undefined ? body.status : project.status;
    const progress = body.progress !== undefined ? Number(body.progress) : project.progress;

    if (type && !['AI', '3D Rendering', 'Data Simulation', 'Video Processing'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 });
    }
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return NextResponse.json({ success: false, error: 'Preço deve ser um número positivo' }, { status: 400 });
    }
    if (wallet_address && !isValidWalletAddress(wallet_address)) {
      return NextResponse.json({ success: false, error: 'Endereço de carteira inválido' }, { status: 400 });
    }

    const result: any = await runQuery(
      `UPDATE projects SET title = ?, description = ?, type = ?, price = ?, wallet_address = ?, wallet_address_secondary = ?, status = ?, progress = ? WHERE id = ?`,
      [title, description, type, price, wallet_address, wallet_address_secondary, status, progress, id]
    );

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }

    const updated = await getQuery('SELECT * FROM projects WHERE id = ?', [id]);
    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error('PUT /api/projects/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar projeto' }, { status: 500 });
  }
}

// DELETE /api/projects/:id
export async function DELETE(request: Request, context: any) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    const result: any = await runQuery('DELETE FROM projects WHERE id = ?', [id]);
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Projeto deletado' });
  } catch (error: any) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao deletar projeto' }, { status: 500 });
  }
}
