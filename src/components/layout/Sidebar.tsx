'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Database, Mail, Video, MessageSquare, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems?: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

// Default nav items as fallback
const defaultNavItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    name: 'Upload Leads',
    href: '/data-input',
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: 'Outreach',
    href: '/outreach',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    name: 'AI Messages',
    href: '/leads/outreach',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    name: 'Heygen Integration',
    href: '/heygen',
    icon: <Video className="w-5 h-5" />,
  },
];

export default function Sidebar({ 
  navItems = defaultNavItems, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (onClose) {
      const handleRouteChange = () => {
        if (isOpen) {
          onClose();
        }
      };
      
      // Only close when the route changes, not when isOpen changes
      window.addEventListener('popstate', handleRouteChange);
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [isOpen, onClose]);

  // Handle clicks outside on mobile to close the sidebar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Only on mobile view
      if (window.innerWidth < 768 && isOpen && onClose) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(e.target as Node)) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay for mobile - only shown when sidebar is open */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 touch-auto"
          onClick={onClose}
          role="button"
          tabIndex={-1}
          aria-label="Close menu overlay"
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed md:sticky top-0 z-50 h-screen bg-gray-900 p-4 shadow-lg border-r border-gray-700/50 
          ${isOpen ? 'left-0' : '-left-64'} w-64 md:w-60 md:left-0
          transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="mb-8 px-4 flex justify-between items-center h-10">
          <Link href="/?landing=true" aria-label="Go to homepage" className="flex items-center h-full">
            <span className="text-white font-bold text-xl hover:text-gray-200 transition-colors">
              OptiLeads.ai
            </span>
          </Link>
          {/* Close button - only visible on mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-md hover:bg-gray-700/80 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-150 ease-in-out 
                      ${isActive 
                        ? 'bg-gray-800 text-white font-medium border-l-2 border-blue-500 pl-[14px]'
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white border-l-2 border-transparent focus:outline-none focus:bg-gray-800/60 focus:text-white'
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Navigate to ${item.name}`}
                    tabIndex={0}
                  >
                    <span className={`flex items-center justify-center w-6 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto pt-4 px-4 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
          <span>v1.0.0</span>
        </div>
      </div>
    </>
  );
} 