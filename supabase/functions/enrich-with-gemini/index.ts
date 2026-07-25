import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Gemini JSON Schema ──────────────────────────────────────────
const GEMINI_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["video", "recipe", "motion_design", "comparison", "generic"],
    },
    summary: { type: "string" },
    key_points: { type: "array", items: { type: "string" } },
    suggested_related: { type: "array", items: { type: "string" } },
    creator_username: { type: "string" },
    creator_profile_url: { type: "string" },
    recipe_name: { type: "string" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          amount: { type: "string" },
          image_url: { type: "string" },
        },
      },
    },
    steps: { type: "array", items: { type: "string" } },
    prep_time: { type: "string" },
    cook_time: { type: "string" },
    related_recipes: { type: "array", items: { type: "string" } },
    substitutes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ingredient: { type: "string" },
          substitute: { type: "string" },
          source_url: { type: "string" },
        },
      },
    },
    pairs_well_with: { type: "array", items: { type: "string" } },
    brands_or_subjects_featured: { type: "array", items: { type: "string" } },
    items_compared: { type: "array", items: { type: "string" } },
    verdict: { type: "string" },
  },
  required: ["type", "summary", "key_points"],
};

// ── Fetch page metadata ─────────────────────────────────────────
async function fetchPageMetadata(
  url: string
): Promise<{ title: string; description: string; textSnippet: string }> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return { title: "", description: "", textSnippet: "" };
    const html = await resp.text();

    const getMeta = (prop: string): string => {
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
        "i"
      );
      const m = html.match(regex);
      if (m) return m[1];
      const rev = new RegExp(
        `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
        "i"
      );
      const rm = html.match(rev);
      return rm ? rm[1] : "";
    };

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : html;
    const textSnippet = bodyHtml
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    return {
      title: getMeta("og:title"),
      description: getMeta("og:description"),
      textSnippet,
    };
  } catch {
    return { title: "", description: "", textSnippet: "" };
  }
}

// ── Call Gemini with retry on 429 ───────────────────────────────
async function callGemini(
  url: string,
  metadata: { title: string; description: string; textSnippet: string },
  platform: string,
  retries = 2
): Promise<Record<string, unknown> | null> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set");
    return null;
  }

  const systemPrompt = `You are a content classifier and enricher. Given a URL and its page metadata, classify the content into exactly ONE type:
- video: a reel/post where a creator talks about or reviews something
- recipe: a recipe video/post with ingredients and steps
- motion_design: a design/animation showcase, possibly featuring a brand
- comparison: "this or that" content comparing two or more things
- generic: fallback when it doesn't fit above

Rules:
- Return ONLY valid JSON matching the schema
- summary: 2-3 sentences on what the content covers
- key_points: 3-5 short bullet takeaways
- suggested_related: 2-3 URLs of similar content
- If creator info is available, include creator_username and creator_profile_url
- For recipes: extract ingredients, steps, timing. If timing not stated, estimate
- For comparisons: list items compared, criteria, and verdict
- If uncertain about type, use "generic"
- Platform: ${platform}`;

  const userMessage = `URL: ${url}
Platform: ${platform}
Title: ${metadata.title}
Description: ${metadata.description}
Page text: ${metadata.textSnippet.slice(0, 1500)}

Classify and enrich this content. Return ONLY valid JSON.`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: GEMINI_SCHEMA,
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.status === 429) {
        console.warn(`Rate limited on attempt ${attempt + 1}, retrying in ${(attempt + 1) * 2}s...`);
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        console.error(`Gemini API error (attempt ${attempt + 1}):`, err);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.error("No text in Gemini response:", JSON.stringify(data));
        continue;
      }

      return JSON.parse(text);
    } catch (err) {
      console.error(`Gemini call failed (attempt ${attempt + 1}):`, err);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
      }
    }
  }

  return null;
}

// ── Main handler ─────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { save_id, url } = await req.json();

    if (!save_id || !url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "save_id and url are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Deduplication: skip if enrichment already exists ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server config missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if enrichment already exists for this save
    const { data: existing } = await supabase
      .from("saves")
      .select("enrichment")
      .eq("id", save_id)
      .single();

    if (existing?.enrichment) {
      console.log(`Enrichment already exists for ${save_id} — skipping`);
      return new Response(
        JSON.stringify({ enrichment: existing.enrichment, cached: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Detect platform ──
    const lower = url.toLowerCase();
    let platform = "other";
    if (lower.includes("instagram.com") || lower.includes("instagr.am")) platform = "instagram";
    else if (lower.includes("tiktok.com")) platform = "tiktok";

    // ── Fetch metadata + call Gemini ──
    const metadata = await fetchPageMetadata(url);
    const enrichment = await callGemini(url, metadata, platform);

    if (!enrichment) {
      return new Response(
        JSON.stringify({ error: "Enrichment failed", enrichment: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Store in Supabase ──
    const { error } = await supabase
      .from("saves")
      .update({ enrichment })
      .eq("id", save_id);

    if (error) {
      console.error("Supabase update error:", error);
    }

    return new Response(
      JSON.stringify({ enrichment, cached: false }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (err) {
    console.error("Enrichment error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        details: err instanceof Error ? err.message : "Unknown",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
