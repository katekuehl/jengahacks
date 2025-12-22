# Staging Environment - Quick Start

Quick reference for staging environment setup and usage.

## 🚀 Quick Setup

### 1. Run Setup Script

```bash
./scripts/setup-staging.sh
```

This interactive script will guide you through:
- Creating `.env.staging` file
- Linking to Supabase staging project
- Applying migrations
- Deploying Edge Functions
- Setting secrets

### 2. Manual Setup (Alternative)

```bash
# 1. Create staging Supabase project
# Go to https://app.supabase.com → New Project

# 2. Link to staging project
supabase link --project-ref <staging-project-ref>

# 3. Apply migrations
supabase db push --project-ref <staging-project-ref>

# 4. Deploy Edge Functions
supabase functions deploy register-with-ip --project-ref <staging-project-ref>
supabase functions deploy verify-recaptcha --project-ref <staging-project-ref>
supabase functions deploy get-resume-url --project-ref <staging-project-ref>

# 5. Set secrets
supabase secrets set RECAPTCHA_SECRET_KEY=<key> --project-ref <staging-project-ref>
supabase secrets set ADMIN_PASSWORD=<password> --project-ref <staging-project-ref>
```

## 📋 GitHub Secrets Required

Set these in Repository Settings → Secrets and variables → Actions:

**Required:**
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_PROJECT_REF`
- `STAGING_RECAPTCHA_SITE_KEY` (use test key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`)
- `STAGING_RECAPTCHA_SECRET_KEY` (use test key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`)

**Optional:**
- `STAGING_SENTRY_DSN`
- `STAGING_GA_MEASUREMENT_ID`
- `STAGING_ADMIN_PASSWORD`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_STAGING_PROJECT_ID`
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_STAGING_SITE_ID`
- `SUPABASE_ACCESS_TOKEN` (for CI/CD)

## 🔄 Deployment Workflow

### Automatic Deployment

Push to `develop` branch → Auto-deploys to staging

```bash
git checkout develop
git pull origin develop
# Make changes
git add .
git commit -m "feat: new feature"
git push origin develop
# Staging deploys automatically via GitHub Actions
```

### Manual Deployment

```bash
# Build with staging environment
cp .env.staging .env
npm run build

# Deploy to your hosting platform
# Vercel: vercel --prod=false
# Netlify: netlify deploy --dir=dist
```

## 🧪 Testing on Staging

### Test Registration Flow

1. Go to staging URL
2. Fill out registration form
3. Use test email: `test@example.com`
4. CAPTCHA will always pass (test keys)
5. Verify data appears in staging database

### Test Admin Dashboard

1. Go to `https://staging.jengahacks.com/admin`
2. Use staging admin password
3. Verify registrations are visible

### Run Tests Against Staging

```bash
# Set staging environment variables
export VITE_SUPABASE_URL=https://<staging-project>.supabase.co
export VITE_SUPABASE_ANON_KEY=<staging-anon-key>

# Run tests
npm run test:run
npm run test:e2e
```

## 🔍 Verify Staging

Checklist after deployment:

- [ ] Homepage loads
- [ ] Registration form works
- [ ] CAPTCHA passes (test keys)
- [ ] File upload works
- [ ] Database writes succeed
- [ ] Admin dashboard accessible
- [ ] Health check works: `/health`
- [ ] All routes accessible

## 🚨 Common Issues

### Deployment Fails

**Problem:** GitHub Actions workflow fails

**Solution:**
1. Check workflow logs in GitHub Actions tab
2. Verify all required secrets are set
3. Check Supabase project is accessible
4. Verify build succeeds locally with staging vars

### Database Migrations Fail

**Problem:** Migrations don't apply to staging

**Solution:**
```bash
# Check current migration status
supabase migration list --project-ref <staging-ref>

# Reset and re-apply (WARNING: Deletes data)
supabase db reset --project-ref <staging-ref>
supabase db push --project-ref <staging-ref>
```

### Edge Functions Not Working

**Problem:** Functions return errors

**Solution:**
1. Check function logs: `supabase functions logs <function-name> --project-ref <staging-ref>`
2. Verify secrets are set: `supabase secrets list --project-ref <staging-ref>`
3. Redeploy functions: `supabase functions deploy <function-name> --project-ref <staging-ref>`

## 📚 Full Documentation

For detailed instructions, see [STAGING_SETUP.md](./STAGING_SETUP.md)

## 🔗 Useful Links

- **Staging URL:** `https://staging.jengahacks.com` (or your staging URL)
- **Health Check:** `https://staging.jengahacks.com/health`
- **Admin:** `https://staging.jengahacks.com/admin`
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub Actions:** Repository → Actions tab

