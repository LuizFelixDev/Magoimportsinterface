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

    const statusClass = sale.status_venda === 'Concluída' 
        ? 'text-green-600' 
        : sale.status_venda === 'Cancelada' 
            ? 'text-red-600' 
            : 'text-yellow-600';

    return (
        <div className="product-card !flex-row !items-center !justify-between !py-3 !px-6 w-full">
            <div className="flex flex-1 items-center justify-between gap-4">
                <div className="min-w-[80px]">
                    <h3 className="product-title !mb-0 !text-lg">#{sale.id}</h3>
                    <p className="text-[10px] text-gray-500 uppercase">{formattedDate}</p>
                </div>

                <div className="flex-1">
                    <span className="text-[10px] text-gray-400 block uppercase">Cliente</span>
                    <span className="font-medium text-gray-800">{sale.cliente || 'N/A'}</span>
                </div>

                <div className="flex-1">
                    <span className="text-[10px] text-gray-400 block uppercase">Total</span>
                    <span className="product-price !mb-0 !text-base">{formattedTotal}</span>
                </div>

                <div className="flex-1 text-right sm:text-left">
                    <span className="text-[10px] text-gray-400 block uppercase">Status</span>
                    <span className={`text-sm font-bold ${statusClass}`}>{sale.status_venda}</span>
                </div>
            </div>
            
            <div className="actions-menu !relative !top-0 !right-0 ml-4">
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