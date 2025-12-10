// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, removeItem } from '../utils/storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedUser = await getItem('gymfit_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, senha) => {
    const usuariosString = await getItem('gymfit_users');
    const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

    const user = usuarios.find(u => u.email === email && u.senha === senha);

    if (user) {
      setCurrentUser(user);
      await setItem('gymfit_current_user', JSON.stringify(user));
      return user;
    }
    throw new Error('E-mail ou senha incorretos.');
  };

  const cadastro = async (userData) => {
    const usuariosString = await getItem('gymfit_users');
    const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

    if (usuarios.some(u => u.email === userData.email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      dataCadastro: new Date().toISOString(),
      xp: 0
    };

    usuarios.push(newUser);
    await setItem('gymfit_users', JSON.stringify(usuarios));
    await setItem('gymfit_current_user', JSON.stringify(newUser));

    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    removeItem('gymfit_current_user');
  };

  const updateUser = (updatedUser) => {
    (async () => {
    const usuariosString = await getItem('gymfit_users');
    const usuarios = usuariosString ? JSON.parse(usuariosString) : [];
    
    const userIndex = usuarios.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      usuarios[userIndex] = updatedUser;
      await setItem('gymfit_users', JSON.stringify(usuarios));
      await setItem('gymfit_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
    })();
  };

  const value = {
    currentUser,
    login,
    cadastro,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}