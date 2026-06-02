import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — AI Appointment Setter",
  description: "Terms and conditions governing your use of AI Appointment Setter's services.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service — AI Appointment Setter", url: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Last updated: May 27, 2026 · Effective date: May 27, 2026</p>

        <div className="max-w-none space-y-8 text-gray-600 dark:text-gray-300 text-sm leading-relaxed
          [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
          [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
          [&_ul]:space-y-2 [&_li]:text-gray-600 [&_li]:dark:text-gray-300 [&_a]:text-primary [&_a]:underline">

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using AI Appointment Setter (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all visitors, users, and others who access the Service.</p>

          <h2>2. Account Registration</h2>
          <p>To use the Service, you must register an account. You agree to:</p>
          <ul className="list-disc pl-5">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and accept all risks of unauthorized access</li>
            <li>Immediately notify us if you discover any unauthorized use of your account</li>
            <li>You must be at least 18 years old to create an account</li>
          </ul>

          <h2>3. Subscription Plans and Billing</h2>
          <h3>Free Trial</h3>
          <p>We offer a 14-day free trial for new accounts. During the trial, you have access to features of your selected plan. No credit card is required to start a trial.</p>
          <h3>Subscription Plans</h3>
          <ul className="list-disc pl-5">
            <li><strong>Starter ($49/month):</strong> 500 AI conversations/month, email automation, basic analytics, 1 calendar integration, email support.</li>
            <li><strong>Growth ($99/month):</strong> Unlimited conversations, CRM integrations, SMS follow-ups, advanced workflows, multi-calendar support, priority support.</li>
            <li><strong>Enterprise ($299/month):</strong> Custom AI workflows, dedicated account manager, API access, white-label solution, SLA guarantee, custom integrations.</li>
          </ul>
          <h3>Auto-Renewal</h3>
          <p>Subscriptions automatically renew at the end of each billing period (monthly or annually). You may cancel at any time; access continues through the end of the current billing period. No partial-month refunds are provided.</p>
          <h3>Annual Billing</h3>
          <p>Annual plans are billed as a single payment and receive a 20% discount. Annual subscriptions renew automatically unless cancelled before the renewal date.</p>

          <h2>4. Acceptable Use</h2>
          <p>You agree <strong>not</strong> to:</p>
          <ul className="list-disc pl-5">
            <li>Use the Service for any unlawful purpose or to send spam, unsolicited messages, or harmful content</li>
            <li>Attempt to gain unauthorized access to other users&apos; accounts, our systems, or infrastructure</li>
            <li>Use the Service to collect or store personal data in violation of applicable privacy laws</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
            <li>Resell or redistribute the Service without written permission</li>
            <li>Interfere with or disrupt the Service or servers connected to the Service</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>The Service and its original content (excluding user data), features, and functionality are owned by AI Appointment Setter and are protected by international copyright, trademark, and other intellectual property laws. Your business data, lead information, and conversation content remain yours.</p>

          <h2>6. Data Ownership</h2>
          <p>You retain ownership of all data you upload, create, or process through the Service, including lead information, conversation logs, and appointment data. We do not claim ownership of your data. You may export your data at any time through the dashboard or by contacting support.</p>

          <h2>7. Service Availability</h2>
          <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. Scheduled maintenance windows are communicated in advance. We are not liable for temporary outages caused by factors beyond our control.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, AI Appointment Setter shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of or inability to use the Service. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>

          <h2>9. Indemnification</h2>
          <p>You agree to indemnify and hold harmless AI Appointment Setter from any claims, damages, losses, or expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.</p>

          <h2>10. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination shall remain in effect.</p>

          <h2>11. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with applicable law, without regard to conflict-of-law provisions. Any disputes arising from these Terms shall be resolved through binding arbitration.</p>

          <h2>12. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:legal@aiappointmentsetter.com">legal@aiappointmentsetter.com</a>.</p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
          <a href="/" className="text-sm text-primary hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}