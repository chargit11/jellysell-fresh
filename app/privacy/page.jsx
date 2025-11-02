'use client';
import Sidebar from '@/components/Sidebar';

export default function Privacy() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-1">Last updated: November 2, 2025</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              JellySell ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cross-listing platform and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
            <p className="text-gray-700 mb-4">
              When you create an account, we collect your email address, name, and authentication credentials.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-2">Marketplace Integration Data</h3>
            <p className="text-gray-700 mb-4">
              When you connect your eBay, Etsy, or other marketplace accounts, we collect:
            </p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>OAuth access tokens to access your marketplace data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Product listings and inventory information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Customer messages and communications</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Order and sales data</span>
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
            <p className="text-gray-700">
              We automatically collect information about how you use our platform, including browser type, IP address, pages visited, and actions taken.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Provide, operate, and maintain our services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Sync your data across connected marketplaces</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Send you messages and notifications related to your account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Improve and optimize our platform</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Respond to your requests and provide customer support</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Detect, prevent, and address technical issues or fraud</span>
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Share Your Information</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Marketplace Platforms:</strong> We share necessary data with eBay, Etsy, and other connected platforms to provide our services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Service Providers:</strong> We work with third-party service providers who help us operate our platform (hosting, analytics, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700">
              We retain your information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Access, update, or delete your personal information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Disconnect your marketplace accounts at any time</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Request a copy of your data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Opt out of marketing communications</span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Links</h2>
            <p className="text-gray-700">
              Our platform may contain links to third-party websites (such as eBay and Etsy). We are not responsible for the privacy practices of these external sites.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              Email: <a href="mailto:privacy@jellysell.com" className="text-blue-600 hover:underline">privacy@jellysell.com</a>
            </p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
