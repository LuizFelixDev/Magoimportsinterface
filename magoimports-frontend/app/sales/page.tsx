'use client'; 
import React, { useState, useCallback } from 'react';
import { useSales, Sale } from '../../hooks/useSales'; 
import SaleCard from '../../components/SaleCard'; 
import SaleModal from '../../components/SaleModal';

// Componente para a mensagem de alerta (Reutilizado do Products)
const Alert = ({ message, type }: { message: string, type: 'success' | 'error' }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    setTimeout(() => setIsVisible(false), 3000);

    return (
        <div className={`alert ${type} show`}>
            {message}
        </div>
    );
};

export default function SalesManagerPage() {
    const { sales, isLoading, error, saveSale, deleteSale } = useSales();
    
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<{ id: number, nome: string } | null>(null);
    
    const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showAlert = useCallback((message: string, type: 'success' | 'error') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); 
    }, []);

    const handleOpenNewModal = () => {
        setSaleToEdit(null);
        setIsSaleModalOpen(true);
    };

    const handleEdit = (sale: Sale) => {
        setSaleToEdit(sale);
        setIsSaleModalOpen(true);
    };

    const handleDeleteClick = (id: number, cliente: string) => {
        setSaleToDelete({ id, nome: cliente });
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (saleToDelete) {
            const result = await deleteSale(saleToDelete.id);
            showAlert(result.message, result.success ? 'success' : 'error');
            setIsDeleteModalOpen(false);
            setSaleToDelete(null);
        }
    };

    const handleCloseModal = () => {
        setIsSaleModalOpen(false);
        setSaleToEdit(null);
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSaleToDelete(null);
    };

    let content;
    if (isLoading) {
        content = <div className="loading-message">Carregando vendas...</div>;
    } else if (error) {
        content = <div className="empty-message error-message">Erro ao carregar vendas: {error}. Verifique se a API está online.</div>;
    } else if (sales.length === 0) {
        content = <div className="empty-message">Nenhuma venda cadastrada. Clique em "Novo +" para registrar uma venda.</div>;
    } else {
        content = sales.map(sale => (
            <SaleCard 
                key={sale.id} 
                sale={sale} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
            />
        ));
    }

    return (
        <>
            <header className="navbar">
                <button className="nav-button back-button" onClick={() => window.history.back()}>
                    <i className="fas fa-chevron-left"></i> Voltar
                </button>
                <h1 className="nav-title">Gestão de Vendas - MagoImportes</h1>
                <button onClick={handleOpenNewModal} className="nav-button new-button">
                    Novo <i className="fas fa-plus"></i>
                </button>
            </header>

            {alert && <Alert message={alert.message} type={alert.type} />}

            <main className="product-grid-container">
                <div className="product-grid">
                    {content}
                </div>
            </main>

            <SaleModal
                isOpen={isSaleModalOpen}
                onClose={handleCloseModal}
                onSave={saveSale}
                saleToEdit={saleToEdit}
                showAlert={showAlert}
            />

            <div id="delete-modal" className={`modal-backdrop ${isDeleteModalOpen ? '' : 'hidden'}`}>
                <div className="modal-card small-card">
                    <h2>Confirmar Exclusão</h2>
                    <p>Tem certeza que deseja excluir a venda de: 
                        <strong id="sale-name-to-delete">{saleToDelete?.nome}</strong>?
                    </p>
                    <div className="button-group">
                        <button onClick={handleConfirmDelete} className="delete-button">Excluir</button>
                        <button onClick={handleCancelDelete} className="cancel-button">Cancelar</button>
                    </div>
                </div>
            </div>
        </>
    );
}