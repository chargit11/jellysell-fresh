'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export default function Home() {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    window.location.href = '/api/auth/google';
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('user_email', data.user.email);
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co/Fqjcgnr/jellysell.png" 
                alt="JellySell" 
                className="w-10 h-10" 
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                jellysell
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
              <button 
                onClick={() => setShowSignInModal(true)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Sign In
              </button>
              <button 
                onClick={() => setShowSignUpModal(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="h-screen flex items-center px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Sell Everywhere, Manage in One Place
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10">
            JellySell is the FASTEST way to sell something online
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowSignUpModal(true)}
              className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700"
            >
              Start Free Trial
            </button>
            <p className="text-sm text-gray-500">14 days free • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Connect with your favorite platforms
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg" alt="Etsy" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Poshmark_logo.png?20201202202741" alt="Poshmark" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Mercari_logo_2018.svg/1198px-Mercari_logo_2018.svg.png?20200825183145" alt="Mercari" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Depop_logo.svg/640px-Depop_logo.svg.png" alt="Depop" className="h-8" />
          </div>
        </div>
      </section>

      {/* Testimonials/Tweets */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">What Sellers Are Saying</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Join thousands of successful sellers who trust JellySell
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex justify-center">
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://twitter.com/okonomiyakeria/status/1954609024487567867"></a>
              </blockquote>
            </div>
            
            <div className="flex justify-center">
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://twitter.com/WhirledJuice/status/1954611242041299068"></a>
              </blockquote>
            </div>
            
            <div className="flex justify-center">
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://twitter.com/YosClothes/status/1954617503046676874"></a>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* See JellySell in Action */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">See JellySell® in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the power of unified multi-platform management
            </p>
          </div>
          <div className="space-y-16">
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Centralized Dashboard</h3>
              <p className="text-gray-600 mb-6">
                View all your metrics, inventory, and orders from every marketplace in one powerful interface.
              </p>
              <img 
                src="https://i.ibb.co/ZNFb5Yx/dashboard.webp" 
                alt="Dashboard" 
                className="rounded-lg shadow-xl border border-gray-200 w-full" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-600">Powerful tools designed for modern multi-channel sellers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">List items across multiple platforms in seconds with our Chrome extension.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inventory Sync</h3>
              <p className="text-gray-600">Real-time inventory updates across all platforms. Never oversell again.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Pricing</h3>
              <p className="text-gray-600">AI-powered pricing suggestions to maximize your profits on every platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to scale your business?</h2>
          <p className="text-xl mb-8 text-purple-100">Join thousands of successful sellers who trust JellySell</p>
          <button 
            onClick={() => setShowSignUpModal(true)}
            className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-semibold rounded-lg hover:bg-gray-50 shadow-lg"
          >
            Start Your Free Trial
          </button>
          <p className="mt-6 text-sm text-purple-100">14 days free • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-24 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://i.ibb.co/Fqjcgnr/jellysell.png" 
                  alt="JellySell" 
                  className="w-8 h-8 brightness-0 invert" 
                />
                <span className="text-lg font-bold text-white">jellysell</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed" style={{ maxWidth: '240px' }}>
                This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-3">
                <a href="#features" className="block text-gray-400 hover:text-white text-sm">Features</a>
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
                <a href="#" className="block text-gray-400 hover:text-white text-sm">About</a>
                <a href="#" className="block text-gray-400 hover:text-white text-sm">Privacy</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex justify-center items-center relative">
            <p className="text-sm text-gray-400">© 2025 HAN-E LLC / JellySell®</p>
            <a 
              href="https://x.com/jellysell_" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors absolute right-0"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <button 
                onClick={() => setShowSignInModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button 
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
              <button 
                onClick={() => setShowSignUpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button 
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
