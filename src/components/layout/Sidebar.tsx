'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Database, Mail, Video } from 'lucide-react';
import { useEffect } from 'react';

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

export default function Sidebar({ 
  navItems = defaultNavItems, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

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
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed md:sticky top-0 z-30 h-screen bg-gray-900/95 p-5 shadow-xl border-r border-gray-800/50
          ${isOpen ? 'left-0' : '-left-64'} w-64 md:w-60 md:left-0
          transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">CHROME</h1>
          <p className="text-xs text-gray-500 mt-1">Lead Management Platform</p>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 pl-[14px]' 
                        : 'text-gray-400 hover:bg-gray-800/90 hover:text-white border-l-2 border-transparent'
                      }`}
                    aria-label={`Navigate to ${item.name}`}
                    tabIndex={0}
                  >
                    <span className="flex items-center justify-center w-6">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
          <span>v1.0.0</span>
          <button 
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            🌙
          </button>
        </div>
      </div>
    </>
  );
} 