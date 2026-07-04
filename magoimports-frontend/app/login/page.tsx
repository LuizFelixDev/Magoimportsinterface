'use client';
import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png';

const DEFAULT_EMAILS = [
  'luizhenriquefelix138@gmail.com',
];

const getAllowedEmails = (): string[] => {
  const envEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS;
  if (!envEmails) return DEFAULT_EMAILS;
  return envEmails.split(',').map(email => email.trim().toLowerCase());
};

export default function LoginPage() {
  useEffect(() => {
    document.cookie = "mago_user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.clear();
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await infoRes.json();

        const allowedEmails = getAllowedEmails();
        const userEmail = googleUser.email.toLowerCase();

        if (!allowedEmails.includes(userEmail)) {
          alert("Acesso negado: Este e-mail não possui autorização.");
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2020';
        
        const res = await fetch(`${apiUrl}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: googleUser.email,
            nome: googleUser.name,
            foto: googleUser.picture,
            google_id: googleUser.sub
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          document.cookie = `mago_user_session=${googleUser.email}; path=/;`;
          
          const userObj = {
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            token: data.token
          };
          const savedUsers = JSON.parse(sessionStorage.getItem('mago_users') || '[]');
          const updatedUsers = [...savedUsers.filter((u: any) => u.email !== userObj.email), userObj];
          
          sessionStorage.setItem('mago_users', JSON.stringify(updatedUsers));
          sessionStorage.setItem('mago_active_user', googleUser.email);
          sessionStorage.setItem('token', data.token);
          window.location.href = '/';
        } else {
          const errorData = await res.json().catch(() => ({}));
          alert(errorData.error || errorData.message || "Erro na validação com o servidor.");
        }
      } catch (error) {
        alert("Erro de conexão.");
      }
    }
  });

  return (
    <div className="min-h-screen flex bg-[#030712] text-white relative overflow-hidden font-sans">
      {/* Decorative Orbs for general background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* LEFT SIDE: Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-[#080d1a] to-[#030712] border-r border-white/5 relative overflow-hidden">
        {/* Glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-[1px] flex items-center justify-center shadow-lg shadow-yellow-500/10">
            <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
              <span className="text-yellow-400 font-black text-lg">M</span>
            </div>
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MAGO IMPORTS</span>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-start space-y-8 z-10 my-auto">
          <div className="relative p-8 bg-white/[0.01] backdrop-blur-sm border border-white/5 rounded-3xl shadow-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-blue-500/20 rounded-3xl blur opacity-30"></div>
            <Image 
              src={MagoLogo} 
              alt="Mago Imports Logo" 
              width={200} 
              height={200} 
              priority 
              className="object-contain relative drop-shadow-[0_0_30px_rgba(251,255,0,0.15)]"
            />
          </div>

          <div className="space-y-4 max-w-lg">
            <h2 className="text-5xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Sua importadora sob controle total.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Gerencie vendas, relatórios financeiros e estoque em uma plataforma unificada de alto desempenho desenvolvida para o time da Mago Imports.
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="z-10">
          <p className="text-gray-600 text-sm tracking-wider font-semibold">
            &copy; 2026 Mago Imports. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Action */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 relative">
        {/* Glow for mobile screen representation */}
        <div className="absolute lg:hidden top-10 right-10 w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-[440px] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/50 via-yellow-500/50 to-blue-500/50"></div>
          
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden flex-col items-center mb-10">
            <div className="p-4 bg-gradient-to-b from-[#1a1d23] to-[#0b0e11] rounded-2xl border border-white/10 shadow-inner mb-4">
              <Image src={MagoLogo} alt="Mago Imports Logo" width={64} height={64} priority className="object-contain" />
            </div>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">Mago Imports</h1>
            <p className="text-gray-500 text-xs font-semibold tracking-[0.2em] mt-1">SISTEMA DE GESTÃO</p>
          </div>

          {/* Desktop Heading (hidden on mobile) */}
          <div className="hidden lg:block mb-10">
            <h3 className="text-3xl font-extrabold tracking-tight text-white mb-3">Bem-vindo</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Faça login utilizando sua conta Google institucional autorizada para acessar o painel administrativo.
            </p>
          </div>

          <div className="space-y-6 my-6">
            <button 
              onClick={() => handleGoogleLogin()} 
              className="group relative w-full flex items-center justify-center gap-4 py-4 px-6 bg-white text-black rounded-xl font-bold text-base transition-all duration-300 hover:bg-gray-50 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Acessar com o Google
            </button>
          </div>

          {/* Alert Box */}
          <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 text-xs leading-relaxed flex gap-3">
            <i className="fas fa-shield-alt text-base mt-0.5 animate-pulse"></i>
            <span>
              <strong>Acesso Restrito:</strong> Apenas contas de e-mail administrativas autorizadas têm permissão para acessar os dados deste sistema.
            </span>
          </div>

          <p className="lg:hidden mt-12 text-center text-gray-600 text-xs tracking-[0.1em] font-medium">
            &copy; 2026 Mago Imports
          </p>
        </div>
      </div>
    </div>
  );
}