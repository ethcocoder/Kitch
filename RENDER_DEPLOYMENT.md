# Kitch - Render Deployment Guide

This guide provides step-by-step instructions for deploying the Kitch application to Render with SQLite database persistence.

## Prerequisites

- Render account (https://render.com)
- GitHub repository with your Kitch code
- Basic understanding of environment variables and deployment

## Database Setup

### SQLite Persistence on Render

Render provides ephemeral storage by default, but you can use Render Disks for persistent SQLite storage.

#### Step 1: Create a Render Disk

1. Go to your Render dashboard
2. Click "New +" and select "Disk"
3. Configure:
   - **Name**: `kitch-db`
   - **Size**: 1 GB (or as needed)
   - **Mount Path**: `/var/data`
4. Click "Create Disk"

#### Step 2: Configure Your Web Service

When creating the web service (see below), ensure the disk is mounted at `/var/data`.

## Deployment Steps

### Step 1: Connect GitHub Repository

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Select "Connect a repository"
4. Authorize Render to access your GitHub account
5. Select the `ethcocoder/Kitch` repository

### Step 2: Configure Web Service

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `kitch-app` |
| **Environment** | `Node` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Plan** | Free or Starter (as needed) |

### Step 3: Mount Disk

1. In the Web Service settings, scroll to "Disks"
2. Click "Add Disk"
3. Select the `kitch-db` disk created earlier
4. Set **Mount Path** to `/var/data`

### Step 4: Set Environment Variables

Add the following environment variables in the "Environment" section:

```
DATABASE_URL=/var/data/kitch.db
NODE_ENV=production
JWT_SECRET=<generate-a-secure-random-string>
VITE_APP_ID=<your-manus-oauth-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

**Important**: Generate a strong random string for `JWT_SECRET`. You can use:
```bash
openssl rand -hex 32
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the deployment logs in the "Logs" tab
4. Once deployment is complete, your app will be live at `https://kitch-app.onrender.com`

## Database Initialization

The SQLite database will be automatically created on first run. The application will:

1. Check if `kitch.db` exists at the `DATABASE_URL` path
2. If not, create it and run migrations
3. Initialize all tables (users, products, orders, cms_content, etc.)

### Manual Database Initialization (if needed)

If you need to manually initialize the database:

1. Connect to your Render service via SSH (available on paid plans)
2. Run the initialization script:
   ```bash
   node init-db.mjs
   ```

## Backup and Recovery

### Backing Up Your Database

Since your database is on a Render Disk, you can:

1. Download the disk contents via Render's dashboard
2. Or set up automated backups using Render's backup features

### Restoring a Database

1. Upload your backup `kitch.db` file to the mounted disk
2. Restart the web service

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Path to SQLite database file | `/var/data/kitch.db` |
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | Session signing secret | `abc123...` |
| `VITE_APP_ID` | Manus OAuth application ID | `your-app-id` |
| `OAUTH_SERVER_URL` | Manus OAuth server URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth portal URL | `https://oauth.manus.im` |

## Monitoring and Logs

### View Application Logs

1. Go to your Render service dashboard
2. Click the "Logs" tab
3. Monitor real-time application output

### Common Issues

#### Database Connection Errors

If you see database connection errors:

1. Verify the disk is mounted at `/var/data`
2. Check that `DATABASE_URL` environment variable is set correctly
3. Ensure the disk has sufficient space

#### Build Failures

If the build fails:

1. Check the build logs for error messages
2. Ensure all dependencies are listed in `package.json`
3. Verify Node version compatibility (Node 18+ recommended)

#### Cold Start Issues

Render may put your service to sleep if unused. To prevent this:

1. Upgrade to a paid plan
2. Or set up a monitoring service to ping your app regularly

## Performance Optimization

### For Production Use

1. **Enable Caching**: Configure browser caching headers in your Express server
2. **Use CDN**: Consider adding Cloudflare or similar for static assets
3. **Database Optimization**: Monitor query performance and add indexes as needed
4. **Scaling**: If you outgrow free tier, upgrade to paid plans with auto-scaling

### SQLite Limitations

SQLite is suitable for:
- Small to medium-sized applications
- Single-region deployments
- Development and staging environments

For larger deployments, consider migrating to:
- PostgreSQL (available on Render)
- MySQL/MariaDB
- MongoDB

## Troubleshooting

### Application Won't Start

1. Check logs for error messages
2. Verify all environment variables are set
3. Ensure disk is properly mounted
4. Check Node version compatibility

### Database Locked Errors

SQLite can have concurrency issues. Solutions:

1. Ensure only one instance is running
2. Use WAL mode: Add `?mode=wal` to DATABASE_URL
3. Consider upgrading to PostgreSQL for high-concurrency scenarios

### Disk Space Issues

1. Monitor disk usage in Render dashboard
2. Clean up old data if necessary
3. Upgrade disk size if needed

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## Support

For deployment issues:

1. Check Render's status page
2. Review application logs
3. Consult the Render documentation
4. Contact Render support for infrastructure issues

---

**Last Updated**: May 2026
**Kitch Version**: 1.0.0
