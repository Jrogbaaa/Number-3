import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { 
  BarChart2, 
  Database, 
  Mail, 
  Video,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    name: 'Data Input',
    href: '/data-input',
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: 'Outreach',
    href: '/outreach',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    name: 'Heygen Integration',
    href: '/heygen',
    icon: <Video className="w-5 h-5" />,
  },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Mobile header with menu button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800/50">
        <h1 className="text-xl font-bold">CHROME</h1>
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-md bg-gray-800/50"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - hidden on mobile by default, shown when toggled */}
      <Sidebar 
        navItems={navItems} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto md:pl-60 w-full">
        <main className="p-4 md:p-8 h-full max-w-7xl mx-auto">
          <div className="bg-gray-900/30 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-800/50 shadow-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 