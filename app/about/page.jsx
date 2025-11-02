'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function About() {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.ibb.co/cKc6rqyy/new-jellysell-logo.webp" alt="JellySell" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">jellysell</span>
          </Link>
          <div className="flex items-center gap-8">
            <a href="/#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">About JellySell</h1>
          
          <div className="space-y-12 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed">
                JellySell is a powerful cross-listing platform designed to help sellers manage their inventory across multiple marketplaces from a single dashboard. We make it easy to list, track, and manage your products on eBay, Etsy, and more - all in one place.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">What We Do</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Multi-Platform Management</h3>
                  <p className="text-lg">
                    Connect your eBay, Etsy, and other marketplace accounts to manage all your listings from one centralized dashboard.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Unified Messaging</h3>
                  <p className="text-lg">
                    Keep track of all customer messages across platforms in one inbox. Never miss an important conversation.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Inventory Tracking</h3>
                  <p className="text-lg">
                    Monitor your inventory, sales, and performance metrics across all marketplaces in real-time.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">✓</span>
                  <span>Real-time sync with eBay and Etsy marketplaces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">✓</span>
                  <span>Centralized message management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">✓</span>
                  <span>Inventory and listing tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">✓</span>
                  <span>Chrome extension for quick access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">✓</span>
                  <span>Sales analytics and reporting</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-lg mb-4">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <p className="text-lg">
                Email us at: <a href="mailto:support@jellysell.com" className="text-purple-600 hover:underline font-medium">support@jellysell.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-24 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://i.ibb.co/cKc6rqyy/new-jellysell-logo.webp" alt="JellySell" className="w-8 h-8 brightness-0 invert" />
                <span className="text-lg font-bold text-white">jellysell</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed" style={{ maxWidth: '240px' }}>This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-3">
                <a href="/#features" className="block text-gray-400 hover:text-white text-sm">Features</a>
                <Link href="/pricing" className="block text-gray-400 hover:text-white text-sm">Pricing</Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white text-sm">Help Center</a>
                <a href="mailto:support@jellysell.com" className="block text-gray-400 hover:text-white text-sm">Contact Us</a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-400 hover:text-white text-sm">About</Link>
                <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm">Privacy</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex justify-center items-center relative">
            <p className="text-sm text-gray-400">© 2025 HAN-E LLC / JellySell®</p>
            <a href="https://x.com/jellysell_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors absolute right-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
