'use client';
import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';

export default function AuthButton() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('mago_users') || '[]');
    const activeEmail = localStorage.getItem('mago_active_user');
    setUsers(savedUsers);
    if (activeEmail) {
      setCurrentUser(savedUsers.find((u: any) => u.email === activeEmail));
    }
  }, []);

  const login = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await infoRes.json();

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
        const data = await res.json();
        if (res.ok) {
          const userObj = {
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            token: data.token
          };
          const updatedUsers = [...users.filter(u => u.email !== userObj.email), userObj];
          setUsers(updatedUsers);
          setCurrentUser(userObj);
          localStorage.setItem('mago_users', JSON.stringify(updatedUsers));
          localStorage.setItem('mago_active_user', userObj.email);
          localStorage.setItem('token', data.token);
          setShowMenu(false);
        } else {
          alert(data.error || "Erro ao fazer login.");
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  const switchAccount = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('mago_active_user', user.email);
    if (user.token) {
      localStorage.setItem('token', user.token);
    } else {
      localStorage.removeItem('token');
    }
    setShowMenu(false);
  };

  const logout = () => {
    localStorage.removeItem('mago_active_user');
    localStorage.removeItem('token');
    localStorage.removeItem('mago_users');
    setCurrentUser(null);
    setUsers([]);
    document.cookie = "mago_user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  if (!currentUser) {
    return (
      <div onClick={() => login()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
        <i className="menu-icon fas fa-user-circle"></i>
        <h2 className="button-title">Entrar</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div onClick={() => setShowMenu(!showMenu)} className="cursor-pointer flex flex-col items-center">
        <img src={currentUser.picture} alt={currentUser.name} className="w-12 h-12 rounded-full border-2 border-blue-500 mb-1" />
        <h2 className="button-title text-sm">{currentUser.name.split(' ')[0]}</h2>
      </div>

      {showMenu && (
        <div className="absolute top-full mt-2 w-48 bg-white border rounded-lg shadow-xl z-50 py-2">
          <p className="px-4 py-1 text-xs text-gray-500">Contas conectadas:</p>
          {users.map(user => (
            <div 
              key={user.email} 
              onClick={() => switchAccount(user)}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 ${user.email === currentUser.email ? 'bg-blue-50' : ''}`}
            >
              <img src={user.picture} className="w-6 h-6 rounded-full" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
          ))}
          <hr className="my-2" />
          <button onClick={() => login()} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100">
            + Adicionar conta
          </button>
          <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            Sair desta conta
          </button>
        </div>
      )}
    </div>
  );
}