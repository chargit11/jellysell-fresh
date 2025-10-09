'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Connections() {
  const [connections, setConnections] = useState({
    ebay: false,
    etsy: false,
    poshmark: false,
    depop: false,
    mercari: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/ebay/check-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(prev => ({
          ...prev,
          ebay: data.connected || false
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking connections:', error);
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    if (platform !== 'ebay') {
      alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration coming soon!`);
      return;
    }

    try {
      const clientId = 'Christia-JellySel-PRD-edec84694-300e7c9b';
      const redirectUri = encodeURIComponent('https://jellysell-fresh-6pnt.vercel.app/oauth/ebay');
      const state = Math.random().toString(36).substring(7);
      const scopes = encodeURIComponent([
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/sell.marketing',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'
      ].join(' '));

      localStorage.setItem('ebay_oauth_state', state);
      
      const authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}&scope=${scopes}`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Error connecting platform. Please try again.');
    }
  };

  const handleDisconnect = async (platform) => {
    if (platform !== 'ebay') {
      return;
    }

    if (!confirm(`Are you sure you want to disconnect ${platform.charAt(0).toUpperCase() + platform.slice(1)}?`)) {
      return;
    }

    try {
      const user_id = localStorage.getItem('user_id');
      
      const response = await fetch('/api/ebay/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnections(prev => ({ ...prev, [platform]: false }));
        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected successfully!`);
      } else {
        alert(`Failed to disconnect ${platform}: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      alert('Error disconnecting platform. Please try again.');
    }
  };

  const platforms = [
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'The global marketplace for unique and creative goods. Connect to reach millions of buyers worldwide.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'ebay',
      name: 'eBay',
      description: "World's largest online marketplace. List your items to reach buyers in 190+ countries globally.",
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'poshmark',
      name: 'Poshmark',
      description: 'Social commerce marketplace for fashion. Connect with style-conscious buyers and sellers.',
      logo: '👗',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'depop',
      name: 'Depop',
      description: 'Mobile marketplace for buying and selling unique fashion. Connect with Gen Z shoppers.',
      logo: '🛍️',
      bgColor: 'bg-red-100'
    },
    {
      id: 'mercari',
      name: 'Mercari',
      description: 'Simple selling marketplace. List items easily and reach millions of buyers in the US and Japan.',
      logo: '🏪',
      bgColor: 'bg-blue-100'
    }
  ];

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const totalPlatforms = platforms.length;
  const allConnected = connectedCount === totalPlatforms;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 py-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-semibold text-gray-900">Connections</h1>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Connections & Integrations</h2>
            <p className="text-gray-600">Connect your shop to multiple marketplaces and reach new audiences</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Connected Platforms</h3>
                <svg className={`w-5 h-5 ${allConnected ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{connectedCount}</span>
                <span className="text-sm text-gray-500">out of {totalPlatforms} platforms</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Total Reach</h3>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">325k+</span>
                <span className="text-sm text-gray-500">Potential buyers</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div key={platform.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 ${platform.bgColor} rounded-lg flex items-center justify-center`}>
                    {platform.logo.startsWith('http') ? (
                      <img src={platform.logo} alt={platform.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-3xl">{platform.logo}</span>
                    )}
                  </div>
                  {connections[platform.id] ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Not Connected
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{platform.name}</h3>
                <p className="text-sm text-gray-600 mb-4 min-h-[60px]">{platform.description}</p>

                {connections[platform.id] ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="w-full px-4 py-2 border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
