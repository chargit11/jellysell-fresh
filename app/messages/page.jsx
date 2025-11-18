'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

// Helper function to extract item ID from text
const extractItemIdFromText = (text) => {
  if (!text) return null;
  // Match eBay item IDs (typically 12-14 digits)
  const match = text.match(/\b(\d{12,14})\b/);
  return match ? match[1] : null;
};

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ebayConnected, setEbayConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    setSidebarCollapsed(savedCollapsed === 'true');

    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle);
  }, []);

  useEffect(() => {
    fetchUser();
    checkEbayConnection();
  }, []);

  useEffect(() => {
    if (ebayConnected) {
      fetchMessages();
      
      // Auto-refresh every 10 seconds
      const autoRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing messages...');
        fetchMessages();
      }, 10 * 1000); // 10 seconds
      
      return () => clearInterval(autoRefreshInterval);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [ebayConnected]);

  useEffect(() => {
    filterMessages();
  }, [messages, currentFilter, searchQuery]);

  useEffect(() => {
    if (conversationMessages.length > 0) {
      scrollToBottom();
    }
  }, [conversationMessages]);

  const checkEbayConnection = async () => {
    try {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        setEbayConnected(false);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ebay/check-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });

      if (response.ok) {
        const data = await response.json();
        setEbayConnected(data.connected || false);
      } else {
        setEbayConnected(false);
      }
    } catch (error) {
      console.error('Error checking eBay connection:', error);
      setEbayConnected(false);
    }
  };

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      return;
    }

    // Filter to ONLY show incoming messages (from buyers asking about YOUR listings)
    const buyerMessages = (data || []).filter(msg => {
      const sender = (msg.sender || '').toLowerCase();
      const isValidSender = sender !== 'ebay' && sender !== 'ebay user' && sender !== '' && sender !== 'unknown';
      const isIncoming = msg.direction === 'incoming' || !msg.direction;
      
      return isValidSender && isIncoming;
    });

    setMessages(buyerMessages);
    setLoading(false);
  };

  const syncMessages = async () => {
    setIsSyncing(true);
    try {
      // Communicate with Chrome extension to trigger sync
      if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
        try {
          // Send message to extension
          window.postMessage({ type: 'JELLYSELL_SYNC_MESSAGES' }, '*');
          
          console.log('Sync triggered via extension');
          
          // Wait 3 seconds for sync to complete, then refresh messages
          setTimeout(async () => {
            await fetchMessages();
            setIsSyncing(false);
          }, 3000);
          
        } catch (extError) {
          console.error('Extension communication failed:', extError);
          alert('Please make sure the JellySell Chrome extension is installed and enabled');
          setIsSyncing(false);
        }
      } else {
        alert('Chrome extension not detected. Please install the JellySell extension to sync messages.');
        setIsSyncing(false);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync messages');
      setIsSyncing(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    if (currentFilter === 'trash') {
      filtered = filtered.filter(m => m.deleted === true);
    } else if (currentFilter === 'unread') {
      filtered = filtered.filter(m => !m.read && m.deleted !== true);
    } else if (currentFilter === 'sent') {
      filtered = [];
    } else if (currentFilter === 'spam') {
      filtered = [];
    } else {
      filtered = filtered.filter(m => m.deleted !== true);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(m =>
        m.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
      prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]
    );
  };

  const openConversation = async (message) => {
    // Get ALL messages in this conversation (both incoming AND outgoing)
    const { data: allMessages, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .eq('sender', message.sender)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching conversation:', error);
      return;
    }
    
    setConversationMessages(allMessages || []);
    setSelectedMessage(message);

    // Mark unread messages as read
    const unreadMessageIds = (allMessages || []).filter(m => !m.read && m.direction === 'incoming').map(m => m.message_id);

    if (unreadMessageIds.length > 0) {
      try {
        await supabase.from('ebay_messages').update({ read: true }).in('message_id', unreadMessageIds);
        setMessages(prev => prev.map(msg => 
          unreadMessageIds.includes(msg.message_id) ? { ...msg, read: true } : msg
        ));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        alert('User ID not found. Please log in again.');
        setIsSending(false);
        return;
      }

      // Find any incoming message with an item_id
      let incomingMessageWithItem = conversationMessages.find(m => m.direction === 'incoming' && m.item_id);
      
      // If no item_id found, try to extract from subject/body
      if (!incomingMessageWithItem) {
        const incomingMessage = conversationMessages.find(m => m.direction === 'incoming');
        if (incomingMessage) {
          const extractedItemId = extractItemIdFromText(incomingMessage.subject) || extractItemIdFromText(incomingMessage.body);
          if (extractedItemId) {
            console.log('Extracted item ID from text:', extractedItemId);
            incomingMessageWithItem = { ...incomingMessage, item_id: extractedItemId };
          }
        }
      }
      
      if (!incomingMessageWithItem || !incomingMessageWithItem.item_id) {
        alert('Cannot reply: No item ID found for this conversation');
        setIsSending(false);
        return;
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: selectedMessage.sender,
          body: replyText,
          itemId: incomingMessageWithItem.item_id,
          user_id: userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.shouldOpenEbay || data.isEndedItem) {
          const shouldOpen = confirm(`${data.error}\n\nClick OK to open eBay Messages where you can reply.`);
          if (shouldOpen) {
            window.open('https://mesg.ebay.com/mesgweb/ViewMessages', '_blank');
          }
        } else {
          alert(`Failed to send message: ${data.error || 'Unknown error'}`);
        }
        return;
      }

      // Add the sent message to the conversation immediately
      setConversationMessages(prev => [...prev, data.data]);
      setReplyText('');
      // Message sent successfully - no alert needed
    } catch (error) {
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTrash = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await supabase.from('ebay_messages').update({ deleted: true }).in('message_id', selectedMessages);
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) ? { ...msg, deleted: true } : msg
      ));
      setSelectedMessages([]);
    } catch (error) {
      alert('Failed to move messages to trash');
    }
  };

  const handleMarkUnread = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await supabase.from('ebay_messages').update({ read: false }).in('message_id', selectedMessages);
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) ? { ...msg, read: false } : msg
      ));
      setSelectedMessages([]);
    } catch (error) {
      alert('Failed to mark messages as unread');
    }
  };

  const handleMarkRead = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await supabase.from('ebay_messages').update({ read: true }).in('message_id', selectedMessages);
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) ? { ...msg, read: true } : msg
      ));
      setSelectedMessages([]);
    } catch (error) {
      alert('Failed to mark messages as read');
    }
  };

  const handleRestore = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await supabase.from('ebay_messages').update({ deleted: false }).in('message_id', selectedMessages);
      setMessages(prev => prev.map(msg => 
        selectedMessages.includes(msg.message_id) ? { ...msg, deleted: false } : msg
      ));
      setSelectedMessages([]);
    } catch (error) {
      alert('Failed to restore messages');
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedMessages.length === 0) return;
    if (!confirm('Permanently delete these messages? This cannot be undone.')) return;

    try {
      await supabase.from('ebay_messages').delete().in('message_id', selectedMessages);
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.message_id)));
      setSelectedMessages([]);
    } catch (error) {
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

  // Check if conversation has any incoming message with item_id OR item_id in subject/body
  const getConversationItemId = () => {
    // Try to find item_id in database first
    const msgWithItemId = conversationMessages.find(m => m.direction === 'incoming' && m.item_id);
    if (msgWithItemId) return msgWithItemId.item_id;
    
    // Fallback: extract from subject/body
    const incomingMsg = conversationMessages.find(m => m.direction === 'incoming');
    if (incomingMsg) {
      return extractItemIdFromText(incomingMsg.subject) || extractItemIdFromText(incomingMsg.body);
    }
    
    return null;
  };

  const canReply = !!getConversationItemId();

  if (loading) {
    return (
      <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
        <div className="fixed left-0 top-0 h-screen"><Sidebar /></div>
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!ebayConnected) {
    return (
      <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
        <div className="fixed left-0 top-0 h-screen"><Sidebar /></div>
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your eBay Account</h2>
            <p className="text-gray-600 mb-6">Connect your eBay account to view and send messages</p>
            <Link href="/connections" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Go to Connections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-full bg-gray-50 overflow-hidden">
      <div className="fixed left-0 top-0 h-screen z-10"><Sidebar /></div>
      
      <div className={`flex-1 overflow-x-hidden min-w-0 max-w-full transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      
      {selectedMessage ? (
        <div className="flex flex-col h-screen overflow-x-hidden">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 flex-shrink-0">
            <button onClick={() => setSelectedMessage(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png" alt="eBay" className="w-10 h-10 rounded-full object-contain bg-white p-1 border border-gray-200" />
              <div>
                <h2 className="font-semibold text-gray-900">{selectedMessage.sender}</h2>
                <p className="text-sm text-gray-500">{selectedMessage.subject}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-4 bg-gray-50">
            {conversationMessages.map((msg, index) => {
              const isOutgoing = msg.direction === 'outgoing';
              return (
                <div key={msg.message_id || index} className={`flex gap-3 max-w-full ${isOutgoing ? 'flex-row-reverse' : ''}`}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png" alt={isOutgoing ? "You" : "Buyer"} className="w-8 h-8 rounded-full object-contain bg-white p-1 border border-gray-200 flex-shrink-0" />
                  <div className={`flex-1 max-w-2xl min-w-0 ${isOutgoing ? 'flex flex-col items-end' : ''}`}>
                    <div className={`rounded-lg p-4 shadow-sm break-words ${isOutgoing ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                      {msg.subject && !isOutgoing && <p className="font-semibold text-sm text-gray-700 mb-2 break-words">{msg.subject}</p>}
                      {msg.body && <p className={`text-sm whitespace-pre-wrap break-words ${isOutgoing ? 'text-white' : 'text-gray-900'}`}>{msg.body}</p>}
                      {!msg.body && !isOutgoing && <p className="text-sm text-gray-400 italic">No message text</p>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{isOutgoing && 'You • '}{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex-shrink-0">
            {canReply ? (
              <div className="flex gap-4 max-w-full">
                <textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }}} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" rows={3} />
                <button onClick={sendReply} disabled={!replyText.trim() || isSending} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 h-fit disabled:bg-gray-400 disabled:cursor-not-allowed">{isSending ? 'Sending...' : 'Send'}</button>
              </div>
            ) : (
              <div className="flex gap-4 max-w-full">
                <a 
                  href="https://mesg.ebay.com/mesgweb/ViewMessages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium">Reply on eBay.com →</p>
                </a>
                <button disabled className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed h-fit">Send</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-6 flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex-1"></div>
            <div className="max-w-md w-96">
              <div className="relative">
                <input type="text" placeholder="Search your messages" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <button
              onClick={syncMessages}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync
                </>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-50">Auto-reply<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              <nav className="flex-1 px-4 py-4 space-y-1">
                {folders.map(folder => (
                  <button key={folder.id} onClick={() => setCurrentFilter(folder.id)} className={`w-full text-left px-4 py-2 rounded-lg font-semibold flex items-center justify-between ${currentFilter === folder.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{folder.label}</span><span className="text-sm text-gray-400">{folder.count}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600" checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0} onChange={(e) => { setSelectedMessages(e.target.checked ? filteredMessages.map(m => m.message_id) : []); }} />
                {currentFilter === 'trash' ? (
                  <>
                    <button onClick={handleRestore} disabled={selectedMessages.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>Restore</button>
                    <button onClick={handlePermanentDelete} disabled={selectedMessages.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded disabled:opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete Forever</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleTrash} disabled={selectedMessages.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Trash</button>
                    <button onClick={handleMarkUnread} disabled={selectedMessages.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Mark Unread</button>
                    <button onClick={handleMarkRead} disabled={selectedMessages.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>Mark Read</button>
                  </>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-64"><p className="text-gray-500">No messages found</p></div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <div key={message.message_id} className={`flex items-start gap-4 px-8 py-4 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-purple-50' : ''}`} onClick={() => openConversation(message)}>
                        <input type="checkbox" checked={selectedMessages.includes(message.message_id)} onChange={(e) => { e.stopPropagation(); toggleSelectMessage(message.message_id); }} onClick={(e) => e.stopPropagation()} className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png" alt="eBay" className="w-10 h-10 rounded-full object-contain bg-white p-1 border border-gray-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className={`text-gray-900 text-sm truncate ${!message.read ? 'font-bold' : 'font-semibold'}`}>{message.sender || 'eBay User'}</p>
                              {message.message_count > 1 && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{message.message_count}</span>}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <p className={`text-sm text-gray-600 truncate ${!message.read ? 'font-bold' : ''}`}>{message.subject || 'No subject'}</p>
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
