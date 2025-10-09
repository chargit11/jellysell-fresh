'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tweetsLoaded, setTweetsLoaded] = useState(false);

  useEffect(() => {
    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.onload = () => {
      setTweetsLoaded(true);
      if (window.twttr) {
        window.twttr.widgets.load();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-purple-600" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 36c-8.822 0-16-7.178-16-16S15.178 8 24 8s16 7.178 16 16-7.178 16-16 16z" fill="currentColor"/>
              <path d="M24 12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="currentColor"/>
              <circle cx="24" cy="24" r="4" fill="currentColor"/>
              <path d="M12 24c0-1.5 1-3 2-4M36 24c0 1.5-1 3-2 4M24 12c1.5 0 3 1 4 2M24 36c-1.5 0-3-1-4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-bold text-gray-900">jellysell</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
            <Link href="/login" className="px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <Link href="/login" className="block px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 text-center">
                Sign In
              </Link>
              <Link href="/signup" className="block px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Sell Everywhere,<br />Manage in One Place
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            JellySell® is the ultimate crosslisting platform that helps you expand your reach across multiple marketplaces while managing everything from a single, powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
              Start Free Trial
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-900 text-lg font-semibold rounded-lg hover:border-gray-400 transition-colors">
              Watch Demo
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required • Free 14-day trial</p>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Connect with your favorite platforms
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" className="h-8 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg" alt="Etsy" className="h-8 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" />
            <span className="text-4xl grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">👗</span>
            <span className="text-4xl grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">🛍️</span>
            <span className="text-4xl grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">🏪</span>
          </div>
        </div>
      </section>

      {/* See JellySell in Action */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See JellySell® in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the power of unified multi-platform management
            </p>
          </div>

          <div className="space-y-16">
            {/* Dashboard Screenshot */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unified Dashboard</h3>
                <p className="text-gray-600">Monitor all your sales, inventory, and performance metrics in one place</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden">
                <img 
                  src="https://via.placeholder.com/1200x700/f3f4f6/9333ea?text=Dashboard+Overview" 
                  alt="JellySell Dashboard" 
                  className="w-full"
                />
              </div>
            </div>

            {/* Messages Screenshot */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unified Inbox</h3>
                <p className="text-gray-600">Manage customer messages from all platforms in one centralized location</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden">
                <img 
                  src="https://via.placeholder.com/1200x700/f3f4f6/3b82f6?text=Messages+Interface" 
                  alt="JellySell Messages" 
                  className="w-full"
                />
              </div>
            </div>

            {/* Listings Screenshot */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h3>
                <p className="text-gray-600">Update and sync your inventory across all connected marketplaces instantly</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden">
                <img 
                  src="https://via.placeholder.com/1200x700/f3f4f6/10b981?text=Listings+Management" 
                  alt="JellySell Listings" 
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed for multi-platform sellers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Platform Sync</h3>
              <p className="text-gray-600">
                Automatically sync your inventory across eBay, Etsy, Poshmark, and Depop. Update once, sell everywhere.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Inbox</h3>
              <p className="text-gray-600">
                Manage all your customer messages from different platforms in one centralized inbox. Never miss a message.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track your sales, revenue, and performance across all platforms with beautiful, actionable insights.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Order Management</h3>
              <p className="text-gray-600">
                Process orders from all your platforms in one place. Print shipping labels and track fulfillment easily.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Tracking</h3>
              <p className="text-gray-600">
                Monitor revenue, fees, and profits across all platforms. Export reports for accounting and tax purposes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk Actions</h3>
              <p className="text-gray-600">
                Edit prices, update inventory, and manage listings in bulk. Save hours with powerful automation tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Sellers Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real feedback from sellers using JellySell
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" id="tweets-container">
            <div className="flex justify-center min-h-[400px]">
              {!tweetsLoaded && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}
              <blockquote className="twitter-tweet" data-conversation="none" data-dnt="true">
                <p lang="en" dir="ltr">
                  <a href="https://twitter.com/okonomiyakeria/status/1954609024487567867"></a>
                </p>
              </blockquote>
            </div>

            <div className="flex justify-center min-h-[400px]">
              {!tweetsLoaded && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}
              <blockquote className="twitter-tweet" data-conversation="none" data-dnt="true">
                <p lang="en" dir="ltr">
                  <a href="https://twitter.com/WhirledJuice/status/1954611242041299068"></a>
                </p>
              </blockquote>
            </div>

            <div className="flex justify-center min-h-[400px]">
              {!tweetsLoaded && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}
              <blockquote className="twitter-tweet" data-conversation="none" data-dnt="true">
                <p lang="en" dir="ltr">
                  <a href="https://twitter.com/YosClothes/status/1954617503046676874"></a>
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-600 to-purple-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Simplify Your Selling?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join thousands of sellers who trust JellySell to manage their multi-platform businesses.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-purple-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
            Start Your Free Trial
          </Link>
          <p className="mt-6 text-sm text-purple-200">14 days free • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-purple-400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 36c-8.822 0-16-7.178-16-16S15.178 8 24 8s16 7.178 16 16-7.178 16-16 16z" fill="currentColor"/>
                  <path d="M24 12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="currentColor"/>
                  <circle cx="24" cy="24" r="4" fill="currentColor"/>
                  <path d="M12 24c0-1.5 1-3 2-4M36 24c0 1.5-1 3-2 4M24 12c1.5 0 3 1 4 2M24 36c-1.5 0-3-1-4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-lg font-bold text-white">jellysell</span>
              </div>
              <p className="text-sm">
                This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Chrome Extension</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2025 HAN-E LLC / JellySell®</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="https://x.com/jellysell_" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
