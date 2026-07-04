import React from 'react';
import { Sale } from '@/hooks/useSales';

interface SaleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
    onEdit: () => void;
    onDelete: () => void;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ isOpen, onClose, sale, onEdit, onDelete }) => {
    if (!isOpen || !sale) return null;

    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.valor_total);
    const formattedDate = new Date(sale.data).toLocaleDateString('pt-BR');

    const statusClass = sale.status_venda === 'Concluída' 
        ? 'text-green-500 bg-green-500/10' 
        : sale.status_venda === 'Cancelada' 
            ? 'text-red-500 bg-red-500/10' 
            : 'text-yellow-500 bg-yellow-500/10';

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
                    maxWidth: '550px', 
                    padding: '30px',
                    position: 'relative'
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
                
                <div>
                    <h2 style={{ fontSize: '1.6em', marginBottom: '15px', fontWeight: 'bold' }}>
                        Detalhes da Venda #{sale.id}
                    </h2>
                    
                    <div className="space-y-3 border-b border-white/5 pb-4 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Cliente:</span>
                            <span className="font-semibold text-gray-200">{sale.cliente || 'Consumidor Final'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Data:</span>
                            <span className="text-gray-200">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Forma de Pagamento:</span>
                            <span className="text-gray-200">{sale.forma_pagamento}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-400">Status:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusClass}`}>
                                {sale.status_venda}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Itens da Venda</h3>
                    <div className="max-h-48 overflow-y-auto border border-white/5 rounded-xl p-3 bg-white/[0.01] space-y-2 mb-4">
                        {sale.itens.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                                <div>
                                    <span className="font-semibold text-yellow-400">{item.quantidade}x</span> {item.nomeProduto}
                                    <span className="text-[10px] text-gray-500 block">Unitário: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}</span>
                                </div>
                                <span className="font-medium text-gray-200">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalItem)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center py-2 mb-6">
                        <strong className="text-base text-gray-200">Valor Total:</strong> 
                        <span className="text-xl text-green-500 font-black">{formattedTotal}</span>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onEdit} style={{...buttonStyle, background: 'var(--primary-color)', color: '#030712' }}>
                            <i className="fas fa-pen"></i> Alterar Venda
                        </button>
                        <button onClick={onDelete} style={{...buttonStyle, background: '#ef4444', color: 'white' }}>
                            <i className="fas fa-trash-alt"></i> Excluir Venda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleDetailModal;
