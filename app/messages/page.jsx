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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

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

  // Group messages by conversation
  const conversationsMap = {};
  (messages || []).forEach(msg => {
    const key = `${msg.sender}_${msg.item_id || 'no_item'}`;
    if (!conversationsMap[key]) {
      conversationsMap[key] = {
        sender: msg.sender,
        item_id: msg.item_id,
        subject: msg.subject,
        latest_message: msg.body,
        created_at: msg.created_at,
        read: msg.read,
        message_count: 1,
        messages: [msg]
      };
    } else {
      conversationsMap[key].message_count += 1;
      conversationsMap[key].messages.push(msg);
      if (new Date(msg.created_at) > new Date(conversationsMap[key].created_at)) {
        conversationsMap[key].latest_message = msg.body;
        conversationsMap[key].created_at = msg.created_at;
        conversationsMap[key].subject = msg.subject;
      }
    }
  });

  const conversations = Object.values(conversationsMap).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Show loading with sidebar
  if (loading && !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Please log in to view messages</h2>
            <Link href="/" className="text-purple-600 hover:underline">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        {conversations.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold">{conversation.sender?.[0]?.toUpperCase() || 'E'}</span>
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
  );
}
