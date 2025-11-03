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
    fetchMessages(); // Fetch messages immediately, don't wait for user
  }, []);

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
    setLoading(false);
  };

  const fetchMessages = async () => {
    console.log('Fetching all buyer messages from any eBay account');
    console.log('Supabase URL:', 'https://qvhjmzdavsbauugubfcm.supabase.co');
    
    const { data, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Filter out eBay system messages - only show messages from real buyers
    const buyerMessages = (data || []).filter(msg => {
      const sender = (msg.sender || '').toLowerCase();
      return sender !== 'ebay' && sender !== 'ebay user' && sender !== '' && sender !== 'unknown';
    });

    console.log('Total messages:', data?.length || 0);
    console.log('Buyer messages (filtered):', buyerMessages.length);
    setMessages(buyerMessages);
  };

  const filterMessages = () => {
    let filtered = [...messages];

    console.log('Filtering messages. Total:', messages.length, 'Deleted:', messages.filter(m => m.deleted === true).length);

    // Apply folder-specific filters first
    if (currentFilter === 'trash') {
      // Only show deleted messages
      filtered = filtered.filter(m => m.deleted === true);
    } else if (currentFilter === 'unread') {
      // Show unread, non-deleted messages
      filtered = filtered.filter(m => !m.read && m.deleted !== true);
    } else if (currentFilter === 'sent') {
      filtered = [];
    } else if (currentFilter === 'spam') {
      filtered = [];
    } else {
      // inbox, all - show non-deleted messages (treat undefined as not deleted)
      filtered = filtered.filter(m => m.deleted !== true);
    }

    console.log('After filter (currentFilter=' + currentFilter + '):', filtered.length);

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

    const grouped = Object.values(groupedBySender);
    console.log('After grouping:', grouped.length, 'conversations');
    setFilteredMessages(grouped);
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const openConversation = async (message) => {
    // Load all messages to/from this sender (both incoming and outgoing)
    const allMessagesInConversation = messages
      .filter(m => m.sender === message.sender)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    setConversationMessages(allMessagesInConversation);
    setSelectedMessage(message);

    // Mark all messages in this conversation as read
    const unreadMessageIds = allMessagesInConversation
      .filter(m => !m.read)
      .map(m => m.message_id);

    if (unreadMessageIds.length > 0) {
      try {
        // Update in database
        const { error } = await supabase
          .from('ebay_messages')
          .update({ read: true })
          .in('message_id', unreadMessageIds);

        if (error) throw error;

        // Update local state
        setMessages(prev => prev.map(msg => 
          unreadMessageIds.includes(msg.message_id) 
            ? { ...msg, read: true }
            : msg
        ));

        console.log('Marked messages as read:', unreadMessageIds.length);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const sendReply = async () => {
    console.log('=== SEND REPLY CLICKED ===');
    console.log('Reply text:', replyText);
    console.log('Is sending:', isSending);
    
    if (!replyText.trim() || isSending) {
      console.log('Aborting: empty text or already sending');
      return;
    }
    
    console.log('Selected message:', selectedMessage);
    console.log('Sending reply to:', selectedMessage.sender);
    
    setIsSending(true);
    
    try {
      // Get user_id from localStorage
      const userId = localStorage.getItem('user_id');
      console.log('User ID from localStorage:', userId);
      
      if (!userId) {
        console.error('No user_id found in localStorage');
        alert('User ID not found. Please log in again.');
        setIsSending(false);
        return;
      }

      const requestBody = {
        recipient: selectedMessage.sender,
        body: replyText,
        itemId: selectedMessage.item_id,
        user_id: userId
      };
      
      console.log('Request body:', requestBody);
      console.log('Making fetch request to /api/messages/send...');

      // Send message via eBay API
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response received. Status:', response.status);
      console.log('Response OK:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Failed to send message. Status:', response.status);
        console.error('Error data:', data);
        alert(`Failed to send message: ${data.error || 'Unknown error'}`);
        return;
      }

      console.log('Message sent successfully!');
      
      // Add to local state immediately
      setMessages(prev => [...prev, data.data]);
      setConversationMessages(prev => [...prev, data.data]);
      
      setReplyText('');
      alert('Message sent successfully!');
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      console.log('Setting isSending to false');
      setIsSending(false);
    }
  };

  const handleTrash = async () => {
    if (selectedMessages.length === 0) return;

    console.log('Trashing messages:', selectedMessages);

    try {
      // Update messages in database to mark as deleted
      const { error } = await supabase
        .from('ebay_messages')
        .update({ deleted: true })
        .in('message_id', selectedMessages);

      if (error) throw error;

      console.log('Database updated, now updating local state');

      // Update local state
      const updatedMessages = messages.map(msg => 
        selectedMessages.includes(msg.message_id) 
          ? { ...msg, deleted: true }
          : msg
      );
      
      setMessages(updatedMessages);
      console.log('Messages after trash:', updatedMessages.filter(m => m.deleted === true).length, 'deleted');

      // Clear selection
      setSelectedMessages([]);
      console.log('Messages moved to trash');
    } catch (error) {
      console.error('Error moving to trash:', error);
      alert('Failed to move messages to trash');
    }
  };

  const handleMarkUnread = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Update messages in database to mark as unread
      const { error } = await supabase
        .from('ebay_messages')
        .update({ read: false })
        .in('message_id', selectedMessages);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) 
          ? { ...msg, read: false }
          : msg
      ));

      // Clear selection
      setSelectedMessages([]);
      console.log('Messages marked as unread');
    } catch (error) {
      console.error('Error marking as unread:', error);
      alert('Failed to mark messages as unread');
    }
  };

  const handleMarkRead = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Update messages in database to mark as read
      const { error } = await supabase
        .from('ebay_messages')
        .update({ read: true })
        .in('message_id', selectedMessages);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) 
          ? { ...msg, read: true }
          : msg
      ));

      // Clear selection
      setSelectedMessages([]);
      console.log('Messages marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      alert('Failed to mark messages as read');
    }
  };

  const handleRestore = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Update messages in database to mark as not deleted
      const { error } = await supabase
        .from('ebay_messages')
        .update({ deleted: false })
        .in('message_id', selectedMessages);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) 
          ? { ...msg, deleted: false }
          : msg
      ));

      // Clear selection
      setSelectedMessages([]);
      console.log('Messages restored from trash');
    } catch (error) {
      console.error('Error restoring messages:', error);
      alert('Failed to restore messages');
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    if (!confirm('Permanently delete these messages? This cannot be undone.')) {
      return;
    }

    try {
      // Actually delete messages from database
      const { error } = await supabase
        .from('ebay_messages')
        .delete()
        .in('message_id', selectedMessages);

      if (error) throw error;

      // Remove from local state
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.message_id)));

      // Clear selection
      setSelectedMessages([]);
      console.log('Messages permanently deleted');
    } catch (error) {
      console.error('Error deleting messages:', error);
      alert('Failed to delete messages permanently');
    }
  };

  const folders = [
    { id: 'inbox', label: 'Inbox', count: messages.filter(m => m.deleted !== true).length },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'all', label: 'All', count: messages.filter(m => m.deleted !== true).length },
    { id: 'unread', label: 'Unread', count: messages.filter(m => !m.read && m.deleted !== true).length },
    { id: 'spam', label: 'Spam', count: 0 },
    { id: 'trash', label: 'Trash', count: messages.filter(m => m.deleted === true).length },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
        <div className="fixed left-0 top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
      <div className="fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-64 overflow-x-hidden min-w-0 max-w-full">
      
      {selectedMessage ? (
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
                      {msg.subject && !isOutgoing && <p className="font-semibold text-sm text-gray-700 mb-2 break-words">{msg.subject}</p>}
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
                onClick={() => {
                  console.log('SEND BUTTON CLICKED!');
                  console.log('Reply text:', replyText);
                  console.log('Reply text length:', replyText.length);
                  console.log('Is sending:', isSending);
                  sendReply();
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors h-fit"
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
              {/* Action buttons - NOT SCROLLING */}
              <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-3 flex-shrink-0 overflow-x-auto scrollbar-hide max-w-full">
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
                
                {currentFilter === 'trash' ? (
                  // Trash-specific buttons
                  <>
                    <button 
                      onClick={handleRestore}
                      disabled={selectedMessages.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Restore
                    </button>
                    <button 
                      onClick={handlePermanentDelete}
                      disabled={selectedMessages.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Forever
                    </button>
                  </>
                ) : (
                  // Regular inbox buttons
                  <>
                    <button 
                      onClick={handleTrash}
                      disabled={selectedMessages.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Trash
                    </button>
                    <button 
                      onClick={handleMarkUnread}
                      disabled={selectedMessages.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Mark Unread
                    </button>
                    <button 
                      onClick={handleMarkRead}
                      disabled={selectedMessages.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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
                  </>
                )}
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
                          onClick={(e) => e.stopPropagation()}
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
                              <p className={`text-gray-900 text-sm truncate ${!message.read ? 'font-bold' : 'font-semibold'}`}>{message.sender || 'eBay User'}</p>
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
                          <p className={`text-sm text-gray-600 truncate overflow-hidden ${!message.read ? 'font-bold' : ''}`}>{message.subject || 'No subject'}</p>
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
