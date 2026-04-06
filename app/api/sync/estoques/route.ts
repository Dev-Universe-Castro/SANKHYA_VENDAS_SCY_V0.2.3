
import { NextRequest, NextResponse } from 'next/server';
import {
  sincronizarEstoquesPorEmpresa,
  sincronizarEstoquesParcial,
  sincronizarTodasEmpresas,
  obterEstatisticasSincronizacao,
  listarEstoques
} from '@/lib/sync-estoques-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idSistema = searchParams.get('idSistema');
    const list = searchParams.get('list');

    if (list === 'true') {
      const data = await listarEstoques(idSistema ? Number(idSistema) : undefined);
      return NextResponse.json(data);
    }

    if (idSistema) {
      const stats = await obterEstatisticasSincronizacao(parseInt(idSistema));
      return NextResponse.json(stats);
    }

    const stats = await obterEstatisticasSincronizacao();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idSistema = searchParams.get('idSistema');
    const empresa = searchParams.get('empresa');
    const type = searchParams.get('type') || 'total';
    const startPage = searchParams.get('startPage');

    console.log('📥 [API] Requisição de sincronização recebida:', { idSistema, empresa, type, startPage });

    if (idSistema && empresa) {
      console.log(`🔄 [API] Sincronizando empresa: ${empresa} (ID: ${idSistema}) - Tipo: ${type}${startPage ? ` - Página: ${startPage}` : ''}`);
      let resultado;

      if (startPage) {
        const { sincronizarEstoquesRetomada } = await import('@/lib/sync-estoques-service');
        resultado = await sincronizarEstoquesRetomada(parseInt(idSistema), empresa, Number(startPage));
      } else if (type === 'partial') {
        resultado = await sincronizarEstoquesParcial(parseInt(idSistema), empresa);
      } else {
        resultado = await sincronizarEstoquesPorEmpresa(parseInt(idSistema), empresa);
      }
      return NextResponse.json(resultado);
    }

    console.log('🔄 [API] Sincronizando todas as empresas');
    const resultados = await sincronizarTodasEmpresas();
    return NextResponse.json(resultados);
  } catch (error: any) {
    console.error('❌ [API] Erro ao sincronizar estoques:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar estoques' },
      { status: 500 }
    );
  }
}
