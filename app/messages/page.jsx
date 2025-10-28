'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '@/components/Sidebar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
        filtered = filtered.filter(msg => msg.direction === 'outgoing');
        break;
      case 'unread':
        filtered = filtered.filter(msg => !msg.read);
        break;
      case 'all':
        break;
      case 'spam':
        filtered = filtered.filter(msg => msg.spam);
        break;
      case 'trash':
        filtered = filtered.filter(msg => msg.deleted);
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

  const openConversation = (message) => {
    const allMessagesInConversation = messages
      .filter(m => m.sender === message.sender)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    setConversationMessages(allMessagesInConversation);
    setSelectedMessage(message);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase
        .from('ebay_messages')
        .insert({
          user_id: user.id,
          sender: selectedMessage.sender,
          subject: `Re: ${selectedMessage.subject}`,
          body: replyText,
          direction: 'outgoing',
          read: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConversationMessages(prev => [...prev, data]);
      setMessages(prev => [data, ...prev]);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const folders = [
    { id: 'inbox', label: 'Inbox', count: messages.filter(m => m.direction !== 'outgoing' && !m.read).length },
    { id: 'sent', label: 'Sent', count: messages.filter(m => m.direction === 'outgoing').length },
    { id: 'all', label: 'All', count: messages.length },
    { id: 'unread', label: 'Unread', count: messages.filter(m => !m.read).length },
    { id: 'spam', label: 'Spam', count: 0 },
    { id: 'trash', label: 'Trash', count: 0 },
  ];

  // Group messages by sender
  const groupedMessages = filteredMessages.reduce((acc, message) => {
    const sender = message.sender;
    if (!acc[sender]) {
      acc[sender] = [];
    }
    acc[sender].push(message);
    return acc;
  }, {});

  const conversations = Object.entries(groupedMessages).map(([sender, msgs]) => {
    const sortedMsgs = msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latestMessage = sortedMsgs[0];
    return {
      sender,
      message_count: msgs.length,
      latest_message: latestMessage,
      ...latestMessage
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view messages</p>
          <a href="/" className="text-purple-600 hover:underline">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 overflow-x-hidden min-w-0 max-w-full">
      
      {selectedMessage ? (
        // Chat View
        <div className="flex flex-col h-screen overflow-x-hidden">
          {/* Chat Header - STICKY */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 flex-shrink-0">
            <button 
              onClick={() => setSelectedMessage(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{selectedMessage.sender}</h2>
              <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-4 bg-gray-50">
            {conversationMessages.map((msg, index) => {
              const isOutgoing = msg.direction === 'outgoing';
              
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

          {/* Reply Input - STICKY */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex gap-4 max-w-full overflow-x-hidden">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
              />
              <button
                onClick={sendReply}
                disabled={!replyText.trim() || isSending}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium h-fit"
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
            
            <div className="flex-1"></div>

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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Auto-reply
            </button>
          </div>

          <div className="flex flex-1 min-w-0 overflow-hidden">
            {/* Messages Folders Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
              <div className="p-4">
                <button
                  onClick={syncMessages}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Messages
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentFilter(folder.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      currentFilter === folder.id
                        ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{folder.label}</span>
                    {folder.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        currentFilter === folder.id
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {folder.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Messages List */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Action buttons - STICKY */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-3 flex-shrink-0 overflow-x-auto scrollbar-hide max-w-full">
                <button 
                  onClick={() => {
                    if (selectedMessages.length > 0) {
                      console.log('Delete messages:', selectedMessages);
                    }
                  }}
                  disabled={selectedMessages.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Trash
                </button>
                <button 
                  disabled={selectedMessages.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0 whitespace-nowrap"
                >
                  Mark Unread
                </button>
                <button 
                  disabled={selectedMessages.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0 whitespace-nowrap"
                >
                  Report Spam
                </button>
                <button 
                  disabled={selectedMessages.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Archive
                </button>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium">No messages</p>
                    <p className="text-sm">Messages from your eBay buyers will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.message_id}
                        className={`flex items-start gap-4 px-8 py-4 hover:bg-gray-50 cursor-pointer max-w-full ${
                          !conversation.read ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => openConversation(conversation.latest_message)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(conversation.message_id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectMessage(conversation.message_id);
                          }}
                          className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png"
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
