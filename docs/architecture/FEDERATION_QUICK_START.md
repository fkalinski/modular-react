# Module Federation Quick Start Guide

**5-Minute Guide to Using Dynamic Federation**

---

## For Developers: Testing Feature Branches

### Method 1: URL Parameter (Fastest)

Just add `?remote_NAME=URL` to your localhost URL:

```
http://localhost:3000/?remote_shared_components=https://my-pr-456.vercel.app/remoteEntry.js
```

**Use when:**
- Quick one-time test
- Sharing test link with teammate
- Testing specific PR deployment

---

### Method 2: Browser Console (Most Flexible)

Open browser console and type:

```javascript
// Test your PR
mf.testPR('shared_components', 456)
location.reload()

// Switch to staging
mf.useStaging()
location.reload()

// Back to local
mf.useLocal()
location.reload()

// See what's active
mf.listOverrides()
```

**Use when:**
- Need to test multiple versions
- Want persistent override (stays after refresh)
- Testing different environments

---

## Available Remotes

You can override any of these:

- `shared_components` - UI component library
- `shared_data` - Redux store and GraphQL
- `content_shell` - Content platform shell
- `files_folders` - Files & Folders tab
- `hubs_tab` - Hubs tab
- `reports_tab` - Reports tab
- `user_tab` - User tab

---

## Common Scenarios

### "I want to test my PR before merging"

Your PR is deployed at: `https://shared-components-pr-456.vercel.app`

**Option A (quickest):**
```
http://localhost:3000/?remote_shared_components=https://shared-components-pr-456.vercel.app/remoteEntry.js
```

**Option B (persistent):**
```javascript
mf.testPR('shared_components', 456)
location.reload()
```

---

### "I want to test with staging data"

```javascript
mf.useStaging()
location.reload()
```

This loads ALL remotes from staging.

---

### "I want to test staging components with local data"

```javascript
// Override just components
mf.override('shared_components', 'https://staging-shared-components.vercel.app/remoteEntry.js')
// Everything else stays local
location.reload()
```

---

### "I want to debug a production issue"

```javascript
// Load production versions locally
mf.useProduction()
location.reload()
```

---

### "I messed up, how do I reset?"

```javascript
mf.clearOverrides()
location.reload()
```

Or just clear localStorage and refresh:
```javascript
localStorage.clear()
location.reload()
```

---

## Console Commands Cheat Sheet

```javascript
// See all available commands
mf

// Override a remote
mf.override('shared_components', 'https://url/remoteEntry.js')

// Test PR deployment
mf.testPR('shared_components', 456)

// Environment switching
mf.useLocal()        // Local development
mf.useStaging()      // Staging environment
mf.useProduction()   // Production environment

// Management
mf.listOverrides()           // Show all active overrides
mf.clearOverride('name')     // Clear specific remote
mf.clearOverrides()          // Clear everything
mf.showCurrentURLs()         // Show current config
```

---

## For Product/Growth Teams: A/B Testing

### Server-Side Cookie Setup

To show different versions to different users:

```javascript
// Backend sets cookie based on experiment
if (getUserVariant(userId, 'new-table-design') === 'treatment') {
  response.cookie(
    'mf_shared_components',
    'https://shared-components-new-table.vercel.app/remoteEntry.js',
    { httpOnly: true, secure: true, sameSite: 'strict' }
  );
}
```

User automatically gets the experiment version, no client-side code needed.

---

## How It Works

1. **Default:** Uses environment-based URLs (localhost in dev, Vercel in prod)
2. **URL Param Override:** `?remote_NAME=URL` takes highest priority
3. **Cookie Override:** Server can set per-user versions
4. **localStorage Override:** Developers can set persistent overrides
5. **Fallback:** Falls back to webpack static imports if dynamic loader fails

**Priority:** URL Params > Cookies > LocalStorage > Defaults

---

## Need Help?

- Full documentation: [FEDERATION_STRATEGY_IMPLEMENTATION.md](./FEDERATION_STRATEGY_IMPLEMENTATION.md)
- Troubleshooting: See "Troubleshooting" section in main docs
- Questions: Ask in team chat

---

**Quick Tip:** Type `mf` in console to see all available commands!
