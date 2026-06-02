import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — AI Appointment Setter",
  description: "Cookie policy for AI Appointment Setter. Learn how we use cookies and tracking technologies.",
  alternates: { canonical: "/cookies" },
  openGraph: { title: "Cookie Policy — AI Appointment Setter", url: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Cookie Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Last updated: May 27, 2026 · Effective date: May 27, 2026</p>

        <div className="max-w-none space-y-8 text-gray-600 dark:text-gray-300 text-sm leading-relaxed
          [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
          [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:py-2 [&_th]:pr-4 [&_th]:font-semibold [&_th]:text-gray-900 [&_th]:dark:text-white
          [&_td]:py-2 [&_td]:pr-4 [&_tr]:border-b [&_tr]:border-gray-200 [&_tr]:dark:border-white/10">

          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, understand how you use our service, and improve your experience. Similar technologies include web beacons, pixel tags, and local storage.</p>

          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Essential</strong></td>
                <td>Session management, authentication, security (e.g. CSRF protection, login state)</td>
                <td>Session / 1 year</td>
              </tr>
              <tr>
                <td><strong>Functional</strong></td>
                <td>Remember your preferences (theme, language, dashboard layout)</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td><strong>Analytics</strong></td>
                <td>Understand how visitors interact with our website (page views, features used)</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td><strong>Marketing</strong></td>
                <td>Track campaign effectiveness and retarget visitors who showed interest</td>
                <td>90 days</td>
              </tr>
            </tbody>
          </table>

          <h2>3. Third-Party Cookies</h2>
          <p>We may use third-party services that set their own cookies:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google Analytics:</strong> to understand website traffic and usage patterns</li>
            <li><strong>Stripe:</strong> for secure payment processing</li>
            <li><strong>Intercom / Crisp:</strong> for live chat and customer support</li>
          </ul>
          <p>These third parties have their own privacy policies governing their use of cookies.</p>

          <h2>4. Managing Cookies</h2>
          <p>You can control and manage cookies through your browser settings:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
          </ul>
          <p>Please note that disabling cookies may affect the functionality of our Service. Essential cookies cannot be disabled as they are required for the Service to operate.</p>

          <h2>5. Consent</h2>
          <p>By using our Service, you consent to the use of cookies as described in this policy. You may withdraw consent at any time by adjusting your browser settings or contacting us.</p>

          <h2>6. Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance.</p>

          <h2>7. Contact</h2>
          <p>For questions about our use of cookies, contact us at <a href="mailto:privacy@aiappointmentsetter.com" className="text-primary underline">privacy@aiappointmentsetter.com</a>.</p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
          <a href="/" className="text-sm text-primary hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}