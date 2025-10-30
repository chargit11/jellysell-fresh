import React from 'react';

// --- CONFIGURATION ---
// REPLACE ALL PLACEHOLDERS IN CAPITAL LETTERS BELOW
const CONFIG = {
  COMPANY_NAME: "HAN-E LLC", 
  WEBSITE_NAME: "Jellysell", // The public-facing site name
  CONTACT_EMAIL: "support@jellysell.com", 
  EFFECTIVE_DATE: "October 30, 2025",
  PRIMARY_COLOR_BG: "bg-indigo-50", // Light background for contrast
  PRIMARY_COLOR_TEXT: "text-indigo-700", // Primary color for headings
  BORDER_COLOR: "border-indigo-200", // Soft border color
};

const PrivacyPolicyPage = () => {
  const { COMPANY_NAME, WEBSITE_NAME, CONTACT_EMAIL, MAILING_ADDRESS, EFFECTIVE_DATE, PRIMARY_COLOR_BG, PRIMARY_COLOR_TEXT, BORDER_COLOR } = CONFIG;

  return (
    <div className={`container mx-auto p-6 md:p-12 max-w-5xl ${PRIMARY_COLOR_BG}`}>
      
      {/* --- HEADER --- */}
      <header className="mb-10 text-center">
        <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 ${PRIMARY_COLOR_TEXT}`}>
          {WEBSITE_NAME} Privacy Policy
        </h1>
        <p className="text-md text-gray-600">
          **Effective Date:** {EFFECTIVE_DATE}
        </p>
      </header>

      <div className="bg-white shadow-xl rounded-xl p-6 md:p-10 space-y-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          This Privacy Policy describes how **{COMPANY_NAME}** collects, uses, and discloses your personal and inventory information when you use our cross-listing and inventory management services through **{WEBSITE_NAME}** (the "Service"). We are committed to protecting your privacy and the data required to operate your multi-platform selling business efficiently.
        </p>

        {/* --- 1. Information We Collect --- */}
        <section>
          <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${BORDER_COLOR} ${PRIMARY_COLOR_TEXT}`}>
            1. Information We Collect
          </h2>
          <div className="space-y-4 text-gray-700">
            
            <p className="font-semibold">A. Information You Provide Directly:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>**Identity and Contact Data:** Name, email address, phone number, and billing address.</li>
              <li>**Account Data:** Usernames and securely hashed passwords associated with your {WEBSITE_NAME} account.</li>
              <li>**Marketplace Credentials/Tokens:** Secure, encrypted authorization tokens required to connect and interact with third-party marketplaces (e.g., eBay, Poshmark, Mercari). **We do not store your direct marketplace passwords.**</li>
            </ul>

            <p className="font-semibold pt-3">B. Data Processed for the Service (Inventory Data):</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>**Listing Content:** Item titles, descriptions, pricing, product categories, and images that you manage via our Service.</li>
              <li>**Transaction Data:** Sales records, order numbers, and fulfillment status synchronized across connected platforms.</li>
            </ul>

            <p className="font-semibold pt-3">C. Information Collected Automatically:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>**Usage Data:** IP address, device type, browser information, pages visited, and timestamps.</li>
              <li>**Cookies and Tracking:** We use standard cookies for authentication, security, and site functionality (see Section 4).</li>
            </ul>
          </div>
        </section>

        {/* --- 2. How We Use Your Information (Cross-Listing Focus) --- */}
        <section>
          <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${BORDER_COLOR} ${PRIMARY_COLOR_TEXT}`}>
            2. How We Use Your Information
          </h2>
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>**To Provide Cross-Listing Services:** The primary use is to utilize your connected marketplace tokens and inventory data to **create, sync, update, and delist** items across your designated marketplaces.</li>
              <li>**Service Fulfillment and Billing:** To process your subscription payments and manage your account.</li>
              <li>**Security and Integrity:** To protect against unauthorized access to your account and marketplace data.</li>
              <li>**Service Improvement:** To analyze performance data (anonymized where possible) to optimize our service, automation, and user interface.</li>
              <li>**Communication:** To send you service notifications, maintenance alerts, and (with your consent) marketing communications.</li>
            </ul>
          </div>
        </section>

        {/* --- 3. Sharing Your Personal Information --- */}
        <section>
          <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${BORDER_COLOR} ${PRIMARY_COLOR_TEXT}`}>
            3. Sharing Your Personal Information
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="mb-2">We share your data only in the following necessary contexts:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>**With Marketplaces (Crucial to Service):** When you use the Service, we securely transmit your inventory data and utilize your authentication tokens to communicate with the marketplaces you connect (e.g., eBay, Poshmark, Depop) to perform listing actions on your behalf.</li>
              <li>**Service Providers:** With third-party vendors who assist us with essential functions like secure payment processing, cloud hosting (e.g., Vercel, AWS), and email delivery.</li>
              <li>**Legal Obligations:** When required by law or necessary to protect the rights, property, or safety of {WEBSITE_NAME}, our users, or the public.</li>
            </ul>
          </div>
        </section>

        {/* --- 7. Contact Us --- */}
        <section>
          <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${BORDER_COLOR} ${PRIMARY_COLOR_TEXT}`}>
            7. Contact Us
          </h2>
          <p className="mb-4 text-gray-700">
            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:
          </p>
          <ul className="space-y-1 font-mono text-sm">
            <li>
              **By Email:** <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:text-indigo-800 font-semibold">{CONTACT_EMAIL}</a>
            </li>
            <li>
              **By Mail:** <span className="font-semibold">{MAILING_ADDRESS}</span>
            </li>
          </ul>
        </section>

        {/* --- LEGAL DISCLAIMER BOX --- */}
        <div className="mt-12 p-5 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg">
          <p className="font-bold mb-2">Legal Disclaimer</p>
          <p className="text-sm">
            This template is a technical implementation suggestion. It is **mandatory** that you replace all bracketed placeholders and **consult with a legal professional** to ensure your policy accurately covers your business structure and complies with all data privacy laws (like GDPR, CCPA, etc.) applicable to your users.
          </p>
        </div>

      </div> {/* End of main content box */}
    </div>
  );
};

export default PrivacyPolicyPage;
