import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sale, SaleFormData, SaleStatus, PaymentMethod, SaleItem, ProductPrice } from '@/hooks/useSales'; 
import { proxy } from '@/proxy';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: SaleFormData, id: number | null) => Promise<{ success: boolean; message: string }>;
    saleToEdit: Sale | null;
    showAlert: (message: string, type: 'success' | 'error') => void;
}

const statusOptions: SaleStatus[] = ['Concluída', 'Pendente', 'Cancelada'];
const paymentOptions: PaymentMethod[] = ['Dinheiro', 'Cartão de Crédito', 'Pix', 'Boleto'];

const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onSave, saleToEdit, showAlert }) => {
    const today = new Date().toISOString().substring(0, 10);
    
    const [clientName, setClientName] = useState('');
    const [saleDate, setSaleDate] = useState(today);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentOptions[0]); 
    const [saleStatus, setSaleStatus] = useState<SaleStatus>('Concluída');
    const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
    
    const [availableProducts, setAvailableProducts] = useState<ProductPrice[]>([]);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const fetchProducts = async () => {
            try {
                const response = await proxy('/products');
                if (!response || !response.ok) {
                    throw new Error('Falha ao buscar produtos.');
                }
                const data = await response.json();
                
                const productList: ProductPrice[] = data.map((p: any) => ({
                    id: p.id,
                    nome: p.nome,
                    preco: p.preco,
                    quantidade_em_estoque: p.quantidade_em_estoque
                }));
                setAvailableProducts(productList);
            } catch (error: any) {
                showAlert(`Erro ao carregar produtos: ${error.message}`, 'error');
            }
        };
        fetchProducts();
    }, [isOpen, showAlert]);

    useEffect(() => {
        if (saleToEdit) {
            setSaleDate(saleToEdit.data.substring(0, 10));
            setClientName(saleToEdit.cliente || '');
            setPaymentMethod(saleToEdit.forma_pagamento as PaymentMethod);
            setSaleStatus(saleToEdit.status_venda as SaleStatus);
            setSelectedItems(saleToEdit.itens);
        } else {
            setSaleDate(today);
            setClientName('');
            setPaymentMethod(paymentOptions[0]);
            setSaleStatus('Concluída');
            setSelectedItems([]);
        }
    }, [saleToEdit, today]);

    const calculatedTotal = useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + item.totalItem, 0);
    }, [selectedItems]);

    const filteredAvailableProducts = useMemo(() => {
        return availableProducts.filter(p =>
            p.nome.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [availableProducts, productSearch]);
    
    const handleRemoveItem = useCallback((produtoId: number) => {
        setSelectedItems(prev => prev.filter(item => item.produtoId !== produtoId));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedItems.length === 0) {
            showAlert("A venda deve conter pelo menos um item.", 'error');
            return;
        }

        const serializedItems: SaleItem[] = selectedItems.map(item => ({
            produtoId: Number(item.produtoId),
            nomeProduto: item.nomeProduto,
            quantidade: Number(item.quantidade),
            precoUnitario: Number(item.precoUnitario),
            totalItem: Number(item.totalItem),
        }));

        const formData: SaleFormData = {
            data: saleDate,
            cliente: clientName || null,
            forma_pagamento: paymentMethod,
            status_venda: saleStatus,
            valor_total: calculatedTotal, 
            itens: JSON.stringify(serializedItems), 
        };

        const result = await onSave(formData, saleToEdit ? saleToEdit.id : null);

        if (result.success) {
            showAlert(result.message, 'success');
            onClose(); 
        } else {
            showAlert(result.message, 'error');
        }
    };
    
    const handleClose = () => {
        setAvailableProducts([]);
        onClose();
    };
    
    const handleBasicChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setter(e.target.value);
        };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-card max-w-md">
                <h2 id="modal-title" className="text-lg font-bold mb-4">{saleToEdit ? `Editar Venda #${saleToEdit.id}` : 'Nova Venda'}</h2>
                
                <form className="form-container space-y-3" onSubmit={handleSave}>
                    <div className="flex gap-3">
                        <div className="input-group flex-1">
                            <label htmlFor="data">Data</label>
                            <input type="date" id="data" value={saleDate} onChange={handleBasicChange(setSaleDate)} required />
                        </div>
                        <div className="input-group flex-1">
                            <label htmlFor="status_venda">Status</label>
                            <select id="status_venda" value={saleStatus} onChange={(e) => setSaleStatus(e.target.value as SaleStatus)}>
                                 {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="cliente">Cliente</label>
                        <input type="text" id="cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Opcional" />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="forma_pagamento">Pagamento</label>
                        <select id="forma_pagamento" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                            {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="input-group pt-2 border-t border-white/10">
                        <label>Produtos</label>
                        <div className="relative mb-2">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <i className="fas fa-search text-gray-400 text-xs"></i>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Pesquisar produto pelo nome..." 
                                value={productSearch} 
                                onChange={(e) => setProductSearch(e.target.value)} 
                                className="w-full pl-9 pr-3 py-2 text-sm bg-[#0d1222] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            />
                        </div>
                        
                        <div className="product-checklist max-h-48 overflow-y-auto border border-white/10 rounded-xl p-2 bg-[#0d1222] space-y-1.5 scrollbar-thin">
                            {filteredAvailableProducts.length === 0 ? (
                                <p className="text-gray-400 text-xs text-center py-4">Nenhum produto cadastrado ou encontrado</p>
                            ) : (
                                filteredAvailableProducts.map(p => {
                                    const isChecked = selectedItems.some(item => item.produtoId === p.id);
                                    const selectedItem = selectedItems.find(item => item.produtoId === p.id);
                                    const quantity = selectedItem ? selectedItem.quantidade : 1;
                                    
                                    return (
                                        <div 
                                            key={p.id} 
                                            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                                                isChecked 
                                                    ? 'bg-yellow-400/5 border-yellow-400/30' 
                                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                            }`}
                                        >
                                            <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-200 flex-1 min-w-0 pr-2 select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked} 
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            const newItem: SaleItem = {
                                                                produtoId: p.id,
                                                                nomeProduto: p.nome,
                                                                quantidade: 1,
                                                                precoUnitario: p.preco,
                                                                totalItem: p.preco,
                                                            };
                                                            setSelectedItems(prev => [...prev, newItem]);
                                                        } else {
                                                            setSelectedItems(prev => prev.filter(item => item.produtoId !== p.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-white/20 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 bg-[#0b0f19] cursor-pointer"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-gray-200 truncate" title={p.nome}>{p.nome}</span>
                                                    <span className="text-xs text-yellow-400/90 font-semibold">R$ {p.preco.toFixed(2)}</span>
                                                </div>
                                            </label>
                                            
                                            {isChecked && (
                                                <div className="flex items-center gap-1.5 bg-[#0b0f19] px-2 py-1 rounded-lg border border-white/5 shadow-inner">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Qtd:</span>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        value={quantity} 
                                                        onChange={(e) => {
                                                            const val = Math.max(1, parseInt(e.target.value) || 1);
                                                            setSelectedItems(prev => prev.map(item => 
                                                                item.produtoId === p.id 
                                                                    ? { ...item, quantidade: val, totalItem: val * p.preco }
                                                                    : item
                                                            ));
                                                        }}
                                                        className="w-10 h-6 text-center text-xs bg-transparent border-0 text-white focus:ring-0 focus:outline-none p-0 font-bold"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="selected-items-list">
                        {selectedItems.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">Nenhum produto selecionado</p>
                        ) : (
                            selectedItems.map((item) => (
                                <div key={item.produtoId} className="item-row">
                                    <span className="text-sm font-medium text-gray-200">
                                        {item.quantidade}x {item.nomeProduto}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-yellow-400">
                                            R$ {item.totalItem.toFixed(2)}
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveItem(item.produtoId)} 
                                            className="remove-item-button"
                                            title="Remover"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="total-display">
                        <strong className="text-sm">Total:</strong> 
                        <span className="total-price text-green-700 font-bold">R$ {calculatedTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={handleClose} className="cancel-button flex-1 py-2 bg-gray-100 rounded text-sm">Cancelar</button>
                        <button type="submit" className="register-button flex-1 py-2 rounded text-sm">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaleModal;