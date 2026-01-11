'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png'; 
import AuthButton from '@/components/AuthButton';

const menuItems = [
    { name: "Produtos", icon: "fas fa-box-open", href: "/products", status: "Pronto" },
    { name: "Vendas", icon: "fas fa-shopping-cart", href: "/sales", status: "Pronto" },
    { name: "Receitas & Despesas", icon: "fas fa-money-check-alt", href: "/finance", status: "Em Breve" },
    { name: "Relatórios", icon: "fas fa-chart-line", href: "/reports", status: "Pronto" },
];

export default function MainMenuPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const activeUser = localStorage.getItem('mago_active_user');
        if (!activeUser) {
            router.push('/login');
        } else {
            setIsLoading(false);
        }
    }, [router]);

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
        </div>
    );
}