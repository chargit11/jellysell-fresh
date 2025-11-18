'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const supabase = createClient();
  const refreshIntervalRef = useRef(null);

  const platforms = [
    { name: 'All Platforms', value: 'all', color: 'bg-purple-500' },
    { name: 'eBay', value: 'ebay', color: 'bg-blue-500' },
    { name: 'Etsy', value: 'etsy', color: 'bg-orange-500' },
    { name: 'Mercari', value: 'mercari', color: 'bg-red-500' },
    { name: 'Depop', value: 'depop', color: 'bg-pink-500' }
  ];

  // TRIGGER SYNC ON PAGE LOAD
  useEffect(() => {
    triggerBackgroundSync();
  }, []);

  // AUTO-REFRESH EVERY 5 SECONDS FOR LIVE UPDATES
  useEffect(() => {
    fetchMessages(); // Initial load
    
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing messages (5 sec)...');
      fetchMessages();
    }, 5000); // 5 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedPlatform, searchQuery]);

  // Trigger background extension to sync NOW
  async function triggerBackgroundSync() {
    try {
      console.log('📡 Triggering extension sync...');
      
      // Send message to extension to sync
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(
          'YOUR_EXTENSION_ID_HERE', // You'll need to replace this
          { action: 'syncEbayMessages' },
          (response) => {
            console.log('Sync response:', response);
          }
        );
      }
    } catch (error) {
      console.log('Extension not available:', error);
    }
  }

  async function fetchMessages() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('ebay_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform);
      }

      if (searchQuery) {
        query = query.or(`sender.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        // Filter out eBay system messages
        const buyerMessages = (data || []).filter(msg => {
          const sender = (msg.sender || '').toLowerCase();
          return sender !== 'ebay' && sender !== 'ebay user' && sender !== '';
        });
        
        setMessages(buyerMessages);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function syncNow() {
    setIsSyncing(true);
    try {
      console.log('🔄 Manual sync triggered');
      
      // Trigger extension sync
      await triggerBackgroundSync();
      
      // Wait 2 seconds then refresh
      setTimeout(async () => {
        await fetchMessages();
        setIsSyncing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Sync error:', error);
      setIsSyncing(false);
    }
  }

  const filteredMessages = messages;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <div className="text-sm text-gray-500">
                {messages.length} messages • Updated {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={syncNow}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Now
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Auto-updating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Platform Filter */}
            <div className="flex items-center gap-2">
              {platforms.map(platform => (
                <button
                  key={platform.value}
                  onClick={() => setSelectedPlatform(platform.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPlatform === platform.value
                      ? `${platform.color} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {platform.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No messages match your search' : 'Connect your marketplaces to see messages'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        message.platform === 'ebay' ? 'bg-blue-100 text-blue-700' :
                        message.platform === 'etsy' ? 'bg-orange-100 text-orange-700' :
                        message.platform === 'mercari' ? 'bg-red-100 text-red-700' :
                        'bg-pink-100 text-pink-700'
                      }`}>
                        {message.platform?.toUpperCase()}
                      </span>
                      <span className="font-semibold text-gray-900">{message.sender}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{message.subject}</h3>
                    <p className="text-gray-600 line-clamp-2">{message.body}</p>
                  </div>
                  {message.direction === 'outgoing' && (
                    <span className="ml-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Sent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
