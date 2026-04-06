
import { NextResponse } from 'next/server';
import {
  sincronizarExcecaoPrecoTotal,
  sincronizarExcecaoPrecoParcial,
  sincronizarTodasEmpresas,
  obterEstatisticasSincronizacao,
  listarExcecaoPreco
} from '@/lib/sync-excecao-preco-service';
import { NextRequest } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idSistema = searchParams.get('idSistema');
    const empresa = searchParams.get('empresa');
    const type = searchParams.get('type') || 'total';

    if (idSistema && empresa) {
      // Sincronizar empresa específica
      console.log(`🔄 [API] Sincronizando exceções de preço: ${empresa} (ID: ${idSistema}) - Tipo: ${type}`);

      const resultado = type === 'partial'
        ? await sincronizarExcecaoPrecoParcial(parseInt(idSistema), empresa)
        : await sincronizarExcecaoPrecoTotal(parseInt(idSistema), empresa);

      return NextResponse.json(resultado);
    } else {
      // Sincronizar todas as empresas (uma por vez)
      const resultados = await sincronizarTodasEmpresas();
      return NextResponse.json(resultados);
    }
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar exceções de preço' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idSistema = searchParams.get('idSistema');
    const list = searchParams.get('list');

    if (list === 'true') {
      const data = await listarExcecaoPreco(idSistema ? Number(idSistema) : undefined);
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
