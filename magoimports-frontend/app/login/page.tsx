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
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#1a1c20] via-[#0B0E11] to-[#000000] p-6 font-sans">
            {/* Efeito de luz de fundo (Glow) */}
            <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>

            <div className="w-full max-w-[420px] bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-white/10 flex flex-col items-center transition-all">
                
                {/* Logo com Glow suave */}
                <div className="mb-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-[#161b22] p-6 rounded-full shadow-2xl">
                        <Image 
                            src={MagoLogo} 
                            alt="Logo" 
                            width={100} 
                            height={100} 
                            priority 
                            className="object-contain"
                        />
                    </div>
                </div>

                <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">Bem-vindo de volta</h1>
                <p className="text-gray-400 text-sm mb-10">Entre com suas credenciais Mago</p>

                <div className="w-full space-y-5">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="E-mail profissional"
                                className="w-full px-6 py-4 bg-white/[0.05] border border-white/10 rounded-2xl focus:border-blue-500/50 focus:bg-white/[0.08] transition-all outline-none text-white placeholder:text-gray-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Senha"
                                className="w-full px-6 py-4 bg-white/[0.05] border border-white/10 rounded-2xl focus:border-blue-500/50 focus:bg-white/[0.08] transition-all outline-none text-white placeholder:text-gray-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleGoogleLogin()}
                        className="w-full py-4 bg-gradient-to-r from-[#1a73e8] to-[#0d47a1] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Acessar Sistema
                    </button>
                </div>

                <div className="w-full mt-10 pt-6 border-t border-white/5 text-center">
                    <button 
                        onClick={() => handleGoogleLogin()} 
                        className="text-gray-400 font-medium hover:text-white transition-colors text-xs uppercase tracking-[0.2em]"
                    >
                        Solicitar novo acesso
                    </button>
                    <p className="text-gray-600 text-[10px] mt-4 font-medium uppercase tracking-widest">Mago Imports &copy; 2026</p>
                </div>
            </div>
        </div>
    );
}