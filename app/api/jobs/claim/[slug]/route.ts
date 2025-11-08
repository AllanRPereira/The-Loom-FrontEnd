import { NextResponse } from 'next/server';
import { getQuery, runQuery } from '../../../../../database';

// Função helper para parsear campos que são JSON strings
function parseProject(project: any) {
  if (project.external_links) {
    try {
      project.external_links = JSON.parse(project.external_links);
    } catch (e) {
      project.external_links = [];
    }
  }
  return project;
}

// GET /api/jobs/claim/[slug] - Consome um slug para obter os detalhes do job
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug não fornecido' }, { status: 400 });
    }

    // 1. Encontrar o claim e verificar se não expirou
    const claim = await getQuery(
      `SELECT * FROM job_claims WHERE slug = ? AND expires_at > datetime('now')`,
      [slug]
    );

    if (!claim) {
      // Pode ser que não exista ou já expirou
      return NextResponse.json({ success: false, error: 'Slug inválido ou expirado.' }, { status: 404 });
    }

    // 2. O slug é válido, então vamos consumi-lo (deletar)
    await runQuery('DELETE FROM job_claims WHERE id = ?', [claim.id]);

    // 3. Buscar os detalhes completos do projeto associado
    const project = await getQuery('SELECT * FROM projects WHERE id = ?', [claim.project_id]);

    if (!project) {
      // Isso seria um estado inconsistente, mas é bom tratar
      return NextResponse.json({ success: false, error: 'Erro de consistência: Projeto associado ao slug não foi encontrado.' }, { status: 500 });
    }

    // 4. Retornar os detalhes do projeto
    const parsedProject = parseProject(project);
    return NextResponse.json({ success: true, project: parsedProject });

  } catch (error: any) {
    console.error(`GET /api/jobs/claim/[slug] error:`, error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor ao buscar o trabalho' }, { status: 500 });
  }
}
