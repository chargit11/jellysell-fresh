'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

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
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Apply folder filter
    if (currentFilter === 'unread') {
      filtered = filtered.filter(m => !m.read);
    } else if (currentFilter === 'sent') {
      filtered = [];
    } else if (currentFilter === 'spam') {
      filtered = [];
    } else if (currentFilter === 'trash') {
      filtered = [];
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(m =>
        m.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const folders = [
    { id: 'inbox', label: 'Inbox', count: messages.length },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'all', label: 'All', count: messages.length },
    { id: 'unread', label: 'Unread', count: messages.filter(m => !m.read).length },
    { id: 'spam', label: 'Spam', count: 0 },
    { id: 'trash', label: 'Trash', count: 0 },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to view messages</p>
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex">
        {/* Messages Folders Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header with search */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Folders */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setCurrentFilter(folder.id)}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold flex items-center justify-between ${
                  currentFilter === folder.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{folder.label}</span>
                <span className="text-sm text-gray-400">{folder.count}</span>
              </button>
            ))}
          </nav>

          {/* Auto-reply button */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors">
              Auto-reply
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 flex flex-col">
          {/* Action buttons */}
          <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMessages(filteredMessages.map(m => m.message_id));
                } else {
                  setSelectedMessages([]);
                }
              }}
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

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div
                    key={message.message_id}
                    className={`flex items-start gap-4 px-8 py-4 hover:bg-gray-50 cursor-pointer ${
                      !message.read ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.message_id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectMessage(message.message_id);
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    
                    <div className="flex-shrink-0">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png"
                        alt="eBay"
                        className="w-10 h-10 rounded-full object-contain bg-white p-1 border border-gray-200"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{message.sender || 'eBay User'}</p>
                          {message.message_count > 1 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              {message.message_count}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.subject || 'No subject'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
