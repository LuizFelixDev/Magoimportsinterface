import React from 'react';
import Image from 'next/image';
import { Product } from '@/hooks/useProducts'; 

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onEdit: () => void;
    onDelete: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product, onEdit, onDelete }) => {
    if (!isOpen || !product) return null;
    
    const getImageUrl = (imagens: Product['imagens']) => {
        let firstImageUrl = '';

        if (Array.isArray(imagens) && imagens.length > 0) {
            const foundUrl = imagens.find(url => typeof url === 'string' && url.trim() !== '');
            if (foundUrl) {
                firstImageUrl = foundUrl.trim();
            }
        }
        
        if (firstImageUrl) {
            return firstImageUrl;
        }
        return 'https://via.placeholder.com/300x300?text=Sem+Imagem';
    };

    const imageUrl = getImageUrl(product.imagens);
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco);
    
    const isLocalOrPlaceholder = imageUrl.startsWith('data:image/') || imageUrl.includes('placeholder');
    
    const buttonStyle = {
        padding: '10px 15px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        transition: 'background-color 0.2s, transform 0.1s',
        flexGrow: 1,
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div 
                className="modal-card" 
                style={{ 
                    maxWidth: '700px', 
                    display: 'flex', 
                    gap: '30px', 
                    alignItems: 'flex-start',
                    padding: '30px'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    style={{ 
                        position: 'absolute', 
                        top: '15px', 
                        right: '15px', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-color)', 
                        fontSize: '1.5em', 
                        cursor: 'pointer' 
                    }}
                >
                    <i className="fas fa-times"></i>
                </button>
                
                <div style={{ flexShrink: 0, width: '40%' }}>
                    <Image 
                        src={imageUrl} 
                        alt={product.nome} 
                        width={300}
                        height={300}
                        style={{ 
                            width: '100%', 
                            height: 'auto', 
                            borderRadius: '12px', 
                            objectFit: 'contain', 
                            backgroundColor: 'var(--background-color)' 
                        }}
                        unoptimized={isLocalOrPlaceholder}
                    />
                </div>
                
                <div style={{ flexGrow: 1 }}>
                    <h2 style={{ fontSize: '1.8em', marginBottom: '10px', color: 'black', fontWeight: 'bold' }}>{product.nome}</h2>
                    <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#00ff08', marginBottom: '15px' }}>{formattedPrice}</p>
                    
                    <h3 style={{ fontSize: '1.1em', marginTop: '20px', marginBottom: '5px', color: 'var(--text-color)' }}>Descrição</h3>
                    <p style={{ fontSize: '0.9em', color: 'var(--text-color)' }}>{product.descricao || 'Nenhuma descrição fornecida.'}</p>

                    <h3 style={{ fontSize: '1.1em', marginTop: '20px', marginBottom: '5px', color: 'var(--text-color)' }}>Estoque</h3>
                    <p style={{ fontSize: '0.9em', color: 'var(--text-color)' }}>{product.quantidade_em_estoque} unidades em estoque.</p>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                        <button onClick={onEdit} style={{...buttonStyle, background: 'var(--primary-color)', color: 'var(--foreground)' }}>
                            <i className="fas fa-pen"></i> Alterar Produto
                        </button>
                        <button onClick={onDelete} style={{...buttonStyle, background: '#d32f2f', color: 'white' }}>
                            <i className="fas fa-trash-alt"></i> Excluir Produto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;