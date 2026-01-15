'use client'; 
import React, { useState, useEffect, useCallback } from 'react';
import { useReports } from '@/hooks/useReports'; 

const StatCard = ({ title, value, sub, icon, color }: any) => (
    <div className="stat-card">
        <div className="stat-content">
            <p className="stat-label">{title}</p>
            <h2 className="stat-main-value">{value}</h2>
            <span className="stat-sub">{sub}</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: `${color}20`, color: color }}>
            <i className={icon}></i>
        </div>
    </div>
);

export default function EnhancedReportsPage() {
    const { 
        fetchSalesByStatusReport, 
        fetchSalesRanking,
        fetchFullInventory
    } = useReports();
    
    const [view, setView] = useState<'overview' | 'inventory'>('overview');
    const [data, setData] = useState<any>({
        status: [],
        ranking: [],
        inventory: null
    });

    const loadData = useCallback(async () => {
        const [st, rk, inv] = await Promise.all([
            fetchSalesByStatusReport(),
            fetchSalesRanking(),
            fetchFullInventory()
        ]);
        setData({ status: st, ranking: rk, inventory: inv });
    }, [fetchSalesByStatusReport, fetchSalesRanking, fetchFullInventory]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return (
        <div className="reports-app">
            <aside className="reports-sidebar">
                <div className="sidebar-logo">
                    <i className="fas fa-magic"></i>
                    <span>MagoAnalytics</span>
                </div>
                <nav className="sidebar-nav">
                    <button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}>
                        <i className="fas fa-chart-line"></i> Dashboard
                    </button>
                    <button className={view === 'inventory' ? 'active' : ''} onClick={() => setView('inventory')}>
                        <i className="fas fa-boxes"></i> Estoque Completo
                    </button>
                </nav>
                <button className="back-home" onClick={() => window.history.back()}>
                    <i className="fas fa-arrow-left"></i> Voltar ao Menu
                </button>
            </aside>

            <main className="reports-main">
                <header className="main-header">
                    <h1>{view === 'overview' ? 'Visão Geral de Vendas' : 'Detalhamento de Estoque'}</h1>
                    <div className="header-actions">
                        <button className="refresh-btn" onClick={loadData}>
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </header>

                <div className="content-scroll">
                    {view === 'overview' ? (
                        <div className="dashboard-grid">
                            <div className="top-stats">
                                <StatCard 
                                    title="Faturamento Total" 
                                    value={formatBRL(data.status?.reduce((a:any, b:any) => a + b.total_valor, 0) || 0)} 
                                    sub="Receita bruta" 
                                    icon="fas fa-coins" 
                                    color="#FFD700" 
                                />
                                <StatCard 
                                    title="Total em Estoque" 
                                    value={data.inventory?.summary.totalItems || 0} 
                                    sub="Unidades físicas" 
                                    icon="fas fa-warehouse" 
                                    color="#FFFFFF" 
                                />
                                <StatCard 
                                    title="Alertas Críticos" 
                                    value={data.inventory?.summary.critical || 0} 
                                    sub="Abaixo do mínimo" 
                                    icon="fas fa-exclamation-triangle" 
                                    color="#FFD700" 
                                />
                            </div>

                            <div className="visual-reports">
                                <div className="report-card">
                                    <h3>Performance de Vendas</h3>
                                    <div className="status-bars">
                                        {data.status?.map((s: any) => (
                                            <div key={s.status_venda} className="bar-row">
                                                <div className="bar-info">
                                                    <span>{s.status_venda}</span>
                                                    <span>{s.count} un.</span>
                                                </div>
                                                <div className="bar-track">
                                                    <div className="bar-fill" style={{ width: `${Math.min((s.count / 20) * 100, 100)}%`, background: '#FFD700' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="report-card">
                                    <h3>Produtos Sem Giro (+30 dias)</h3>
                                    <div className="stagnant-list">
                                        {data.inventory?.stagnant.slice(0, 5).map((p: any, i: number) => (
                                            <div key={i} className="stagnant-item">
                                                <span>{p.nome}</span>
                                                <span className="stagnant-date">{new Date(p.data_criacao).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="inventory-view">
                            <div className="inventory-header-stats">
                                <div className="mini-stat">
                                    <span className="label">Críticos</span>
                                    <span className="value yellow">{data.inventory?.summary.critical}</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="label">Atenção</span>
                                    <span className="value white">{data.inventory?.summary.warning}</span>
                                </div>
                            </div>

                            <table className="full-inventory-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Estoque Atual</th>
                                        <th>Estoque Mínimo</th>
                                        <th>Status</th>
                                        <th>Preço</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.inventory?.all.map((p: any, i: number) => {
                                        const isCritical = p.quantidade_em_estoque <= p.estoque_minimo;
                                        const isWarning = p.quantidade_em_estoque <= p.estoque_minimo + 3 && !isCritical;
                                        
                                        return (
                                            <tr key={i} className={isCritical ? 'row-critical' : ''}>
                                                <td>{p.nome}</td>
                                                <td>{p.quantidade_em_estoque} un</td>
                                                <td>{p.estoque_minimo} un</td>
                                                <td>
                                                    {isCritical ? <span className="badge critical">CRÍTICO</span> : 
                                                     isWarning ? <span className="badge warning">ATENÇÃO</span> : 
                                                     <span className="badge ok">OK</span>}
                                                </td>
                                                <td>{formatBRL(p.preco)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .reports-app { display: flex; height: 100vh; background: #000000; color: #FFFFFF; font-family: 'Inter', sans-serif; }
                .reports-sidebar { width: 260px; background: #111111; padding: 2rem; display: flex; flex-direction: column; border-right: 1px solid #222222; }
                .sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; color: #FFD700; }
                .sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .sidebar-nav button { background: transparent; border: none; color: #888888; padding: 12px 16px; text-align: left; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; font-weight: 500; }
                .sidebar-nav button.active { background: #FFD700; color: #000000; }
                .reports-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .main-header { padding: 1.5rem 3rem; background: #111111; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222222; }
                .content-scroll { padding: 3rem; overflow-y: auto; flex: 1; }
                .top-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
                .stat-card { background: #111111; padding: 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #222222; }
                .stat-label { color: #888888; font-size: 0.875rem; margin-bottom: 8px; }
                .stat-main-value { font-size: 1.75rem; font-weight: 700; color: #FFFFFF; }
                .stat-sub { color: #FFD700; font-size: 0.75rem; font-weight: 600; }
                .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
                .visual-reports { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
                .report-card { background: #111111; padding: 24px; border-radius: 16px; border: 1px solid #222222; }
                .report-card h3 { color: #FFD700; margin-bottom: 20px; font-size: 1rem; }
                .bar-row { margin-bottom: 15px; }
                .bar-info { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 5px; }
                .bar-track { background: #222222; height: 6px; border-radius: 10px; overflow: hidden; }
                .bar-fill { height: 100%; transition: width 0.8s ease; }
                .stagnant-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #222222; font-size: 0.85rem; }
                .stagnant-date { color: #888888; }
                .inventory-header-stats { display: flex; gap: 20px; margin-bottom: 20px; }
                .mini-stat { background: #111111; padding: 15px 25px; border-radius: 12px; border: 1px solid #222222; display: flex; flex-direction: column; }
                .mini-stat .label { font-size: 0.75rem; color: #888888; }
                .mini-stat .value { font-size: 1.5rem; font-weight: 800; }
                .mini-stat .yellow { color: #FFD700; }
                .full-inventory-table { width: 100%; border-collapse: collapse; background: #111111; border-radius: 12px; overflow: hidden; }
                .full-inventory-table th { text-align: left; padding: 15px; background: #222222; color: #FFD700; font-size: 0.85rem; }
                .full-inventory-table td { padding: 15px; border-bottom: 1px solid #222222; font-size: 0.9rem; }
                .badge { padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
                .badge.critical { background: #FFD700; color: #000000; }
                .badge.warning { border: 1px solid #FFD700; color: #FFD700; }
                .badge.ok { color: #888888; border: 1px solid #333333; }
                .row-critical { background: rgba(255, 215, 0, 0.05); }
                .back-home { margin-top: auto; background: #222222; border: none; color: #FFFFFF; padding: 12px; border-radius: 8px; cursor: pointer; }
                .refresh-btn { background: #222222; border: none; color: #FFD700; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; }
            `}</style>
        </div>
    );
}