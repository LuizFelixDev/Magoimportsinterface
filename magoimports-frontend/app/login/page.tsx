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
      const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const googleUser = await infoRes.json();

      if (!EMAILS_PERMITIDOS.includes(googleUser.email)) {
        alert("E-mail não autorizado.");
        return;
      }

      const res = await fetch('http://localhost:2020/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.access_token, email: googleUser.email }),
      });
      
      if (res.ok) {
        // CRIA O COOKIE PARA O MIDDLEWARE LER
        document.cookie = `mago_user_session=${googleUser.email}; path=/; max-age=28800`; // 8 horas
        localStorage.setItem('mago_active_user', googleUser.email);
        window.location.href = '/';
      } else {
        alert("Erro no servidor.");
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-10 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
        <Image src={MagoLogo} alt="Logo" width={100} height={100} className="mb-6" />
        <button 
          onClick={() => handleGoogleLogin()}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold"
        >
          Entrar no Sistema Mago
        </button>
      </div>
    </div>
  );
}