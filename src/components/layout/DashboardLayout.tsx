import React from 'react';
import Sidebar from './Sidebar';
import { 
  BarChart2, 
  Database, 
  Mail, 
  Video 
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
  return (
    <div className="flex h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 overflow-auto pl-60">
        <main className="p-6 h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 