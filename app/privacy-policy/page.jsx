'use client';
import { useState } from 'react';
import Link from 'next/link';

// --- CONFIGURATION ---
const CONFIG = {
  COMPANY_NAME: "HAN-E LLC", 
  WEBSITE_NAME: "Jellysell", 
  CONTACT_EMAIL: "{YOUR DEDICATED PRIVACY EMAIL}", 
  MAILING_ADDRESS: "{YOUR COMPANY MAILING ADDRESS}",
  EFFECTIVE_DATE: "October 30, 2025",
  PRIMARY_COLOR: "text-purple-600",
  BG_COLOR: "bg-gray-50",
};

export default function PrivacyPolicy() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Retained for header functionality
  const { COMPANY_NAME, WEBSITE_NAME, CONTACT_EMAIL, MAILING_ADDRESS, EFFECTIVE_DATE, PRIMARY_COLOR, BG_COLOR } = CONFIG;

  return (
    <div className="min-h-screen bg-white">
      {/* Header (Copied from Pricing page for consistency) */}
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
      {/* End Header */}

      <div className={`pt-32 pb-12 px-6 ${BG_COLOR}`}>
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-xl rounded-xl">
          <header className="mb-10 text-center">
            <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 text-gray-900`}>
              {WEBSITE_NAME} Privacy Policy
            </h1>
            <p className="text-md text-gray-500">
              **Effective Date:** {EFFECTIVE_DATE}
            </p>
          </header>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            This Privacy Policy describes how **{COMPANY_NAME}** collects, uses, and discloses your personal and inventory information when you use our cross-listing and inventory management services through **{WEBSITE_NAME}** (the "Service").
          </p>

          {/* --- 1. Information We Collect --- */}
          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 border-b pb-2 text-gray-900`}>
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              
              <p className="font-semibold">A. Information You Provide Directly:</p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>**Identity & Billing Data:** Name, email address, phone number, and billing details.</li>
                <li>**Account Data:** Usernames and securely hashed passwords for your {WEBSITE_NAME} account.</li>
                <li>**Marketplace Credentials/Tokens:** Encrypted authorization tokens required to connect to marketplaces (eBay, Poshmark, Mercari, etc.). **We do not store your direct marketplace passwords.**</li>
              </ul>

              <p className="font-semibold pt-3">B. Data Processed for the Service (Inventory & Sales Data):</p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>**Listing Content:** Item titles, descriptions, pricing, product categories, and images synchronized via our service.</li>
                <li>**Transaction Data:** Sales records, order details, and fulfillment status used for calculating your **2% transaction fee** (capped at $40/month).</li>
              </ul>
            </div>
          </section>

          {/* --- 2. How We Use Your Information (Cross-Listing Focus) --- */}
          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 border-b pb-2 text-gray-900`}>
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-700">
              <li>**To Provide Cross-Listing Services:** To utilize your marketplace tokens and inventory data to **create, sync, update, and delist** items across your designated platforms.</li>
              <li>**Billing and Fee Calculation:** To track your sales volume and calculate the **2% fee** and apply the **$40 monthly cap.**</li>
              <li>**Security and Integrity:** To protect against unauthorized access and ensure the security of your data connections.</li>
              <li>**Communication:** To send service notifications, maintenance alerts, and (with your consent) marketing communications.</li>
            </ul>
          </section>

          {/* --- 3. Sharing Your Personal Information --- */}
          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 border-b pb-2 text-gray-900`}>
              3. Sharing Your Personal Information
            </h2>
            <p className="mb-4 text-gray-700">We share your data only in the following necessary contexts:</p>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-700">
              <li>**With Marketplaces:** Data (listings, status updates) is securely transmitted to the marketplaces you connect (eBay, Poshmark, etc.) to perform the cross-listing actions you initiate.</li>
              <li>**Service Providers:** With third-party vendors who assist with secure payment processing, cloud hosting, and email delivery.</li>
              <li>**Legal Obligations:** To comply with laws or legal processes.</li>
            </ul>
          </section>

          {/* --- 7. Contact Us --- */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 border-b pb-2 text-gray-900`}>
              4. Contact Us
            </h2>
            <p className="mb-4 text-gray-700">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="space-y-1 font-mono text-sm">
              <li>
                **By Email:** <a href={`mailto:${CONTACT_EMAIL}`} className={`${PRIMARY_COLOR} hover:text-purple-700 font-semibold`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                **By Mail:** <span className="font-semibold text-gray-700">{MAILING_ADDRESS}</span>
              </li>
            </ul>
          </section>

          {/* --- LEGAL DISCLAIMER BOX --- */}
          <div className="mt-12 p-5 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg">
            <p className="font-bold mb-2">⚠️ Legal Disclaimer</p>
            <p className="text-sm">
              You must replace all bracketed placeholders and **consult with a legal professional** to ensure your policy accurately reflects your business and complies with all applicable data privacy laws (like GDPR, CCPA, etc.).
            </p>
          </div>

        </div> 
      </div>

      {/* Footer (Copied exactly from Pricing page) */}
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
                <a href="#" className="block text-gray-400 hover:text-white text-sm">About</a>
                <Link href="/privacy-policy" className="block text-gray-400 hover:text-white text-sm">Privacy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex justify-center items-center relative">
            <p className="text-sm text-gray-400">© 2025 HAN-E LLC / JellySell®</p>
            <a href="https://x.com/jellysell_" target
