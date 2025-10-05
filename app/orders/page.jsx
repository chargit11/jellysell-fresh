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
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4">#12345</td>
                  <td className="px-6 py-4">john_doe</td>
                  <td className="px-6 py-4 font-semibold">$15.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
