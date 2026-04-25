'use client';
import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import MagoLogo from '@/imagens/image.png';

const EMAILS_PERMITIDOS = [
  'luizhenriquefelix138@gmail.com',
];

export default function LoginPage() {
  useEffect(() => {
    document.cookie = "mago_user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await infoRes.json();

        if (!EMAILS_PERMITIDOS.includes(googleUser.email)) {
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
          document.cookie = `mago_user_session=${googleUser.email}; path=/; max-age=28800`;
          localStorage.setItem('mago_active_user', googleUser.email);
          window.location.href = '/';
        } else {
          alert("Erro na validação com o servidor.");
        }
      } catch (error) {
        alert("Erro de conexão.");
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="z-10 w-full max-w-[500px] px-6">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-[4rem] px-12 py-24 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center min-h-[720px] justify-center">
          <div className="relative mb-20">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
            <div className="relative bg-gradient-to-b from-[#1a1d23] to-[#0b0e11] p-10 rounded-full border border-white/10 shadow-inner">
              <Image src={MagoLogo} alt="Mago Imports Logo" width={120} height={120} priority className="object-contain" />
            </div>
          </div>
          <div className="text-center mb-20">
            <h1 className="text-white text-5xl font-extrabold tracking-tight mb-8 leading-[1.2]">Mago Imports</h1>
            <p className="text-gray-400 text-base font-medium tracking-[0.4em] leading-relaxed">SISTEMA DE GESTÃO INTERNA</p>
          </div>
          <div className="w-full space-y-12">
            <button onClick={() => handleGoogleLogin()} className="group relative w-full flex items-center justify-center gap-6 py-7 bg-white text-black rounded-2xl font-bold text-2xl transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-xl">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Acessar com Google
            </button>
          </div>
          <p className="mt-24 text-gray-600 text-xs uppercase tracking-[0.2em] font-semibold leading-8">Mago Imports &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}