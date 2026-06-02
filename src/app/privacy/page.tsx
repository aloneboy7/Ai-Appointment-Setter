import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — AI Appointment Setter",
  description: "Privacy policy for AI Appointment Setter. Learn how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy — AI Appointment Setter", url: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Last updated: May 27, 2026 · Effective date: May 27, 2026</p>

        <div className="max-w-none space-y-8 text-gray-600 dark:text-gray-300 text-sm leading-relaxed
          [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
          [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
          [&_ul]:space-y-2 [&_li]:text-gray-600 [&_li]:dark:text-gray-300 [&_a]:text-primary [&_a]:underline">

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-5">
            <li><strong>Account information:</strong> name, email address, company name, and password when you register.</li>
            <li><strong>Business data:</strong> lead information, appointment details, conversation transcripts, and CRM data you process through our platform.</li>
            <li><strong>Payment information:</strong> billing address and payment method details (processed securely through Stripe; we never store full card numbers).</li>
            <li><strong>Communications:</strong> messages you send to our support team and feedback you provide.</li>
            <li><strong>Usage data:</strong> pages visited, features used, time spent, and device/browser information collected via cookies and analytics.</li>
          </ul>

          <h2>2. AI-Specific Data Processing</h2>
          <p>AI Appointment Setter uses artificial intelligence to automate lead engagement. This involves:</p>
          <ul className="list-disc pl-5">
            <li><strong>Conversation processing:</strong> messages between your leads and our AI are processed to generate responses and qualify leads. These conversations are stored in your account and are not used to train AI models shared with other customers.</li>
            <li><strong>Lead qualification:</strong> AI analyzes lead responses to determine fit and priority. Qualification criteria are based on your configured settings.</li>
            <li><strong>Data retention:</strong> conversation logs and lead data are retained for the lifetime of your account unless you delete them. Upon account deletion, data is removed within 30 days.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5">
            <li>Provide, maintain, and improve our AI appointment setting service</li>
            <li>Process transactions and send related billing information</li>
            <li>Send technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our service</li>
            <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>We do <strong>not</strong> sell your personal data or lead data to third parties. We share data only with:</p>
          <ul className="list-disc pl-5">
            <li><strong>Service providers:</strong> cloud hosting (AWS), payment processing (Stripe), email delivery, and analytics providers who process data on our behalf under strict data protection agreements.</li>
            <li><strong>Legal requirements:</strong> when required by law, subpoena, or government request.</li>
            <li><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, your data would be transferred to the acquiring entity.</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, regular security audits, and access controls. While no system is completely secure, we continuously work to protect your data.</p>

          <h2>6. Your Rights (GDPR / CCPA / CPRA)</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-5">
            <li><strong>Access:</strong> request a copy of your personal data</li>
            <li><strong>Rectification:</strong> correct inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> request deletion of your personal data</li>
            <li><strong>Portability:</strong> receive your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> opt out of the sale of personal information (we do not sell data)</li>
            <li><strong>Restriction:</strong> request restriction of processing in certain circumstances</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:privacy@aiappointmentsetter.com">privacy@aiappointmentsetter.com</a>. We will respond within 30 days.</p>

          <h2>7. Cookies</h2>
          <p>We use essential cookies for authentication and session management, analytics cookies to understand usage patterns, and functional cookies to remember your preferences. You can manage cookie preferences through your browser settings. See our <a href="/cookies">Cookie Policy</a> for details.</p>

          <h2>8. Children's Privacy</h2>
          <p>Our service is not directed to children under 16. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child under 16, we will take steps to delete it promptly.</p>

          <h2>9. International Data Transfers</h2>
          <p>Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting a notice on our website or sending you an email. Your continued use after changes constitutes acceptance of the updated policy.</p>

          <h2>11. Contact</h2>
          <p>For privacy-related questions or to exercise your data rights, contact us at <a href="mailto:privacy@aiappointmentsetter.com">privacy@aiappointmentsetter.com</a>.</p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
          <a href="/" className="text-sm text-primary hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}