# Pocket Werewolf - Deployment Guide 🚀

This guide covers deploying **Pocket Werewolf** to various hosting providers with zero server infrastructure costs.

---

## 1. Automated GitHub Pages (Recommended)

Pocket Werewolf comes pre-configured with a continuous deployment pipeline in `.github/workflows/ci-cd.yml`.

### Steps:
1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Navigate to your repository on GitHub:
   `https://github.com/<your-username>/pocket-werewolf`
3. Click **Settings** > **Pages** (in the left sidebar).
4. Under **Build and deployment > Source**, select **"GitHub Actions"**.
5. The deployment will run automatically and your live game will be accessible at:
   `https://<your-username>.github.io/pocket-werewolf/`

---

## 2. Deploy to Vercel

1. Import your GitHub repository on [vercel.com](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variables (optional, can also be entered in-app):
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-public-key`
4. Click **Deploy**.

---

## 3. Deploy to Netlify

1. Import your repository on [netlify.com](https://netlify.com).
2. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add environment variables in **Site configuration > Environment variables**.
4. Click **Deploy Site**.

---

## 4. Deploy to Cloudflare Pages

1. Log in to the Cloudflare Dashboard and navigate to **Workers & Pages**.
2. Select **Create application** > **Pages** > **Connect to Git**.
3. Select your `pocket-werewolf` repository.
4. Set build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**.

---

## 5. Setting up Supabase Backend (One-Time)

Regardless of where the client frontend is hosted, the multiplayer backend is powered by Supabase:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of [`supabase/schema.sql`](../supabase/schema.sql) and click **Run**.
4. Copy your **Project URL** and **Anon Public Key** from **Project Settings > API**.
5. Enter them either in your hosting provider's environment variables or directly inside the game's **Settings (⚙️)** modal.
