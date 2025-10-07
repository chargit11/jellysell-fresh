'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No messages yet. Connect your platforms to see messages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow ${
                    !message.read ? 'border-l-4 border-l-purple-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                          {message.platform}
                        </span>
                        {!message.read && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            ● Unread
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {message.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        From: <span className="font-medium">{message.sender}</span>
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {message.body}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
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
