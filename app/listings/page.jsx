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
  const [selectedListings, setSelectedListings] = useState([]);

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

  const toggleSelectListing = (listingId) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map(l => l.listing_id));
    }
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
                    <th className="px-6 py-3 text-left w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedListings.length === listings.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platforms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing, idx) => { 
                    const quality = calculateQuality(listing); 
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox"
                            checked={selectedListings.includes(listing.listing_id)}
                            onChange={() => toggleSelectListing(listing.listing_id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {listing.image ? (
                              <img 
                                src={listing.image} 
                                alt={listing.title} 
                                className="w-12 h-12 object-cover rounded border border-gray-200" 
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{listing.title}</p>
                              <p className="text-xs text-gray-500">ID: {listing.listing_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600">
                            <p>0 sold</p>
                            <p className="text-gray-400">0 views</p>
                            <p className="text-gray-400">$0</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Live</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
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
                              className="w-16 px-2 py-1 border border-purple-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            />
                          ) : (
                            <span 
                              className="text-sm text-gray-900 cursor-pointer hover:text-purple-600 transition-colors" 
                              onDoubleClick={() => handleStockDoubleClick(listing)} 
                              title="Double-click to edit"
                            >
                              {listing.quantity || 0}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingPrice === listing.listing_id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-sm">$</span>
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
                                className="w-20 px-2 py-1 border border-purple-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                              />
                            </div>
                          ) : (
                            <span 
                              className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors" 
                              onDoubleClick={() => handlePriceDoubleClick(listing)} 
                              title="Double-click to edit"
                            >
                              ${listing.price?.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              EB
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{quality.label}</span>
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
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-gray-100 rounded">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
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
