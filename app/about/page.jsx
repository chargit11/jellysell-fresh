'use client';
import Sidebar from '@/components/Sidebar';

export default function About() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">About JellySell</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              JellySell is a powerful cross-listing platform designed to help sellers manage their inventory across multiple marketplaces from a single dashboard. We make it easy to list, track, and manage your products on eBay, Etsy, and more - all in one place.
            </p>
          </section>

          {/* What We Do */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Platform Management</h3>
                <p className="text-gray-700">
                  Connect your eBay, Etsy, and other marketplace accounts to manage all your listings from one centralized dashboard.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unified Messaging</h3>
                <p className="text-gray-700">
                  Keep track of all customer messages across platforms in one inbox. Never miss an important conversation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Tracking</h3>
                <p className="text-gray-700">
                  Monitor your inventory, sales, and performance metrics across all marketplaces in real-time.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Time Savings</h3>
                <p className="text-gray-700">
                  Reduce the time spent switching between multiple platforms and streamline your selling workflow.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Real-time sync with eBay and Etsy marketplaces</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Centralized message management</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Inventory and listing tracking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Chrome extension for quick access</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Sales analytics and reporting</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <p className="text-gray-700">
              Email us at: <a href="mailto:support@jellysell.com" className="text-blue-600 hover:underline">support@jellysell.com</a>
            </p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
