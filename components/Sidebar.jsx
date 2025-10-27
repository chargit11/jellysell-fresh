'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard', badge: null },
    { name: 'Listings', icon: '📦', path: '/listings', badge: 1 },
    { name: 'Messages', icon: '💬', path: '/messages', badge: 5 },
    { name: 'Orders', icon: '🛒', path: '/orders', badge: 2 },
    { name: 'Finances', icon: '💰', path: '/finances', badge: null },
    { name: 'Connections', icon: '🔗', path: '/connections', badge: null },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    router.push('/');
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 sticky top-0`}>
      <div className="p-6 flex items-center">
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1">
            <img 
              src="https://i.ibb.co/1tp0Y9jz/jellysell-logo.webp" 
              alt="JellySell" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-semibold text-gray-900">jellysell</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`text-gray-400 hover:text-gray-600 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors relative ${
              pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge && (
                  <span className="w-6 h-6 bg-purple-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-purple-600 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <span>🚪</span>
          {!collapsed && <span className="font-medium">Log out</span>}
        </button>
      </div>
    </div>
  );
}
