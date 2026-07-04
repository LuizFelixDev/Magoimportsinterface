'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png'; 
import AuthButton from '@/components/AuthButton';
import { proxy } from '@/proxy';

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
        const activeUser = sessionStorage.getItem('mago_active_user');
        if (!activeUser) {
            router.push('/login');
        } else {
            setIsLoading(false);
            fetchPendingUsers();
        }
    }, [router]);

    const fetchPendingUsers = async () => {
        try {
            const res = await proxy('/admin/users/pending');
            if (res && res.ok) {
                const data = await res.json();
                setPendingUsers(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDecision = async (id: string, action: string) => {
        try {
            const res = await proxy('/admin/users/decide', {
                method: 'POST',
                body: JSON.stringify({ id, action })
            });
            if (res && res.ok) {
                setPendingUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert("Erro ao processar decisão");
            }
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
            {/* Background Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="relative mb-12 flex flex-col items-center">
                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-10 rounded-full"></div>
                <div className="relative bg-gradient-to-b from-[#111827] to-[#030712] p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center">
                    <Image src={MagoLogo} alt="Logo Mago Imports" width={180} height={180} priority className="object-contain drop-shadow-[0_0_20px_rgba(251,255,0,0.1)]" />
                </div>
            </div>

            <h1 className="main-title mb-10">Mago Imports</h1>
            
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
                    bottom: 24px;
                    right: 24px;
                    width: 340px;
                    background: rgba(17, 24, 39, 0.9);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    z-index: 9999;
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideIn {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .toast-header {
                    background: rgba(251, 255, 0, 0.1);
                    color: var(--primary-color);
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 0.88rem;
                    border-bottom: 1px solid rgba(251, 255, 0, 0.1);
                }

                .toast-body {
                    max-height: 280px;
                    overflow-y: auto;
                    padding: 6px 0;
                }

                .pending-user-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    transition: background 0.2s;
                }

                .pending-user-row:hover { background: rgba(255,255,255,0.02); }

                .user-info { display: flex; flex-direction: column; gap: 2px; }
                .user-info strong { font-size: 0.85rem; color: #f3f4f6; }
                .user-info small { font-size: 0.75rem; color: #9ca3af; }

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

                .btn-approve { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .btn-approve:hover { background: #10b981; color: #030712; transform: scale(1.1); }

                .btn-reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .btn-reject:hover { background: #ef4444; color: #ffffff; transform: scale(1.1); }
            `}</style>
        </div>
    );
}