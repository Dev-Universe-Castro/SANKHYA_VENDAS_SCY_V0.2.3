
import { NextResponse, NextRequest } from 'next/server';
import {
  sincronizarProdutosTotal,
  sincronizarProdutosParcial,
  sincronizarTodasEmpresas,
  obterEstatisticasSincronizacao,
  listarProdutos
} from '@/lib/sync-produtos-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idSistema, empresa, type = 'total', startPage } = body;

    if (idSistema && empresa) {
      // Sincronizar empresa específica
      console.log(`🔄 [API] Sincronizando empresa: ${empresa} (ID: ${idSistema}) - Tipo: ${type}${startPage !== undefined ? ` - Página: ${startPage}` : ''}`);

      let resultado;
      if (startPage !== undefined) {
        const { sincronizarProdutosRetomada } = await import('@/lib/sync-produtos-service');
        resultado = await sincronizarProdutosRetomada(parseInt(idSistema), empresa, Number(startPage));
      } else {
        resultado = type === 'partial'
          ? await sincronizarProdutosParcial(parseInt(idSistema), empresa)
          : await sincronizarProdutosTotal(parseInt(idSistema), empresa);
      }

      return NextResponse.json(resultado);
    } else {
      // Sincronizar todas as empresas (uma por vez)
      const resultados = await sincronizarTodasEmpresas();
      return NextResponse.json(resultados);
    }
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar produtos' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idSistema = searchParams.get('idSistema');
    const list = searchParams.get('list');

    if (list === 'true') {
      const data = await listarProdutos(idSistema ? Number(idSistema) : undefined);
      return NextResponse.json(data);
    }

    const estatisticas = await obterEstatisticasSincronizacao(
      idSistema ? parseInt(idSistema) : undefined
    );

    return NextResponse.json(estatisticas);
  } catch (error: any) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
