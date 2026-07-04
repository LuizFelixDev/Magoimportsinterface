'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSales } from '@/hooks/useSales';

export default function FinancePage() {
    const router = useRouter();
    const { sales, isLoading, deleteSale, fetchSales } = useSales();
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

    const handleResetDashboard = async () => {
        const confirmed = confirm("Tem certeza que deseja zerar os dashboards? Isso excluirá as despesas manuais e todas as vendas concluídas.");
        
        if (confirmed) {
            setManualExpenses([]);
            const concluidas = sales.filter(s => s.status_venda === 'Concluída');
            
            try {
                for (const sale of concluidas) {
                    await deleteSale(sale.id);
                }
                await fetchSales();
                alert("Dashboards zerados com sucesso.");
            } catch (err) {
                alert("Erro ao tentar zerar algumas vendas do banco de dados.");
            }
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/sales?edit=${id}`);
    };

    if (isLoading) return <div className="loading-message">Carregando dados financeiros...</div>;

    return (
        <div className="product-grid-container">
            {/* Background Decorative Glow */}
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <nav className="navbar" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="nav-button back-button" onClick={() => router.replace('/')}>
                        <i className="fas fa-arrow-left"></i> Voltar
                    </button>
                    <button className="nav-button" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={handleResetDashboard}>
                        <i className="fas fa-trash-alt"></i> Zerar Dados
                    </button>
                </div>
                <h1 className="nav-title">Gestão Financeira</h1>
                <button className="nav-button new-button" onClick={handleAddExpense}>
                    <i className="fas fa-plus"></i> Adicionar Despesa
                </button>
            </nav>

            <div className="menu-button-card" style={{ width: '100%', cursor: 'default', marginBottom: '30px', padding: '40px' }}>
                <h2 className="button-title" style={{ marginBottom: '25px', alignSelf: 'flex-start', fontSize: '1.4em' }}>Resumo de Caixa</h2>
                <div className="finance-bar-container">
                    <div className="finance-item">
                        <span style={{ fontSize: '1.05em' }}>Receitas: <strong style={{ color: '#10b981' }}>R$ {metrics.receitas.toFixed(2)}</strong></span>
                        <div className="bar-bg">
                            <div className="bar-fill green" style={{ width: `${metrics.percReceita}%` }}></div>
                        </div>
                    </div>
                    <div className="finance-item">
                        <span style={{ fontSize: '1.05em' }}>Despesas: <strong style={{ color: '#ef4444' }}>R$ {metrics.despesas.toFixed(2)}</strong></span>
                        <div className="bar-bg">
                            <div className="bar-fill red" style={{ width: `${metrics.percDespesa}%` }}></div>
                        </div>
                    </div>
                    <div className="finance-item">
                        <span style={{ fontSize: '1.05em' }}>Faturamento Líquido: <strong style={{ color: '#3b82f6' }}>R$ {metrics.faturamento.toFixed(2)}</strong></span>
                        <div className="bar-bg">
                            <div className="bar-fill primary" style={{ width: `${metrics.percFaturamento}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="menu-button-card" style={{ width: '100%', cursor: 'default', alignItems: 'flex-start', textAlign: 'left', padding: '32px' }}>
                <h2 className="button-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-clock" style={{ marginRight: '12px', color: 'var(--primary-color)' }}></i>
                    Vendas com Status Pendente
                </h2>
                
                <div className="selected-items-list" style={{ width: '100%', maxHeight: 'none', border: 'none', background: 'transparent' }}>
                    {pendingSales.length === 0 ? (
                        <p className="empty-message">Nenhuma venda pendente encontrada.</p>
                    ) : (
                        pendingSales.map((sale) => (
                            <div key={sale.id} className="item-row" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div>
                                    <strong style={{ fontSize: '1.05em' }}>{sale.cliente || "Cliente Final"}</strong>
                                    <div style={{ fontSize: '0.85em', color: '#9ca3af', marginTop: '4px' }}>
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
                    gap: 24px;
                    width: 100%;
                }
                .finance-item {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-weight: 600;
                    color: #d1d5db;
                }
                .bar-bg {
                    background: rgba(255, 255, 255, 0.05);
                    height: 12px;
                    border-radius: 6px;
                    overflow: hidden;
                }
                .bar-fill {
                    height: 100%;
                    transition: width 0.5s ease-in-out;
                }
                .green { background-color: #10b981; }
                .red { background-color: #ef4444; }
                .primary { background-color: #3b82f6; }

                .btn-approve { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: none; cursor: pointer; }
                .btn-approve:hover { background: #3b82f6; color: #030712; }
                
                .btn-reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; cursor: pointer; }
                .btn-reject:hover { background: #ef4444; color: white; }

                .action-buttons button {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
            `}</style>
        </div>
    );
}