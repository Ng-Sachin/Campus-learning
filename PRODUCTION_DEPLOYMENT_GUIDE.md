# Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

1. ✅ Firebase project set up for production
2. ✅ All environment variables configured
3. ✅ Firebase CLI installed: `npm install -g firebase-tools`
4. ✅ Production Discord webhooks configured
5. ✅ Google OAuth credentials for production

## Environment Setup

### 1. Configure Production Environment Variables

Copy `.env.production` and fill in your production credentials:

```bash
cp .env.production .env.production.local
# Edit .env.production.local with your production values
```

**Required Variables:**
- `REACT_APP_FIREBASE_*` - Production Firebase config
- `REACT_APP_GOOGLE_*` - Production Google API credentials
- `REACT_APP_DISCORD_WEBHOOK_*` - Production Discord webhooks

### 2. Firestore Security Rules

Deploy security rules to production:

```bash
firebase use production  # Switch to production project
firebase deploy --only firestore:rules
```

### 3. Firestore Indexes

Deploy required indexes:

```bash
firebase deploy --only firestore:indexes
```

## Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

This will:
- ✅ Create an optimized production build
- ✅ Minify JavaScript and CSS
- ✅ Generate source maps for debugging
- ✅ Extract feature manifests
- ✅ Bundle and optimize assets

### Build Validation
```bash
# Check build size
npm run build
ls -lh build/static/js/*.js
ls -lh build/static/css/*.css

# Test production build locally
npx serve -s build
```

## Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# Login to Firebase
firebase login

# Select production project
firebase use production

# Deploy
npm run deploy:production
```

### Option 2: Manual Deployment

```bash
# Build for production
npm run build

# Deploy build folder to your hosting provider
# - Netlify: Drag & drop `build` folder
# - Vercel: `vercel --prod`
# - AWS S3: `aws s3 sync build/ s3://your-bucket`
```

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Application loads without errors
- [ ] Authentication works correctly
- [ ] All API calls are successful
- [ ] Firebase connection is established

### 2. Test Core Features
- [ ] User login/logout
- [ ] Student dashboard
- [ ] Mentor features
- [ ] Admin panel
- [ ] Discord notifications
- [ ] Google Calendar integration

### 3. Performance Check
- [ ] Lighthouse score > 90
- [ ] Time to First Byte (TTFB) < 200ms
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s

### 4. Security Verification
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] API keys not exposed in client
- [ ] CORS properly configured
- [ ] Firestore rules tested

## Environment Variables Configuration

### Firebase Hosting

Add to `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  }
}
```

### Netlify

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

## Monitoring & Maintenance

### Error Tracking
Consider integrating:
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **Firebase Crashlytics**: Crash reporting

### Analytics
- Firebase Analytics (already integrated)
- Google Analytics
- Custom event tracking

### Performance Monitoring
- Firebase Performance Monitoring
- Lighthouse CI
- WebPageTest

## Rollback Procedure

If issues occur in production:

```bash
# Firebase Hosting
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live

# Or redeploy previous version
git checkout <previous-commit>
npm run deploy:production
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Troubleshooting

### Build Fails
- Check Node.js version (>= 16)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Deployment Fails
- Verify Firebase CLI version: `firebase --version`
- Check Firebase project: `firebase projects:list`
- Verify authentication: `firebase login --reauth`

### Runtime Errors
- Check browser console for errors
- Verify environment variables are loaded
- Check Firebase quotas and limits
- Review Firestore security rules

## Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review Firebase console logs
3. Check application logs in browser DevTools
4. Contact system administrator

---

**Last Updated:** January 3, 2026
**Version:** 1.0.0
