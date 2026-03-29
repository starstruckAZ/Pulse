import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const ADMIN_USER_ID = "ae1c09ba-1b88-4ea8-89e7-7bd10262bdb2";

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ReviewSeed {
  location_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  source: string;
  sentiment: string;
  responded: boolean;
  response_text: string | null;
  created_at: string;
  status: string;
}

const reviewSeeds: Omit<ReviewSeed, "location_id">[] = [
  // 5-star reviews (6 total)
  {
    reviewer_name: "Sarah M.",
    rating: 5,
    review_text:
      "Absolutely love Starstruck TV! The picture quality on my new setup is incredible. The team walked me through every option patiently and made sure I got exactly what I needed. Highly recommend to anyone looking for a premium home theater experience.",
    source: "google",
    sentiment: "positive",
    responded: true,
    response_text:
      "Thank you so much, Sarah! We're thrilled you're loving your new setup. Enjoy every movie night!",
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "responded",
  },
  {
    reviewer_name: "James T.",
    rating: 5,
    review_text:
      "Best TV store in Phoenix, hands down. I've been to several places and nobody comes close to the knowledge and selection here. They set up my entire living room system and it looks like something out of a magazine.",
    source: "google",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  {
    reviewer_name: "Maria G.",
    rating: 5,
    review_text:
      "Came in not knowing anything about 4K vs 8K displays. The staff spent over an hour with me explaining everything without any pressure to buy. Ended up with a gorgeous OLED and couldn't be happier. Five stars all day!",
    source: "yelp",
    sentiment: "positive",
    responded: true,
    response_text:
      "Maria, thank you for taking the time to leave this review! Helping customers find the perfect display is what we love to do. Enjoy your OLED!",
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "responded",
  },
  {
    reviewer_name: "David L.",
    rating: 5,
    review_text:
      "Phenomenal service and an amazing product range. I brought in my interior designer and they worked together to find a TV that fit perfectly with our decor. The installation crew was professional, on time, and left everything spotless.",
    source: "facebook",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  {
    reviewer_name: "Jennifer R.",
    rating: 5,
    review_text:
      "I've been a loyal customer for three years and Starstruck TV never disappoints. Just upgraded to their latest soundbar bundle and the audio is out of this world. The staff remembered my preferences from my last visit — that kind of personal touch is rare.",
    source: "google",
    sentiment: "positive",
    responded: true,
    response_text:
      "Jennifer, we appreciate your loyalty so much! Glad the new soundbar bundle is hitting all the right notes. See you for your next upgrade!",
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "responded",
  },
  {
    reviewer_name: "Mike S.",
    rating: 5,
    review_text:
      "Got a commercial display package for my restaurant and it looks stunning. The team handled the whole project from consulting to mounting. Customers have been complimenting the screens non-stop. Worth every penny.",
    source: "yelp",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  // 4-star reviews (4 total)
  {
    reviewer_name: "Lisa K.",
    rating: 4,
    review_text:
      "Really great selection and knowledgeable staff. The only reason I'm giving four stars instead of five is that the wait time was a bit long before someone was free to help me. Once I got assistance, though, it was a fantastic experience.",
    source: "google",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  {
    reviewer_name: "Tom B.",
    rating: 4,
    review_text:
      "Solid store with a great variety of brands. I appreciated that they carry both budget-friendly and high-end options. Delivery took a day longer than expected, but they kept me updated throughout. The TV itself is perfect.",
    source: "yelp",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  {
    reviewer_name: "Rachel H.",
    rating: 4,
    review_text:
      "Good experience overall. Staff was helpful and the showroom is impressive. Pricing is on the higher side but you can tell the quality matches it. Would have given five stars but the checkout process was a little slow.",
    source: "facebook",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  {
    reviewer_name: "Carlos V.",
    rating: 4,
    review_text:
      "Picked up a 75-inch display for my home office and I'm very happy with it. The team helped me calibrate the settings for video calls and gaming. Minor hiccup with the mounting hardware but they shipped a replacement the same day.",
    source: "google",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  // 3-star reviews (2 total)
  {
    reviewer_name: "Amy W.",
    rating: 3,
    review_text:
      "The product itself is great but I had a mixed experience in-store. One staff member was very helpful while another seemed disinterested. The price was also slightly higher than what I found online, though they did match it after I asked.",
    source: "yelp",
    sentiment: "neutral",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  {
    reviewer_name: "Kevin P.",
    rating: 3,
    review_text:
      "Average experience. The showroom looks nice and they have a decent range but I felt a bit rushed when I was browsing. The TV I bought is working fine, nothing special about the buying process though.",
    source: "google",
    sentiment: "neutral",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  // 2-star review (1 total)
  {
    reviewer_name: "Stephanie N.",
    rating: 2,
    review_text:
      "Disappointed with the after-sales support. Bought a soundbar that had a defect out of the box and it took nearly two weeks of back-and-forth to get a replacement. The staff in-store were friendly enough but the support process was frustrating.",
    source: "facebook",
    sentiment: "negative",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  // 1-star review (1 total)
  {
    reviewer_name: "Brian O.",
    rating: 1,
    review_text:
      "Very poor experience. Was quoted one price over the phone and charged a significantly higher amount in-store. When I brought it up I was told the phone quote 'wasn't official.' I had to dispute the charge with my bank. Will not be returning.",
    source: "yelp",
    sentiment: "negative",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
  // Extra 5-star to balance (Nicole F.)
  {
    reviewer_name: "Nicole F.",
    rating: 5,
    review_text:
      "What a gem of a store! Walked in just to browse and left with the TV of my dreams. The demo wall is impressive and really helps you compare screens side by side. The team is genuinely passionate about what they sell — it shows.",
    source: "google",
    sentiment: "positive",
    responded: false,
    response_text: null,
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    status: "new",
  },
];

export async function POST() {
  try {
    // Auth check via session cookie
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const adminSupabase = getAdminSupabase();

    // --- 1. Ensure test location exists ---
    const { data: existingLocations, error: locationFetchError } =
      await adminSupabase
        .from("locations")
        .select("id")
        .eq("user_id", ADMIN_USER_ID)
        .eq("google_place_id", "test_place_123")
        .limit(1);

    if (locationFetchError) {
      return NextResponse.json(
        { error: "Failed to query locations: " + locationFetchError.message },
        { status: 500 }
      );
    }

    let locationId: string;

    if (existingLocations && existingLocations.length > 0) {
      locationId = existingLocations[0].id;
    } else {
      const { data: newLocation, error: locationInsertError } =
        await adminSupabase
          .from("locations")
          .insert({
            user_id: ADMIN_USER_ID,
            name: "Starstruck TV",
            address: "Phoenix, AZ",
            google_place_id: "test_place_123",
            platform: "google",
          })
          .select("id")
          .single();

      if (locationInsertError || !newLocation) {
        return NextResponse.json(
          {
            error:
              "Failed to create location: " +
              (locationInsertError?.message ?? "unknown error"),
          },
          { status: 500 }
        );
      }

      locationId = newLocation.id;
    }

    // --- 2. Insert test reviews ---
    const reviewsToInsert: ReviewSeed[] = reviewSeeds.map((r) => ({
      ...r,
      location_id: locationId,
    }));

    const { data: insertedReviews, error: reviewsInsertError } =
      await adminSupabase
        .from("reviews")
        .insert(reviewsToInsert)
        .select("id");

    if (reviewsInsertError) {
      return NextResponse.json(
        { error: "Failed to insert reviews: " + reviewsInsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      locationId,
      reviewsCreated: insertedReviews?.length ?? 0,
    });
  } catch (error) {
    console.error("POST /api/admin/seed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
