import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/' },
    { icon: '📥', label: 'Upload Leads', href: '/data-input' },
    { icon: '📨', label: 'Outreach', href: '/outreach' },
    { icon: '🎥', label: 'Heygen Integration', href: '/heygen' },
  ];

  return (
    <div className="w-64 bg-[#0D1117] text-white p-6 flex flex-col border-r border-gray-800">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">OptiLeads</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex items-center space-x-2 text-sm text-gray-400">
        <span>v1.0.0</span>
        <button className="p-2 rounded-lg hover:bg-gray-800">
          🌙
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 