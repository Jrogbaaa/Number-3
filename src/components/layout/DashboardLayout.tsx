'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    name: 'Your Leads',
    href: '/dashboard',
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    name: 'Upload Leads',
    href: '/data-input',
    icon: <Database className="w-5 h-5" />,
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
    console.log("Toggle sidebar:", !isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} navItems={navItems} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header - only visible on small screens */}
        <header className="md:hidden bg-gray-900 p-4 flex items-center justify-between shadow-md">
          <Link 
            href="/?landing=true"
            className="text-white font-bold hover:text-gray-200 transition-colors"
            aria-label="OptiLeads.ai Home"
          >
            OptiLeads.ai
          </Link>
          <button
            onClick={toggleSidebar}
            className="text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
            aria-label="Toggle navigation menu"
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 