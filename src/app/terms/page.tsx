import Link from "next/link";
import { MessageSquare, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ReviewHype",
  description:
    "Read the Terms of Service for ReviewHype. Your use of the platform is subject to these terms.",
};

const LAST_UPDATED = "March 30, 2026";
const COMPANY = "ReviewHype";
const EMAIL = "legal@reviewpulse.app";
const SITE = "https://reviewpulse.app";

export default function TermsPage() {
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
            Get Started Free
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="badge mb-4 border-[rgba(255,107,74,0.25)] bg-[rgba(255,107,74,0.05)] text-[#ff6b4a]">
            <FileText className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="font-display mb-3 text-4xl font-bold">Terms of Service</h1>
          <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-8 text-zinc-300">

          {/* Intro */}
          <div className="bento p-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the {COMPANY}{" "}
              platform at <a href={SITE} className="text-[#ff6b4a] hover:underline">{SITE}</a> (&ldquo;Service&rdquo;)
              operated by {COMPANY} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or
              using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>
          </div>

          <Section title="1. Eligibility">
            <p>
              You must be at least 18 years old and have the legal authority to enter into this agreement on
              behalf of yourself or your business. By using the Service, you represent and warrant that you meet
              these requirements.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <ul>
              <li>You must provide accurate, current, and complete information during registration and keep it updated.</li>
              <li>You are responsible for safeguarding your password and all activity under your account.</li>
              <li>Notify us immediately at <a href={`mailto:${EMAIL}`} className="text-[#ff6b4a] hover:underline">{EMAIL}</a> if you suspect unauthorized access.</li>
              <li>You may not share, transfer, or sell your account credentials to any third party.</li>
            </ul>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree <strong>not</strong> to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of any applicable regulations.</li>
              <li>Post, submit, or transmit any content that is false, misleading, defamatory, harassing, or infringing on third-party rights.</li>
              <li>Attempt to create fake or fraudulent reviews, or manipulate review data on any platform.</li>
              <li>Reverse engineer, decompile, or extract source code from the Service.</li>
              <li>Use automated scripts or bots to scrape, crawl, or overload the Service.</li>
              <li>Resell, sublicense, or otherwise commercialize access to the Service without our written consent.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service or related infrastructure.</li>
            </ul>
          </Section>

          <Section title="4. Review Data & Third-Party Platforms">
            <p>
              The Service displays review data sourced from third-party platforms (Google, Yelp, Facebook, etc.).
              You acknowledge that:
            </p>
            <ul>
              <li>Such data is owned by the respective platforms and their users.</li>
              <li>ReviewHype does not guarantee the accuracy, completeness, or timeliness of third-party review data.</li>
              <li>Your use of third-party platform data through our Service must comply with each platform&apos;s own terms of service.</li>
              <li>We may not be able to retrieve or display all reviews if platform APIs are restricted or unavailable.</li>
            </ul>
          </Section>

          <Section title="5. AI-Generated Content">
            <p>
              ReviewHype offers AI-powered response suggestions. You acknowledge that:
            </p>
            <ul>
              <li>AI-generated responses are suggestions only and must be reviewed by you before publishing.</li>
              <li>You are solely responsible for any content you publish to third-party review platforms.</li>
              <li>We do not guarantee that AI suggestions are accurate, appropriate, or free from error.</li>
              <li>You will not use AI features to generate deceptive, harassing, or misleading content.</li>
            </ul>
          </Section>

          <Section title="6. Subscriptions & Payments">
            <ul>
              <li>Paid plans are billed on a monthly or annual basis as described on our pricing page.</li>
              <li>All fees are non-refundable except as required by law or as stated in our refund policy.</li>
              <li>We reserve the right to change pricing with at least 30 days&apos; notice. Continued use after a price change constitutes acceptance.</li>
              <li>If payment fails, we will retry for up to 7 days before suspending access to paid features.</li>
              <li>Payments are processed securely by Stripe. By subscribing, you also agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-[#ff6b4a] hover:underline">Stripe&apos;s Terms of Service</a>.</li>
            </ul>
          </Section>

          <Section title="7. Free Plan & Trial">
            <p>
              We offer a free tier with limited features. We reserve the right to modify or discontinue the free
              tier at any time with 30 days&apos; notice. We may also offer time-limited free trials of paid features,
              after which your account will revert to the free tier unless you subscribe.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              All content, features, and functionality of the Service — including but not limited to design,
              logos, software, and text — are owned by {COMPANY} or its licensors and are protected by copyright,
              trademark, and other intellectual property laws.
            </p>
            <p className="mt-3">
              You retain ownership of content you submit (e.g., business information). By submitting content,
              you grant {COMPANY} a worldwide, royalty-free license to use, store, display, and process it solely
              to provide and improve the Service.
            </p>
          </Section>

          <Section title="9. Privacy">
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-[#ff6b4a] hover:underline">Privacy Policy</Link>, which is
              incorporated into these Terms by reference.
            </p>
          </Section>

          <Section title="10. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, {COMPANY.toUpperCase()} AND ITS OFFICERS, DIRECTORS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY,
              OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR USE OR
              INABILITY TO USE THE SERVICE; (B) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS; OR (C) ANY
              THIRD-PARTY CONTENT OBTAINED THROUGH THE SERVICE.
            </p>
            <p className="mt-3">
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED
              THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) $100 USD.
            </p>
          </Section>

          <Section title="12. Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless {COMPANY} and its officers, directors, employees,
              and agents from and against any claims, liabilities, damages, losses, and expenses (including
              reasonable attorneys&apos; fees) arising out of or in any way connected with your access to or use of
              the Service, your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </Section>

          <Section title="13. Termination">
            <p>
              We may suspend or terminate your account at any time, with or without cause, and with or without
              notice, including for violations of these Terms. You may cancel your account at any time from your
              dashboard settings. Upon termination, your right to use the Service ceases immediately. Sections
              8–15 survive termination.
            </p>
          </Section>

          <Section title="14. Governing Law & Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Arizona,
              United States, without regard to its conflict of law provisions. Any dispute arising under these
              Terms shall be resolved by binding arbitration in Maricopa County, Arizona, under the rules of the
              American Arbitration Association, except that either party may seek injunctive relief in court for
              intellectual property violations.
            </p>
          </Section>

          <Section title="15. Changes to These Terms">
            <p>
              We reserve the right to update these Terms at any time. We will provide at least 14 days&apos; notice
              of material changes via email or a prominent notice on our website. Your continued use of the
              Service after the effective date constitutes your acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>For questions about these Terms, contact us:</p>
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
          <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
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
