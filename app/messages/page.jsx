import Sidebar from '@/components/Sidebar';

export default function Messages() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
        <div className="p-8">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-gray-600">No messages yet. Connect your platforms to see messages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
