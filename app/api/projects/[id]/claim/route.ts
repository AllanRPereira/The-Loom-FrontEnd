import { NextResponse } from 'next/server';
import { runQuery, getQuery } from '../../../../../database';
import crypto from 'crypto';

const SLUG_EXPIRATION_MINUTES = 5;

// POST /api/projects/[id]/claim
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = parseInt(params.id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json({ success: false, error: 'ID de projeto inválido' }, { status: 400 });
    }

    // 1. Verificar se o projeto existe
    const project = await getQuery('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }

    // 2. Limpar slugs expirados para este projeto antes de verificar
    await runQuery(`DELETE FROM job_claims WHERE project_id = ? AND expires_at < datetime('now')`, [projectId]);

    // 3. Verificar se já existe um claim ativo para este projeto
    const existingClaim = await getQuery('SELECT slug FROM job_claims WHERE project_id = ?', [projectId]);
    if (existingClaim) {
      return NextResponse.json(
        { success: true, slug: existingClaim.slug }
      );
    }

    // 4. Gerar um slug único e seguro
    const slug = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SLUG_EXPIRATION_MINUTES * 60000);

    // 5. Inserir o novo claim no banco de dados
    await runQuery(
      'INSERT INTO job_claims (project_id, slug, expires_at) VALUES (?, ?, ?)',
      [projectId, slug, expiresAt.toISOString()]
    );

    // 6. Retornar o slug gerado
    return NextResponse.json({ success: true, slug: slug });

  } catch (error: any) {
    console.error(`POST /api/projects/[id]/claim error:`, error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor ao tentar reivindicar o trabalho' }, { status: 500 });
  }
}
