# Stash — MCP Setup Guide

Install these MCPs to empower AI-assisted development. Install order matters — start with Tier 0.

---

## Tier 0 — Must Have

### 1. Expo MCP Server (Official)

**What:** Docs search, package install, config generation, screenshots, UI automation, DevTools, sitemap.

**Install (Remote — recommended):**
Add to your MCP client config:
```json
{
  "mcpServers": {
    "expo": {
      "url": "https://mcp.expo.dev/mcp"
    }
  }
}
```

**Install (Local — for screenshots/automation):**
```bash
cd stash/
npx expo install expo-mcp --dev
```

**Requirements:** Expo SDK 54+ (we have it). Free Expo account.

**Use for:** Looking up Expo docs, generating configs, capturing screenshots, automating UI tests.

---

### 2. metro-mcp (Debugging)

**What:** 80+ tools for runtime debugging — console, network, errors, Redux/Zustand, components, navigation, profiler, test-recorder, accessibility, UI automation.

**Install:**
```bash
npm install -g metro-mcp
```

**Add to MCP config:**
```json
{
  "mcpServers": {
    "metro": {
      "command": "metro-mcp",
      "args": []
    }
  }
}
```

**Requirements:** Node.js 18+, Metro + Hermes, iOS Simulator running.

**Use for:** Debugging runtime errors, recording user interactions for E2E tests, inspecting network requests, profiling performance.

---

## Tier 1 — Should Have

### 3. apple-dev-mcp (Apple HIG)

**What:** 113+ pre-processed HIG sections + Apple API documentation. Search by platform (iOS) and framework.

**Install:**
```bash
npm install -g apple-dev-mcp
```

**Add to MCP config:**
```json
{
  "mcpServers": {
    "apple-dev": {
      "command": "apple-dev-mcp",
      "args": []
    }
  }
}
```

**Use for:** Checking Apple design compliance, looking up iOS API patterns, verifying HIG guidelines for components.

---

### 4. expo-state-mcp (State Inspection)

**What:** Inspect and mutate live Zustand stores and Expo SQLite databases from the AI agent.

**Install:**
```bash
npm install -g @vitrion/expo-state-mcp
```

**Add to MCP config:**
```json
{
  "mcpServers": {
    "expo-state": {
      "command": "expo-state-mcp",
      "args": []
    }
  }
}
```

**Use for:** Debugging Zustand state, inspecting database contents, testing state mutations.

---

## Tier 2 — Nice to Have

### 5. Context7 (Live Documentation)

**What:** Up-to-date library documentation lookup. Prevents hallucinated APIs.

**Add to MCP config:**
```json
{
  "mcpServers": {
    "context7": {
      "url": "https://context7.com/mcp"
    }
  }
}
```

**Use for:** Looking up current Expo, React Native, Supabase, NativeWind documentation.

---

## Complete MCP Config

Add this to your MCP client's config file:

```json
{
  "mcpServers": {
    "expo": {
      "url": "https://mcp.expo.dev/mcp"
    },
    "metro": {
      "command": "metro-mcp",
      "args": []
    },
    "apple-dev": {
      "command": "apple-dev-mcp",
      "args": []
    },
    "expo-state": {
      "command": "expo-state-mcp",
      "args": []
    },
    "context7": {
      "url": "https://context7.com/mcp"
    }
  }
}
```

---

## MCP Usage in Stash Development

| Task | Use This MCP |
|------|-------------|
| Look up Expo API docs | Expo MCP or Context7 |
| Debug runtime errors | metro-mcp |
| Check Apple design compliance | apple-dev-mcp |
| Inspect Zustand store state | expo-state-mcp |
| Capture app screenshots | Expo MCP (local) |
| Record E2E test flows | metro-mcp (test-recorder) |
| Profile performance | metro-mcp (profiler) |
| Check iOS haptic patterns | apple-dev-mcp |
| Look up NativeWind classes | Context7 |
| Inspect Supabase queries | expo-state-mcp |

---

## Notes

- Keep 3-5 MCPs connected maximum to avoid tool bloat
- Start with Tier 0 (Expo + metro-mcp), add Tier 1 as needed
- metro-mcp requires the app running in iOS Simulator
- apple-dev-mcp works offline after initial install
- Context7 requires internet connection
