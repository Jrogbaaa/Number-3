'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Database, Mail, Video } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems?: NavItem[];
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

export default function Sidebar({ navItems = defaultNavItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col fixed h-screen w-60 bg-gray-900 p-5">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">CHROME</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10' 
                      : 'text-gray-400 hover:bg-gray-800/80 hover:text-white hover:shadow-lg hover:shadow-gray-800/10 hover:translate-x-1'
                    }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex items-center justify-between text-sm text-gray-400 px-4">
        <span>v1.0.0</span>
        <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
          🌙
        </button>
      </div>
    </div>
  );
} 