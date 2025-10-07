'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    
    if (!user_id) {
      window.location.href = '/login';
      return;
    }

    fetch(`/api/listings?user_id=${user_id}`)
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
            <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
              Add a product
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
              Import Listing
            </button>
          </div>
        </div>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No listings found. Sync your eBay account using the Chrome extension.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {listing.image && (
                            <img 
                              src={listing.image} 
                              alt={listing.title} 
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-base">
                              {listing.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              ID: {listing.listing_id}
                            </p>
                            {listing.url && (
                              <a 
                                href={listing.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 hover:text-purple-800 hover:underline mt-1 inline-block"
                              >
                                View on eBay →
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                          {listing.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${listing.price?.toFixed(2)}
                        </span>
                      </td>
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
