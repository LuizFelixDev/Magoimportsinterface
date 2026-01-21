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
        fetchFullInventory,
        fetchProcurementSuggested,
        fetchProductPerformance,
        isLoading
    } = useReports();
    
    const [view, setView] = useState<'overview' | 'inventory' | 'analysis'>('overview');
    const [dates, setDates] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [data, setData] = useState<any>({
        status: [],
        inventory: { all: [], stagnant: [], summary: { totalItems: 0, critical: 0, warning: 0 } },
        procurement: [],
        performance: { bestSellers: [], worstSellers: [] }
    });

    const loadData = useCallback(async () => {
        const [st, inv, proc, perf] = await Promise.all([
            fetchSalesByStatusReport(),
            fetchFullInventory(),
            fetchProcurementSuggested(),
            fetchProductPerformance(dates.start, dates.end)
        ]);
        
        setData({ 
            status: st || [], 
            inventory: inv || { all: [], stagnant: [], summary: { totalItems: 0, critical: 0, warning: 0 } }, 
            procurement: proc || [], 
            performance: perf || { bestSellers: [], worstSellers: [] } 
        });
    }, [fetchSalesByStatusReport, fetchFullInventory, fetchProcurementSuggested, fetchProductPerformance, dates]);

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
                    <button className={view === 'analysis' ? 'active' : ''} onClick={() => setView('analysis')}>
                        <i className="fas fa-shopping-cart"></i> Compras e Giro
                    </button>
                </nav>
                <div className="filter-section" style={{ padding: '1rem', borderTop: '1px solid #222', marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '5px' }}>PERÍODO DE ANÁLISE</label>
                    <input type="date" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} className="date-input" />
                    <input type="date" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} className="date-input" />
                </div>
                <button className="back-home" onClick={() => window.history.back()}>
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
            </aside>

            <main className="reports-main">
                <header className="main-header">
                    <h1>{view === 'overview' ? 'Visão Geral' : view === 'inventory' ? 'Estoque' : 'Análise de Compras'}</h1>
                    <button className={`refresh-btn ${isLoading ? 'fa-spin' : ''}`} onClick={loadData}>
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </header>

                <div className="content-scroll">
                    {view === 'overview' && (
                        <div className="dashboard-grid">
                            <div className="top-stats">
                                <StatCard title="Faturamento" value={formatBRL(data.status?.reduce((a:any, b:any) => a + (b.total_valor || 0), 0) || 0)} sub="Receita Total" icon="fas fa-coins" color="#FFD700" />
                                <StatCard title="Itens em Estoque" value={data.inventory?.summary?.totalItems || 0} sub="Total Físico" icon="fas fa-warehouse" color="#FFFFFF" />
                                <StatCard title="Abaixo do Mínimo" value={data.procurement?.length || 0} sub="Crítico" icon="fas fa-exclamation-triangle" color="#FFD700" />
                            </div>
                            <div className="visual-reports">
                                <div className="report-card">
                                    <h3>Status das Vendas</h3>
                                    {data.status?.length > 0 ? data.status.map((s: any) => (
                                        <div key={s.status_venda} className="bar-row">
                                            <div className="bar-info"><span>{s.status_venda}</span><span>{s.count} un.</span></div>
                                            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min((s.count / 20) * 100, 100)}%`, background: '#FFD700' }}></div></div>
                                        </div>
                                    )) : <p style={{ color: '#555' }}>Nenhuma venda encontrada.</p>}
                                </div>
                                <div className="report-card">
                                    <h3>Mais Vendidos (Período)</h3>
                                    {data.performance?.bestSellers?.length > 0 ? data.performance.bestSellers.slice(0, 5).map((p: any, i: number) => (
                                        <div key={i} className="stagnant-item"><span>{p.nome}</span><strong>{p.total} un</strong></div>
                                    )) : <p style={{ color: '#555' }}>Sem dados de movimentação.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'inventory' && (
                        <div className="inventory-view">
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
                                    {data.inventory?.all?.length > 0 ? data.inventory.all.map((p: any, i: number) => {
                                        const isCritical = p.quantidade_em_estoque <= p.estoque_minimo;
                                        return (
                                            <tr key={i} className={isCritical ? 'row-critical' : ''}>
                                                <td>{p.nome}</td>
                                                <td>{p.quantidade_em_estoque} un</td>
                                                <td>{p.estoque_minimo} un</td>
                                                <td>
                                                    {isCritical ? <span className="badge critical">CRÍTICO</span> : <span className="badge ok">ESTÁVEL</span>}
                                                </td>
                                                <td>{formatBRL(p.preco)}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Carregando produtos ou estoque vazio...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'analysis' && (
                        <div className="analysis-view">
                            <div className="report-card" style={{ marginBottom: '2rem' }}>
                                <h3>🛒 Necessidade de Reposição (Compra Imediata)</h3>
                                <table className="full-inventory-table">
                                    <thead><tr><th>Produto</th><th>Atual</th><th>Mínimo</th><th>Faltam</th><th>Sugestão de Pedido</th></tr></thead>
                                    <tbody>
                                        {data.procurement?.length > 0 ? data.procurement.map((p: any, i: number) => (
                                            <tr key={i} className="row-critical">
                                                <td>{p.nome}</td>
                                                <td>{p.quantidade_em_estoque} un</td>
                                                <td>{p.estoque_minimo} un</td>
                                                <td style={{ color: '#FFD700', fontWeight: 'bold' }}>{p.necessidade_reposicao}</td>
                                                <td><strong>Pedir {p.necessidade_reposicao + 5} un</strong></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Tudo em dia! Nenhum produto abaixo do mínimo.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="visual-reports">
                                <div className="report-card">
                                    <h3>📉 Baixo Giro (Menos Vendidos)</h3>
                                    {data.performance?.worstSellers?.length > 0 ? data.performance.worstSellers.slice(0, 5).map((p: any, i: number) => (
                                        <div key={i} className="stagnant-item"><span>{p.nome}</span><span>{p.total} vendas</span></div>
                                    )) : <p style={{ color: '#555' }}>Nenhum dado de baixo giro.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .reports-app { display: flex; height: 100vh; background: #000; color: #fff; font-family: 'Inter', sans-serif; }
                .reports-sidebar { width: 280px; background: #111; padding: 1.5rem; display: flex; flex-direction: column; border-right: 1px solid #222; }
                .sidebar-logo { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; font-weight: 800; color: #FFD700; margin-bottom: 2rem; }
                .sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .sidebar-nav button { background: none; border: none; color: #888; padding: 12px; text-align: left; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; }
                .sidebar-nav button.active { background: #FFD700; color: #000; font-weight: bold; }
                .date-input { background: #222; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 6px; width: 100%; margin-top: 8px; font-size: 0.85rem; }
                .reports-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .main-header { padding: 1.5rem 2rem; background: #111; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; }
                .content-scroll { padding: 2rem; overflow-y: auto; flex: 1; }
                .top-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: #111; padding: 24px; border-radius: 16px; border: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
                .stat-label { color: #888; font-size: 0.85rem; margin-bottom: 5px; }
                .stat-main-value { font-size: 1.8rem; font-weight: 700; }
                .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
                .visual-reports { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .report-card { background: #111; padding: 24px; border-radius: 16px; border: 1px solid #222; }
                .report-card h3 { color: #FFD700; font-size: 1rem; margin-bottom: 20px; }
                .bar-row { margin-bottom: 15px; }
                .bar-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; }
                .bar-track { background: #222; height: 8px; border-radius: 10px; }
                .bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
                .full-inventory-table { width: 100%; border-collapse: collapse; background: #111; border-radius: 12px; overflow: hidden; }
                .full-inventory-table th { text-align: left; padding: 15px; background: #1a1a1a; color: #FFD700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
                .full-inventory-table td { padding: 15px; border-bottom: 1px solid #222; font-size: 0.9rem; }
                .row-critical { background: rgba(255, 215, 0, 0.03); }
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
                .badge.critical { background: #FFD700; color: #000; }
                .badge.ok { border: 1px solid #333; color: #888; }
                .stagnant-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; font-size: 0.9rem; }
                .refresh-btn { background: #222; border: none; color: #FFD700; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .refresh-btn:hover { background: #333; }
                .back-home { margin-top: auto; background: #222; border: none; color: #fff; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .back-home:hover { background: #cc0000; }
            `}</style>
        </div>
    );
}