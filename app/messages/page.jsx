'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessage, setActiveMessage] = useState(null);
  const [threadBubbles, setThreadBubbles] = useState([]); // {id, role: 'buyer'|'me', text}
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      window.location.href = '/login';
      return;
    }

    fetch(`/api/messages?user_id=${user_id}`)
      .then(res => res.json())
      .then(data => {
        const list = data.messages || [];
        setMessages(list);
        if (list.length > 0) {
          const first = list[0];
          setActiveMessage(first);
          const text = typeof first.body === 'string' ? first.body : '';
          setThreadBubbles(text ? [{ id: `b_${first.message_id}`, role: 'buyer', text }] : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const folders = [
    { id: 'inbox', label: 'Inbox', count: messages.length },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'all', label: 'All', count: messages.length },
    { id: 'unread', label: 'Unread', count: messages.filter(m => !m.read).length },
    { id: 'spam', label: 'Spam', count: 0 },
    { id: 'trash', label: 'Trash', count: 0 },
  ];

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.sender?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  function onSelectMessage(message) {
    setActiveMessage(message);
    const initial = typeof message.body === 'string' && message.body.trim().length > 0
      ? [{ id: `b_${message.message_id}`, role: 'buyer', text: message.body }]
      : [];
    setThreadBubbles(initial);
    // mark as read locally
    setMessages(prev => prev.map(m => m.message_id === message.message_id ? { ...m, read: true } : m));
  }

  async function sendReply() {
    if (!replyText.trim() || !activeMessage) return;
    const user_id = localStorage.getItem('user_id');
    try {
      const res = await fetch('/api/ebay/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          message_id: activeMessage.message_id,
          buyer_username: activeMessage.sender,
          subject: `Re: ${activeMessage.subject || ''}`.trim(),
          text: replyText
        })
      });
      if (res.ok) {
        setThreadBubbles(prev => [...prev, { id: `me_${Date.now()}`, role: 'me', text: replyText }]);
        setReplyText('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to send');
      }
    } catch (e) {
      alert('Failed to send');
    }
  }

  function onComposerKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar spanning full width */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <div className="flex items-center gap-4 flex-1 max-w-3xl ml-8">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search your messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-shrink-0">
              <option>Auto-reply</option>
              <option>Manual reply</option>
            </select>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left sidebar with folders */}
          <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="px-6 py-4">
              <div className="space-y-1">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {folder.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content (Etsy-like split) */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Action bar */}
            <div className="px-8 py-4 border-b border-gray-200 bg-white flex items-center gap-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                onChange={() => {
                  if (selectedMessages.length === filteredMessages.length) {
                    setSelectedMessages([]);
                  } else {
                    setSelectedMessages(filteredMessages.map(m => m.message_id));
                  }
                }}
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

            <div className="flex-1 min-h-0 flex">
              {/* List */}
              <div className="w-full md:w-[380px] max-w-full overflow-y-auto border-r border-gray-200">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading messages...</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No messages found.</p>
                  </div>
                ) : (
                  <div className="bg-white">
                    {filteredMessages.map((message, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onSelectMessage(message)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(message.message_id)}
                          onChange={() => toggleSelectMessage(message.message_id)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" className="w-6 h-auto" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{message.sender || 'User'}</p>
                            <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{message.subject || 'No subject'}</p>
                          {!message.read && <span className="inline-block mt-1 w-2 h-2 bg-purple-600 rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thread */}
              <div className="hidden md:flex flex-1 flex-col min-w-0 bg-white">
                <div className="px-8 py-5 border-b border-gray-200">
                  {activeMessage ? (
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">From</p>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{activeMessage.sender}</h3>
                      <p className="text-sm text-gray-600 truncate">{activeMessage.subject || 'No subject'}</p>
                    </div>
                  ) : (
                    <div className="text-gray-500">Select a conversation</div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {activeMessage && threadBubbles.length === 0 && (
                    <div className="text-gray-400 text-sm">No content</div>
                  )}
                  {threadBubbles.map(b => (
                    <div key={b.id} className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${b.role === 'me' ? 'ml-auto bg-purple-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      <div className="whitespace-pre-wrap break-words">{b.text}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-end gap-3">
                    <textarea value={replyText} onChange={(e)=>setReplyText(e.target.value)} onKeyDown={onComposerKeyDown} placeholder="Write a reply (Enter to send, Shift+Enter for newline)" className="flex-1 min-h-[44px] max-h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <button onClick={sendReply} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
