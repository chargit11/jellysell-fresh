import Sidebar from '@/components/Sidebar';

export default function Connections() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
        </div>
        <div className="p-8">
          <p>Connect your platforms using the Chrome extension</p>
        </div>
      </div>
    </div>
  );
}
