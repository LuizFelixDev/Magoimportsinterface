'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        {/* Seu Client ID configurado corretamente aqui */}
        <GoogleOAuthProvider clientId="389814300715-btnrn4dan7prjko2eqkiuv5b472pd588.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}