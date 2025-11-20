import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '@/hooks/useProducts'; 

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: ProductFormData, id: number | null) => Promise<{ success: boolean; message: string }>;
    productToEdit: Product | null;
    showAlert: (message: string, type: 'success' | 'error') => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, showAlert }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        nome: '',
        preco: 0,
        quantidade_em_estoque: 0,
        descricao: '',
        imagens: '',
        ativo: 1,
    });
    
    const isEditMode = !!productToEdit;

    // Efeito para preencher o formulário quando um produto para edição é passado
    useEffect(() => {
        if (productToEdit) {
            // Processa o campo 'imagens' para a string de URLs separadas por vírgula no formulário
            let imageUrls = '';
            const images = Array.isArray(productToEdit.imagens) 
                ? productToEdit.imagens 
                : typeof productToEdit.imagens === 'string' 
                    ? (JSON.parse(productToEdit.imagens) as string[]) 
                    : [];
            imageUrls = images.join(', ');
            
            setFormData({
                nome: productToEdit.nome,
                preco: productToEdit.preco,
                quantidade_em_estoque: productToEdit.quantidade_em_estoque,
                descricao: productToEdit.descricao || '',
                imagens: imageUrls,
                ativo: productToEdit.ativo,
            });
        } else {
            // Limpa o formulário para o modo de cadastro
            setFormData({
                nome: '',
                preco: 0,
                quantidade_em_estoque: 0,
                descricao: '',
                imagens: '',
                ativo: 1,
            });
        }
    }, [productToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'radio' ? parseInt(value) : value,
        }));
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Trata a entrada como string para campos de número
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Coleta os valores do formulário e converte para os tipos corretos
        const dataToSave: ProductFormData = {
             ...formData,
             preco: parseFloat(formData.preco.toString()),
             quantidade_em_estoque: parseInt(formData.quantidade_em_estoque.toString()),
        };

        // Validação básica (campos obrigatórios)
        if (!dataToSave.nome || isNaN(dataToSave.preco) || isNaN(dataToSave.quantidade_em_estoque)) {
             showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
             return;
        }

        const result = await onSave(dataToSave, isEditMode ? productToEdit.id : null);

        if (result.success) {
            showAlert(result.message, result.success ? 'success' : 'error');
            onClose(); 
        } else {
            showAlert(result.message, 'error');
        }
    };
    
    // A classe 'hidden' é controlada via CSS e a prop 'isOpen'
    return (
        <div className={`modal-backdrop ${isOpen ? '' : 'hidden'}`}>
            <div className="modal-card">
                <h2 id="modal-title">{isEditMode ? `Editar Produto #${productToEdit?.id}` : 'Cadastrar Novo Produto'}</h2>
                <form className="form-container" onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="nome">Nome do Produto</label>
                        <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="preco">Preço (R$)</label>
                        {/* Usando value como string para permitir entradas parciais e formatação no futuro */}
                        <input type="number" id="preco" name="preco" step="0.01" value={formData.preco} onChange={handleNumberChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="quantidade_em_estoque">Estoque</label>
                        <input type="number" id="quantidade_em_estoque" name="quantidade_em_estoque" value={formData.quantidade_em_estoque} onChange={handleNumberChange} required />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="descricao">Descrição</label>
                        <textarea id="descricao" name="descricao" rows={3} value={formData.descricao} onChange={handleChange}></textarea>
                    </div>

                    <div className="input-group">
                        <label htmlFor="imagens">URL da Imagem (Ex: "url1.jpg,url2.png")</label>
                        <input type="text" id="imagens" name="imagens" value={formData.imagens} onChange={handleChange} />
                    </div>
                    
                    <div className="input-group radio-group">
                        <label>Ativo:</label>
                        <input type="radio" id="ativo-sim" name="ativo" value={1} checked={formData.ativo === 1} onChange={handleChange} /> 
                        <label htmlFor="ativo-sim">Sim</label>
                        
                        <input type="radio" id="ativo-nao" name="ativo" value={0} checked={formData.ativo === 0} onChange={handleChange} /> 
                        <label htmlFor="ativo-nao">Não</label>
                    </div>

                    <button type="submit" className="register-button">
                        {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                </form>
                <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            </div>
        </div>
    );
};

export default ProductModal;