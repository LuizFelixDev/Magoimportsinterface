import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sale, SaleFormData, SaleStatus, PaymentMethod, SaleItem, ProductPrice } from '@/hooks/useSales'; 

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: SaleFormData, id: number | null) => Promise<{ success: boolean; message: string }>;
    saleToEdit: Sale | null;
    showAlert: (message: string, type: 'success' | 'error') => void;
}

// URLs e Constantes
const PRODUCTS_API_URL = 'http://localhost:2020/products';
const statusOptions: SaleStatus[] = ['Pendente', 'Concluída', 'Cancelada'];
const paymentOptions: PaymentMethod[] = ['Dinheiro', 'Cartão de Crédito', 'Pix', 'Boleto'];

const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onSave, saleToEdit, showAlert }) => {
    const today = new Date().toISOString().substring(0, 10);
    
    // --- ESTADO LOCAL (Tipagem correta aplicada aqui) ---
    const [clientName, setClientName] = useState('');
    const [saleDate, setSaleDate] = useState(today);
    // CORREÇÃO: Inicializando com a tipagem PaymentMethod e SaleStatus
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentOptions[0]); 
    const [saleStatus, setSaleStatus] = useState<SaleStatus>(statusOptions[0]);
    const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
    
    const [availableProducts, setAvailableProducts] = useState<ProductPrice[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [itemQuantity, setItemQuantity] = useState(1);

    // --- EFEITOS DE DADOS ---

    // 1. Efeito para buscar produtos disponíveis (para o dropdown)
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

    // 2. Efeito para popular o modal em modo de EDIÇÃO
    useEffect(() => {
        if (saleToEdit) {
            setSaleDate(saleToEdit.data.substring(0, 10));
            setClientName(saleToEdit.cliente || '');
            setPaymentMethod(saleToEdit.forma_pagamento as PaymentMethod); // Asserção de tipo
            setSaleStatus(saleToEdit.status_venda as SaleStatus); // Asserção de tipo
            setSelectedItems(saleToEdit.itens);
        } else {
            setSaleDate(today);
            setClientName('');
            setPaymentMethod(paymentOptions[0]);
            setSaleStatus(statusOptions[0]);
            setSelectedItems([]);
        }
        setSelectedProductId('');
        setItemQuantity(1);
    }, [saleToEdit, today]);

    // --- CÁLCULO E LÓGICA DE ITENS ---

    // Cálculo automático do valor total
    const calculatedTotal = useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + item.totalItem, 0);
    }, [selectedItems]);

    // Adicionar item à venda
    const handleAddItem = useCallback(() => {
        const product = availableProducts.find(p => p.id === selectedProductId);
        
        if (!product || itemQuantity <= 0) {
            showAlert("Selecione um produto e uma quantidade válida.", 'error');
            return;
        }

        const newItem: SaleItem = {
            produtoId: product.id,
            nomeProduto: product.nome,
            quantidade: itemQuantity,
            precoUnitario: product.preco,
            totalItem: itemQuantity * product.preco,
        };

        setSelectedItems(prev => {
            const existingIndex = prev.findIndex(item => item.produtoId === product.id);
            if (existingIndex > -1) {
                const updatedItems = [...prev];
                const existingItem = updatedItems[existingIndex];
                
                existingItem.quantidade += itemQuantity;
                existingItem.totalItem = existingItem.quantidade * existingItem.precoUnitario;
                return updatedItems;
            } else {
                return [...prev, newItem];
            }
        });

        setSelectedProductId('');
        setItemQuantity(1);

    }, [selectedProductId, itemQuantity, availableProducts, showAlert]);
    
    // Remover item da venda
    const handleRemoveItem = useCallback((produtoId: number) => {
        setSelectedItems(prev => prev.filter(item => item.produtoId !== produtoId));
    }, []);

    // --- SUBMISSÃO ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedItems.length === 0) {
            showAlert("A venda deve conter pelo menos um item.", 'error');
            return;
        }

        const formData: SaleFormData = {
            data: saleDate,
            cliente: clientName || null,
            forma_pagamento: paymentMethod,
            status_venda: saleStatus,
            valor_total: calculatedTotal, 
            itens: JSON.stringify(selectedItems), 
        };

        const result = await onSave(formData, saleToEdit ? saleToEdit.id : null);

        if (result.success) {
            showAlert(result.message, 'success');
            onClose(); 
        } else {
            showAlert(result.message, 'error');
        }
    };
    
    // Reseta o estado local ao fechar o modal
    const handleClose = () => {
        setAvailableProducts([]);
        onClose();
    };
    
    // Handler para inputs de texto (Cliente, Data) e select sem tipo de união
    const handleBasicChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setter(e.target.value);
        };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <h2 id="modal-title">{saleToEdit ? `Editar Venda #${saleToEdit.id}` : 'Cadastrar Nova Venda'}</h2>
                
                <form className="form-container" onSubmit={handleSave}>
                    
                    {/* Campos de Informação Básica da Venda */}
                    <div className="input-group">
                        <label htmlFor="data">Data da Venda</label>
                        <input type="date" id="data" name="data" value={saleDate} onChange={handleBasicChange(setSaleDate)} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="cliente">Nome do Cliente (Opcional)</label>
                        <input type="text" id="cliente" name="cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="forma_pagamento">Forma de Pagamento</label>
                        <select 
                            id="forma_pagamento" 
                            name="forma_pagamento" 
                            value={paymentMethod} 
                            // CORREÇÃO DE TIPO: Asserção de tipo
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        >
                            {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="status_venda">Status da Venda</label>
                        <select 
                            id="status_venda" 
                            name="status_venda" 
                            value={saleStatus} 
                            // CORREÇÃO DE TIPO: Asserção de tipo
                            onChange={(e) => setSaleStatus(e.target.value as SaleStatus)}
                        >
                             {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* --- GERENCIADOR DE ITENS --- */}
                    <h3>Adicionar Produto</h3>
                    <div className="item-manager">
                        <select 
                            value={selectedProductId} 
                            onChange={(e) => setSelectedProductId(Number(e.target.value) || '')} 
                            required={selectedItems.length === 0}
                            className="item-select"
                        >
                            <option value="">Selecione um Produto</option>
                            {availableProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nome} (Estoque: {p.quantidade_em_estoque}, R$ {p.preco.toFixed(2)})
                                </option>
                            ))}
                        </select>

                        <input 
                            type="number" 
                            value={itemQuantity} 
                            onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            min="1" 
                            className="item-quantity-input"
                        />
                        <button type="button" onClick={handleAddItem} className="add-item-button">
                            Adicionar <i className="fas fa-cart-plus"></i>
                        </button>
                    </div>

                    {/* --- LISTA DE ITENS SELECIONADOS --- */}
                    <h3 className="mt-4">Itens Selecionados ({selectedItems.length})</h3>
                    <div className="selected-items-list">
                        {selectedItems.length === 0 ? (
                            <p className="text-gray-500">Nenhum item adicionado.</p>
                        ) : (
                            selectedItems.map((item) => (
                                <div key={item.produtoId} className="item-row">
                                    <span>{item.quantidade}x {item.nomeProduto}</span>
                                    <span>R$ {item.totalItem.toFixed(2)}</span>
                                    <button type="button" onClick={() => handleRemoveItem(item.produtoId)} className="remove-item-button">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* --- VALOR TOTAL (APENAS LEITURA) --- */}
                    <div className="total-display">
                        <strong>Valor Total:</strong> 
                        <span className="total-price">
                           R$ {calculatedTotal.toFixed(2)}
                        </span>
                    </div>

                    <button type="submit" className="register-button">
                        {saleToEdit ? 'Salvar Venda' : 'Cadastrar Venda'}
                    </button>
                </form>
                <button type="button" onClick={handleClose} className="cancel-button">Cancelar</button>
            </div>
        </div>
    );
};

export default SaleModal;