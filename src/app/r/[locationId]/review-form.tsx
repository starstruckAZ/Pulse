"use client";

import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";

interface ReviewFormProps {
  locationId: string;
}

export default function ReviewForm({ locationId }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) { setError("Please select a star rating."); return; }
    if (reviewText.trim().length < 10) { setError("Please write at least 10 characters."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/r/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          reviewer_name: name.trim() || "Anonymous",
          rating,
          review_text: reviewText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="font-display font-semibold text-lg">Thank you!</h3>
        <p className="text-sm text-zinc-500 max-w-xs">
          Your feedback has been received. We appreciate you taking the time to share your experience.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Your name <span className="text-zinc-600">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          placeholder="e.g., Jane D."
        />
      </div>

      {/* Star rating */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="rounded-lg p-1 transition hover:scale-110"
              aria-label={`${star} star`}
            >
              <Star
                className={`h-7 w-7 transition ${
                  star <= (hoveredRating || rating)
                    ? "fill-[#ff6b4a] text-[#ff6b4a]"
                    : "text-zinc-700"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-1 text-xs text-zinc-500">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Review text */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Your review <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="input w-full resize-none"
          placeholder="Tell us about your experience (at least 10 characters)..."
        />
        <p className="mt-1 text-right text-xs text-zinc-600">
          {reviewText.length} chars
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm disabled:opacity-50"
      >
        {submitting ? (
          "Submitting..."
        ) : (
          <>
            <Send className="h-4 w-4" /> Submit Review
          </>
        )}
      </button>
    </form>
  );
}
