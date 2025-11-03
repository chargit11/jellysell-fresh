'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.ibb.co/cKc6rqyy/new-jellysell-logo.webp" alt="JellySell" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">jellysell</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-16">Last updated: November 2, 2025</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10 text-gray-700">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-lg leading-relaxed">
                JellySell ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cross-listing platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">Account Information</h3>
              <p className="text-lg mb-6">
                When you create an account, we collect your email address, name, and authentication credentials.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Marketplace Integration Data</h3>
              <p className="text-lg mb-4">
                When you connect your eBay, Etsy, or other marketplace accounts, we collect:
              </p>
              <ul className="space-y-2 text-lg mb-6">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>OAuth access tokens to access your marketplace data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Product listings and inventory information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Customer messages and communications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Order and sales data</span>
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Usage Information</h3>
              <p className="text-lg">
                We automatically collect information about how you use our platform, including browser type, IP address, pages visited, and actions taken.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-lg mb-4">We use your information to:</p>
              <ul className="space-y-2 text-lg">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Provide, operate, and maintain our services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Sync your data across connected marketplaces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Send you messages and notifications related to your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Improve and optimize our platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Detect, prevent, and address technical issues or fraud</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Share Your Information</h2>
              <p className="text-lg mb-4">We do not sell your personal information. We may share your information with:</p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span><strong>Marketplace Platforms:</strong> We share necessary data with eBay, Etsy, and other connected platforms to provide our services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span><strong>Service Providers:</strong> We work with third-party service providers who help us operate our platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span><strong>Legal Requirements:</strong> We may disclose information if required by law</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-lg">
                We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-lg mb-4">You have the right to:</p>
              <ul className="space-y-2 text-lg">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Access, update, or delete your personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Disconnect your marketplace accounts at any time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3">•</span>
                  <span>Request a copy of your data</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-lg">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-lg mt-2">
                Email: <a href="mailto:privacy@jellysell.com" className="text-purple-600 hover:underline font-medium">privacy@jellysell.com</a>
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
