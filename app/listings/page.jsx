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
          <p>Listings table will appear here</p>
        </div>
      </div>
    </div>
  );
}
