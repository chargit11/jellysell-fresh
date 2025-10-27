'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (conversationMessages.length > 0) {
      scrollToBottom();
    }
  }, [conversationMessages]);

  const fetchUser = async () => {
    // Check localStorage first (this is how your login works)
    const userId = localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('user_email');
    
    if (userId) {
      // User is logged in via localStorage
      setUser({ id: userId, email: userEmail });
      setLoading(false);
      return;
    }
    
    // Fallback: Try Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };

  const fetchMessages = async () => {
    console.log('Fetching all messages from ebay_messages table');
    console.log('Supabase URL:', 'https://qvhjmzdavsbauugubfcm.supabase.co');
    
    const { data, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    console.log('Total messages fetched:', data?.length || 0);
    console.log('All messages:', data);

    // Don't filter out YOUR messages - we need them to show sent history!
    // Only filter out eBay system messages
    const filteredMessages = (data || []).filter(msg => {
      const sender = (msg.sender || '').toLowerCase();
      const isSystemMessage = sender === 'ebay' || sender === 'ebay user' || sender === '' || sender === 'unknown';
      return !isSystemMessage;
    });

    console.log('After filtering out system messages:', filteredMessages.length);
    console.log('Unique senders:', [...new Set(filteredMessages.map(m => m.sender))]);
    setMessages(filteredMessages);
  };

  const filterMessages = () => {
    let filtered = [...messages];

    if (currentFilter === 'unread') {
      filtered = filtered.filter(m => !m.read);
    } else if (currentFilter === 'sent') {
      filtered = [];
    } else if (currentFilter === 'spam') {
      filtered = [];
    } else if (currentFilter === 'trash') {
      filtered = [];
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(m =>
        m.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Group messages by sender - show only the most recent message per sender
    const groupedBySender = {};
    filtered.forEach(msg => {
      const sender = msg.sender || 'Unknown';
      if (!groupedBySender[sender] || new Date(msg.created_at) > new Date(groupedBySender[sender].created_at)) {
        groupedBySender[sender] = {
          ...msg,
          message_count: filtered.filter(m => m.sender === sender).length
        };
      }
    });

    setFilteredMessages(Object.values(groupedBySender));
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const openConversation = (message) => {
    // Load all messages to/from this sender (both incoming and outgoing)
    const buyerName = message.sender;
    const userEmail = user?.email || '';
    
    const allMessagesInConversation = messages
      .filter(m => {
        // Incoming from buyer
        if (m.sender === buyerName) return true;
        
        // Outgoing to buyer (with recipient field - if column exists)
        if (m.recipient && m.recipient === buyerName) return true;
        
        // Outgoing to buyer (fallback: message from you about same item/subject)
        // This catches sent messages before recipient column was added OR if column doesn't exist
        if (m.sender === userEmail && m.item_id === message.item_id) return true;
        if (m.sender && m.sender === userEmail && m.subject?.includes(buyerName)) return true;
        
        return false;
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    console.log(`Found ${allMessagesInConversation.length} messages in conversation with ${buyerName}`);
    setConversationMessages(allMessagesInConversation);
    setSelectedMessage(message);
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      alert('Please type a message first!');
      return;
    }
    
    if (isSending) {
      console.log('Already sending, please wait...');
      return;
    }
    
    console.log('=== SEND MESSAGE DEBUG START ===');
    console.log('Selected message:', selectedMessage);
    console.log('Reply text:', replyText);
    console.log('User:', user);
    
    setIsSending(true);
    
    try {
      // Get current user email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const userEmail = currentUser?.email || user?.email || 'You';
      
      console.log('User email:', userEmail);

      // Test if recipient column exists
      console.log('Testing if recipient column exists...');
      const { error: schemaError } = await supabase
        .from('ebay_messages')
        .select('recipient')
        .limit(1);

      if (schemaError) {
        console.error('Schema error:', schemaError);
        if (schemaError.message.includes('recipient') || schemaError.code === 'PGRST116') {
          alert('❌ ERROR: The "recipient" column does NOT exist in your database!\n\n🔧 FIX: Go to Supabase SQL Editor and run:\n\nALTER TABLE ebay_messages ADD COLUMN recipient TEXT;\n\nThen try again.');
          setIsSending(false);
          return;
        }
      }
      
      console.log('Recipient column exists! ✓');

      // Prepare message data (don't include message_id - let database auto-generate it)
      const messageData = {
        sender: userEmail,
        recipient: selectedMessage.sender,
        subject: `Re: ${selectedMessage.subject || 'Message'}`,
        body: replyText,
        item_id: selectedMessage.item_id,
        read: true,
        created_at: new Date().toISOString()
      };
      
      console.log('Inserting message:', messageData);

      // Insert message directly into database
      const { data, error } = await supabase
        .from('ebay_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('❌ Insert failed:', error);
        alert(`Failed to send message: ${error.message}\n\nCheck console for details.`);
        setIsSending(false);
        return;
      }

      console.log('✅ Message inserted successfully:', data);

      // Add to local state immediately
      setMessages(prev => {
        console.log('Adding to messages array, current count:', prev.length);
        return [...prev, data];
      });
      
      setConversationMessages(prev => {
        console.log('Adding to conversation, current count:', prev.length);
        return [...prev, data];
      });
      
      setReplyText('');
      console.log('✅ Message sent successfully!');
      console.log('=== SEND MESSAGE DEBUG END ===');
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert(`Unexpected error: ${error.message}\n\nCheck console for details.`);
    } finally {
      setIsSending(false);
    }
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
      <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
        <div className="fixed left-0 top-0 h-screen z-50">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
        <div className="fixed left-0 top-0 h-screen z-50">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center ml-64">
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
    <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
      <div className="fixed left-0 top-0 h-screen z-50">
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-64 overflow-x-hidden min-w-0 max-w-full flex flex-col h-screen">{selectedMessage ? (
        // Chat View
        <div className="flex flex-col h-screen overflow-x-hidden">
          {/* Chat Header - Sticky */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png"
                alt="eBay"
                className="w-10 h-10 rounded-full object-contain bg-white p-1 border border-gray-200"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{selectedMessage.sender}</h2>
                <p className="text-sm text-gray-500">{selectedMessage.subject}</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-4 bg-gray-50">
            {conversationMessages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No messages in this conversation yet
              </div>
            )}
            {conversationMessages.map((msg, index) => {
              // A message is outgoing if YOU sent it (not the buyer)
              const userEmail = user?.email || '';
              const buyerName = selectedMessage.sender;
              
              // Message is outgoing if:
              // 1. sender is your email, OR
              // 2. recipient is the buyer name
              const isOutgoing = msg.sender === userEmail || msg.recipient === buyerName;
              
              console.log(`Message ${index}:`, {
                sender: msg.sender,
                recipient: msg.recipient,
                userEmail,
                buyerName,
                isOutgoing,
                body: msg.body?.substring(0, 50)
              });
              
              return (
                <div key={msg.message_id || index} className={`flex gap-3 max-w-full ${isOutgoing ? 'flex-row-reverse' : ''}`}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png"
                    alt={isOutgoing ? "You" : "Buyer"}
                    className="w-8 h-8 rounded-full object-contain bg-white p-1 border border-gray-200 flex-shrink-0"
                  />
                  <div className={`flex-1 max-w-2xl min-w-0 ${isOutgoing ? 'flex flex-col items-end' : ''}`}>
                    <div className={`rounded-lg p-4 shadow-sm break-words overflow-wrap-anywhere ${isOutgoing ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                      {msg.subject && !isOutgoing && <p className="font-semibold text-sm mb-2 break-words">{msg.subject}</p>}
                      <p className={`text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere ${isOutgoing ? 'text-white' : 'text-gray-900'}`}>
                        {msg.body || msg.subject}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isOutgoing && 'You • '}
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input - Sticky */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex gap-4 max-w-full overflow-x-hidden">
              <textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button 
                onClick={sendReply}
                disabled={!replyText.trim() || isSending}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors h-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Messages List View
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Top header bar with Messages title, searchbar, and auto-reply - STICKY */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-6 flex-shrink-0 max-w-full overflow-x-hidden">
            <h1 className="text-xl font-bold text-gray-900 flex-shrink-0">Messages</h1>
            
            <div className="flex-1 min-w-0"></div>

            <div className="max-w-md w-96 flex-shrink min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0 whitespace-nowrap">
              Auto-reply
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 min-w-0 overflow-hidden">
            {/* Messages Folders Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
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
            </div>

            {/* Messages List */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Action buttons - STICKY */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-3 flex-shrink-0 overflow-x-auto scrollbar-hide max-w-full">
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
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No messages found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.message_id}
                        className={`flex items-start gap-4 px-8 py-4 hover:bg-gray-50 cursor-pointer max-w-full ${
                          !message.read ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => openConversation(message)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(message.message_id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectMessage(message.message_id);
                          }}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                        />
                        
                        <div className="flex-shrink-0">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png"
                            alt="eBay"
                            className="w-10 h-10 rounded-full object-contain bg-white p-1 border border-gray-200"
                          />
                        </div>

                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-shrink">
                              <p className="font-semibold text-gray-900 text-sm truncate">{message.sender || 'eBay User'}</p>
                              {message.message_count && message.message_count > 1 && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                                  {message.message_count}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                              {new Date(message.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate overflow-hidden">{message.subject || 'No subject'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
