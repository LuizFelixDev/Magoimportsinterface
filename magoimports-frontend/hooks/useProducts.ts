import { useState, useEffect, useCallback } from 'react';

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
    preco: number;
    preco_promocional: number | null;
    peso: number | null;
    imagens: string[] | string | null; 
    data_de_cadastro: string;
    ativo: 0 | 1;
}

export interface ProductFormData {
    nome: string;
    preco: number;
    quantidade_em_estoque: number;
    descricao?: string;
    imagens?: string; 
    ativo: 0 | 1;
}

const API_URL = 'http://localhost:2020/products';

const isDataUrl = (str: string): boolean => {
    return str.startsWith('data:image/');
};

const cleanUpImageUrl = (url: string): string => {
    if (typeof url === 'string' && url.startsWith('http://seusite.com')) {
        return 'https://via.placeholder.com/300x200?text=Mock+Data+Cleaned';
    }
    return url;
};

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processProductData = (data: any): Product => {
        let processedImages: string[] = [];

        if (data.imagens && typeof data.imagens === 'string') {
            try {
                let images = JSON.parse(data.imagens);
                if (Array.isArray(images)) {
                     processedImages = images.map((img: string) => cleanUpImageUrl(img.trim()));
                }
            } catch (e) {
                processedImages = [cleanUpImageUrl(data.imagens.trim())];
            }
        } else if (Array.isArray(data.imagens)) {
            processedImages = data.imagens.map((img: string) => cleanUpImageUrl(img.trim()));
        }
        
        data.imagens = processedImages.filter(img => img !== ''); 
        return data as Product;
    };
    
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

    const saveProduct = async (formData: ProductFormData, id: number | null = null) => {
        setError(null);
        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/${id}` : API_URL;

            let imagensArray: string[];
            
            if (formData.imagens && isDataUrl(formData.imagens.trim())) {
                imagensArray = [formData.imagens.trim()];
            } else {
                imagensArray = [];
            }

            const dataToApi = {
                ...formData,
                preco: Number(formData.preco),
                quantidade_em_estoque: Number(formData.quantidade_em_estoque),
                ativo: Number(formData.ativo),
                imagens: JSON.stringify(imagensArray),
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

            await fetchProducts(); 
            return { success: true, message: `Produto ${id ? 'atualizado' : 'cadastrado'} com sucesso!` };

        } catch (err: any) {
            setError(err.message || 'Erro ao salvar o produto.');
            return { success: false, message: err.message || 'Erro ao salvar o produto.' };
        }
    };
    
    const deleteProduct = async (id: number) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.status !== 204) { 
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

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