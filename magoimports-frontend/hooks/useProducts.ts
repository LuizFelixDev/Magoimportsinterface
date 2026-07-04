import { useState, useEffect, useCallback } from 'react';
import { proxy } from '@/proxy';

export interface Product { 
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
    estoque_minimo: number;
    preco: number;
    preco_promocional: number | null;
    peso: number | null;
    imagens: string[] | null; 
    data_de_cadastro: string;
    ativo: 0 | 1;
}

export interface ProductFormData {
    nome: string;
    preco: number;
    quantidade_em_estoque: number;
    estoque_minimo: number;
    descricao?: string;
    imagens?: string[]; 
    ativo: 0 | 1;
}

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processProductData = (data: any): Product => {
        if (data.imagens && typeof data.imagens === 'string') {
            try {
                data.imagens = JSON.parse(data.imagens);
            } catch (e) {
                data.imagens = [data.imagens];
            }
        }
        return data as Product;
    };
    
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await proxy('/products');
            if (!response || !response.ok) throw new Error('Falha ao buscar produtos na API.');
            const data = await response.json();
            const processedData = data.map(processProductData);
            setProducts(processedData);
        } catch (err: any) {
            setError(err.message || 'Erro de rede ao buscar produtos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveProduct = async (formData: ProductFormData, id: number | null = null) => {
        setError(null);
        try {
            const method = id ? 'PUT' : 'POST';
            const endpoint = id ? `/products/${id}` : '/products';

            const dataToApi = {
                ...formData,
                preco: Number(formData.preco),
                quantidade_em_estoque: Number(formData.quantidade_em_estoque),
                estoque_minimo: Number(formData.estoque_minimo),
                ativo: Number(formData.ativo),
                imagens: typeof formData.imagens === 'string' ? (formData.imagens ? [formData.imagens] : []) : (formData.imagens || []),
            };
            
            const response = await proxy(endpoint, {
                method,
                body: JSON.stringify(dataToApi),
            });

            if (!response || !response.ok) {
                const errorData = response ? await response.json() : {};
                throw new Error(errorData.error || `Erro ao salvar produto.`);
            }

            await fetchProducts(); 
            return { success: true, message: `Produto ${id ? 'atualizado' : 'cadastrado'} com sucesso!` };
        } catch (err: any) {
            return { success: false, message: err.message || 'Erro ao salvar o produto.' };
        }
    };
    
    const deleteProduct = async (id: number) => {
        setError(null);
        try {
            const response = await proxy(`/products/${id}`, { method: 'DELETE' });
            if (!response || response.status !== 204) { 
                const errorData = response ? await response.json() : {};
                throw new Error(errorData.error || `Erro ao excluir produto.`);
            }
            setProducts(prev => prev.filter(p => p.id !== id));
            return { success: true, message: 'Produto excluído com sucesso!' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Erro ao excluir o produto.' };
        }
    };

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    return { products, isLoading, error, fetchProducts, saveProduct, deleteProduct };
};