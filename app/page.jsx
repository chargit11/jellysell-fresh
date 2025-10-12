'use client';
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    alert('Sign in clicked!');
  };

  return (
    <div className="min-h-screen bg-white">
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowSignInModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src="https://i.ibb.co/1tp0Y9jz/jellysell-logo.webp" alt="JellySell" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">jellysell</span>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Welcome back!</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <button onClick={handleSignIn} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Sign In</button>
              <div className="text-center"><a href="#" className="text-sm text-purple-600">Forgot your password?</a></div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OR</span></div>
              </div>
              <button type="button" className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">Continue with Google</button>
              <p className="text-center text-sm text-gray-600 mt-6">Don't have an account? <a href="/signup" className="text-purple-600 font-semibold">Sign up</a></p>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://i.ibb.co/1tp0Y9jz/jellysell-logo.webp" alt="JellySell" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">jellysell</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
            <button onClick={() => setShowSignInModal(true)} className="px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400">Sign In</button>
            <a href="/signup" className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Get Started</a>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <button onClick={() => { setMobileMenuOpen(false); setShowSignInModal(true); }} className="block w-full px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg text-center">Sign In</button>
              <a href="/signup" className="block px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg text-center">Get Started</a>
            </div>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">Sell Everywhere,<br />Manage in One Place</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">JellySell is the ultimate crosslisting platform that helps you expand your reach across multiple marketplaces while managing everything from a single, powerful dashboard.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/signup" className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 shadow-lg">Start Free Trial</a>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-900 text-lg font-semibold rounded-lg hover:border-gray-400">Watch Demo</button>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required - Free 14-day trial</p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">Connect with your favorite platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg" alt="Etsy" className="h-8" />
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">See JellySell in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the power of unified multi-platform management</p>
          </div>
          <div className="space-y-16">
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Unified Dashboard</h3>
              <p className="text-gray-600 mb-6">Monitor all your sales, inventory, and performance metrics in one place</p>
              <div className="bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden">
                <img src="https://placehold.co/1200x700/f3f4f6/9333ea/png?text=Dashboard" alt="Dashboard" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need to Grow</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Powerful tools designed for multi-platform sellers</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Platform Sync</h3>
              <p className="text-gray-600">Automatically sync your inventory across eBay, Etsy, Poshmark, and Depop. Update once, sell everywhere.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Inbox</h3>
              <p className="text-gray-600">Manage all your customer messages from different platforms in one centralized inbox. Never miss a message.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">Track your sales, revenue, and performance across all platforms with beautiful, actionable insights.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Order Management</h3>
              <p className="text-gray-600">Process orders from all your platforms in one place. Print shipping labels and track fulfillment easily.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Tracking</h3>
              <p className="text-gray-600">Monitor revenue, fees, and profits across all platforms. Export reports for accounting and tax purposes.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk Actions</h3>
              <p className="text-gray-600">Edit prices, update inventory, and manage listings in bulk. Save hours with powerful automation tools.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">What sellers are saying</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://twitter.com/okonomiyakeria/status/1954609024487567867"></a>
              </blockquote>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://twitter.com/WhirledJuice/status/1954611242041299068"></a>
              </blockquote>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://twitter.com/YosClothes/status/1954617503046676874"></a>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Simplify Your Selling?</h2>
          <p className="text-xl text-purple-100 mb-10">Join thousands of sellers who trust JellySell to manage their multi-platform businesses.</p>
          <a href="/signup" className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-semibold rounded-lg hover:bg-gray-50 shadow-lg">Start Your Free Trial</a>
          <p className="mt-6 text-sm text-purple-100">14 days free • No credit card required • Cancel anytime</p>
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between gap-24 mb-12">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <img src="https://i.ibb.co/1tp0Y9jz/jellysell-logo.webp" alt="JellySell" className="w-8 h-8" />
                <span className="text-lg font-bold text-white">jellysell</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.</p>
            </div>
            
            <div className="flex gap-24">
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <div className="space-y-3">
                  <a href="#features" className="block text-gray-400 hover:text-white text-sm">Features</a>
                  <a href="#pricing" className="block text-gray-400 hover:text-white text-sm">Pricing</a>
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
                  <a href="#" className="block text-gray-400 hover:text-white text-sm">About</a>
                  <a href="#" className="block text-gray-400 hover:text-white text-sm">Privacy</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-sm text-gray-400">© 2025 HAN-E LLC / JellySell®</p>
            <a href="https://x.com/jellysell_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
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
