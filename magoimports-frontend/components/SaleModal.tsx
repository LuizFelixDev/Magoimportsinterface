import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sale, SaleFormData, SaleStatus, PaymentMethod, SaleItem, ProductPrice } from '@/hooks/useSales'; 

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: SaleFormData, id: number | null) => Promise<{ success: boolean; message: string }>;
    saleToEdit: Sale | null;
    showAlert: (message: string, type: 'success' | 'error') => void;
}

const PRODUCTS_API_URL = 'http://localhost:2020/products';
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
    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [itemQuantity, setItemQuantity] = useState(1);

    useEffect(() => {
        if (!isOpen) return;

        const fetchProducts = async () => {
            try {
                const response = await fetch(PRODUCTS_API_URL);
                if (!response.ok) {
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
        setSelectedProductId('');
        setItemQuantity(1);
    }, [saleToEdit, today]);

    const calculatedTotal = useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + item.totalItem, 0);
    }, [selectedItems]);

    const handleAddItem = useCallback(() => {
        const product = availableProducts.find(p => p.id === selectedProductId);
        
        if (!product || itemQuantity <= 0) {
            showAlert("Selecione um produto e uma quantidade válida.", 'error');
            return;
        }

        const newItem: SaleItem = {
            produtoId: Number(product.id), 
            nomeProduto: product.nome,
            quantidade: Number(itemQuantity), 
            precoUnitario: Number(product.preco),
            totalItem: Number(itemQuantity * product.preco),
        };

        setSelectedItems(prev => {
            const existingIndex = prev.findIndex(item => item.produtoId === product.id);
            if (existingIndex > -1) {
                const updatedItems = [...prev];
                const existingItem = updatedItems[existingIndex];
                
                existingItem.quantidade += newItem.quantidade;
                existingItem.totalItem = existingItem.quantidade * existingItem.precoUnitario;
                return updatedItems;
            } else {
                return [...prev, newItem];
            }
        });

        setSelectedProductId('');
        setItemQuantity(1);

    }, [selectedProductId, itemQuantity, availableProducts, showAlert]);
    
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

                    <div className="item-manager flex gap-2 items-center pt-2 border-t">
                        <div className="flex-1">
                            <label className="text-xs block mb-1">Produto</label>
                            <select value={selectedProductId} onChange={(e) => setSelectedProductId(Number(e.target.value) || '')} className="item-select w-full h-10">
                                <option value="">Selecionar...</option>
                                {availableProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome} (R$ {p.preco.toFixed(2)})</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-16">
                            <label className="text-xs block mb-1">Qtd</label>
                            <input type="number" value={itemQuantity} onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="item-quantity-input w-full h-10" />
                        </div>
                        <div className="self-end">
                            <button type="button" onClick={handleAddItem} className="add-item-button bg-green-600 text-white h-10 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div className="selected-items-list max-h-24 overflow-y-auto border rounded p-2 bg-gray-50">
                        {selectedItems.length === 0 ? (
                            <p className="text-gray-400 text-xs text-center">Nenhum item</p>
                        ) : (
                            selectedItems.map((item) => (
                                <div key={item.produtoId} className="flex justify-between text-xs py-1 border-b last:border-0">
                                    <span>{item.quantidade}x {item.nomeProduto}</span>
                                    <div className="flex items-center gap-2">
                                        <span>R$ {item.totalItem.toFixed(2)}</span>
                                        <button type="button" onClick={() => handleRemoveItem(item.produtoId)} className="text-red-500">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="total-display flex justify-between items-center py-1">
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