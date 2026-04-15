# CI/CD Setup Guide

This guide explains how to set up CI/CD for the E-commerce Food Website using GitHub Actions and Heroku.

## 📋 What the CI/CD Pipeline Does

### On Every Push:
1. **Backend Tests** - Run tests and linting on backend code
2. **Frontend Build** - Build React app and check for errors
3. **Deploy** (only on `main` branch) - Automatically deploy to production

## 🚀 Setup Steps

### Step 1: Create Heroku App

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create backend app
heroku create ecommerce-food-api

# Create database add-on (free tier)
heroku addons:create cleardb:ignite --app ecommerce-food-api

# View database URL
heroku config:get CLEARDB_DATABASE_URL --app ecommerce-food-api
```

### Step 2: Set Heroku Environment Variables

```bash
heroku config:set \
  JWT_SECRET="your_secure_jwt_secret" \
  GEMINI_API_KEY="your_gemini_key" \
  VNP_TMN_CODE="your_vnpay_code" \
  VNP_HASH_SECRET="your_vnpay_secret" \
  EMAIL_USER="your_email@gmail.com" \
  EMAIL_PASS="your_app_password" \
  NODE_ENV="production" \
  --app ecommerce-food-api
```

### Step 3: Get Heroku API Key

1. Go to https://dashboard.heroku.com/account
2. Scroll to "API Key"
3. Click "Reveal"
4. Copy the API key

### Step 4: Create GitHub Secrets

Go to your GitHub repository:
1. Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `HEROKU_API_KEY` | Your Heroku API key from Step 3 |
| `HEROKU_APP_NAME` | `ecommerce-food-api` |
| `VERCEL_TOKEN` | (Optional) For frontend deployment |
| `GEMINI_API_KEY` | Your Google Gemini API key |

### Step 5: Configure Database Connection String

Heroku provides `CLEARDB_DATABASE_URL`, but you need to parse it in your backend:

**Example URL:** `mysql://username:password@host/dbname?reconnect=true`

Update your `backend/config/mysql.js`:

```javascript
let config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ecommerce_db'
};

// Parse CLEARDB_DATABASE_URL if provided (Heroku)
if (process.env.CLEARDB_DATABASE_URL) {
  const url = new URL(process.env.CLEARDB_DATABASE_URL);
  config = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

module.exports = mysql.createPool(config);
```

### Step 6: Deploy Database Schema to Heroku

```bash
# Get Heroku MySQL credentials
MYSQL_URL=$(heroku config:get CLEARDB_DATABASE_URL --app ecommerce-food-api)

# Import database schema
mysql --protocol=TCP -u $USERNAME -p$PASSWORD -h $HOST $DATABASE < ecommerce_db.sql
```

Or use phpMyAdmin to import `ecommerce_db.sql`.

## 📝 Using the Workflow

### Automatic Deployment
- Push to `main` branch → Tests run → Deploy to Heroku (if tests pass)
- Push to `develop` branch → Tests run (no deployment)

### Manual Workflow Trigger
Go to GitHub → Actions → CI/CD Pipeline → "Run workflow" → Select branch

### Monitoring Deployments
1. GitHub → Actions tab - View workflow runs
2. Heroku Dashboard - View app activity and logs
3. Terminal: `heroku logs --app ecommerce-food-api --tail`

## 🧪 Adding Tests

### Backend Tests (Jest)

1. Install Jest:
```bash
cd backend
npm install --save-dev jest
```

2. Create `backend/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['controllers/**/*.js', 'services/**/*.js'],
};
```

3. Update `backend/package.json`:
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

4. Create test files: `backend/__tests__/auth.test.js`, etc.

### Frontend Tests (Vitest)

1. Install Vitest:
```bash
cd frontend
npm install --save-dev vitest
```

2. Update `frontend/package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## 🔐 Environment Variable Management

### For Production (Heroku)
Set in Heroku dashboard or CLI (shown above)

### For Local Development
Create `.env` file in `backend/` directory (use `.env.example` as template)

### For Testing
Environment variables are injected in the GitHub Actions workflow

## 📊 Monitoring & Logs

### View Heroku Logs
```bash
# Real-time logs
heroku logs --app ecommerce-food-api --tail

# Last 100 lines
heroku logs --app ecommerce-food-api -n 100
```

### View GitHub Actions Logs
1. Go to GitHub repository
2. Click "Actions" tab
3. Click the workflow run to see detailed logs

## 🚨 Troubleshooting

### Deployment Fails with "Cannot find module"
- Run `npm install` in both `backend/` and `frontend/`
- Check `package-lock.json` is committed

### Database Connection Error
- Verify `CLEARDB_DATABASE_URL` environment variable
- Check database schema is imported
- Verify credentials in Heroku config

### Heroku App Won't Start
- Check logs: `heroku logs --app ecommerce-food-api --tail`
- Verify all environment variables are set
- Check `Procfile` is in root directory

### Frontend Build Fails
- Check all dependencies in `package-lock.json`
- Verify environment variables for build (like API URL)
- Test locally: `npm run build`

## 🔄 Rollback Deployment

If deployment has issues:

```bash
# View previous releases
heroku releases --app ecommerce-food-api

# Rollback to previous version
heroku releases:rollback v2 --app ecommerce-food-api
```

## 📈 Next Steps

1. Add unit tests for critical features
2. Set up staging environment on Heroku
3. Configure domain name (custom domain)
4. Set up monitoring and alerting (e.g., Sentry, New Relic)
5. Implement database backups
6. Set up automated security scanning

## 🎯 CI/CD Best Practices

✅ Always commit `package-lock.json`
✅ Use environment variables for secrets
✅ Write tests for new features
✅ Keep deployments quick
✅ Monitor production logs
✅ Use feature branches before main
✅ Review code before merging to main
✅ Tag releases with version numbers

---

For help: https://devcenter.heroku.com/articles/github-integration
