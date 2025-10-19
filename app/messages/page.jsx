'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for thread view
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Enhanced function to strip HTML tags and extract readable text
  const stripHtml = (html) => {
    if (!html) return 'No message content';
    
    // First, decode HTML entities
    const decodeHtml = (text) => {
      const txt = document.createElement('textarea');
      txt.innerHTML = text;
      return txt.value;
    };
    
    // Check for eBay marketing emails first
    if (html.includes('eBay') && (
        html.includes('share feedback') || 
        html.includes('Rate purchase') || 
        html.includes('Your feedback helps'))) {
      
      // Extract meaningful content from eBay marketing emails
      const contentRegex = /Your feedback helps.*?Share feedback|Your review matters.*?Rate purchase|Rate purchase/gi;
      const matches = html.match(contentRegex);
      
      if (matches && matches.length > 0) {
        // Clean up the extracted content
        let ebayContent = matches.join('\n\n');
        ebayContent = ebayContent.replace(/<[^>]+>/g, ' ');
        ebayContent = ebayContent.replace(/\s+/g, ' ').trim();
        
        // Add a cleaner summary
        return `eBay is requesting feedback for your recent purchases. They're asking you to rate or review items including:
- Ancient Roman Widows Mite
- Men's Yeezy X Gap X Kanye West Heavy product

You can provide feedback by clicking the "Rate purchase" button in the original email.`;
      }
    }
    
    // Decode the escaped HTML
    let decoded = decodeHtml(html);
    
    // Special handling for full HTML documents
    if (decoded.includes('<!DOCTYPE') || decoded.includes('<html')) {
      try {
        // Try to parse and extract the actual content
        const parser = new DOMParser();
        const doc = parser.parseFromString(decoded, 'text/html');
        
        // Extract all text content
        if (doc.body) {
          // Focus on specific sections that might contain the message
          const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, div.content, div.message, div.body');
          
          if (contentElements.length > 0) {
            // Collect text from all content elements
            let contents = [];
            contentElements.forEach(el => {
              const text = el.textContent.trim();
              if (text.length > 15 && !text.includes('{') && !text.includes('};')) {
                contents.push(text);
              }
            });
            
            if (contents.length > 0) {
              return contents.join('\n\n');
            }
          }
          
          // If no specific content found, use body text as fallback
          let bodyText = doc.body.textContent;
          
          // Clean up common marketing email junk
          bodyText = bodyText.replace(/(?:https?:\/\/[^\s]+)/g, ''); // Remove URLs
          bodyText = bodyText.replace(/\s+/g, ' ').trim(); // Normalize whitespace
          bodyText = bodyText.replace(/@media.*?}/gs, ''); // Remove CSS media queries
          bodyText = bodyText.replace(/\{.*?\}/gs, ''); // Remove CSS blocks
          bodyText = bodyText.replace(/\..*?\{.*?\}/gs, ''); // Remove CSS selectors
          bodyText = bodyText.replace(/^\s*@.*?$/gm, ''); // Remove CSS directives
          bodyText = bodyText.replace(/\[\#.*?\]/g, ''); // Remove email reference IDs
          
          // Split into lines and keep only those that look like real content
          const lines = bodyText.split(/\n|\r\n|\r/);
          const contentLines = lines.filter(line => {
            line = line.trim();
            return line.length > 15 && 
                   !line.includes('@media') &&
                   !line.includes('px') &&
                   !line.startsWith('.') &&
                   !line.includes(':hover') &&
                   !line.includes('(max-width');
          });
          
          if (contentLines.length > 0) {
            return contentLines.join('\n\n');
          }
          
          // If nothing else worked, return a simplified version
          return bodyText.substring(0, 500);
        }
      } catch (e) {
        console.error("Error parsing HTML:", e);
      }
    }
    
    // For regular messages, strip tags and clean up
    decoded = decoded.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    decoded = decoded.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    decoded = decoded.replace(/<[^>]+>/g, ' ');
    decoded = decoded.replace(/&nbsp;/g, ' ');
    decoded = decoded.replace(/&amp;/g, '&');
    decoded = decoded.replace(/&lt;/g, '<');
    decoded = decoded.replace(/&gt;/g, '>');
    decoded = decoded.replace(/&quot;/g, '"');
    decoded = decoded.replace(/&#39;/g, "'");
    decoded = decoded.replace(/&zwnj;/g, '');
    decoded = decoded.replace(/\s+/g, ' ').trim();
    
    return decoded || 'No message content available';
  };

  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      window.location.href = '/login';
      return;
    }

    fetch(`/api/messages?user_id=${user_id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
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

  // Open thread view
  const handleMessageClick = async (message) => {
    setSelectedThread(message);
    
    // Strip HTML from the message body before displaying
    const cleanContent = stripHtml(message.body) || message.subject || 'No message content';
    
    // Show the message body immediately
    setThreadMessages([{
      id: message.message_id,
      sender: 'buyer',
      content: cleanContent,
      timestamp: new Date(message.created_at),
      senderName: message.sender || 'eBay User'
    }]);
  };

  // Send reply - updated to use chrome.runtime.sendMessage instead of fetch API
  const handleSendReply = async () => {
    if (!replyText.trim() || isSending || !selectedThread) return;

    setIsSending(true);
    
    // Optimistically add the message to UI
    const newMessage = {
      id: Date.now().toString(),
      sender: 'seller',
      content: replyText,
      timestamp: new Date(),
      senderName: 'You'
    };
    
    setThreadMessages([...threadMessages, newMessage]);
    const messageToSend = replyText;
    setReplyText('');
    
    try {
      const user_id = localStorage.getItem('user_id');
      console.log('Sending reply to:', selectedThread.message_id);
      
      // Use chrome.runtime.sendMessage to communicate with the extension
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          {
            action: 'replyToMessage',
            messageId: selectedThread.message_id,
            message: messageToSend,
            userId: user_id
          },
          (response) => {
            console.log('Reply response:', response);
            
            if (!response || !response.success) {
              // Remove the optimistic message on error
              setThreadMessages(prev => prev.filter(m => m.id !== newMessage.id));
              setReplyText(messageToSend);
              console.error('Reply error:', response?.error);
              alert('Failed to send message: ' + (response?.error || 'Unknown error'));
            }
            
            setIsSending(false);
          }
        );
      } else {
        // Fallback to fetch API if chrome.runtime is not available
        const response = await fetch(`/api/messages/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message_id: selectedThread.message_id,
            message: messageToSend,
            user_id: user_id
          })
        });

        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        let responseData = null;
        
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            responseData = JSON.parse(text);
          }
        }

        console.log('Reply response:', responseData);

        if (!response.ok) {
          // Remove the optimistic message on error
          setThreadMessages(prev => prev.filter(m => m.id !== newMessage.id));
          setReplyText(messageToSend);
          console.error('Reply error:', responseData);
          alert('Failed to send message: ' + (responseData?.error || 'Unknown error'));
        }
        
        setIsSending(false);
      }
    } catch (error) {
      // Remove the optimistic message on error
      setThreadMessages(prev => prev.filter(m => m.id !== newMessage.id));
      setReplyText(messageToSend);
      console.error('Failed to send reply:', error);
      alert('Failed to send message: ' + error.message);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  // If a thread is selected, show the thread view
  if (selectedThread) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen">
          {/* Thread Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedThread(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-semibold">{selectedThread.sender || 'eBay User'}</h2>
                {selectedThread.subject && (
                  <p className="text-sm text-gray-500">Re: {selectedThread.subject}</p>
                )}
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
            {threadMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.sender === 'seller'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  } rounded-2xl px-4 py-3 shadow-sm`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'seller' ? 'text-purple-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white">
            <div className="flex items-end gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your reply"
                className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[48px] max-h-[120px]"
                rows={1}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || isSending}
                className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We scan and review messages for fraud prevention, policy enforcement, security, to provide support, and for similar purposes.{' '}
              <a href="#" className="text-purple-600 hover:underline">Learn more</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show the messages list (original view)
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

          {/* Main content */}
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

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto">
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
                      onClick={() => handleMessageClick(message)}
                      className="flex items-center gap-4 px-8 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message.message_id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectMessage(message.message_id);
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
                          <p className="font-semibold text-gray-900 text-sm">{message.sender || 'eBay User'}</p>
                          <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
    </div>
  );
}
