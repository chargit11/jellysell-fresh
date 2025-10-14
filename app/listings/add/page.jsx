'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function AddListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  function handleBack() {
    router.push('/listings');
  }

  function handleSave(e) {
    e.preventDefault();
    // TODO: Save logic, then go back to listings
    router.push('/listings');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="px-8 py-6 border-b border-gray-200 flex items-center gap-4">
          <Link href="/listings" className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white">Back</Link>
          <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/listings" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white">Cancel</Link>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Save Product</button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="aspect-square rounded-xl border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2l2-3h10l2 3h2v13H3V7z"/></svg>
                <p className="mt-2 text-sm text-gray-600">Upload images</p>
                <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Product title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Write a compelling description"></textarea>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2">
                  <span className="text-gray-500">$</span>
                  <input value={price} onChange={(e)=>setPrice(e.target.value)} type="number" className="w-full focus:outline-none" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={1} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select</option>
                  <option>Clothing</option>
                  <option>Shoes</option>
                  <option>Electronics</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
