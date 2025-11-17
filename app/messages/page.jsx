'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEbayConnected, setIsEbayConnected] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndFetchMessages() {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if eBay is connected
      const { data: connections } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'ebay')
        .single();

      setIsEbayConnected(!!connections);

      if (!connections) {
        setLoading(false);
        return;
      }

      // Fetch eBay messages
      await fetchMessages(user.id);
    }

    checkAuthAndFetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel('ebay_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ebay_messages'
        },
        () => {
          // Refetch messages when changes occur
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) fetchMessages(user.id);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  async function fetchMessages(userId) {
    try {
      const { data, error } = await supabase
        .from('ebay_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } else {
        console.log('Raw messages from DB:', data);
        
        // Only filter out eBay system messages
        const buyerMessages = (data || []).filter(msg => {
          const sender = (msg.sender || '').toLowerCase();
          const isSystemMessage = sender === 'ebay' || sender === 'ebay user';
          return !isSystemMessage;
        });

        console.log('Messages after filtering:', buyerMessages);
        setMessages(buyerMessages);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!isEbayConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No eBay Connection</h2>
          <p className="text-gray-600 mb-6">Connect your eBay account to view and manage messages.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Connect eBay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Messages</h1>
            <p className="text-gray-600 mt-1">Manage all your eBay customer inquiries</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">Your buyer messages will appear here once they start coming in.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{message.sender}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Item: {message.item_id}
                    </p>
                    {message.subject && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Subject: {message.subject}
                      </p>
                    )}
                  </div>
                  <a
                    href={`https://www.ebay.com/sh/ms/${message.message_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Reply on eBay →
                  </a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{message.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
