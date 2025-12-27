# 📖 Complete Setup Guide

Welcome! This guide will help you set up your SaaS application in about **10 minutes**.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org))
- ✅ **npm or yarn** package manager
- ✅ **Supabase account** (free tier is perfect - [Sign up](https://supabase.com))
- ✅ **Code editor** (VS Code recommended)
- ✅ **10 minutes** of your time

---

## 🎯 Step 1: Create Supabase Project

### 1.1 Sign Up / Log In

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with GitHub, Google, or email
3. You'll see your dashboard

### 1.2 Create New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `my-saas-app` (or whatever you want)
   - **Database Password**: Create a strong password (SAVE IT!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

3. Click **"Create new project"**
4. **Wait ~2 minutes** while Supabase sets up your database

### 1.3 Get Your API Keys

Once your project is ready:

1. Go to **Settings** (⚙️ icon in left sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:

**Project URL** - Something like:
```
https://abcdefghijklmno.supabase.co
```

**anon public key** - A long string starting with `eyJ`:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**⚠️ IMPORTANT**: Copy both of these - you'll need them in Step 3!

---

## 🗄️ Step 2: Setup Database

### 2.1 Open SQL Editor

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**

### 2.2 Run Database Schema

1. Open the file `database-schema.sql` from this project
2. **Copy ALL the contents**
3. **Paste** into the SQL Editor
4. Click **RUN** (or press Ctrl/Cmd + Enter)

You should see:
```
Success. No rows returned
```

### 2.3 Verify Tables Created

1. Click **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `organizations`
   - ✅ `profiles`
   - ✅ `records`

**If you see all three tables, you're good!** 🎉

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create .env File

1. In your project folder, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Or manually create a file called `.env` in the root folder**

### 3.2 Add Your Supabase Credentials

Open `.env` and replace the placeholders:

```env
# Replace with YOUR values from Step 1.3
VITE_SUPABASE_URL=https://abcdefghijklmno.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Make sure**:
- No spaces around the `=` sign
- No quotes around the values
- The file is named exactly `.env` (with the dot!)

---

## 📦 Step 4: Install Dependencies

In your project folder, run:

```bash
npm install
```

This will install all required packages (React, Supabase, Tailwind, etc.)

**Wait 1-2 minutes** for everything to download.

---

## 🚀 Step 5: Launch Your App

Start the development server:

```bash
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open your browser** and go to **http://localhost:5173**

---

## ✅ Step 6: Test Everything

### 6.1 Create Your First Account

1. You should see a login page
2. Click **"Sign Up"** or **"Create Account"**
3. Fill in:
   - Email
   - Password
   - Role: Select **"Admin"**
   - Organization name (optional)
4. Click **"Sign Up"**

### 6.2 Verify in Supabase

1. Go back to your Supabase dashboard
2. Click **Table Editor** → **profiles**
3. You should see your new profile with:
   - ✅ Your email
   - ✅ Role: `admin`
   - ✅ Created timestamp

**If you see this, EVERYTHING WORKS!** 🎉

### 6.3 Test Login

1. Log out of your app
2. Log back in with your credentials
3. You should see the dashboard

---

## 🎨 Step 7: Customize (Optional)

### Change App Name

Edit `index.html`:
```html
<title>My Awesome SaaS</title>
```

### Change Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#your-color-here'
}
```

### Add Your Logo

Replace logo in `src/components/Header.tsx`

---

## 🚢 Step 8: Deploy to Production

### Option A: Vercel (Recommended - FREE)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Your app is LIVE! 🎉

### Option B: Netlify (FREE)

1. Build your app:
```bash
npm run build
```

2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `dist/` folder
4. Add environment variables in Netlify settings

---

## 🐛 Troubleshooting

### "Invalid API key" Error

**Problem**: Wrong Supabase key in `.env`

**Solution**:
1. Go to Supabase → Settings → API
2. Copy the **anon public** key (not service_role!)
3. Make sure it starts with `eyJ`
4. Restart dev server: `Ctrl+C` then `npm run dev`

---

### "User not authorized" Error

**Problem**: RLS policies not set up correctly

**Solution**:
1. Go to Supabase SQL Editor
2. Re-run `database-schema.sql`
3. Check that RLS is **enabled** on all tables

---

### Tables Not Created

**Problem**: SQL script didn't run completely

**Solution**:
1. Go to Supabase → SQL Editor
2. Run this to check:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
3. If `organizations`, `profiles`, `records` are missing, re-run the full schema

---

### Build Errors

**Problem**: Missing dependencies or wrong Node version

**Solution**:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try again
npm run dev
```

---

### Port 5173 Already in Use

**Problem**: Another app is using the port

**Solution**:
```bash
# Kill the process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 📚 Next Steps

Now that your app is running:

1. ✅ **Explore the code** - Check out `src/` folder
2. ✅ **Read the database schema** - Understand the data model
3. ✅ **Add your features** - Build on top of this foundation
4. ✅ **Customize the UI** - Make it your own
5. ✅ **Deploy** - Share with the world!

---

## 💡 Pro Tips

### Development

- Use `npm run dev` for development with hot reload
- Check browser console for errors (F12)
- Use React DevTools extension

### Database

- Always use RLS policies for security
- Test permissions with different roles
- Use Supabase Table Editor to view data

### Deployment

- Set up CI/CD with GitHub Actions
- Use environment variables for secrets
- Enable HTTPS (automatic with Vercel/Netlify)

---

## 🤝 Need Help?

- 📧 Email: [your-email@example.com]
- 📖 Check the README.md
- 🐛 Common issues are listed above

---

## ✨ You're All Set!

Your multi-tenant SaaS is now running! 🎉

**Focus on building your unique features and let this starter kit handle the foundation.**

Happy building! 🚀
