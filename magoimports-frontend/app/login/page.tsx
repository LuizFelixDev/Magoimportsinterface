'use client';
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const res = await fetch('http://localhost:2020/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: tokenResponse.access_token,
                    email: email,
                    password: password,
                    checkExists: true 
                }),
            });
            
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('mago_active_user', data.user.email);
                router.push('/');
            } else {
                alert(data.error || "Acesso negado.");
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E11] p-6 font-sans text-slate-900">
            {/* Card reduzido para largura de 310px e altura mínima de 540px */}
            <div className="w-full max-w-[400px] min-h-[410px] bg-white rounded-[3.8rem] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.9)] border border-gray-800/5 flex flex-col items-center transition-all overflow-hidden">
                
                {/* Logo ocupando o topo com destaque */}
                <div className="mt-4 mb-2 p-5 bg-gray-50 rounded-[3rem] shadow-inner transition-transform hover:scale-105 flex items-center justify-center">
                    <Image 
                        src={MagoLogo} 
                        alt="Logo" 
                        width={220} 
                        height={220} 
                        priority 
                        className="object-contain"
                    />
                </div>

                {/* Bloco de Inputs e Botão com verticalidade extrema e desgrudados */}
                <div className="w-full flex-grow flex flex-col justify-center space-y-12">
                    <div className="space-y-6">
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="w-full px-6 py-7 bg-gray-100 border-2 border-transparent rounded-[2.2rem] focus:border-blue-500 focus:bg-white transition-all outline-none font-semibold text-lg shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Senha"
                            className="w-full px-6 py-7 bg-gray-100 border-2 border-transparent rounded-[2.2rem] focus:border-blue-500 focus:bg-white transition-all outline-none font-semibold text-lg shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={() => handleGoogleLogin()}
                        className="w-full py-7 bg-[#1a73e8] text-white rounded-[2.2rem] font-black text-xl shadow-[0_15px_30px_rgba(26,115,232,0.4)] hover:bg-[#1557b0] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-7 h-7 bg-white rounded-lg p-1" alt="" />
                        Entrar
                    </button>
                </div>

                {/* Rodapé minimalista */}
                <div className="w-full mt-10 pt-6 border-t border-gray-100 text-center">
                    <button 
                        onClick={() => handleGoogleLogin()} 
                        className="text-blue-600 font-black hover:text-blue-800 transition-colors text-[10px] uppercase tracking-widest"
                    >
                        Solicitar acesso
                    </button>
                    <p className="text-gray-300 text-[8px] mt-3 font-bold uppercase tracking-[0.2em]">Mago Imports © 2026</p>
                </div>
            </div>
        </div>
    );
}