import Sidebar from '@/components/Sidebar';

export default function Orders() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        </div>
        <div className="p-8">
          <p>Orders will appear here</p>
        </div>
      </div>
    </div>
  );
}
