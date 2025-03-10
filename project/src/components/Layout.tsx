import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, DollarSign, List, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Gerenciador</h1>
        </div>
        <nav className="mt-6">
          <div 
            className="flex items-center px-6 py-3 cursor-pointer hover:bg-blue-50"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="w-5 h-5 text-blue-600" />
            <span className="mx-4 text-gray-700">Dashboard</span>
          </div>
          <div 
            className="flex items-center px-6 py-3 cursor-pointer hover:bg-blue-50"
            onClick={() => navigate('/transactions')}
          >
            <List className="w-5 h-5 text-blue-600" />
            <span className="mx-4 text-gray-700">Transações</span>
          </div>
          <div 
            className="flex items-center px-6 py-3 cursor-pointer hover:bg-blue-50"
            onClick={() => navigate('/transactions/new')}
          >
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="mx-4 text-gray-700">Nova Transação</span>
          </div>
          <div 
            className="flex items-center px-6 py-3 cursor-pointer hover:bg-blue-50 mt-auto"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="mx-4 text-gray-700">Sair</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;