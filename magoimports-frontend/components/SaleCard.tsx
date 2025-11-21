import React, { useState } from 'react';
import { Sale } from '@/hooks/useSales';

interface SaleCardProps {
    sale: Sale;
    onEdit: (sale: Sale) => void;
    onDelete: (id: number, cliente: string) => void;
}

const SaleCard: React.FC<SaleCardProps> = ({ sale, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.valor_total);
    const formattedDate = new Date(sale.data).toLocaleDateString('pt-BR');

    // Estilo condicional para o status
    const statusClass = sale.status_venda === 'Concluída' 
        ? 'text-green-600' 
        : sale.status_venda === 'Cancelada' 
            ? 'text-red-600' 
            : 'text-yellow-600';

    return (
        <div className="product-card"> {/* Reutilizamos a classe de estilo do produto */}
            <div className="product-info">
                <h3 className="product-title">Venda #{sale.id}</h3>
                <p>Cliente: <strong>{sale.cliente || 'N/A'}</strong></p>
                <p className="product-price">Total: {formattedTotal}</p>
                <p className={`font-semibold ${statusClass}`}>Status: {sale.status_venda}</p>
                <p className="text-sm text-gray-500 mt-2">Data: {formattedDate}</p>
            </div>
            
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
                    
                    <button onClick={() => onEdit(sale)}>
                        <i className="fas fa-pen"></i> Alterar
                    </button>
                    
                    <button className="delete" onClick={() => onDelete(sale.id, sale.cliente || `Venda ${sale.id}`)}>
                        <i className="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleCard;