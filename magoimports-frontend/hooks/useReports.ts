import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:2020/reports';

export interface ProductReport {
    nome: string;
    quantidade_em_estoque: number;
    preco: number;
}

export interface LowStockReport {
    threshold: number;
    count: number;
    products: ProductReport[];
}

export interface SaleStatusReport {
    status_venda: string;
    count: number;
    total_valor: number;
}

export interface SaleInPeriod {
    id: number;
    data: string;
    cliente: string;
    valor_total: number;
    forma_pagamento: string;
    status_venda: string;
}

export interface SalesPeriodReport {
    periodo: { startDate: string; endDate: string };
    total_vendas: number;
    valor_total_arrecadado: number;
    vendas: SaleInPeriod[];
}

export const useReports = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async <T>(path: string, errorMessage: string): Promise<T | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}${path}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao buscar relatório: ${response.status}`);
            }
            const data = await response.json();
            return data as T;
        } catch (err: any) {
            console.error(err);
            setError(err.message || errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLowStockReport = useCallback(() => {
        return fetchData<LowStockReport>('/products/low-stock', 'Erro ao carregar relatório de estoque baixo.');
    }, [fetchData]);

    const fetchSalesByStatusReport = useCallback(() => {
        return fetchData<SaleStatusReport[]>('/sales/by-status', 'Erro ao carregar relatório de vendas por status.');
    }, [fetchData]);

    const fetchSalesPeriodReport = useCallback((startDate: string, endDate: string) => {
        const path = `/sales/period?startDate=${startDate}&endDate=${endDate}`;
        return fetchData<SalesPeriodReport>(path, 'Erro ao carregar relatório de vendas por período.');
    }, [fetchData]);


    return {
        isLoading,
        error,
        fetchLowStockReport,
        fetchSalesByStatusReport,
        fetchSalesPeriodReport,
    };
};