# Vercel API Token Usage

## Token Location

Your Vercel API token is stored in:
```
.env.vercel
```

This file is automatically gitignored (matches `.env` pattern in `.gitignore`).

## Token Value

```bash
VERCEL_TOKEN=Sg9DCjY520avAxhOvM8J2SGs
```

## How to Use

### Option 1: Source the file

```bash
source .env.vercel
echo $VERCEL_TOKEN  # Verify it's loaded
```

### Option 2: Use directly in commands

```bash
# Configure Root Directories
VERCEL_TOKEN=$(grep VERCEL_TOKEN .env.vercel | cut -d'=' -f2) ./scripts/set-root-directories.sh

# Or export first
export VERCEL_TOKEN=$(grep VERCEL_TOKEN .env.vercel | cut -d'=' -f2)
./scripts/set-root-directories.sh
```

### Option 3: Load in scripts

Add to the top of your scripts:

```bash
# Load Vercel token if available
if [ -f ".env.vercel" ]; then
  export $(cat .env.vercel | grep -v '^#' | xargs)
fi
```

## Use Cases

1. **Configure Root Directories** (already done)
   ```bash
   source .env.vercel
   ./scripts/set-root-directories.sh
   ```

2. **Direct API Calls**
   ```bash
   source .env.vercel
   curl -H "Authorization: Bearer $VERCEL_TOKEN" \
     https://api.vercel.com/v9/projects/<project-id>
   ```

3. **Vercel CLI (alternative to login)**
   ```bash
   source .env.vercel
   vercel --token $VERCEL_TOKEN ls
   ```

## Security Notes

- ✅ File is gitignored
- ✅ Never commit this token to git
- ✅ Token has full access to your Vercel account
- ⚠️  Treat it like a password
- 🔄 Regenerate if compromised at: https://vercel.com/account/tokens

## Token Permissions

This token has access to:
- Read/write projects
- Create/update deployments
- Configure project settings
- Manage domains
- Access logs

## Regenerating Token

If you need to regenerate:

1. Go to: https://vercel.com/account/tokens
2. Delete the old token
3. Create a new token
4. Update `.env.vercel` with the new value

---

**Created**: 2025-10-24
**Last Used**: Setting Root Directories for all 8 projects
