// app/connections/page.jsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

function ConnectionsContent() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState({
    ebay: false,
    etsy: false,
    poshmark: false,
    depop: false,
    mercari: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for success/error messages from OAuth callback
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success || error) {
      // Remove URL params and refresh connection status
      window.history.replaceState({}, '', '/connections');
      checkConnections();
      
      // Trigger Chrome extension to sync data automatically
      if (success === 'ebay_connected') {
        triggerExtensionSync('ebay');
      } else if (success === 'etsy_connected') {
        triggerExtensionSync('etsy');
      }

      // Show success/error message
      if (success === 'ebay_connected') {
        alert('eBay connected successfully!');
      } else if (success === 'etsy_connected') {
        alert('Etsy connected successfully!');
      } else if (error) {
        alert(`Connection failed: ${error}`);
      }
    } else {
      checkConnections();
    }
  }, [searchParams]);

  const triggerExtensionSync = async (platform) => {
    try {
      // Send message to Chrome extension to sync data
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage('eopdegaaaehcnlkeiidkflahpffhmhmd', { 
          action: 'syncData',
          platform: platform
        });
        console.log(`✓ ${platform} extension sync triggered`);
      }
    } catch (error) {
      console.log('Extension not installed or unavailable:', error.message);
    }
  };

  const checkConnections = async () => {
    try {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        window.location.href = '/login';
        return;
      }

      // Check eBay connection
      const ebayResponse = await fetch('/api/ebay/check-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });

      if (ebayResponse.ok) {
        const data = await ebayResponse.json();
        setConnections(prev => ({
          ...prev,
          ebay: data.connected || false
        }));
      }

      // Check Etsy connection
      const etsyResponse = await fetch('/api/etsy/check-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });

      if (etsyResponse.ok) {
        const data = await etsyResponse.json();
        setConnections(prev => ({
          ...prev,
          etsy: data.connected || false
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking connections:', error);
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    const user_id = localStorage.getItem('user_id');
    
    if (!user_id) {
      alert('Please login first');
      window.location.href = '/login';
      return;
    }

    if (platform === 'ebay') {
      try {
        const clientId = 'Christia-JellySel-PRD-edec84694-300e7c9b';
        const redirectUri = encodeURIComponent('https://jellysell.com/api/ebay/callback');
        
        const state = JSON.stringify({ 
          user_id, 
          random: Math.random().toString(36).substring(7) 
        });
        const encodedState = encodeURIComponent(state);
        
        const scopes = encodeURIComponent([
          'https://api.ebay.com/oauth/api_scope',
          'https://api.ebay.com/oauth/api_scope/sell.marketing',
          'https://api.ebay.com/oauth/api_scope/sell.inventory',
          'https://api.ebay.com/oauth/api_scope/sell.account',
          'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
          'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'
        ].join(' '));
        
        const authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${encodedState}&scope=${scopes}`;
        
        window.location.href = authUrl;
      } catch (error) {
        console.error('Error connecting eBay:', error);
        alert('Error connecting eBay. Please try again.');
      }
    } else if (platform === 'etsy') {
      // Redirect to Etsy OAuth
      window.location.href = `/api/etsy/auth?user_id=${user_id}`;
    } else {
      alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration coming soon!`);
    }
  };

  const handleDisconnect = async (platform) => {
    if (platform !== 'ebay' && platform !== 'etsy') {
      return;
    }

    if (!confirm(`Are you sure you want to disconnect ${platform.charAt(0).toUpperCase() + platform.slice(1)}?`)) {
      return;
    }

    try {
      const user_id = localStorage.getItem('user_id');
      
      const response = await fetch(`/api/${platform}/disconnect`, {
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
      id: 'ebay',
      name: 'eBay',
      description: "World's largest online marketplace.",
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Marketplace for unique goods.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'poshmark',
      name: 'Poshmark',
      description: 'Social commerce for fashion.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Poshmark_logo.png?20201202202741',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'depop',
      name: 'Depop',
      description: 'Mobile fashion marketplace.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Depop_logo.svg/1200px-Depop_logo.svg.png?20180616154725',
      bgColor: 'bg-red-50'
    },
    {
      id: 'mercari',
      name: 'Mercari',
      description: 'Simple selling marketplace.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Mercari_logo_2018.svg/1198px-Mercari_logo_2018.svg.png?20200825183145',
      bgColor: 'bg-blue-50'
    }
  ];

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const totalPlatforms = platforms.length;
  const allConnected = connectedCount === totalPlatforms;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="px-6 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">Connections</h1>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <div className="mb-3">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Platform Connections</h2>
            <p className="text-gray-600 text-xs">Connect your shop to multiple marketplaces</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-lg border border-gray-200 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-gray-700">Connected Platforms</h3>
                <svg className={`w-4 h-4 ${allConnected ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{connectedCount}</span>
                <span className="text-xs text-gray-500">out of {totalPlatforms}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-gray-700">Total Reach</h3>
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">325k+</span>
                <span className="text-xs text-gray-500">Buyers</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="bg-white rounded-lg border border-gray-200 p-2.5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-11 h-11 ${platform.bgColor} rounded-lg flex items-center justify-center`}>
                    <img src={platform.logo} alt={platform.name} className="w-7 h-7 object-contain" />
                  </div>
                  {connections[platform.id] ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Not Connected
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">{platform.name}</h3>
                <p className="text-xs text-gray-600 mb-2 h-7 leading-tight">{platform.description}</p>

                {connections[platform.id] ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="w-full px-2 py-1.5 border border-red-600 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    className="w-full px-2 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
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

export default function Connections() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectionsContent />
    </Suspense>
  );
}
