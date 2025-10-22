'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    filterMessages();
  }, [messages, currentFilter, searchQuery]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const filterMessages = () => {
    let filtered = [...messages];

    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (currentFilter) {
      case 'inbox':
        break;
      case 'sent':
        filtered = [];
        break;
      case 'unread':
        filtered = filtered.filter(msg => !msg.read);
        break;
      case 'spam':
        filtered = [];
        break;
      case 'trash':
        filtered = [];
        break;
      default:
        break;
    }

    setFilteredMessages(filtered);
  };

  const syncMessages = async () => {
    console.log('Syncing messages from eBay...');
    await fetchMessages();
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view messages</h2>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Auto-reply</option>
              </select>
              <button 
                onClick={syncMessages}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Sync Messages
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-48 bg-white border-r border-gray-200 py-4">
            <nav className="space-y-1 px-4">
              <button 
                onClick={() => setCurrentFilter('inbox')}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${currentFilter === 'inbox' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Inbox
              </button>
              <button 
                onClick={() => setCurrentFilter('sent')}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${currentFilter === 'sent' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Sent
              </button>
              <button 
                onClick={() => setCurrentFilter('all')}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${currentFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All
              </button>
              <button 
                onClick={() => setCurrentFilter('unread')}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${currentFilter === 'unread' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Unread
              </button>
              <button 
                onClick={() => setCurrentFilter('spam')}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${currentFilter === 'spam' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Spam
              </button>
              <button 
                onClick={() => setCurrentFilter('trash')}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${currentFilter === 'trash' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Trash
              </button>
            </nav>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Trash
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Mark Unread
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
                Mark Read
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Report
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Label
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No messages found.</p>
                  <button 
                    onClick={syncMessages}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Sync Messages from eBay
                  </button>
                </div>
              ) : (
                <div className="bg-white">
                  {(() => {
                    const conversationsMap = {};
                    
                    filteredMessages.forEach(msg => {
                      const key = `${msg.sender}_${msg.item_id || 'no_item'}`;
                      
                      if (!conversationsMap[key]) {
                        conversationsMap[key] = {
                          ...msg,
                          message_count: 1,
                          all_messages: [msg]
                        };
                      } else {
                        conversationsMap[key].message_count += 1;
                        conversationsMap[key].all_messages.push(msg);
                        
                        if (new Date(msg.created_at) > new Date(conversationsMap[key].created_at)) {
                          conversationsMap[key] = {
                            ...msg,
                            message_count: conversationsMap[key].message_count,
                            all_messages: conversationsMap[key].all_messages
                          };
                        }
                      }
                    });
                    
                    const conversations = Object.values(conversationsMap);
                    
                    return conversations.map((conversation, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleMessageClick(conversation)}
                        className="flex items-center gap-4 px-8 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(conversation.message_id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectMessage(conversation.message_id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" 
                            alt="eBay" 
                            className="w-6 h-auto"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm">{conversation.sender || 'eBay User'}</p>
                              {conversation.message_count > 1 && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                                  {conversation.message_count}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{new Date(conversation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.subject || 'No subject'}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
