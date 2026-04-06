
import { NextRequest, NextResponse } from 'next/server';
import {
    sincronizarMarcasTotal,
    sincronizarMarcasParcial,
    sincronizarTodasEmpresas,
    obterEstatisticasSincronizacao,
    listarMarcas
} from '@/lib/sync-marcas-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const idSistema = searchParams.get('idSistema');
        const list = searchParams.get('list');

        if (list === 'true') {
            const data = await listarMarcas(idSistema ? Number(idSistema) : undefined);
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
        const body = await request.json();
        const { idSistema, empresa, type = 'total' } = body;

        console.log('📥 [API] Requisição de sincronização recebida:', { idSistema, empresa, type });

        if (idSistema && empresa) {
            console.log(`🔄 [API] Sincronizando empresa: ${empresa} (ID: ${idSistema}) - Tipo: ${type}`);

            const resultado = type === 'partial'
                ? await sincronizarMarcasParcial(parseInt(idSistema), empresa)
                : await sincronizarMarcasTotal(parseInt(idSistema), empresa);

            return NextResponse.json(resultado);
        }

        console.log('🔄 [API] Sincronizando todas as empresas');
        const resultados = await sincronizarTodasEmpresas();
        return NextResponse.json(resultados);
    } catch (error: any) {
        console.error('❌ [API] Erro ao sincronizar marcas:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao sincronizar marcas' },
            { status: 500 }
        );
    }
}
