import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/hooks/useProducts'; 

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: number, nome: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // CORREÇÃO DEFINITIVA: Garante que o src nunca será nulo ou uma string vazia.
    const getImageUrl = (imagens: Product['imagens']) => {
        let firstImageUrl = '';

        if (Array.isArray(imagens) && imagens.length > 0) {
            // Procura pelo primeiro URL que seja uma string não vazia
            const foundUrl = imagens.find(url => typeof url === 'string' && url.trim() !== '');
            if (foundUrl) {
                firstImageUrl = foundUrl.trim();
            }
        }
        
        // Se a busca falhar, retorna o placeholder configurado
        if (firstImageUrl) {
            return firstImageUrl;
        }
        return 'https://via.placeholder.com/300x200?text=Sem+Imagem';
    };

    const imageUrl = getImageUrl(product.imagens);
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco);

    return (
        <div className="product-card">
            {/* O componente Image agora recebe apenas strings válidas */}
            <Image 
                src={imageUrl} 
                alt={product.nome} 
                className="product-image" 
                width={300}
                height={200}
                style={{ objectFit: 'cover' }}
                unoptimized={imageUrl.includes('placeholder')}
            />
            
            <div className="product-info">
                <h3 className="product-title">{product.nome}</h3>
                <p className="product-price">{formattedPrice}</p>
                <p className="product-description">{product.descricao || 'Sem descrição.'}</p>
            </div>
            
            {/* Menu de Ações (3 pontinhos) */}
            <div className="actions-menu">
                <button 
                    className="menu-button" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(prev => !prev);
                    }}
                >
                    <i className="fas fa-ellipsis-v"></i>
                </button>
                
                <div className={`dropdown-menu ${isMenuOpen ? 'visible' : ''}`} 
                     onMouseLeave={() => setIsMenuOpen(false)}>
                    
                    <button onClick={() => onEdit(product)}>
                        <i className="fas fa-pen"></i> Alterar
                    </button>
                    
                    <button className="delete" onClick={() => onDelete(product.id, product.nome)}>
                        <i className="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;