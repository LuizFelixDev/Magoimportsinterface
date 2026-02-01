'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png'; 
import AuthButton from '@/components/AuthButton';

const menuItems = [
    { name: "Produtos", icon: "fas fa-box-open", href: "/products", status: "Pronto" },
    { name: "Vendas", icon: "fas fa-shopping-cart", href: "/sales", status: "Pronto" },
    { name: "Receitas & Despesas", icon: "fas fa-money-check-alt", href: "/finance", status: "Pronto" }, 
    { name: "Relatórios", icon: "fas fa-chart-line", href: "/reports", status: "Pronto" },
];

export default function MainMenuPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);

    useEffect(() => {
        const activeUser = localStorage.getItem('mago_active_user');
        if (!activeUser) {
            router.push('/login');
        } else {
            setIsLoading(false);
            fetchPendingUsers();
        }
    }, [router]);

    const fetchPendingUsers = async () => {
        try {
            const res = await fetch('http://localhost:2020/admin/users/pending');
            const data = await res.json();
            setPendingUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDecision = async (id: string, action: string) => {
        try {
            await fetch('http://localhost:2020/admin/users/decide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            });
            setPendingUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Erro ao processar decisão");
        }
    };

    const handleNavigation = (href: string, status: string) => {
        if (status === "Pronto") {
            router.push(href);
        } else {
            alert(`A rota "${status}" ainda não foi implementada.`);
        }
    };

    if (isLoading) return null;

    return (
        <div className="main-menu-container">
            <Image src={MagoLogo} alt="Logo Mago Imports" width={400} height={400} style={{ marginBottom: '20px' }} priority />
            
            {pendingUsers.length > 0 && (
                <div className="admin-notification-toast">
                    <div className="toast-header">
                        <i className="fas fa-bell"></i>
                        <span>Novas Solicitações ({pendingUsers.length})</span>
                    </div>
                    <div className="toast-body">
                        {pendingUsers.map(u => (
                            <div key={u.id} className="pending-user-row">
                                <div className="user-info">
                                    <strong>{u.nome}</strong>
                                    <small>{u.email}</small>
                                </div>
                                <div className="action-buttons">
                                    <button className="btn-approve" onClick={() => handleDecision(u.id, 'aprovado')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="btn-reject" onClick={() => handleDecision(u.id, 'rejeitado')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="menu-grid">
                {menuItems.map((item) => (
                    <div 
                        key={item.name} 
                        className={`menu-button-card ${item.status === "Pronto" ? 'ready' : 'disabled'}`}
                        onClick={() => handleNavigation(item.href, item.status)}
                    >
                        <i className={`menu-icon ${item.icon}`}></i>
                        <h2 className="button-title">{item.name}</h2>
                        {item.status !== "Pronto" && <span className="status-badge">{item.status}</span>}
                    </div>
                ))}

                <div className="menu-button-card ready overflow-visible">
                   <AuthButton />
                </div>
            </div>

            <style jsx>{`
                .admin-notification-toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 320px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    z-index: 9999;
                    overflow: hidden;
                    animation: slideIn 0.4s ease-out;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                .toast-header {
                    background: #1a1a1a;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .toast-body {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .pending-user-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    transition: background 0.2s;
                }

                .pending-user-row:hover { background: rgba(0,0,0,0.02); }

                .user-info { display: flex; flex-direction: column; gap: 2px; }
                .user-info strong { font-size: 0.85rem; color: #333; }
                .user-info small { font-size: 0.75rem; color: #777; }

                .action-buttons { display: flex; gap: 8px; }

                .action-buttons button {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .btn-approve { background: #e6fcf5; color: #20c997; }
                .btn-approve:hover { background: #20c997; color: white; transform: scale(1.1); }

                .btn-reject { background: #fff5f5; color: #fa5252; }
                .btn-reject:hover { background: #fa5252; color: white; transform: scale(1.1); }
            `}</style>
        </div>
    );
}