# Production Issues and Required Actions

## ⚠️ CRITICAL - Must Fix Before Production Deployment

### 1. Environment Variables Configuration

**Issue:** `.env.production` contains placeholder values  
**Risk:** App will fail to connect to Firebase and other services  
**Action Required:**

```bash
# Edit .env.production and replace ALL placeholder values with actual production credentials:
REACT_APP_FIREBASE_API_KEY=<your-actual-production-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<your-production-domain>
REACT_APP_FIREBASE_PROJECT_ID=<your-production-project-id>
# ... and all other variables
```

**Where to get credentials:**
- Firebase: https://console.firebase.google.com → Project Settings
- Google Calendar API: https://console.cloud.google.com → APIs & Services → Credentials
- Discord Webhooks: Discord Server → Channel Settings → Integrations → Webhooks

---

### 2. Console.log Statements in Production Code

**Issue:** Some files still use `console.log` instead of the logger utility  
**Risk:** Performance impact and logs visible in production browser console  
**Files affected:**
- `src/api/reminderEndpoints.ts`
- `src/utils/cache.ts`
- `src/contexts/AuthContext.tsx`
- `src/contexts/DataCacheContext.tsx`

**Action Required:** Replace console statements with logger

**Example fix:**
```typescript
// Before
console.log('[App] Starting...');
console.error('Error:', error);

// After
import { logger } from './utils/logger';
logger.info('[App] Starting...');
logger.error('Error:', error);
```

---

### 3. Environment Flag Not Set in Build

**Issue:** `REACT_APP_ENV` not automatically set during build  
**Risk:** Logging won't be disabled, health monitoring won't work correctly  
**Status:** ✅ FIXED in package.json

**Verification:**
```bash
# Build for production and verify
npm run build:production
# Check that REACT_APP_ENV=production is set
```

---

## 🟡 IMPORTANT - Should Fix Before Production

### 4. Firebase Security Rules Review

**Issue:** Need to verify Firestore security rules for production  
**Action Required:**
```bash
# Review firestore.rules file
# Test rules in Firebase Console
# Deploy rules:
firebase deploy --only firestore:rules
```

### 5. API Key Restrictions

**Issue:** Firebase API keys should be restricted in production  
**Action Required:**
1. Go to Google Cloud Console → Credentials
2. Restrict each API key by:
   - HTTP referrers (your production domain)
   - Specific APIs only
3. Document restrictions in your deployment notes

### 6. Discord Webhook Placeholders

**Issue:** Most campus-specific webhooks are placeholders  
**Risk:** Attendance notifications won't work for those campuses  
**Action Required:**
- Create Discord webhooks for each campus
- Update `.env.production` with actual webhook URLs
- Test notifications in production

---

## ✅ Already Fixed / No Issues

1. ✅ **Error Boundary** - Properly wraps app, will catch errors gracefully
2. ✅ **Logger Utility** - Will automatically disable debug logs in production
3. ✅ **Health Monitoring** - Will run every 5 minutes in production
4. ✅ **Security Headers** - Already configured in firebase.json
5. ✅ **Environment Isolation** - Separate .env files for dev/prod
6. ✅ **Build Scripts** - Updated to set REACT_APP_ENV correctly
7. ✅ **Import Paths** - All fixed (ErrorBoundary path corrected)
8. ✅ **CI/CD Pipeline** - GitHub Actions workflow ready

---

## 📋 Pre-Deployment Checklist

### Required Before Production Deploy:
- [ ] Fill `.env.production` with actual credentials
- [ ] Replace remaining console.log with logger
- [ ] Test production build locally: `npm run build:production && npx serve -s build`
- [ ] Verify Firebase connection works
- [ ] Test authentication flow
- [ ] Verify Discord notifications work
- [ ] Review and deploy Firestore security rules
- [ ] Restrict Firebase API keys in Google Cloud Console
- [ ] Set up error tracking (Sentry/LogRocket) - optional but recommended
- [ ] Configure domain in Firebase Hosting
- [ ] Test in staging environment first

### Deployment Command:
```bash
# After all checks pass:
npm run deploy:production
```

### Post-Deployment Verification:
- [ ] App loads without console errors
- [ ] Authentication works
- [ ] Database reads/writes work
- [ ] Discord notifications send
- [ ] Health monitoring active
- [ ] Error boundary catches errors properly
- [ ] Performance is acceptable (Lighthouse > 90)

---

## 🔧 Quick Fixes for Common Production Issues

### If app won't load:
1. Check browser console for errors
2. Verify `.env.production` credentials are correct
3. Check Firebase quotas not exceeded
4. Verify domain is authorized in Firebase Console

### If authentication fails:
1. Check Firebase API key restrictions
2. Verify authorized domains in Firebase Console
3. Check Google OAuth credentials
4. Review browser console for auth errors

### If notifications don't work:
1. Verify Discord webhook URLs are correct
2. Check webhook permissions in Discord
3. Test webhook manually with curl
4. Check browser console for errors

---

## 📞 Support

For production deployment issues:
1. Review this document first
2. Check [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
3. Check [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
4. Review Firebase Console logs
5. Contact development team

**Created:** January 3, 2026  
**Last Updated:** January 3, 2026
