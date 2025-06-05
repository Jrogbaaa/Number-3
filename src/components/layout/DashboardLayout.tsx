'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { useSession, signOut } from 'next-auth/react';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';
import { 
  BarChart2, 
  Database, 
  Mail, 
  Video,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  Building
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
    name: 'Outreach Calendar',
    href: '/outreach',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    name: 'Upload Leads',
    href: '/data-input',
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: 'Create Media',
    href: '/heygen',
    icon: <Video className="w-5 h-5" />,
  },
];

const UserProfile = () => {
  const { data: session, status } = useSession();
  const { preferences } = useUserPreferences();
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionRetryCount, setSessionRetryCount] = useState(0);
  const [manualSession, setManualSession] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging
  console.log('[UserProfile] Session status:', status);
  console.log('[UserProfile] Session data:', session);
  console.log('[UserProfile] User data:', session?.user);
  console.log('[UserProfile] User preferences:', preferences);

  // Fallback: Try to get session from API if useSession fails OR is loading for too long
  useEffect(() => {
    if ((status === 'unauthenticated' || status === 'loading') && sessionRetryCount < 5) {
      const fetchSession = async () => {
        try {
          console.log('[UserProfile] Attempting manual session fetch, retry:', sessionRetryCount, 'status:', status);
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const sessionData = await response.json();
            console.log('[UserProfile] Manual session fetch response:', sessionData);
            if (sessionData.user) {
              // NextAuth session format
              console.log('[UserProfile] Found NextAuth session, setting manual session');
              setManualSession({ user: sessionData.user });
            } else if (sessionData.authenticated && sessionData.nextAuth?.user) {
              // Custom session format
              console.log('[UserProfile] Found custom session format, setting manual session');
              setManualSession(sessionData.nextAuth);
            }
          }
        } catch (error) {
          console.error('[UserProfile] Manual session fetch failed:', error);
        }
        setSessionRetryCount(prev => prev + 1);
      };
      
      // Try much faster for loading state
      const delay = status === 'loading' ? 100 : 1000 * (sessionRetryCount + 1);
      setTimeout(fetchSession, delay);
    }
  }, [status, sessionRetryCount]);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="hidden sm:block">
          <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Use manual session if useSession fails
  const activeSession = session || manualSession;
  
  // Handle both NextAuth format and our custom API format
  let user;
  if (activeSession?.user) {
    // Standard NextAuth format: { user: {...} }
    user = activeSession.user;
  } else if (activeSession?.nextAuth?.user) {
    // Our custom API format: { nextAuth: { user: {...} } }
    user = activeSession.nextAuth.user;
  } else if (activeSession?.authenticated && activeSession?.nextAuth) {
    // Another variant of our API format
    user = activeSession.nextAuth.user;
  }

  console.log('[UserProfile] Extracted user:', user);
  console.log('[UserProfile] User image URL:', user?.image);
  console.log('[UserProfile] User image exists?', !!user?.image);
  console.log('[UserProfile] Company name from preferences:', preferences?.companyName);
  
  // Force refresh if we don't have user data but session should be available
  if (!user && sessionRetryCount === 0) {
    setTimeout(() => setSessionRetryCount(1), 100);
  }

  // Get company name from preferences
  const companyName = preferences?.companyName;

  if (!user) {
    console.log('[UserProfile] No session/user found, returning Session Error');
    return (
      <div className="text-xs text-red-400 px-2 py-1 bg-red-900/20 rounded">
        Session Error
      </div>
    );
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
        aria-label="User menu"
      >
        {/* User avatar */}
        <div className="relative w-8 h-8">
          <img
            src={user.image || ''}
            alt={user.name || 'User avatar'}
            className="w-8 h-8 rounded-full ring-2 ring-gray-600/50 group-hover:ring-blue-400/50 transition-all duration-200"
            style={{ display: user.image ? 'block' : 'none' }}
            onLoad={() => {
              console.log('[UserProfile] Image loaded successfully:', user.image);
            }}
            onError={(e) => {
              console.log('[UserProfile] Image failed to load:', user.image);
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          <div 
            className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-gray-600/50 group-hover:ring-blue-400/50 transition-all duration-200"
            style={{ display: user.image ? 'none' : 'flex' }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* User name and company - hidden on very small screens */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors truncate max-w-32">
              {user.name || 'User'}
            </p>
            {companyName && (
              <>
                <span className="text-gray-500 text-xs">@</span>
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400 truncate max-w-24">
                    {companyName}
                  </p>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate max-w-32">
            {user.email}
          </p>
        </div>
        
        {/* Dropdown arrow */}
        <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu - rendered via portal */}
      {showDropdown && isMounted && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[150]" 
            onClick={() => setShowDropdown(false)}
            style={{ zIndex: 9998 }}
          />
          
          {/* Dropdown content */}
          <div 
            className="fixed bg-red-500 border-4 border-yellow-400 rounded-lg shadow-2xl z-[200] py-2 w-56"
            style={{ 
              zIndex: 9999,
              top: '60px',
              right: '20px'
            }}
          >
            {/* User info section */}
            <div className="px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <img
                    src={user.image || ''}
                    alt={user.name || 'User avatar'}
                    className="w-10 h-10 rounded-full"
                    style={{ display: user.image ? 'block' : 'none' }}
                    onError={(e) => {
                      console.log('[UserProfile] Dropdown image failed to load:', user.image);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div 
                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center"
                    style={{ display: user.image ? 'none' : 'flex' }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || 'User'}
                    </p>
                    {companyName && (
                      <>
                        <span className="text-gray-500 text-xs">@</span>
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-400 truncate max-w-20">
                            {companyName}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

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
        {/* Desktop header - only visible on medium screens and up */}
        <header className="hidden md:block bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/30 px-6 py-3">
          <div className="flex items-center justify-end">
            <UserProfile />
          </div>
        </header>

        {/* Mobile header - only visible on small screens */}
        <header className="md:hidden bg-gray-900 p-4 flex items-center justify-between shadow-md">
          <Link 
            href="/?landing=true"
            className="font-bold hover:opacity-80 transition-all duration-200"
            aria-label="OptiLeads.ai Home"
          >
            <span className="text-white">Opti<span className="text-blue-400">Leads</span><span className="text-white opacity-80">.</span><span className="text-indigo-300">ai</span></span>
          </Link>
          
          <div className="flex items-center gap-3">
            <UserProfile />
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
          </div>
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