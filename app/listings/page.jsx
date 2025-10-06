'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched listings:', data);
        setListings(data.listings || []);
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
        <div className="px-8 pt-8 pb-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg">Add a product</button>
            <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg">Import Listing</button>
          </div>
        </div>
        <div className="p-8">
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length === 0 ? (
            <p>No listings found. Sync your eBay account using the Chrome extension.</p>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {listing.image && (
                          <img src={listing.image} alt={listing.title} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-sm text-gray-500">ID: {listing.listing_id}</p>
                          {listing.url && (
                            <a href={listing.url} target="_blank" className="text-xs text-blue-600 hover:underline">
                              View on eBay
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded uppercase">
                          {listing.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-lg">${listing.price?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
