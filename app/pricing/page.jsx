'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const examples = [
    { sales: 500, fee: 10, saved: 'vs $19-49/mo' },
    { sales: 1000, fee: 20, saved: 'vs $49/mo' },
    { sales: 2000, fee: 40, saved: 'vs $99/mo' },
    { sales: 5000, fee: 40, saved: 'Capped at $40!' },
    { sales: 10000, fee: 40, saved: '$160 saved!' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.ibb.co/cKc6rqyy/new-jellysell-logo.webp" alt="JellySell" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">jellysell</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
            <Link href="/" className="px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400">Sign In</Link>
            <Link href="/" className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Get Started</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, performance-based pricing
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Only pay when you make money.
          </p>
          <div className="inline-block bg-purple-50 border-2 border-purple-200 rounded-2xl px-8 py-6 mt-4">
            <div className="text-5xl font-bold text-purple-600 mb-2">2%</div>
            <div className="text-lg text-gray-700 mb-1">per transaction</div>
            <div className="text-sm text-gray-600">capped at $40/month</div>
          </div>
          <p className="text-gray-500 mt-6 max-w-2xl mx-auto">
            No monthly fees, no setup costs, no surprises.
          </p>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Real examples based on monthly sales volume
          </h2>
          <p className="text-gray-600 text-center mb-12">See how much you'd pay with our transparent pricing</p>
          
          <div className="grid md:grid-cols-5 gap-4">
            {examples.map((example, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-all">
                <div className="text-sm text-gray-500 mb-2">Monthly Sales</div>
                <div className="text-2xl font-bold text-gray-900 mb-4">${example.sales.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mb-1">You Pay</div>
                <div className="text-3xl font-bold text-purple-600 mb-2">${example.fee}</div>
                <div className="text-xs text-green-600 font-semibold">{example.saved}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-purple-600 text-white rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Once you hit $40 in fees...</h3>
            <p className="text-purple-100 text-lg">All additional sales for the month are completely FREE! 🎉</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Simple, transparent, and fair
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect your accounts</h3>
                <p className="text-gray-600">Connect your marketplace accounts and start listing products across all platforms.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Make a sale</h3>
                <p className="text-gray-600">When you make a sale, we automatically charge 2% of the transaction amount.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hit the cap, sell for free</h3>
                <p className="text-gray-600">Once you've paid $40 in fees for the month, all additional sales are free!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Real feedback from sellers
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Growing their business with JellySell®
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://x.com/okonomiyakeria/status/1954609024487567867"></a>
              </blockquote>
            </div>

            <div>
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://x.com/WhirledJuice/status/1954611242041299068"></a>
              </blockquote>
            </div>

            <div>
              <blockquote className="twitter-tweet" data-conversation="none" data-theme="light">
                <a href="https://x.com/YosClothes/status/1954617503046676874"></a>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Everything you need to know about our pricing
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">When do I get charged?</h3>
              <p className="text-gray-600">You only get charged when you make a sale. We automatically deduct 2% from each transaction.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens after I hit $40?</h3>
              <p className="text-gray-600">Once you've paid $40 in fees for the month, all additional sales are completely free for the rest of the month!</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are there any other fees?</h3>
              <p className="text-gray-600">No! No setup fees, no monthly minimums, no hidden costs. Just 2% per transaction capped at $40/month.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What marketplaces do you support?</h3>
              <p className="text-gray-600">We currently support eBay, Etsy, Poshmark, Depop, and Mercari. More platforms coming soon!</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes! You can cancel your account at any time. No questions asked, no cancellation fees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of sellers who only pay when they make money.
          </p>
          <p className="text-lg text-purple-100 mb-10">
            No risk, all reward.
          </p>
          <Link href="/" className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-semibold rounded-lg hover:bg-gray-50 shadow-lg">
            Start Selling Today
          </Link>
          <p className="text-purple-100 text-sm mt-6">
            No setup fees • No monthly minimums • Cancel anytime
          </p>
        </div>
      </section>

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
                <Link href="/#features" className="block text-gray-400 hover:text-white text-sm">Features</Link>
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
