import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '@/hooks/useProducts'; 

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: ProductFormData, id: number | null) => Promise<{ success: boolean; message: string }>;
    productToEdit: Product | null;
    showAlert: (message: string, type: 'success' | 'error') => void;
}

const isDataUrl = (str: string): boolean => {
    return str.startsWith('data:image/');
};

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, showAlert }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        nome: '',
        preco: 0,
        quantidade_em_estoque: 0,
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
                 setFormData(prev => ({ 
                     ...prev, 
                     imagens: images[0],
                 }));
            } else {
                 setFormData(prev => ({ 
                    ...prev, 
                    imagens: '',
                 }));
                 setSelectedFileName(null);
            }

            setFormData(prev => ({
                ...prev,
                nome: productToEdit.nome,
                preco: productToEdit.preco,
                quantidade_em_estoque: productToEdit.quantidade_em_estoque,
                descricao: productToEdit.descricao || '',
                ativo: productToEdit.ativo,
            }));
            
        } else {
            setFormData({
                nome: '',
                preco: 0,
                quantidade_em_estoque: 0,
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
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    imagens: reader.result as string, 
                }));
                setSelectedFileName(file.name);
            };
            reader.onerror = () => {
                 showAlert('Erro ao ler o arquivo.', 'error');
                 setSelectedFileName(null);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({ ...prev, imagens: '' }));
            setSelectedFileName(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave: ProductFormData = {
             ...formData,
             preco: parseFloat(formData.preco.toString()),
             quantidade_em_estoque: parseInt(formData.quantidade_em_estoque.toString()),
        };

        if (!dataToSave.nome || isNaN(dataToSave.preco) || isNaN(dataToSave.quantidade_em_estoque)) {
             showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
             return;
        }

        const result = await onSave(dataToSave, isEditMode ? productToEdit!.id : null);

        if (result.success) {
            showAlert(result.message, result.success ? 'success' : 'error');
            onClose(); 
        } else {
            showAlert(result.message, 'error');
        }
    };
    
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
                        <label>Imagem (Upload Local)</label>
                        
                        <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: 'var(--background-color)' }}>
                            <label htmlFor="upload-file" style={{ display: 'block', marginBottom: '5px' }}>Selecionar Arquivo:</label>
                            <input 
                                type="file" 
                                id="upload-file" 
                                name="file-upload" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                style={{ display: 'block', width: '100%', padding: '0' }}
                            />
                            {selectedFileName && (
                                <p style={{ marginTop: '5px', fontSize: '0.8em', color: '#00ff08', fontWeight: 'bold' }}>Selecionado: {selectedFileName}</p>
                            )}
                        </div>
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