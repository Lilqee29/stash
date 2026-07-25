// Quick test — verify Gemini API key and model work
// Run: node test-gemini.js

const https = require("https");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Set GEMINI_API_KEY env var first");
  process.exit(1);
}

const body = JSON.stringify({
  contents: [
    {
      parts: [
        {
          text: 'Classify this Instagram reel: "Amazing motion design breakdown of Uber rebrand". Return JSON: {"type": "video", "summary": "short summary", "key_points": ["point1", "point2"]}',
        },
      ],
    },
  ],
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const req = https.request(
  url,
  { method: "POST", headers: { "Content-Type": "application/json" } },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      console.log("HTTP Status:", res.statusCode);
      if (res.statusCode === 429) {
        console.log("RATE LIMITED — your key hit the quota");
        process.exit(1);
      }
      try {
        const j = JSON.parse(data);
        const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log("SUCCESS! Gemini responded:");
          console.log(JSON.parse(text));
        } else {
          console.log("NO TEXT in response:", JSON.stringify(j, null, 2));
        }
      } catch (e) {
        console.log("Parse error. Raw response:", data.slice(0, 500));
      }
    });
  }
);
req.on("error", (e) => console.error("Network error:", e.message));
req.write(body);
req.end();
