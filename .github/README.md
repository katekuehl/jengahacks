# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. CI (`ci.yml`)

Main continuous integration workflow that runs on every push and pull request.

**Jobs:**
- **Lint**: Runs ESLint to check code quality
- **Test**: Runs unit and integration tests with Vitest, generates coverage reports
- **Build**: Builds the project to ensure it compiles successfully
- **E2E**: Runs end-to-end tests with Playwright
- **Visual Regression**: Runs visual regression tests (only on pull requests)

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests targeting `main`, `master`, or `develop` branches

### 2. Deploy (`deploy.yml`)

Deployment workflow for production releases.

**Triggers:**
- Push to `main` or `master` branch
- Tags starting with `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**Note:** You need to configure deployment steps based on your hosting platform. Examples are provided in the workflow file for:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### 3. Dependency Review (`dependency-review.yml`)

Automatically reviews dependencies in pull requests for security vulnerabilities.

**Triggers:**
- Pull requests targeting `main`, `master`, or `develop` branches

### 4. CodeQL Analysis (`codeql.yml`)

Automated security analysis using GitHub's CodeQL.

**Triggers:**
- Push to `main` or `master` branch
- Pull requests targeting `main` or `master` branch
- Weekly schedule (Mondays at 00:00 UTC)

## Dependabot

Dependabot is configured to automatically:
- Check for npm package updates weekly (Mondays at 09:00)
- Check for GitHub Actions updates weekly (Mondays at 09:00)
- Create pull requests for updates
- Limit to 10 npm PRs and 5 GitHub Actions PRs at a time

## Required Secrets

For the deploy workflow, you'll need to set up the following secrets in your GitHub repository:

### Required for all deployments:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key (if using)

### Platform-specific secrets:

**Vercel:**
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**Netlify:**
- `NETLIFY_AUTH_TOKEN` - Netlify authentication token
- `NETLIFY_SITE_ID` - Netlify site ID

**AWS:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID (if using)

## Setting up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

## Workflow Status Badge

Add this to your README.md to show CI status:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

## Customization

### Adjusting Test Timeouts

If tests are timing out, you can adjust timeouts in:
- `vite.config.ts` - For Vitest tests
- `playwright.config.ts` - For Playwright E2E tests

### Adding More Browsers to E2E Tests

Edit `playwright.config.ts` to uncomment additional browser configurations:
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

### Skipping Workflows

To skip CI on a commit, add `[skip ci]` or `[ci skip]` to your commit message.

## Troubleshooting

### Tests Failing in CI

1. Check if environment variables are set correctly
2. Ensure all dependencies are listed in `package.json`
3. Check test timeouts - CI may be slower than local development

### Build Failures

1. Verify all environment variables are available
2. Check for TypeScript errors: `npm run build` locally
3. Ensure all dependencies are installed: `npm ci`

### E2E Test Failures

1. Check Playwright report artifacts uploaded by the workflow
2. Verify the dev server starts correctly (check logs)
3. Ensure test selectors are stable and not flaky

