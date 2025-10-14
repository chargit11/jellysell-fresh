import Sidebar from '@/components/Sidebar';

export default function Listings() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg">Add a product</button>
            <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg">Import Listing</button>
          </div>
        </div>
        <div className="p-8">
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4">
                    <p className="font-medium">Sample Product</p>
                    <p className="text-sm text-gray-500">ID: 12345</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Live</span>
                  </td>
                  <td className="px-6 py-4 font-semibold">$7.95</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
