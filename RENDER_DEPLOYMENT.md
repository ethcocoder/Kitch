# Kitch - Render Deployment Guide (PostgreSQL)

This guide provides step-by-step instructions for deploying the Kitch application to Render using a managed PostgreSQL database.

## Prerequisites

- Render account (https://render.com)
- GitHub repository with your Kitch code

## Database Setup

### Step 1: Create a Render PostgreSQL Database

1. Go to your Render dashboard.
2. Click **New +** and select **PostgreSQL**.
3. Configure your database:
   - **Name**: `kitch-db`
   - **Database**: `kitch`
   - **User**: `kitch_user`
   - **Region**: Choose the region closest to you.
   - **Plan**: Free (note: expires in 30 days) or any paid plan.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (for use within Render) or **External Database URL** (for local migrations).

## Deployment Steps

### Step 1: Connect GitHub Repository

1. Go to Render Dashboard.
2. Click **New +** → **Web Service**.
3. Select **Connect a repository** and choose `ethcocoder/Kitch`.

### Step 2: Configure Web Service

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `kitch-app` |
| **Environment** | `Node` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Plan** | Free or Starter |

### Step 3: Set Environment Variables

Add the following environment variables in the **Environment** section:

```
DATABASE_URL=<your-internal-postgresql-url>
NODE_ENV=production
JWT_SECRET=<generate-a-secure-random-string>
VITE_APP_ID=<your-manus-oauth-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

**Note**: Use the **Internal Database URL** provided by Render for `DATABASE_URL` to ensure a secure, high-speed connection between your web service and database.

### Step 4: Run Migrations

To initialize your database schema, you can run the following command locally using your **External Database URL**:

```bash
export DATABASE_URL=<your-external-postgresql-url>
pnpm db:push
```

Alternatively, you can add `pnpm db:push` to your **Build Command** on Render:
`pnpm install && pnpm db:push && pnpm build`

### Step 5: Deploy

1. Click **Create Web Service**.
2. Render will automatically build and deploy your application.
3. Once complete, your app will be live at `https://kitch-app.onrender.com`.

## Troubleshooting

### "Invalid URL" Error
If you see an "Invalid URL" error in the browser, ensure that all environment variables starting with `VITE_` are correctly set in the Render dashboard. These variables are baked into the frontend during the build process.

### Database Connection
Ensure the `DATABASE_URL` is correct. If using the Free tier, remember it will be deleted after 30 days. For production, use a paid PostgreSQL plan.
