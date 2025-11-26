<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1isoIEEt1JQlppUZ65ddi6wgy4wVdNR1i

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

This project is configured for deployment on Vercel.

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your repository
5. Configure environment variables:
   - Add `GEMINI_API_KEY` in the project settings
6. Click "Deploy"

### Environment Variables

Make sure to set the following environment variable in your Vercel project settings:
- `GEMINI_API_KEY`: Your Gemini API key

The build will automatically use these environment variables during the build process.
