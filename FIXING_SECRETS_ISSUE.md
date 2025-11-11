# Fixing GitHub Secrets Issue

## Problem
GitHub is masking the FIREBASE_SERVICE_ACCOUNT secret as `***` which breaks JSON parsing.

## Root Cause
When you copy-pasted the JSON into GitHub secrets, it might have:
1. Extra spaces or newlines at the beginning
2. Been formatted across multiple lines (needs to be single line)
3. Special characters that weren't escaped properly

## Solution

### Step 1: Re-create the secret with proper formatting

1. Go to: https://github.com/theemubin/DharamshalaLearning/settings/secrets/actions

2. **Delete** the existing `FIREBASE_SERVICE_ACCOUNT` secret

3. **Create a new one** with this exact value (already formatted on one line):

Open the file: `/Users/mubinmac/Documents/Codespace/Campus Learning Dashboard/GITHUB_SECRETS_TO_ADD.md`

Copy the **entire JSON** for `FIREBASE_SERVICE_ACCOUNT` - it should be all on ONE line without any line breaks.

### Step 2: Verify other secrets

Make sure all 4 secrets are set:
- ✅ FIREBASE_SERVICE_ACCOUNT (the one you just fixed)
- ✅ GOOGLE_SERVICE_ACCOUNT  
- ✅ GOOGLE_SHEETS_ID
- ✅ DISCORD_WEBHOOK_URL

### Step 3: Test Discord first

Before testing the full sync, let's test Discord:

1. Go to: https://github.com/theemubin/DharamshalaLearning/actions
2. Click **"Test Discord Notification"** (new workflow)
3. Click **"Run workflow"**
4. Check your Discord channel for a "Hello World" message

If Discord works, then we know:
- ✅ Secrets are configured correctly
- ✅ Webhook URL is valid
- ✅ Discord integration is ready

### Step 4: Test full sync

After Discord test succeeds:
1. Make sure Google Sheet is shared with: `sheets-sync-service@dharamshalacampus.iam.gserviceaccount.com`
2. Run the **"Sync Data to Google Sheets"** workflow
3. Check logs for success

---

## Quick Test Locally

You can also test the secrets work by running locally:

```bash
cd scripts
export FIREBASE_SERVICE_ACCOUNT='<paste the JSON here>'
node init-metadata.js
```

If it works locally, the JSON is correct - just needs to be copied to GitHub properly.
