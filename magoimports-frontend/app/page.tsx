'use client'; 
import React, { useState, useCallback } from 'react';
import { useProducts, Product } from '@/hooks/useProducts'; 
import ProductCard from '@/components/ProductCard'; 
import ProductModal from '@/components/ProductModal'; 

// Componente para a mensagem de alerta (para reatividade e animações)
const Alert = ({ message, type }: { message: string, type: 'success' | 'error' }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    // Esconde o alerta após 3 segundos
    setTimeout(() => setIsVisible(false), 3000);

    return (
        <div className={`alert ${type} show`}>
            {message}
        </div>
    );
};

// Componente da Página Principal (usa 'use client' para interatividade)
export default function HomePage() {
    const { products, isLoading, error, saveProduct, deleteProduct } = useProducts();
    
    // Estados para o Modal de Cadastro/Edição
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    
    // Estados para o Modal de Exclusão
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number, nome: string } | null>(null);
    
    // Estado para Alertas
    const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showAlert = useCallback((message: string, type: 'success' | 'error') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); 
    }, []);

    // Manipuladores de Ações
    
    const handleOpenNewModal = () => {
        setProductToEdit(null); // Limpa o produto para edição
        setIsProductModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteClick = (id: number, nome: string) => {
        setProductToDelete({ id, nome });
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (productToDelete) {
            const result = await deleteProduct(productToDelete.id);
            showAlert(result.message, result.success ? 'success' : 'error');
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const handleCloseModal = () => {
        setIsProductModalOpen(false);
        setProductToEdit(null); // Garante que limpa o estado de edição
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    // Renderização Condicional
    let content;
    if (isLoading) {
        content = <div className="loading-message">Carregando produtos...</div>;
    } else if (error) {
        content = <div className="empty-message error-message">Erro ao carregar produtos. Verifique se a API está online.</div>;
    } else if (products.length === 0) {
        content = <div className="empty-message">Nenhum produto cadastrado. Clique em "Novo +" para começar.</div>;
    } else {
        content = products.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
            />
        ));
    }

    return (
        <>
            {/* Navbar */}
            <header className="navbar">
                <button className="nav-button back-button" onClick={() => window.history.back()}>
                    <i className="fas fa-chevron-left"></i> Voltar
                </button>
                <h1 className="nav-title">Gestão de Produtos ✨</h1>
                <button onClick={handleOpenNewModal} className="nav-button new-button">
                    Novo <i className="fas fa-plus"></i>
                </button>
            </header>

            {/* Alerta de Feedback */}
            {alert && <Alert message={alert.message} type={alert.type} />}

            {/* Grid de Produtos */}
            <main className="product-grid-container">
                <div className="product-grid">
                    {content}
                </div>
            </main>

            {/* Modal de Cadastro/Edição */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={handleCloseModal}
                onSave={saveProduct}
                productToEdit={productToEdit}
                showAlert={showAlert}
            />

            {/* Modal de Confirmação de Exclusão */}
            <div id="delete-modal" className={`modal-backdrop ${isDeleteModalOpen ? '' : 'hidden'}`}>
                <div className="modal-card small-card">
                    <h2>Confirmar Exclusão</h2>
                    <p>Tem certeza que deseja excluir o produto: 
                        <strong id="product-name-to-delete">{productToDelete?.nome}</strong>?
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