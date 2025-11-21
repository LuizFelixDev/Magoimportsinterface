import { useState, useEffect, useCallback } from 'react';

// Tipos baseados na estrutura do seu backend src/routes/sales.ts
export type SaleStatus = 'Pendente' | 'Concluída' | 'Cancelada';
export type PaymentMethod = 'Dinheiro' | 'Cartão de Crédito' | 'Pix' | 'Boleto';

export interface SaleItem {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    totalItem: number;
}

export interface ProductPrice {
    id: number;
    nome: string;
    preco: number;
    // Tipos adicionais que podem ser úteis para exibição no dropdown:
    quantidade_em_estoque: number;
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
    itens: string; // JSON string input pelo usuário
    valor_total: number;
    forma_pagamento: string;
    status_venda: SaleStatus;
}

const API_URL = 'http://localhost:2020/sales';

export const useSales = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Converte o campo 'itens' de string JSON para array de objetos.
    const processSaleData = (data: any): Sale => {
        if (data.itens && typeof data.itens === 'string') {
            try {
                data.itens = JSON.parse(data.itens);
            } catch (e) {
                console.error("Failed to parse itens JSON:", data.itens);
                data.itens = [];
            }
        }
        return data as Sale;
    };
    
    const fetchSales = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Falha ao buscar vendas na API.');
            }
            const data = await response.json();
            const processedData = data.map(processSaleData);
            setSales(processedData);
        } catch (err: any) {
            setError(err.message || 'Erro de rede ao buscar vendas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveSale = async (formData: SaleFormData, id: number | null = null) => {
        setError(null);
        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/${id}` : API_URL;

            // Prepara os dados para a API (mantendo 'itens' como string JSON e garantindo tipos)
            const dataToApi = {
                ...formData,
                valor_total: Number(formData.valor_total),
                cliente: formData.cliente || null
            };
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToApi),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            await fetchSales(); 
            return { success: true, message: `Venda ${id ? 'atualizada' : 'cadastrada'} com sucesso!` };

        } catch (err: any) {
            setError(err.message || 'Erro ao salvar a venda.');
            return { success: false, message: err.message || 'Erro ao salvar a venda.' };
        }
    };
    
    const deleteSale = async (id: number) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.status !== 204) { 
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            setSales(prev => prev.filter(p => p.id !== id));
            return { success: true, message: 'Venda excluída com sucesso!' };

        } catch (err: any) {
            setError(err.message || 'Erro ao excluir a venda.');
            return { success: false, message: err.message || 'Erro ao excluir a venda.' };
        }
    };

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    return {
        sales,
        isLoading,
        error,
        fetchSales,
        saveSale,
        deleteSale,
    };
};