'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSales } from '@/hooks/useSales';

export default function FinancePage() {
    const router = useRouter();
    const { sales, isLoading, deleteSale } = useSales();
    const [manualExpenses, setManualExpenses] = useState<{ id: number; valor: number }[]>([]);

    const pendingSales = useMemo(() => 
        sales.filter(sale => sale.status_venda === 'Pendente'), 
    [sales]);

    const metrics = useMemo(() => {
        const receitas = sales
            .filter(s => s.status_venda === 'Concluída')
            .reduce((acc, s) => acc + Number(s.valor_total), 0);
        
        const despesas = manualExpenses.reduce((acc, exp) => acc + exp.valor, 0);
        const faturamento = receitas - despesas;

        const totalVolume = receitas + despesas || 1;
        const percReceita = (receitas / totalVolume) * 100;
        const percDespesa = (despesas / totalVolume) * 100;
        const percFaturamento = receitas > 0 ? Math.max(0, Math.min(100, (faturamento / receitas) * 100)) : 0;

        return { receitas, despesas, faturamento, percReceita, percDespesa, percFaturamento };
    }, [sales, manualExpenses]);

    const handleAddExpense = () => {
        const valor = prompt("Digite o valor da despesa:");
        if (valor && !isNaN(Number(valor))) {
            setManualExpenses(prev => [...prev, { id: Date.now(), valor: Number(valor) }]);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/sales?edit=${id}`);
    };

    if (isLoading) return <div className="loading-message">Carregando dados financeiros...</div>;

    return (
        <div className="product-grid-container">
            <nav className="navbar" style={{ marginBottom: '30px' }}>
                <button className="nav-button back-button" onClick={() => router.push('/')}>
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <h1 className="nav-title">Gestão Financeira</h1>
                <button className="nav-button new-button" onClick={handleAddExpense}>
                    <i className="fas fa-plus"></i> Adicionar Despesa
                </button>
            </nav>

            <div className="menu-button-card" style={{ width: '100%', cursor: 'default', marginBottom: '30px', padding: '40px' }}>
                <h2 className="button-title" style={{ marginBottom: '20px' }}>Resumo de Caixa</h2>
                <div className="finance-bar-container">
                    <div className="finance-item">
                        <span>Receitas: R$ {metrics.receitas.toFixed(2)}</span>
                        <div className="bar-bg">
                            <div className="bar-fill green" style={{ width: `${metrics.percReceita}%` }}></div>
                        </div>
                    </div>
                    <div className="finance-item">
                        <span>Despesas: R$ {metrics.despesas.toFixed(2)}</span>
                        <div className="bar-bg">
                            <div className="bar-fill red" style={{ width: `${metrics.percDespesa}%` }}></div>
                        </div>
                    </div>
                    <div className="finance-item">
                        <span>Faturamento Líquido: R$ {metrics.faturamento.toFixed(2)}</span>
                        <div className="bar-bg">
                            <div className="bar-fill primary" style={{ width: `${metrics.percFaturamento}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

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
                    transition: width 0.5s ease-in-out;
                }
                .green { background-color: #2ecc71; }
                .red { background-color: #e74c3c; }
                .primary { background-color: #3498db; }

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