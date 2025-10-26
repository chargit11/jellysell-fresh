'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('No user_id found');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/messages?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-200 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
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
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
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
  );
}
