document.addEventListener('DOMContentLoaded', () => {
    // Configuração
    const API_BASE_URL = 'http://localhost:2020';
    const API_URL = `${API_BASE_URL}/products`;
    
    // Elementos do DOM
    const productGrid = document.getElementById('product-grid');
    const btnNovoProduto = document.getElementById('btn-novo-produto');
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const btnCancelar = document.getElementById('btn-cancelar');
    const productForm = document.getElementById('product-form');
    const btnSubmit = document.getElementById('btn-submit');
    const deleteModal = document.getElementById('delete-modal');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const productNameToDelete = document.getElementById('product-name-to-delete');

    let currentProductId = null;

    /**
     * Exibe uma mensagem de feedback (sucesso ou erro) ao usuário.
     * @param {string} message A mensagem a ser exibida.
     * @param {string} type O tipo de alerta ('success' ou 'error').
     */
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        // Animação de entrada
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);

        // Animação de saída e remoção
        setTimeout(() => {
            alertDiv.classList.remove('show');
            // Remove o elemento após a transição de saída
            alertDiv.addEventListener('transitionend', () => alertDiv.remove());
        }, 3000);
    }
    
    /**
     * Alterna a visibilidade do modal de cadastro/edição com animação.
     * @param {boolean} show Se deve exibir (true) ou ocultar (false).
     */
    function toggleProductModal(show) {
        if (show) {
            productModal.classList.remove('hidden');
        } else {
            productModal.classList.add('hidden');
            // Limpa o formulário e o ID após a animação de saída
            setTimeout(() => {
                productForm.reset();
                document.getElementById('product-id').value = '';
                currentProductId = null;
                btnSubmit.textContent = 'Cadastrar';
                modalTitle.textContent = 'Cadastrar Novo Produto';
            }, 300); 
        }
    }

    /**
     * Alterna a visibilidade do menu de 3 pontinhos no card de produto.
     * @param {HTMLElement} menu O elemento dropdown-menu.
     */
    function toggleDropdownMenu(menu) {
        document.querySelectorAll('.dropdown-menu.visible').forEach(m => {
            if (m !== menu) {
                m.classList.remove('visible');
            }
        });
        menu.classList.toggle('visible');
    }

    /**
     * Busca e exibe todos os produtos da API.
     */
    async function fetchAndRenderProducts() {
        productGrid.innerHTML = '<div class="loading-message">Carregando produtos...</div>';
        
        try {
            const response = await fetch(API_URL);
            const products = await response.json();
            
            productGrid.innerHTML = ''; 

            if (products.length === 0) {
                productGrid.innerHTML = '<div class="empty-message">Nenhum produto cadastrado. Clique em "Novo +" para começar.</div>';
                return;
            }

            products.forEach(product => {
                productGrid.appendChild(createProductCard(product));
            });

        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            productGrid.innerHTML = '<div class="error-message">Erro ao carregar produtos. Verifique se a API está online.</div>';
            showAlert('Erro ao carregar produtos.', 'error');
        }
    }

    /**
     * Cria o elemento HTML (card) para um produto.
     * @param {object} product Dados do produto.
     * @returns {HTMLElement} O elemento card.
     */
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);

        // Tratamento da imagem (a API retorna um array JSON string)
        let imageUrl = '';
        if (product.imagens && typeof product.imagens === 'string') {
            try {
                const images = JSON.parse(product.imagens);
                imageUrl = images[0] || ''; // Pega a primeira imagem ou string vazia
            } catch (e) {
                imageUrl = product.imagens.split(',')[0] || ''; // Trata como string de URLs separadas por vírgula
            }
        } else if (Array.isArray(product.imagens)) {
            imageUrl = product.imagens[0] || '';
        }

        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco);

        card.innerHTML = `
            <img src="${imageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}" alt="${product.nome}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.nome}</h3>
                <p class="product-price">${formattedPrice}</p>
                <p class="product-description">${product.descricao || 'Sem descrição.'}</p>
            </div>
            <div class="actions-menu">
                <button class="menu-button" onclick="event.stopPropagation(); window.handleMenuClick(this)"><i class="fas fa-ellipsis-v"></i></button>
                <div class="dropdown-menu">
                    <button class="edit-button" data-id="${product.id}" data-action="edit"><i class="fas fa-pen"></i> Alterar</button>
                    <button class="delete-button" data-id="${product.id}" data-name="${product.nome}" data-action="delete"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            </div>
        `;
        
        // Adiciona evento de clique para o menu
        card.querySelector('.menu-button').onclick = (e) => {
            e.stopPropagation(); // Previne eventos de click no card se houver
            const menu = card.querySelector('.dropdown-menu');
            toggleDropdownMenu(menu);
        };

        // Adiciona eventos de clique para Ações
        card.querySelector('.edit-button').onclick = (e) => handleEditProduct(product);
        card.querySelector('.delete-button').onclick = (e) => handleDeleteProduct(product.id, product.nome);

        return card;
    }

    // --- Lógica de Ações ---

    // 1. Ação: Abrir Modal de Cadastro
    btnNovoProduto.addEventListener('click', () => {
        // Configura o modal para Cadastro
        modalTitle.textContent = 'Cadastrar Novo Produto';
        btnSubmit.textContent = 'Cadastrar';
        currentProductId = null;
        productForm.reset();
        document.getElementById('product-id').value = '';
        toggleProductModal(true);
    });

    // 2. Ação: Abrir Modal de Edição (Chamado pelo card)
    function handleEditProduct(product) {
        toggleDropdownMenu(document.querySelector('.dropdown-menu.visible')); // Fecha qualquer menu aberto
        
        // Popula o formulário para edição
        document.getElementById('product-id').value = product.id;
        document.getElementById('nome').value = product.nome;
        document.getElementById('preco').value = product.preco;
        document.getElementById('quantidade_em_estoque').value = product.quantidade_em_estoque;
        document.getElementById('descricao').value = product.descricao || '';
        
        let imageUrls = '';
        if (product.imagens) {
             // A API retorna `product.imagens` como uma string JSON parseada para Array no GET /products, ou um Array se parseado no backend.
             // Para simplificar o input no formulário, converte para string separada por vírgula.
            try {
                const images = Array.isArray(product.imagens) ? product.imagens : JSON.parse(product.imagens);
                imageUrls = images.join(', ');
            } catch (e) {
                // Se falhar o parse, usa o valor como string (caso o backend não tenha feito o JSON.parse)
                imageUrls = product.imagens;
            }
        }
        document.getElementById('imagens').value = imageUrls;

        document.getElementById(product.ativo === 1 ? 'ativo-sim' : 'ativo-nao').checked = true;

        // Configura o modal para Edição
        modalTitle.textContent = `Editar Produto #${product.id}`;
        btnSubmit.textContent = 'Salvar Alterações';
        currentProductId = product.id;
        toggleProductModal(true);
    }
    
    // 3. Ação: Abrir Modal de Exclusão (Chamado pelo card)
    function handleDeleteProduct(id, nome) {
        toggleDropdownMenu(document.querySelector('.dropdown-menu.visible')); // Fecha qualquer menu aberto

        currentProductId = id;
        productNameToDelete.textContent = nome;
        deleteModal.classList.remove('hidden');
    }

    // Ação: Fechar Modal de Cadastro/Edição
    btnCancelar.addEventListener('click', () => toggleProductModal(false));
    
    // Ação: Fechar Modal de Exclusão
    btnCancelDelete.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        currentProductId = null;
    });

    // 4. Ação: Submeter Formulário (Cadastro ou Edição)
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const formData = new FormData(productForm);
        
        // Coletar dados do formulário
        const data = {
            nome: formData.get('nome'),
            preco: parseFloat(formData.get('preco')),
            quantidade_em_estoque: parseInt(formData.get('quantidade_em_estoque')),
            descricao: formData.get('descricao'),
            ativo: parseInt(formData.get('ativo')),
            // Tratamento de Imagens: Converte string separada por vírgulas para Array de Strings JSON
            imagens: JSON.stringify(formData.get('imagens').split(',').map(s => s.trim()).filter(s => s.length > 0))
        };
        
        // A API espera campos obrigatórios
        if (!data.nome || isNaN(data.preco) || isNaN(data.quantidade_em_estoque) || isNaN(data.ativo)) {
            showAlert('Por favor, preencha todos os campos obrigatórios (Nome, Preço, Estoque, Ativo).', 'error');
            return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            // Sucesso
            const actionText = id ? 'alterado' : 'cadastrado';
            showAlert(`Produto ${actionText} com sucesso!`, 'success');
            
            toggleProductModal(false); 
            fetchAndRenderProducts(); // Atualiza a lista
            
        } catch (error) {
            console.error(`Erro ao ${method === 'PUT' ? 'atualizar' : 'cadastrar'} produto:`, error.message);
            showAlert(`Erro ao ${method === 'PUT' ? 'atualizar' : 'cadastrar'} produto: ${error.message}`, 'error');
        }
    });

    // 5. Ação: Confirmação de Exclusão
    btnConfirmDelete.addEventListener('click', async () => {
        if (!currentProductId) return;

        try {
            const response = await fetch(`${API_URL}/${currentProductId}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                // Sucesso (Status 204 No Content)
                showAlert('Produto excluído com sucesso!', 'success');
                deleteModal.classList.add('hidden');
                fetchAndRenderProducts(); // Atualiza a lista
            } else if (response.status === 404) {
                 showAlert('Erro: Produto não encontrado.', 'error');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Erro ao excluir produto:', error.message);
            showAlert(`Erro ao excluir produto: ${error.message}`, 'error');
        } finally {
            currentProductId = null;
        }
    });

    // Função global para lidar com o clique no menu, útil para delegar eventos dinâmicos
    window.handleMenuClick = function(button) {
        const menu = button.nextElementSibling;
        toggleDropdownMenu(menu);
    };

    // Fechar menu de opções ao clicar em qualquer lugar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.actions-menu')) {
            document.querySelectorAll('.dropdown-menu.visible').forEach(menu => {
                menu.classList.remove('visible');
            });
        }
    });

    // Inicialização: Carregar os produtos ao carregar a página
    fetchAndRenderProducts();
});