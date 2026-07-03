import { useState, useEffect, useCallback } from 'react';
import { proxy } from '@/proxy';

export type SaleStatus = 'Pendente' | 'Concluída' | 'Cancelada';
export type PaymentMethod = 'Dinheiro' | 'Cartão de Crédito' | 'Pix' | 'Boleto';

export interface SaleItem {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    totalItem: number;
}

export interface Sale {
    id: number;
    data: string;
    cliente: string | null;
    itens: SaleItem[]; 
    valor_total: number;
    forma_pagamento: string;
    status_venda: SaleStatus;
}

export interface SaleFormData {
    data: string;
    cliente: string | null;
    itens: string;
    valor_total: number;
    forma_pagamento: string;
    status_venda: SaleStatus;
}

export const useSales = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processSaleData = (data: any): Sale => {
        if (data.itens && typeof data.itens === 'string') {
            try {
                data.itens = JSON.parse(data.itens);
            } catch (e) {
                data.itens = [];
            }
        }
        return data as Sale;
    };
    
    const fetchSales = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await proxy('/sales');
            if (!response || !response.ok) throw new Error('Falha ao buscar vendas');
            const data = await response.json();
            setSales(data.map(processSaleData));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveSale = async (formData: SaleFormData, id: number | null = null) => {
        try {
            const method = id ? 'PUT' : 'POST';
            const endpoint = id ? `/sales/${id}` : '/sales';
            const response = await proxy(endpoint, {
                method,
                body: JSON.stringify({
                    ...formData,
                    valor_total: Number(formData.valor_total)
                }),
            });
            if (!response || !response.ok) throw new Error('Erro ao salvar');
            await fetchSales(); 
            return { success: true, message: 'Sucesso' };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };
    
    const deleteSale = async (id: number) => {
        try {
            const response = await proxy(`/sales/${id}`, { method: 'DELETE' });
            if (!response || response.status !== 204) throw new Error('Erro ao excluir');
            setSales(prev => prev.filter(p => p.id !== id));
            return { success: true, message: 'Excluído' };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    return { sales, isLoading, error, fetchSales, saveSale, deleteSale };
};