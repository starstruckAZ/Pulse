import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const sentimentFilter = searchParams.get("sentiment_filter");

    // Fetch user templates
    let userQuery = supabase
      .from("response_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (sentimentFilter) {
      userQuery = userQuery.eq("sentiment_filter", sentimentFilter);
    }

    const { data: userTemplates, error: userError } = await userQuery;

    // Fetch system templates
    let systemQuery = supabase
      .from("response_templates")
      .select("*")
      .eq("is_system", true)
      .order("created_at", { ascending: true });

    if (sentimentFilter) {
      systemQuery = systemQuery.eq("sentiment_filter", sentimentFilter);
    }

    const { data: systemTemplates, error: systemError } = await systemQuery;

    const error = userError || systemError;
    const data = [...(userTemplates || []), ...(systemTemplates || [])];

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, template_text, sentiment_filter } = body as {
      name: string;
      template_text: string;
      sentiment_filter?: "positive" | "neutral" | "negative";
    };

    if (!name || !template_text) {
      return NextResponse.json(
        { error: "name and template_text are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("response_templates")
      .insert({
        user_id: user.id,
        name,
        template_text,
        sentiment_filter: sentiment_filter || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template id is required as a query parameter" },
        { status: 400 }
      );
    }

    // Verify ownership and delete in one query
    const { data, error } = await supabase
      .from("response_templates")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("DELETE /api/templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
