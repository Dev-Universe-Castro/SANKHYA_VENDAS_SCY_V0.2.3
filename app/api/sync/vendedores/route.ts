
import { NextResponse } from 'next/server';
import {
  sincronizarVendedoresTotal,
  sincronizarVendedoresParcial,
  sincronizarTodasEmpresas,
  obterEstatisticasSincronizacao,
  listarVendedores
} from '@/lib/sync-vendedores-service';
import { NextRequest } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idSistema, empresa, type = 'total' } = body;

    if (idSistema && empresa) {
      console.log(`🔄 [API] Sincronizando vendedores: ${empresa} (ID: ${idSistema}) - Tipo: ${type}`);

      const resultado = type === 'partial'
        ? await sincronizarVendedoresParcial(parseInt(idSistema), empresa)
        : await sincronizarVendedoresTotal(parseInt(idSistema), empresa);

      return NextResponse.json(resultado);
    } else {
      const resultados = await sincronizarTodasEmpresas();
      return NextResponse.json(resultados);
    }
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar vendedores' },
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
      const data = await listarVendedores(idSistema ? Number(idSistema) : undefined);
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
