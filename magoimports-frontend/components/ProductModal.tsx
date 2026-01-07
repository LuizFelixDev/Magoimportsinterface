import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '@/hooks/useProducts'; 

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: ProductFormData, id: number | null) => Promise<{ success: boolean; message: string }>;
    productToEdit: Product | null;
    showAlert: (message: string, type: 'success' | 'error') => void;
}

const isDataUrl = (str: string): boolean => str.startsWith('data:image/');

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, showAlert }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        nome: '',
        preco: 0,
        quantidade_em_estoque: 0,
        estoque_minimo: 0,
        descricao: '',
        imagens: '',
        ativo: 1,
    });
    
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const isEditMode = !!productToEdit;

    useEffect(() => {
        if (productToEdit) {
            const images = Array.isArray(productToEdit.imagens) 
                ? productToEdit.imagens 
                : typeof productToEdit.imagens === 'string' 
                    ? (JSON.parse(productToEdit.imagens) as string[]) 
                    : [];
            
            const isBase64 = images.length === 1 && isDataUrl(images[0]);
            
            if (isBase64) {
                 setSelectedFileName("Arquivo Local (Base64)");
                 setFormData(prev => ({ ...prev, imagens: images[0] }));
            } else {
                 setFormData(prev => ({ ...prev, imagens: '' }));
                 setSelectedFileName(null);
            }

            setFormData(prev => ({
                ...prev,
                nome: productToEdit.nome,
                preco: productToEdit.preco,
                quantidade_em_estoque: productToEdit.quantidade_em_estoque,
                estoque_minimo: productToEdit.estoque_minimo ?? 0,
                descricao: productToEdit.descricao || '',
                ativo: productToEdit.ativo,
            }));
        } else {
            setFormData({
                nome: '',
                preco: 0,
                quantidade_em_estoque: 0,
                estoque_minimo: 0,
                descricao: '',
                imagens: '',
                ativo: 1,
            });
            setSelectedFileName(null);
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imagens: reader.result as string }));
                setSelectedFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: ProductFormData = {
             ...formData,
             preco: parseFloat(formData.preco.toString()),
             quantidade_em_estoque: parseInt(formData.quantidade_em_estoque.toString()),
             estoque_minimo: parseInt(formData.estoque_minimo.toString()),
        };

        if (!dataToSave.nome || isNaN(dataToSave.preco)) {
             showAlert('Preencha os campos obrigatórios.', 'error');
             return;
        }

        const result = await onSave(dataToSave, isEditMode ? productToEdit!.id : null);
        if (result.success) {
            showAlert(result.message, 'success');
            onClose(); 
        } else {
            showAlert(result.message, 'error');
        }
    };
    
    return (
        <div className={`modal-backdrop ${isOpen ? '' : 'hidden'}`}>
            <div className="modal-card">
                <h2>{isEditMode ? `Editar Produto #${productToEdit?.id}` : 'Novo Produto'}</h2>
                <form className="form-container" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nome</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Preço (R$)</label>
                        <input type="number" name="preco" step="0.01" value={formData.preco} onChange={handleNumberChange} required />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>Estoque Atual</label>
                            <input type="number" name="quantidade_em_estoque" value={formData.quantidade_em_estoque} onChange={handleNumberChange} required />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>Estoque Mínimo</label>
                            <input type="number" name="estoque_minimo" value={formData.estoque_minimo} onChange={handleNumberChange} required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Descrição</label>
                        <textarea name="descricao" rows={2} value={formData.descricao} onChange={handleChange}></textarea>
                    </div>
                    <div className="input-group">
                        <label>Imagem</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {selectedFileName && <p style={{color: '#00ff08'}}>✓ {selectedFileName}</p>}
                    </div>
                    <div className="input-group radio-group">
                        <label>Ativo:</label>
                        <input type="radio" name="ativo" value={1} checked={formData.ativo === 1} onChange={handleChange} /> Sim
                        <input type="radio" name="ativo" value={0} checked={formData.ativo === 0} onChange={handleChange} /> Não
                    </div>
                    <button type="submit" className="register-button">{isEditMode ? 'Salvar' : 'Cadastrar'}</button>
                </form>
                <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            </div>
        </div>
    );
};

export default ProductModal;