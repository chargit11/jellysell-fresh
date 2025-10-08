'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) { 
      window.location.href = '/login'; 
      return; 
    }
    fetch(`/api/listings?user_id=${user_id}`)
      .then(res => res.json())
      .then(data => { 
        setListings(data.listings || []); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error('Error:', err); 
        setLoading(false); 
      });
  }, []);

  const handlePriceDoubleClick = (listing) => { 
    setEditingPrice(listing.listing_id); 
    setNewPrice(listing.price.toString()); 
  };

  const handleStockDoubleClick = (listing) => { 
    setEditingStock(listing.listing_id); 
    setNewStock((listing.quantity || 1).toString()); 
  };

  const handlePriceSave = async (listing) => {
    const user_id = localStorage.getItem('user_id');
    
    try {
      const response = await fetch('/api/ebay/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.listing_id,
          price: parseFloat(newPrice),
          user_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Failed to update price: ' + data.error);
        return;
      }

      // Update local state only if API call succeeded
      setListings(listings.map(l => 
        l.listing_id === listing.listing_id 
          ? { ...l, price: parseFloat(newPrice) }
          : l
      ));

      setEditingPrice(null);
      setNewPrice('');
      alert('Price updated successfully on eBay!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleStockSave = async (listing) => {
    const user_id = localStorage.getItem('user_id');
    
    try {
      const response = await fetch('/api/ebay/update-quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.listing_id,
          quantity: parseInt(newStock),
          user_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Failed to update quantity: ' + data.error);
        return;
      }

      // Update local state only if API call succeeded
      setListings(listings.map(l => 
        l.listing_id === listing.listing_id 
          ? { ...l, quantity: parseInt(newStock) }
          : l
      ));

      setEditingStock(null);
      setNewStock('');
      alert('Quantity updated successfully on eBay!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const calculateQuality = (listing) => { 
    let score = 0; 
    if (listing.title && listing.title.length > 10) score += 33; 
    if (listing.image) score += 33; 
    if (listing.title && listing.title.length > 30) score += 34; 
    if (score >= 80) return { label: 'Good', color: 'green' }; 
    if (score >= 50) return { label: 'Fair', color: 'yellow' }; 
    return { label: 'Poor', color: 'red' }; 
  };

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
              <p className="text-gray-600 text-lg">
                No listings found. Sync your eBay account using the Chrome extension.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing, idx) => { 
                    const quality = calculateQuality(listing); 
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {listing.image ? (
                              <img 
                                src={listing.image} 
                                alt={listing.title} 
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-base">{listing.title}</p>
                              <p className="text-sm text-gray-500 mt-1">ID: {listing.listing_id}</p>
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
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Live</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingStock === listing.listing_id ? (
                            <input 
                              type="number" 
                              value={newStock} 
                              onChange={(e) => setNewStock(e.target.value)} 
                              onBlur={() => handleStockSave(listing)} 
                              onKeyDown={(e) => { 
                                if (e.key === 'Enter') handleStockSave(listing); 
                                if (e.key === 'Escape') { 
                                  setEditingStock(null); 
                                  setNewStock(''); 
                                }
                              }} 
                              autoFocus 
                              className="w-20 px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            />
                          ) : (
                            <span 
                              className="text-gray-900 font-medium cursor-pointer hover:text-purple-600 transition-colors" 
                              onDoubleClick={() => handleStockDoubleClick(listing)} 
                              title="Double-click to edit"
                            >
                              {listing.quantity || 1}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingPrice === listing.listing_id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">$</span>
                              <input 
                                type="number" 
                                value={newPrice} 
                                onChange={(e) => setNewPrice(e.target.value)} 
                                onBlur={() => handlePriceSave(listing)} 
                                onKeyDown={(e) => { 
                                  if (e.key === 'Enter') handlePriceSave(listing); 
                                  if (e.key === 'Escape') { 
                                    setEditingPrice(null); 
                                    setNewPrice(''); 
                                  }
                                }} 
                                autoFocus 
                                className="w-24 px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
                              />
                            </div>
                          ) : (
                            <span 
                              className="text-lg font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors" 
                              onDoubleClick={() => handlePriceDoubleClick(listing)} 
                              title="Double-click to edit"
                            >
                              ${listing.price?.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span 
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                quality.color === 'green' 
                                  ? 'bg-green-100 text-green-800' 
                                  : quality.color === 'yellow' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {quality.label}
                            </span>
                            <div className="flex gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                quality.color === 'green' 
                                  ? 'bg-green-500' 
                                  : quality.color === 'yellow' 
                                  ? 'bg-yellow-500' 
                                  : 'bg-gray-300'
                              }`}></div>
                              <div className={`w-2 h-2 rounded-full ${
                                quality.color === 'green' ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <div className={`w-2 h-2 rounded-full ${
                                quality.color === 'green' ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ); 
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
