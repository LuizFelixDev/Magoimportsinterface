'use client'; 
import React, { useState, useCallback } from 'react';
import { 
    useReports, 
    LowStockReport, 
    SaleStatusReport, 
    SalesPeriodReport,
    SaleInPeriod
} from '@/hooks/useReports'; 

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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
};

const LowStockReportDisplay = ({ report }: { report: LowStockReport }) => (
    <div className="report-section">
        <h2>Produtos com Estoque Baixo</h2>
        <p className="report-summary">Limite de Estoque: <strong>{report.threshold} unidades</strong></p>
        <p className="report-summary">Total de Produtos em Risco: <strong>{report.count}</strong></p>
        
        {report.count === 0 ? (
            <div className="empty-message success-message">Nenhum produto com estoque abaixo do limite. Ótimo!</div>
        ) : (
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Estoque</th>
                        <th>Preço Unitário</th>
                    </tr>
                </thead>
                <tbody>
                    {report.products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.nome}</td>
                            <td>{product.quantidade_em_estoque}</td>
                            <td>{formatCurrency(product.preco)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

const SalesByStatusReportDisplay = ({ report }: { report: SaleStatusReport[] }) => (
    <div className="report-section">
        <h2>Resumo de Vendas por Status</h2>
        
        {report.length === 0 ? (
            <div className="empty-message">Nenhum dado de venda encontrado.</div>
        ) : (
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Quantidade</th>
                        <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    {report.map((status, index) => (
                        <tr key={index}>
                            <td>{status.status_venda}</td>
                            <td>{status.count}</td>
                            <td>{formatCurrency(status.total_valor)}</td>
                    </tr>
                    ))}
                    <tr className="summary-row">
                        <td><strong>TOTAL</strong></td>
                        <td><strong>{report.reduce((sum, s) => sum + s.count, 0)}</strong></td>
                        <td><strong>{formatCurrency(report.reduce((sum, s) => sum + s.total_valor, 0))}</strong></td>
                    </tr>
                </tbody>
            </table>
        )}
    </div>
);

const SalesPeriodReportDisplay = ({ report }: { report: SalesPeriodReport }) => (
    <div className="report-section">
        <h2>Vendas por Período</h2>
        <p className="report-summary"><strong>Período:</strong> {formatDate(report.periodo.startDate)} a {formatDate(report.periodo.endDate)}</p>
        <p className="report-summary">Total de Vendas: <strong>{report.total_vendas}</strong> | Valor Total Arrecadado: <strong>{formatCurrency(report.valor_total_arrecadado)}</strong></p>
        
        {report.total_vendas === 0 ? (
            <div className="empty-message">Nenhuma venda registrada neste período.</div>
        ) : (
            <table className="report-table full-width-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Valor Total</th>
                        <th>Pagamento</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {report.vendas.map((sale: SaleInPeriod) => (
                        <tr key={sale.id}>
                            <td>#{sale.id}</td>
                            <td>{formatDate(sale.data)}</td>
                            <td>{sale.cliente}</td>
                            <td>{formatCurrency(sale.valor_total)}</td>
                            <td>{sale.forma_pagamento}</td>
                            <td>{sale.status_venda}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);


export default function ReportsPage() {
    const { 
        isLoading, 
        error, 
        fetchLowStockReport, 
        fetchSalesByStatusReport, 
        fetchSalesPeriodReport 
    } = useReports();
    
    const [currentReport, setCurrentReport] = useState<'low-stock' | 'by-status' | 'period' | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showAlert = useCallback((message: string, type: 'success' | 'error') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); 
    }, []);

    const handleGenerateLowStock = useCallback(async () => {
        setCurrentReport('low-stock');
        setReportData(null);
        const data = await fetchLowStockReport();
        if (data) {
            setReportData(data);
            showAlert('Relatório de Estoque Baixo gerado com sucesso!', 'success');
        } else if (error) {
             showAlert(error, 'error');
        }
    }, [fetchLowStockReport, showAlert, error]);
    
    const handleGenerateSalesByStatus = useCallback(async () => {
        setCurrentReport('by-status');
        setReportData(null);
        const data = await fetchSalesByStatusReport();
        if (data) {
            setReportData(data);
            showAlert('Relatório de Vendas por Status gerado com sucesso!', 'success');
        } else if (error) {
             showAlert(error, 'error');
        }
    }, [fetchSalesByStatusReport, showAlert, error]);
    
    const handleGenerateSalesPeriod = useCallback(async () => {
        if (!startDate || !endDate) {
            showAlert('Por favor, preencha as datas de início e fim.', 'error');
            return;
        }

        setCurrentReport('period');
        setReportData(null);
        const data = await fetchSalesPeriodReport(startDate, endDate);
        if (data) {
            setReportData(data);
            showAlert('Relatório de Vendas por Período gerado com sucesso!', 'success');
        } else if (error) {
             showAlert(error, 'error');
        }
    }, [startDate, endDate, fetchSalesPeriodReport, showAlert, error]);
    
    
    const renderReport = () => {
        if (isLoading) {
            return <div className="loading-message">Gerando relatório...</div>;
        }
        
        if (reportData) {
            switch (currentReport) {
                case 'low-stock':
                    return <LowStockReportDisplay report={reportData as LowStockReport} />;
                case 'by-status':
                    return <SalesByStatusReportDisplay report={reportData as SaleStatusReport[]} />;
                case 'period':
                    return <SalesPeriodReportDisplay report={reportData as SalesPeriodReport} />;
                default:
                    return null;
            }
        }
        
        return <div className="empty-message">Selecione e gere um relatório acima para visualizar os dados.</div>;
    };


    return (
        <>
            <header className="navbar">
                <button className="nav-button back-button" onClick={() => window.history.back()}>
                    <i className="fas fa-chevron-left"></i> Voltar
                </button>
                <h1 className="nav-title">Módulo de Relatórios - MagoImports</h1>
                <div className="nav-button placeholder"></div>
            </header>

            {alert && <Alert message={alert.message} type={alert.type} />}

            <main className="product-grid-container">
                <div className="reports-control-panel">
                    <h2>Controles de Relatórios</h2>

                    <div className="report-control-group">
                        <p><strong>Estoque Baixo:</strong> Produtos ativos com poucas unidades (limite: 5). </p>
                        <button 
                            onClick={handleGenerateLowStock} 
                            disabled={isLoading}
                            className="nav-button generate-button"
                        >
                            <i className="fas fa-cubes"></i> Gerar Estoque Baixo
                        </button>
                    </div>

                    <div className="report-control-group">
                        <p><strong>Vendas por Status:</strong> Contagem e total de valor por status.</p>
                        <button 
                            onClick={handleGenerateSalesByStatus} 
                            disabled={isLoading}
                            className="nav-button generate-button"
                        >
                            <i className="fas fa-chart-pie"></i> Gerar Vendas por Status
                        </button>
                    </div>

                    <div className="report-control-group period-control">
                        <p><strong>Vendas por Período:</strong> Detalhes e resumo financeiro.</p>
                        <div className="date-inputs">
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Data Início"
                                disabled={isLoading}
                                className="date-input"
                            />
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Data Fim"
                                disabled={isLoading}
                                className="date-input"
                            />
                        </div>
                        <button 
                            onClick={handleGenerateSalesPeriod} 
                            disabled={isLoading || !startDate || !endDate}
                            className="nav-button generate-button"
                        >
                            <i className="fas fa-calendar-alt"></i> Gerar Vendas por Período
                        </button>
                    </div>
                </div>

                <div className="report-display-area">
                    {renderReport()}
                </div>
                
            </main>
        </>
    );
}