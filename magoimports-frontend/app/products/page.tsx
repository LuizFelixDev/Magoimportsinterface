'use client'; 
import React, { useState, useCallback } from 'react';
import { useProducts, Product } from '@/hooks/useProducts'; 
import ProductCard from '@/components/ProductCard'; 
import ProductModal from '@/components/ProductModal'; 
import ProductDetailModal from '@/components/ProductDetailModal';

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

export default function HomePage() {
    const { products, isLoading, error, saveProduct, deleteProduct } = useProducts();
    
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [productToView, setProductToView] = useState<Product | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number, nome: string } | null>(null);
    
    const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showAlert = useCallback((message: string, type: 'success' | 'error') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); 
    }, []);

    const filteredProducts = products.filter(product =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenNewModal = () => {
        setProductToEdit(null); 
        setIsProductModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsProductModalOpen(true);
    };
    
    const handleView = (product: Product) => {
        setProductToView(product);
        setIsDetailModalOpen(true);
    };
    
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setProductToView(null);
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
        setProductToEdit(null); 
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    let content;
    const productsToDisplay = searchTerm ? filteredProducts : products;

    if (isLoading) {
        content = <div className="loading-message">Carregando produtos...</div>;
    } else if (error) {
        content = <div className="empty-message error-message">Erro ao carregar produtos. Verifique se a API está online.</div>;
    } else if (products.length === 0 && !searchTerm) {
        content = <div className="empty-message">Nenhum produto cadastrado. Clique em "Novo +" para começar.</div>;
    } else if (productsToDisplay.length === 0 && searchTerm) {
        content = <div className="empty-message">Nenhum produto encontrado para o termo: <strong>"{searchTerm}"</strong>.</div>;
    } else {
        content = productsToDisplay.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onView={handleView} 
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
                <h1 className="nav-title">Gestão de Produtos - MagoImports</h1>
                <button onClick={handleOpenNewModal} className="nav-button new-button">
                    Novo <i className="fas fa-plus"></i>
                </button>
            </header>

            {alert && <Alert message={alert.message} type={alert.type} />}

            <main className="product-grid-container">
                <div className="search-bar-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Buscar produtos por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="product-grid">
                    {content}
                </div>
            </main>

            <ProductDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                product={productToView}
                onEdit={() => {
                    handleCloseDetailModal();
                    if (productToView) {
                        handleEdit(productToView);
                    }
                }}
                onDelete={() => {
                    handleCloseDetailModal();
                    if (productToView) {
                         handleDeleteClick(productToView.id, productToView.nome);
                    }
                }}
            />

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={handleCloseModal}
                onSave={saveProduct}
                productToEdit={productToEdit}
                showAlert={showAlert}
            />

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