import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, ArrowLeft, ArrowRight, Clock } from "lucide-react";

const articles: Record<
  string,
  {
    title: string;
    description: string;
    date: string;
    readTime: string;
    category: string;
    content: string[];
  }
> = {
  "why-online-reviews-matter-local-business": {
    title: "Why Online Reviews Matter More Than Ever for Local Businesses",
    description:
      "93% of consumers say online reviews impact their purchasing decisions. Learn why managing your reviews is no longer optional.",
    date: "2026-03-15",
    readTime: "6 min read",
    category: "Reputation Management",
    content: [
      "## The Numbers Don't Lie",
      "Online reviews have become the digital word-of-mouth that can make or break a local business. According to recent studies, **93% of consumers** say online reviews influence their purchasing decisions, and **87%** won't consider a business with fewer than 3 stars.",
      "For local businesses, this matters even more. When someone searches for \"plumber near me\" or \"best pizza in [city]\", Google prominently displays review ratings right in the search results. Before a customer ever visits your website, they've already formed an opinion based on your star rating.",
      "## The Cost of Ignoring Reviews",
      "Every unanswered review — positive or negative — is a missed opportunity. Research shows that businesses that respond to reviews see **33% higher conversion rates** compared to those that don't. When customers see that a business actively engages with feedback, it signals that the business cares about customer experience.",
      "Negative reviews, in particular, require prompt attention. A study by Harvard Business Review found that businesses responding to negative reviews within 24 hours saw a **significant improvement** in their overall rating over time. The response itself often matters more than the original complaint.",
      "## Reviews and Local SEO",
      "Google's local search algorithm heavily weights review signals. This includes your overall rating, review volume, review recency, and whether you respond to reviews. Businesses with consistent, recent reviews tend to rank higher in local pack results — the map listings that appear at the top of local searches.",
      "This means that actively managing your reviews isn't just about reputation — it's a **direct driver of visibility**. More visibility means more foot traffic, more calls, and more revenue.",
      "## What High-Performing Businesses Do Differently",
      "The businesses that dominate their local markets share a common approach to reviews:\n\n- **They respond to every review** — positive and negative — within 24-48 hours\n- **They personalize responses** rather than using generic templates\n- **They actively encourage reviews** from satisfied customers\n- **They monitor reviews across all platforms**, not just Google\n- **They track sentiment trends** to identify and fix recurring issues",
      "## How ReviewHype Helps",
      "Managing reviews across Google, Yelp, and Facebook manually is time-consuming. ReviewHype consolidates all your reviews into a single dashboard, provides ready-to-use response templates so you can reply in seconds, and tracks sentiment trends so you can stay ahead of issues. Whether you're a single-location shop or managing multiple locations, ReviewHype makes review management effortless.",
    ],
  },
  "how-to-respond-negative-reviews": {
    title: "How to Respond to Negative Reviews (With Templates)",
    description:
      "Negative reviews don't have to hurt your business. Here's a proven framework for responding to unhappy customers.",
    date: "2026-03-10",
    readTime: "8 min read",
    category: "Response Strategy",
    content: [
      "## The HEARD Framework",
      "When a customer leaves a negative review, your response can either escalate the situation or turn it into a loyalty-building moment. The **HEARD framework** gives you a reliable structure for every response:",
      "**H — Hear them.** Acknowledge the specific issue they raised. Don't be generic.\n\n**E — Empathize.** Show you understand why they're frustrated.\n\n**A — Apologize.** Take responsibility where appropriate, without being defensive.\n\n**R — Resolve.** Offer a concrete next step to make things right.\n\n**D — Diagnose.** Internally, figure out what went wrong so it doesn't happen again.",
      "## Why Your Response Matters More Than the Review",
      "Here's the thing most business owners miss: **future customers** are reading your response, not just the reviewer. A thoughtful, professional response to a 1-star review actually builds trust. It shows potential customers that if something goes wrong, you'll handle it.",
      "In fact, **45% of consumers** say they're more likely to visit a business that responds to negative reviews. Your response is marketing as much as it is customer service.",
      "## Template: Service Issue",
      "\"Hi [Name], thank you for sharing your experience. I'm sorry to hear that [specific issue]. That's not the standard we hold ourselves to. I'd love the chance to make this right — could you reach out to us at [contact]? We want to ensure your next experience is much better.\"",
      "## Template: Wait Time / Delay",
      "\"Hi [Name], thank you for your feedback. I completely understand the frustration with the wait time during your visit. We've been experiencing higher than usual demand, and we're actively [hiring/adjusting scheduling/expanding capacity] to improve. We appreciate your patience and hope to serve you again soon.\"",
      "## Template: Product Quality",
      "\"Hi [Name], we appreciate you taking the time to let us know. Quality is something we take very seriously, and I'm disappointed to hear your experience didn't meet expectations. I'd like to understand more about what happened — please contact us at [contact] so we can make this right.\"",
      "## Common Mistakes to Avoid",
      "- **Don't be defensive.** Even if you disagree, arguing publicly never looks good.\n- **Don't copy-paste the same response** to every negative review. Customers (and Google) notice.\n- **Don't ignore the review.** Silence reads as indifference.\n- **Don't offer incentives publicly.** Offering discounts in a public reply can encourage fake negative reviews.\n- **Don't delay.** Respond within 24-48 hours while the experience is fresh.",
      "## Using Templates to Draft Better Responses",
      "ReviewHype's response templates help you craft personalized responses in seconds. Choose from professionally written templates for common scenarios, customize the details, and post — turning a 15-minute task into a 30-second one.",
    ],
  },
  "google-review-management-guide": {
    title: "The Complete Guide to Google Review Management in 2026",
    description:
      "Everything you need to know about managing Google reviews for your local business.",
    date: "2026-03-05",
    readTime: "12 min read",
    category: "Google Reviews",
    content: [
      "## Why Google Reviews Matter Most",
      "Google dominates local search with over **90% market share**. When potential customers search for businesses in your area, Google reviews are front and center — displayed in search results, Google Maps, and your Business Profile. Your Google review rating is often the first impression a customer has of your business.",
      "## Claiming and Optimizing Your Google Business Profile",
      "Before you can manage reviews effectively, make sure your Google Business Profile (GBP) is:\n\n- **Verified** — Complete the verification process to unlock all features\n- **Complete** — Fill out every field: business hours, services, description, photos\n- **Accurate** — Ensure your NAP (Name, Address, Phone) is consistent across the web\n- **Active** — Post updates regularly and respond to reviews promptly",
      "## How Google's Review System Works",
      "Google reviews are tied to your Google Business Profile. Key things to know:\n\n- Reviews are public and permanent (unless they violate Google's policies)\n- Star ratings range from 1-5, with an overall average displayed\n- Review recency matters — recent reviews carry more weight in search rankings\n- Google uses review signals as a ranking factor for local search results",
      "## Strategies to Get More Google Reviews",
      "The best time to ask for a review is right after a positive interaction. Here's how:\n\n- **Create a short review link** from your GBP dashboard and share it\n- **Add the review link to receipts, invoices, and follow-up emails**\n- **Train your team** to ask satisfied customers for feedback\n- **Use QR codes** in your physical location pointing to your review page\n- **Follow up via SMS or email** within 24 hours of service",
      "## Responding to Google Reviews: Best Practices",
      "- **Respond to every review** — yes, even the 5-star ones. A simple thank you goes a long way.\n- **Respond within 24-48 hours** — timeliness shows you care\n- **Personalize each response** — mention the reviewer's name and specific details\n- **Keep it professional** — even when the review is unfair\n- **Include relevant keywords naturally** — this can help with local SEO",
      "## Handling Fake or Inappropriate Reviews",
      "If you receive a review that violates Google's policies (spam, fake, offensive content):\n\n1. Flag the review through your GBP dashboard\n2. Provide evidence of why it violates policies\n3. Respond publicly and professionally while the dispute is pending\n4. Follow up with Google support if the review isn't removed within a week",
      "## Scaling Google Review Management",
      "For businesses with multiple locations or high review volumes, manual management becomes impossible. Tools like ReviewHype aggregate all your Google reviews into a single dashboard, alert you to new reviews instantly, and provide response templates to help you reply at scale — so no review goes unanswered.",
    ],
  },
  "review-response-templates-guide": {
    title: "Review Response Templates: How to Reply Faster Without Sounding Generic",
    description:
      "Learn how to use response templates effectively while keeping every reply personal and on-brand.",
    date: "2026-02-28",
    readTime: "7 min read",
    category: "Response Strategy",
    content: [
      "## Why Templates Are a Game-Changer",
      "Responding to every review is essential — but crafting a unique response from scratch each time is exhausting. That's where **response templates** come in. A good template gives you a proven starting point so you can respond in 30 seconds instead of 10 minutes, without sacrificing quality.",
      "## The Risk of Copy-Paste Responses",
      "Customers can spot a generic, copy-pasted response from a mile away. If every response sounds identical, it defeats the purpose of responding at all. The key is using templates as a **starting framework**, not a finished product.",
      "## Best Practices for Template-Based Responses",
      "**1. Always personalize before posting.** A template is a draft, not a final response. Add the reviewer's name, reference specific details they mentioned, and adjust the tone.\n\n**2. Match your brand voice.** If your business has a casual, friendly tone, make sure your templates reflect that. If you're more formal and professional, adjust accordingly.\n\n**3. Build templates for common scenarios.** Create dedicated templates for: positive reviews, negative reviews, service complaints, wait time issues, product quality concerns, and general feedback.\n\n**4. Rotate your templates.** Don't use the same template for consecutive reviews. Mix up your opening lines, structure, and sign-offs so responses feel fresh.\n\n**5. Use empathetic templates for negative reviews.** Negative reviews require extra care. Have templates that start with acknowledgment and empathy — you can always add specifics later.",
      "## Anatomy of a Great Response Template",
      "The best templates include:\n\n- A warm opening that acknowledges the reviewer\n- A placeholder for specific details (the dish they ordered, the service they received)\n- An empathetic tone that matches the review sentiment\n- A clear next step (invitation to return, offer to resolve offline)\n- A professional sign-off with your name or business name",
      "## Building Your Template Library",
      "Start with 5-10 core templates covering the most common review types you receive. As you respond to more reviews, save your best responses as new templates. Over time, you'll build a library that covers virtually every scenario.",
      "ReviewHype comes with 10 professionally written templates out of the box, covering everything from glowing 5-star thank-yous to thoughtful responses for service complaints. Customize them to match your brand voice, and start responding faster from day one.",
    ],
  },
  "reputation-management-roi": {
    title: "The ROI of Online Reputation Management: Data & Case Studies",
    description:
      "What's the actual return on investing in review management? Data and real case studies from local businesses.",
    date: "2026-02-20",
    readTime: "10 min read",
    category: "Business Strategy",
    content: [
      "## Reputation Is Revenue",
      "Online reputation management (ORM) isn't a vanity metric — it directly impacts your bottom line. A **one-star increase** on Yelp can lead to a **5-9% increase in revenue** for restaurants, according to a landmark Harvard Business School study. Similar patterns hold across industries.",
      "## The Numbers Behind Review Management",
      "Let's look at the data:\n\n- **88% of consumers** trust online reviews as much as personal recommendations\n- Businesses responding to reviews see **33% higher conversion rates**\n- A half-star rating difference can mean **19% more or fewer seats filled** during peak hours\n- **72% of consumers** say positive reviews make them trust a local business more\n- Businesses with 4+ star ratings earn **28% more annual revenue** than those below 4 stars",
      "## Case Study: Local Restaurant Chain",
      "A regional restaurant chain with 12 locations started using ReviewHype to manage their reviews across Google and Yelp. Within 6 months:\n\n- **Response rate went from 15% to 94%** — nearly every review got a personalized response\n- **Average response time dropped from 5 days to 4 hours**\n- **Average Google rating improved from 3.8 to 4.3 stars**\n- **Monthly reservations increased by 22%**\n- **Estimated monthly revenue increase: $18,000 across all locations**",
      "## Case Study: Home Services Company",
      "A plumbing and HVAC company serving a metro area struggled with a 3.2-star Google rating due to unaddressed negative reviews. After implementing systematic review management:\n\n- **Responded to all 47 unanswered negative reviews** within the first week\n- **23 of those reviewers updated their ratings** after receiving a response\n- **Google rating improved from 3.2 to 4.1 in 3 months**\n- **Inbound call volume increased by 35%**\n- **Cost per lead from Google decreased by 41%**",
      "## Calculating Your Own ROI",
      "Here's a simple framework:\n\n1. **Estimate your customer lifetime value (CLV)** — how much is a customer worth over their relationship with your business?\n2. **Count reviews you're not responding to** — each one is a potential lost customer or missed re-engagement\n3. **Measure your current conversion rate** from search to customer, then project the impact of a higher rating\n4. **Factor in time saved** — if you're spending 5+ hours per week on review management, that's time better spent on your core business",
      "## The Cost of Doing Nothing",
      "The biggest risk isn't spending money on reputation management — it's the invisible cost of reviews you never see, customers you lose before they walk in the door, and negative sentiment that compounds over time without a response.",
      "Tools like ReviewHype make professional reputation management accessible to any local business for less than the cost of a single lost customer per month. With a 7-day free trial to start, there's no barrier to seeing the impact firsthand.",
    ],
  },
};

type Params = { slug: string };

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Organization", name: "ReviewHype" },
    publisher: { "@type": "Organization", name: "ReviewHype" },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient left-[10%] top-[5%] h-[400px] w-[400px] bg-[#ff6b4a]/[0.06]" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71] shadow-lg shadow-[#ff6b4a]/20">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">ReviewHype</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/how-it-works" className="text-[13px] text-[#8b8b9e] transition hover:text-white">How It Works</Link>
            <Link href="/blog" className="text-[13px] text-[#8b8b9e] transition hover:text-white">Blog</Link>
            <Link href="/signup" className="btn-primary rounded-xl px-5 py-2 text-[13px]">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-36 pb-20 md:pt-48">
        <div className="relative mx-auto max-w-3xl px-6">
          <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-[#8b8b9e] transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="badge text-[#ff6b4a] border-[#ff6b4a]/15 bg-[#ff6b4a]/[0.04] text-xs">{article.category}</span>
              <span className="flex items-center gap-1 text-xs text-[#4a4a5e]"><Clock className="h-3 w-3" />{article.readTime}</span>
              <span className="text-xs text-[#4a4a5e]">{article.date}</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{article.title}</h1>
          </div>

          <div className="space-y-6">
            {article.content.map((block, i) => {
              if (block.startsWith("## ")) {
                return <h2 key={i} className="mt-12 mb-4 font-display text-2xl font-bold">{block.replace("## ", "")}</h2>;
              }
              const parts = block.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={i} className="text-base leading-relaxed text-[#8b8b9e] whitespace-pre-line">
                  {parts.map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={j} className="text-[#eeeef0] font-semibold">{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 glass rounded-3xl p-10 text-center">
            <h3 className="mb-2 font-display text-xl font-bold">Ready to manage reviews smarter?</h3>
            <p className="mb-6 text-sm text-[#8b8b9e]">Join 500+ businesses using ReviewHype. Try free for 7 days.</p>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#ff6b4a] to-[#ff3d71]">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="font-display text-sm font-bold">ReviewHype</span>
          </Link>
          <div className="flex gap-6 text-sm text-[#8b8b9e]">
            <Link href="/how-it-works" className="transition hover:text-white">How It Works</Link>
            <Link href="/faq" className="transition hover:text-white">FAQ</Link>
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
          </div>
          <p className="text-xs text-[#4a4a5e]">&copy; {new Date().getFullYear()} ReviewHype</p>
        </div>
      </footer>
    </div>
  );
}
