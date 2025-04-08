import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsLogo } from '@/components/ui/Logo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar = ({ navItems }: SidebarProps) => {
  const pathname = usePathname();
  
  return (
    <aside className="w-[240px] bg-navy border-r border-gray-800 h-screen flex flex-col">
      <div className="p-6">
        <PropsLogo className="w-24 h-auto" />
      </div>
      
      <nav className="mt-4 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${
                    isActive ? 'bg-gray-800 text-white' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={0}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <span className="text-sm text-gray-500">v1.0.0</span>
        <button 
          className="p-1.5 rounded-full bg-gray-800 text-gray-300"
          aria-label="Toggle dark mode"
          tabIndex={0}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-4 h-4"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 