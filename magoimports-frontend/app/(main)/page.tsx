'use client';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';

// URLs (Usaremos URLs de placeholder para as rotas que ainda não existem)
const menuItems = [
    { name: "Produtos", icon: "fas fa-box-open", href: "/products", status: "Pronto" },
    { name: "Vendas", icon: "fas fa-shopping-cart", href: "/sales", status: "Pronto" }, // <-- ALTERADO PARA "Pronto"
    { name: "Receitas & Despesas", icon: "fas fa-money-check-alt", href: "/finance", status: "Em Breve" },
    { name: "Relatórios", icon: "fas fa-chart-line", href: "/reports", status: "Em Breve" },
    { name: "Usuários", icon: "fas fa-users-cog", href: "/users", status: "Em Breve" },
];

const MainMenuPage: React.FC = () => {
    const router = useRouter();

    const handleNavigation = (href: string, status: string) => {
        if (status === "Pronto") {
            router.push(href);
        } else {
            alert(`A rota "${status}" ainda não foi implementada.`);
        }
    };

    return (
        <div className="main-menu-container">
            <h1 className="main-title">MagoimportSystem</h1>
            
            
            <div className="menu-grid">
                {menuItems.map((item) => (
                    <div 
                        key={item.name} 
                        className={`menu-button-card ${item.status === "Pronto" ? 'ready' : 'disabled'}`}
                        onClick={() => handleNavigation(item.href, item.status)}
                    >
                        <i className={`menu-icon ${item.icon}`}></i>
                        <h2 className="button-title">{item.name}</h2>
                        {item.status !== "Pronto" && (
                            <span className="status-badge">{item.status}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainMenuPage;