'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('inbox');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  const fetchMessages = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('No user_id found');
        return;
      }

      const response = await fetch(`/api/messages?user_id=${userId}`);
      const data = await response.json();
      
      // Only show incoming messages in the inbox
      const incomingMessages = data.filter(msg => msg.direction === 'incoming');
      setMessages(incomingMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const fetchConversation = async (message) => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`/api/messages/conversation?user_id=${userId}&item_id=${message.item_id}&sender=${message.sender}`);
      const data = await response.json();
      
      setConversationMessages(data);
      setSelectedMessage(message);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || isSending) return;

    // Check if this is a message we can actually reply to
    if (!canReplyToMessage(selectedMessage)) {
      alert('This message cannot be replied to on JellySell. Please reply on eBay.com');
      return;
    }

    setIsSending(true);
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          item_id: selectedMessage.item_id,
          recipient: selectedMessage.sender,
          subject: `Re: ${selectedMessage.subject}`,
          body: replyText,
          parent_message_id: selectedMessage.message_id,
        }),
      });

      if (response.ok) {
        setReplyText('');
        // Refresh the conversation to show the new reply
        await fetchConversation(selectedMessage);
      } else {
        const error = await response.json();
        alert(`Failed to send reply: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  // Determine if we can reply to this message on JellySell
  const canReplyToMessage = (message) => {
    if (!message) return false;
    
    // Can only reply to INCOMING messages (from buyers asking about YOUR listings)
    // Cannot reply to OUTGOING messages (messages YOU sent as a buyer)
    return message.direction === 'incoming';
  };

  const getReplyDisabledReason = (message) => {
    if (!message) return '';
    
    if (message.direction === 'outgoing') {
      return 'Reply on eBay.com';
    }
    
    // Add other cases here if needed
    return '';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  // If viewing a conversation
  if (selectedMessage) {
    const canReply = canReplyToMessage(selectedMessage);
    const disabledReason = getReplyDisabledReason(selectedMessage);

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.sender}</h2>
                <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {conversationMessages.map((msg, index) => {
              const isOutgoing = msg.direction === 'outgoing';
              return (
                <div key={index} className={`flex gap-4 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
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

          {/* Reply Input - Conditional based on message type */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex-shrink-0">
            {canReply ? (
              // CAN reply - show active reply input
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors h-fit disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            ) : (
              // CANNOT reply - show disabled state with message
              <div className="flex gap-4 max-w-full overflow-x-hidden">
                <div className="flex-1 px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-500 flex items-center justify-center">
                  <p className="text-sm font-medium">{disabledReason}</p>
                </div>
                <button 
                  disabled
                  className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed h-fit"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inbox view
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
            
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No messages yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message, index) => (
                      <tr
                        key={index}
                        onClick={() => fetchConversation(message)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{message.sender}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{message.subject}</div>
                          <div className="text-sm text-gray-500 truncate max-w-md">{message.body}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
