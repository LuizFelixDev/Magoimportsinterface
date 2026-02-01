'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSales, Sale } from '@/hooks/useSales';

export default function FinancePage() {
    const router = useRouter();
    const { sales, isLoading, deleteSale } = useSales();

    // Filtra apenas vendas pendentes para o segundo dashboard
    const pendingSales = useMemo(() => 
        sales.filter(sale => sale.status_venda === 'Pendente'), 
    [sales]);

    // Cálculo simplificado para o dashboard superior
    const metrics = useMemo(() => {
        const receitas = sales
            .filter(s => s.status_venda === 'Concluída')
            .reduce((acc, s) => acc + Number(s.valor_total), 0);
        
        // Exemplo de despesas (idealmente viria de um hook useExpenses)
        const despesas = 1500.00; 
        const faturamento = receitas - despesas;

        return { receitas, despesas, faturamento };
    }, [sales]);

    const handleEdit = (id: number) => {
        // Redireciona para a página de vendas com o ID para edição
        router.push(`/sales?edit=${id}`);
    };

    if (isLoading) return <div className="loading-message">Carregando dados financeiros...</div>;

    return (
        <div className="product-grid-container">
            {/* Navbar superior com botões */}
            <nav className="navbar" style={{ marginBottom: '30px' }}>
                <button className="nav-button back-button" onClick={() => router.push('/')}>
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <h1 className="nav-title">Gestão Financeira</h1>
                <button className="nav-button new-button">
                    <i className="fas fa-plus"></i> Adicionar Despesa
                </button>
            </nav>

            {/* Dashboard 1: Resumo em Barras */}
            <div className="menu-button-card" style={{ width: '100%', cursor: 'default', marginBottom: '30px', padding: '40px' }}>
                <h2 className="button-title" style={{ marginBottom: '20px' }}>Resumo de Caixa</h2>
                <div className="finance-bar-container">
                    <div className="finance-item">
                        <span>Receitas: R$ {metrics.receitas.toFixed(2)}</span>
                        <div className="bar-bg"><div className="bar-fill green" style={{ width: '70%' }}></div></div>
                    </div>
                    <div className="finance-item">
                        <span>Despesas: R$ {metrics.despesas.toFixed(2)}</span>
                        <div className="bar-bg"><div className="bar-fill red" style={{ width: '30%' }}></div></div>
                    </div>
                    <div className="finance-item">
                        <span>Faturamento Líquido: R$ {metrics.faturamento.toFixed(2)}</span>
                        <div className="bar-bg"><div className="bar-fill primary" style={{ width: '40%' }}></div></div>
                    </div>
                </div>
            </div>

            {/* Dashboard 2: Vendas Pendentes */}
            <div className="menu-button-card" style={{ width: '100%', cursor: 'default', alignItems: 'flex-start', textAlign: 'left' }}>
                <h2 className="button-title" style={{ paddingLeft: '20px' }}>
                    <i className="fas fa-clock" style={{ marginRight: '10px' }}></i>
                    Vendas com Status Pendente
                </h2>
                
                <div className="selected-items-list" style={{ width: '100%', maxHeight: 'none', border: 'none' }}>
                    {pendingSales.length === 0 ? (
                        <p className="empty-message">Nenhuma venda pendente encontrada.</p>
                    ) : (
                        pendingSales.map((sale) => (
                            <div key={sale.id} className="item-row" style={{ padding: '15px 20px' }}>
                                <div>
                                    <strong>{sale.cliente || "Cliente Final"}</strong>
                                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                                        {new Date(sale.data).toLocaleDateString('pt-BR')} - R$ {Number(sale.valor_total).toFixed(2)}
                                    </div>
                                </div>
                                <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-approve" title="Editar" onClick={() => handleEdit(sale.id)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="btn-reject" title="Excluir" onClick={() => deleteSale(sale.id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style jsx>{`
                .finance-bar-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                }
                .finance-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-weight: 500;
                }
                .bar-bg {
                    background: #eee;
                    height: 12px;
                    border-radius: 6px;
                    overflow: hidden;
                }
                .bar-fill {
                    height: 100%;
                    transition: width 1s ease-in-out;
                }
                .green { background-color: #00ff08; }
                .red { background-color: #fa5252; }
                .primary { background-color: var(--primary-color); }

                .btn-approve { background: #e7f5ff; color: #228be6; }
                .btn-approve:hover { background: #228be6; color: white; }
                
                .action-buttons button {
                    width: 35px;
                    height: 35px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
            `}</style>
        </div>
    );
}