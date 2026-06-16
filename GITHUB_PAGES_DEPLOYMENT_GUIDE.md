# GitHub Pages Deployment Guide

This guide explains how to deploy a Next.js (or any static) website to GitHub Pages, configure a custom domain using a DNS provider like GoDaddy, and securely add environment variables as GitHub Secrets for your deployment pipeline. You can use this guide as a reference across multiple projects.

---

## 1. Prepare Your Project for GitHub Pages (Next.js)

For a Next.js project to be hosted on GitHub Pages, you need to configure it for a **Static HTML Export**.

1. Update your `next.config.mjs` (or `next.config.js`) to enable static export:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     // Optional: Add a trailing slash for better static routing compatibility
     // trailingSlash: true,
   };

   export default nextConfig;
   ```
2. **Note**: Static export means you cannot use features that require a Node.js server at runtime (such as Next.js Image Optimization without a custom loader, or API routes).

---

## 2. Adding Secrets from your `.env` File to GitHub

If your application needs API keys (like Firebase credentials) during the build process, you should **never** commit your `.env` or `.env.local` files to GitHub. Instead, use GitHub Secrets.

1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click the **New repository secret** button.
4. Open your local `.env.local` or `.env` file. For every key-value pair you need (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`):
   - **Name**: Enter the variable name exactly as it appears in your file (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
   - **Secret**: Copy and paste the corresponding value without any quotes.
5. Click **Add secret**.
6. Repeat this process for all required environment variables.

---

## 3. Setting Up GitHub Actions for Deployment

GitHub Pages provides a clean way to build and deploy Next.js apps using GitHub Actions.

1. Create a GitHub Actions workflow file in your project: `.github/workflows/deploy.yml`
2. You can use the following template for a standard Next.js deployment. Notice the `env:` block where we inject the secrets we created earlier.

```yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["main"] # Or master, depending on your default branch
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Setup Pages
        uses: actions/configure-pages@v5
        with:
          static_site_generator: next
      - name: Install dependencies
        run: npm ci # Or yarn install / pnpm install
      - name: Build with Next.js
        run: npm run build # Or npx next build
        env:
          # Inject your GitHub secrets here so Next.js can access them during build
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          # Add any other secrets you configured in Step 2
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. Commit and push this file to your repository.

---

## 4. Configuring GitHub Pages Settings

1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Pages** (on the left sidebar).
3. Under **Build and deployment**, set the **Source** to **GitHub Actions**.

---

## 5. Setting up a Custom Domain (e.g., GoDaddy)

If you want to use a custom domain (like `syrez.co.in` or `3d.syrez.co.in`):

### Part A: In your Repository
1. Create a file named `CNAME` in the `public` directory (or the root directory of your project, depending on how your project builds) containing only your domain name:
   ```text
   3d.syrez.co.in
   ```
   *(For Next.js static exports, putting it in `public/CNAME` ensures it gets copied to the `out/` folder during the build).*
2. Go to your repository's **Settings** > **Pages**.
3. Enter your domain in the **Custom domain** field and click **Save**. GitHub will run a DNS check.

### Part B: In your DNS Provider (e.g., GoDaddy)

**For a Subdomain (like `3d.syrez.co.in`):**
1. Log in to GoDaddy and open the DNS Management for your root domain (`syrez.co.in`).
2. Add a new record:
   - **Type**: `CNAME`
   - **Name**: `3d` (just the subdomain part, do not include the rest of the domain)
   - **Value**: `<your-github-username>.github.io` (e.g., `sanals.github.io`)
   - **TTL**: Default (or 1 hour)

**For a Root Domain (like `syrez.co.in`):**
1. Log in to GoDaddy and open DNS Management.
2. Add four `A` records with the Name `@` pointing to GitHub's IPs:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add a `CNAME` record with the Name `www` pointing to `<your-github-username>.github.io`.

### Final Check
Wait a few minutes to an hour for the DNS changes to propagate globally. Once the GitHub Pages DNS check passes in your repository settings, ensure **Enforce HTTPS** is checked. GitHub will automatically provision an SSL certificate for your site.
