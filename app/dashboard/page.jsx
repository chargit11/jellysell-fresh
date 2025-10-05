import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="px-8 pt-6">
          <div className="flex items-center gap-4 mb-6">
            <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <option>📅 Last 30 days</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <option>All channels</option>
            </select>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">0 live visitors</span>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              Next payout: <span className="font-semibold">$0.00</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="grid grid-cols-4 divide-x divide-gray-200">
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-2">Sessions</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">31</p>
                  <span className="text-sm text-green-600">↗ 3%</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-2">Total sales</p>
                <p className="text-3xl font-bold">$0</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-2">Orders</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-2">Conversion rate</p>
                <p className="text-3xl font-bold">0%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-2">📈</div>
                <p className="font-medium">Analytics chart will appear here</p>
                <p className="text-sm mt-1">Connect platforms to see data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
