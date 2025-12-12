// components/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

function Header() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          <img src="/assets/images/logo.png" alt="GymFit Logo" />
          <h1>GymFit</h1>
        </Link>
        
        <ul className="nav-menu">
          <li>
            <Link 
              to="/criar-treino" 
              className={`nav-link ${location.pathname === '/criar-treino' ? 'active' : ''}`}
            >
              Criar Treino
            </Link>
          </li>
          <li>
            <Link 
              to="/meus-desafios" 
              className={`nav-link ${location.pathname === '/meus-desafios' ? 'active' : ''}`}
            >
              Meus Desafios
            </Link>
          </li>
          <li>
            <Link 
              to="/perfil" 
              className={`nav-link ${location.pathname === '/perfil' ? 'active' : ''}`}
            >
              Meu Perfil
            </Link>
          </li>
        </ul>

        <div className="theme-toggle-wrapper">
          <ThemeToggle />
        </div>

        {!currentUser ? (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-login">
              <i className="bi bi-box-arrow-in-right"></i>
              Entrar
            </Link>
            <Link to="/cadastro" className="btn btn-cadastro">
              <i className="bi bi-person-plus"></i>
              Cadastrar
            </Link>
          </div>
        ) : (
          <div className="user-info">
            <span id="user-name">{currentUser.nome}</span>
            <button onClick={handleLogout} className="btn btn-login">
              <i className="bi bi-box-arrow-right"></i>
              Sair
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
