import { useState, useEffect, useCallback } from 'react';

// Tipagem baseada em src/routes/products.ts
interface Product {
    id: number;
    nome: string;
    descricao: string | null;
    categoria: string | null;
    subcategoria: string | null;
    marca: string | null;
    modelo: string | null;
    material: string | null;
    cor: string | null;
    tamanho: string | null;
    quantidade_em_estoque: number;
    preco: number;
    preco_promocional: number | null;
    peso: number | null;
    // O backend retorna 'imagens' como string JSON, mas o React usará o array.
    imagens: string[] | string | null; 
    data_de_cadastro: string;
    ativo: 0 | 1;
}

// Interface para os dados do formulário
export interface ProductFormData {
    nome: string;
    preco: number;
    quantidade_em_estoque: number;
    descricao?: string;
    imagens?: string; // string de URLs separadas por vírgula no formulário
    ativo: 0 | 1;
}

const API_URL = 'http://localhost:2020/products';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função auxiliar para processar dados de imagem do backend (string JSON para Array)
    const processProductData = (data: any): Product => {
        if (data.imagens && typeof data.imagens === 'string') {
            try {
                data.imagens = JSON.parse(data.imagens);
            } catch (e) {
                // Em caso de falha no parse, trata como string simples de URL (ou array se for apenas um)
                data.imagens = [data.imagens];
            }
        } else if (!data.imagens) {
             data.imagens = [];
        }
        return data as Product;
    };
    
    // Função para buscar produtos (READ)
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Falha ao buscar produtos na API.');
            }
            const data = await response.json();
            const processedData = data.map(processProductData);
            setProducts(processedData);
        } catch (err: any) {
            setError(err.message || 'Erro de rede ao buscar produtos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Função para criar/atualizar produto (CREATE/UPDATE)
    const saveProduct = async (formData: ProductFormData, id: number | null = null) => {
        setError(null);
        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/${id}` : API_URL;

            // Prepara os dados para a API (converte a string de URLs para string JSON)
            const imagensArray = formData.imagens 
                ? formData.imagens.split(',').map(s => s.trim()).filter(s => s.length > 0)
                : [];

            const dataToApi = {
                ...formData,
                preco: Number(formData.preco),
                quantidade_em_estoque: Number(formData.quantidade_em_estoque),
                ativo: Number(formData.ativo),
                imagens: JSON.stringify(imagensArray), // API espera string JSON
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

            // Atualiza o estado após o sucesso
            await fetchProducts(); 
            return { success: true, message: `Produto ${id ? 'atualizado' : 'cadastrado'} com sucesso!` };

        } catch (err: any) {
            setError(err.message || 'Erro ao salvar o produto.');
            return { success: false, message: err.message || 'Erro ao salvar o produto.' };
        }
    };
    
    // Função para deletar produto (DELETE)
    const deleteProduct = async (id: number) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.status !== 204) { // Espera 204 No Content para sucesso
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            // Atualiza o estado removendo o produto deletado (Reatividade)
            setProducts(prev => prev.filter(p => p.id !== id));
            return { success: true, message: 'Produto excluído com sucesso!' };

        } catch (err: any) {
            setError(err.message || 'Erro ao excluir o produto.');
            return { success: false, message: err.message || 'Erro ao excluir o produto.' };
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        isLoading,
        error,
        fetchProducts,
        saveProduct,
        deleteProduct,
        processProductData,
    };
};