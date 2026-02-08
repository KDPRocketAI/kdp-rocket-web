# ⚠️ IMPORTANT: Clerk API Keys Required

To run this app, you need to create a FREE Clerk account and get API keys.

## Step 1: Create Clerk Account
1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application

## Step 2: Get API Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy your keys (they should look like the examples below)

## Step 3: Create .env.local
1. Copy this file content below
2. Create a new file called `.env.local` in the root directory
3. Paste the content and replace the placeholder values with your actual Clerk keys

```env
# Clerk API Keys (from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk URLs (keep these as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 4: Configure Authentication Methods in Clerk Dashboard
1. Go to "User & Authentication" → "Email, Phone, Username"
2. Enable **Email** authentication
3. Go to "User & Authentication" → "Social Connections  "
4. Enable **Google** OAuth
5. (Optional for later) Apple and X/Twitter can be added when you have credentials

## Step 5: Restart Development Server
After creating `.env.local`:
```bash
npm run dev
```

Your app will now have authentication! 🎉

## Troubleshooting
- Make sure `.env.local` is in the root directory (same level as `package.json`)
- Restart the dev server after creating/editing `.env.local`
- Check that your keys don't have extra spaces or quotes
- `.env.local` is already in `.gitignore` so your keys won't be committed to Git
