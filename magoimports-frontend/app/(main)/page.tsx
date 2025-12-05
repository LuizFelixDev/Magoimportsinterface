'use client';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
// Importar a imagem e o componente Image
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png'; 

const menuItems = [
    { name: "Produtos", icon: "fas fa-box-open", href: "/products", status: "Pronto" },
    { name: "Vendas", icon: "fas fa-shopping-cart", href: "/sales", status: "Pronto" },
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
            {/* Margem inferior ajustada para 20px (aproximadamente 1 ou 2 linhas) */}
            <Image 
                src={MagoLogo} 
                alt="Logo Mago Imports" 
                width={400} 
                height={400}
                style={{ marginBottom: '20px' }} 
                priority 
            />
            
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