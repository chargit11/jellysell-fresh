import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function MessagesPage() {
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view messages</h2>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: messages, error: messagesError } = await supabase
    .from('ebay_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  // Group messages by conversation (sender + item_id)
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
      
      // Update to latest message if newer
      if (new Date(msg.created_at) > new Date(conversationsMap[key].created_at)) {
        conversationsMap[key].latest_message = msg.body;
        conversationsMap[key].created_at = msg.created_at;
        conversationsMap[key].subject = msg.subject;
      }
    }
  });

  // Convert to array and sort by most recent
  const conversations = Object.values(conversationsMap).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition ${
                !conversation.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{conversation.sender}</span>
                    {conversation.message_count > 1 && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {conversation.message_count} messages
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{conversation.subject}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(conversation.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 line-clamp-2">
                {conversation.latest_message}
              </p>
              
              {conversation.item_id && (
                <p className="text-xs text-gray-500 mt-2">
                  Item: {conversation.item_id}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
