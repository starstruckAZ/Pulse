import Link from "next/link";
import { MessageSquare, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ReviewHype",
  description:
    "Learn how ReviewHype collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "March 30, 2026";
const COMPANY = "ReviewHype";
const EMAIL = "privacy@reviewpulse.app";
const SITE = "https://reviewpulse.app";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen dot-grid">
      {/* Background blobs */}
      <div className="mesh-gradient fixed left-1/4 top-0 h-[500px] w-[500px] bg-[#ff6b4a] opacity-[0.04]" />
      <div className="mesh-gradient fixed right-1/4 top-1/3 h-[400px] w-[400px] bg-[#ff3d71] opacity-[0.03]" />

      {/* Nav */}
      <nav className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display">ReviewHype</span>
          </Link>
          <Link href="/signup" className="btn-primary rounded-2xl px-5 py-2 text-sm">
            Start Free Trial
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="badge mb-4 border-[rgba(255,107,74,0.25)] bg-[rgba(255,107,74,0.05)] text-[#ff6b4a]">
            <Shield className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="font-display mb-3 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-custom space-y-8 text-zinc-300">

          {/* Intro */}
          <div className="bento p-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              {COMPANY} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates{" "}
              <a href={SITE} className="text-[#ff6b4a] hover:underline">{SITE}</a> (the
              &ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website or use our Service. Please read
              this policy carefully. If you disagree with its terms, please discontinue use of the
              Service.
            </p>
          </div>

          <Section title="1. Information We Collect">
            <SubSection title="A. Information You Provide Directly">
              <ul>
                <li><strong>Account data:</strong> name, email address, and password when you create an account.</li>
                <li><strong>Business data:</strong> business name, address, Google Place ID, and other details you enter about your locations.</li>
                <li><strong>Payment data:</strong> billing information processed securely by Stripe. We never store your full card number.</li>
                <li><strong>Communications:</strong> messages you send to our support team.</li>
              </ul>
            </SubSection>
            <SubSection title="B. Information Collected Automatically">
              <ul>
                <li><strong>Usage data:</strong> pages visited, features used, time spent, referring URLs, and browser/device type.</li>
                <li><strong>Log data:</strong> IP address, browser type, operating system, and timestamps.</li>
                <li><strong>Cookies and similar technologies:</strong> see our Cookie section below.</li>
              </ul>
            </SubSection>
            <SubSection title="C. Review Data from Third-Party Platforms">
              <p>
                When you connect a business location, we fetch publicly available review data from platforms
                such as Google, Yelp, and Facebook solely to display it in your dashboard. We do not
                sell, share, or use this review content for any purpose other than providing the Service to you.
              </p>
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Provide, operate, and improve the Service.</li>
              <li>Process payments and send billing-related communications.</li>
              <li>Send transactional emails (e.g., password resets, plan confirmations).</li>
              <li>Send product updates and promotional emails — you may opt out at any time.</li>
              <li>Monitor and analyze usage trends to improve user experience.</li>
              <li>Detect, investigate, and prevent fraudulent or unauthorized activity.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="mt-3 text-sm text-zinc-500">
              We rely on the following legal bases (GDPR): <em>contract performance</em> (to provide the Service),
              <em> legitimate interests</em> (security, analytics, fraud prevention), <em>legal obligation</em>,
              and <em>consent</em> (marketing emails).
            </p>
          </Section>

          <Section title="3. Cookies & Tracking Technologies">
            <p>
              We use cookies and similar tracking technologies to operate and improve the Service.
              Cookies are small data files stored on your browser.
            </p>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-zinc-500">
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Purpose</th>
                  <th className="pb-2">Can Opt Out?</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 font-medium text-zinc-300">Strictly Necessary</td>
                  <td className="py-2 pr-4">Authentication session, security tokens</td>
                  <td className="py-2">No (required)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 font-medium text-zinc-300">Functional</td>
                  <td className="py-2 pr-4">Remembering your preferences (e.g., theme, language)</td>
                  <td className="py-2">Yes</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 font-medium text-zinc-300">Analytics</td>
                  <td className="py-2 pr-4">Understanding how users navigate the Service</td>
                  <td className="py-2">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-zinc-300">Marketing</td>
                  <td className="py-2 pr-4">Personalising ads on third-party platforms</td>
                  <td className="py-2">Yes</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-sm text-zinc-500">
              You can manage or delete cookies through your browser settings at any time. Disabling
              strictly necessary cookies will prevent you from logging in.
            </p>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We do <strong>not</strong> sell your personal information. We may share it only in these circumstances:</p>
            <ul>
              <li><strong>Service providers:</strong> Supabase (database & auth), Stripe (payments), Vercel (hosting), and similar vendors who process data on our behalf under data processing agreements.</li>
              <li><strong>Business transfers:</strong> if ReviewHype is acquired or merged, your data may transfer as a business asset. We will notify you beforehand.</li>
              <li><strong>Legal requirements:</strong> when required by law, court order, or to protect the rights and safety of our users or the public.</li>
              <li><strong>With your consent:</strong> in any other case, only with your explicit permission.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your account data for as long as your account is active or as needed to provide the
              Service. If you close your account, we will delete or anonymize your personal data within
              <strong> 30 days</strong>, except where we are required to retain it longer by law (e.g., billing
              records for tax purposes, retained for up to 7 years).
            </p>
            <p className="mt-3">
              Review data fetched from third-party platforms is retained for the lifetime of your account and
              deleted upon account closure.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> ask us to correct inaccurate data.</li>
              <li><strong>Erasure:</strong> request deletion of your personal data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
              <li><strong>Restriction / Objection:</strong> restrict or object to certain processing activities.</li>
              <li><strong>Withdraw consent:</strong> unsubscribe from marketing emails at any time via the link in any email.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#ff6b4a] hover:underline">{EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We implement industry-standard technical and organizational measures to protect your information,
              including TLS encryption in transit, encrypted storage, access controls, and regular security
              reviews. However, no method of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              The Service is not directed to children under the age of 13. We do not knowingly collect personal
              information from children. If you believe we have inadvertently collected such information, please
              contact us immediately at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#ff6b4a] hover:underline">{EMAIL}</a>.
            </p>
          </Section>

          <Section title="9. International Transfers">
            <p>
              {COMPANY} is operated in the United States. If you access the Service from outside the US, your
              information may be transferred to, stored, and processed in the US and other countries. Where
              required, we rely on Standard Contractual Clauses (SCCs) or other lawful mechanisms for
              international data transfers.
            </p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>
              The Service may contain links to third-party websites (e.g., Google, Yelp, Facebook). We have no
              control over their content or privacy practices and encourage you to review their respective
              privacy policies.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by
              email or by posting a prominent notice on our website at least 14 days before the change takes
              effect. Your continued use of the Service after changes go into effect constitutes your acceptance
              of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
              <p className="font-semibold text-white">{COMPANY}</p>
              <p className="mt-1 text-zinc-400">
                Email:{" "}
                <a href={`mailto:${EMAIL}`} className="text-[#ff6b4a] hover:underline">{EMAIL}</a>
              </p>
              <p className="mt-1 text-zinc-400">Website: <a href={SITE} className="text-[#ff6b4a] hover:underline">{SITE}</a></p>
            </div>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-8 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <Link href="/terms" className="transition hover:text-white">Terms of Service</Link>
          <Link href="/faq" className="transition hover:text-white">FAQ</Link>
          <Link href="/signup" className="text-[#ff6b4a] transition hover:text-white">Get Started</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display mb-4 text-xl font-bold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 font-semibold text-zinc-300">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-400">{children}</div>
    </div>
  );
}
