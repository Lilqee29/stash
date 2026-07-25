import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MetadataResult {
  title: string;
  description: string;
  thumbnail: string;
  creator: string;
  platform: "instagram" | "tiktok" | "other";
  contentType: "video" | "reel" | "post" | "default";
}

/**
 * Extracts og:meta tags from HTML
 */
function extractOgTags(html: string): {
  title: string;
  description: string;
  image: string;
} {
  const getMeta = (property: string): string => {
    // Try og: prefix first
    const ogRegex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`,
      "i"
    );
    const ogMatch = html.match(ogRegex);
    if (ogMatch) return ogMatch[1];

    // Try reversed attribute order
    const revRegex = new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`,
      "i"
    );
    const revMatch = html.match(revRegex);
    if (revMatch) return revMatch[1];

    // Try name= attribute (some sites use name instead of property)
    const nameRegex = new RegExp(
      `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`,
      "i"
    );
    const nameMatch = html.match(nameRegex);
    if (nameMatch) return nameMatch[1];

    return "";
  };

  return {
    title: getMeta("og:title"),
    description: getMeta("og:description"),
    image: getMeta("og:image"),
  };
}

/**
 * Extract creator from Instagram URL or page content
 */
function extractInstagramCreator(
  url: string,
  html: string
): string {
  // Try to extract from URL pattern: instagram.com/username/...
  const urlMatch = url.match(/instagram\.com\/([^/?]+)/);
  if (urlMatch && !["p", "reel", "stories", "explore", "accounts"].includes(urlMatch[1])) {
    return urlMatch[1];
  }

  // Try to extract from page HTML - look for @username patterns
  const creatorRegex = /["']@?([a-zA-Z0-9._]+)["']\s*(?:\/>|,\s*"|"\/>|'\/>)/;
  const creatorMatch = html.match(creatorRegex);
  if (creatorMatch) return creatorMatch[1];

  // Try to extract from alt text of profile image
  const altRegex = /alt=["']([^"']+)/i;
  const altMatch = html.match(altRegex);
  if (altMatch && altMatch[1].length < 50) return altMatch[1];

  // Try from JSON-LD
  const jsonLdRegex = /"author"[^}]*"name"\s*:\s*"([^"]+)"/;
  const jsonLdMatch = html.match(jsonLdRegex);
  if (jsonLdMatch) return jsonLdMatch[1];

  return "";
}

/**
 * Fetch Instagram metadata using oEmbed API
 */
async function fetchInstagramMetadata(
  url: string
): Promise<MetadataResult> {
  // Instagram oEmbed endpoint (no auth required for basic data)
  const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`;

  try {
    const resp = await fetch(oembedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      },
    });

    if (resp.ok) {
      const data = await resp.json();
      return {
        title: data.title || "",
        description: data.author_name || "",
        thumbnail: data.thumbnail_url || "",
        creator: data.author_name || "",
        platform: "instagram",
        contentType: url.includes("/reel/") ? "reel" : "post",
      };
    }
  } catch {
    // oEmbed failed, fall through to HTML scraping
  }

  // Fallback: fetch the page and extract og:tags
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (resp.ok) {
      const html = await resp.text();
      const og = extractOgTags(html);
      const creator = extractInstagramCreator(url, html);

      return {
        title: og.title || "Instagram Post",
        description: og.description || "",
        thumbnail: og.image || "",
        creator,
        platform: "instagram",
        contentType: url.includes("/reel/") ? "reel" : "post",
      };
    }
  } catch {
    // HTML fetch failed
  }

  // Last resort: derive from URL
  return {
    title: "Instagram Post",
    description: "",
    thumbnail: "",
    creator: "",
    platform: "instagram",
    contentType: url.includes("/reel/") ? "reel" : "post",
  };
}

/**
 * Fetch TikTok metadata using oEmbed API
 */
async function fetchTikTokMetadata(
  url: string
): Promise<MetadataResult> {
  // TikTok oEmbed API (no auth required)
  const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

  try {
    const resp = await fetch(oembedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      },
    });

    if (resp.ok) {
      const data = await resp.json();
      return {
        title: data.title || "",
        description: data.author_unique_id || "",
        thumbnail: data.thumbnail_url || "",
        creator: data.author_unique_id || "",
        platform: "tiktok",
        contentType: "video",
      };
    }
  } catch {
    // oEmbed failed
  }

  // Fallback: derive from URL
  const creatorMatch = url.match(/@([^/?]+)/);
  return {
    title: "TikTok Video",
    description: "",
    thumbnail: "",
    creator: creatorMatch ? creatorMatch[1] : "",
    platform: "tiktok",
    contentType: "video",
  };
}

/**
 * Fetch metadata for a generic URL using og:tags
 */
async function fetchGenericMetadata(
  url: string
): Promise<MetadataResult> {
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

    if (resp.ok) {
      const html = await resp.text();
      const og = extractOgTags(html);
      const domain = new URL(url).hostname.replace("www.", "");

      return {
        title: og.title || domain,
        description: og.description || "",
        thumbnail: og.image || "",
        creator: "",
        platform: "other",
        contentType: "default",
      };
    }
  } catch {
    // fetch failed
  }

  const domain = (() => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "Web";
    }
  })();

  return {
    title: domain,
    description: "",
    thumbnail: "",
    creator: "",
    platform: "other",
    contentType: "default",
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hostname = parsed.hostname.toLowerCase();
    let result: MetadataResult;

    if (hostname.includes("instagram.com") || hostname.includes("instagr.am")) {
      result = await fetchInstagramMetadata(url);
    } else if (hostname.includes("tiktok.com")) {
      result = await fetchTikTokMetadata(url);
    } else {
      result = await fetchGenericMetadata(url);
    }

    return new Response(
      JSON.stringify(result),
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
    return new Response(
      JSON.stringify({
        error: "Failed to fetch metadata",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
