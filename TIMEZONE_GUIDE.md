# Timezone Configuration Guide

## Overview

The Campus Learning Dashboard uses **India Standard Time (IST)** as the standard timezone for all operations. This ensures consistent behavior across all campuses regardless of where the application is accessed from.

## Timezone: Asia/Kolkata (IST)

- **Timezone**: Asia/Kolkata
- **UTC Offset**: +05:30
- **No Daylight Saving Time**: IST does not observe DST

## Why Timezone Management Matters

### Problems Without Timezone Handling:
1. **Attendance Reports**: Would trigger at different times depending on user's location
2. **Date Comparisons**: "Today" would be different for users in different timezones
3. **Deadlines**: Review deadlines would be inconsistent
4. **Scheduling**: Automated tasks would run at wrong times

### Our Solution:
✅ All date/time operations use IST consistently
✅ Attendance reports sent at 10:00 AM IST regardless of user location
✅ Date comparisons done in IST
✅ Consistent "start of day" and "end of day" across all users

## Implementation

### Timezone Utilities (`src/utils/timezone.ts`)

```typescript
import { getISTDate, getISTStartOfDay, getISTEndOfDay } from '../utils/timezone';

// Get current time in IST
const now = getISTDate();

// Get start of day in IST (00:00:00.000)
const startOfDay = getISTStartOfDay();

// Get end of day in IST (23:59:59.999)
const endOfDay = getISTEndOfDay();
```

### Attendance Scheduler

The attendance scheduler now:
- ✅ Checks current time in IST
- ✅ Sends reports at 10:00 AM IST
- ✅ Works correctly regardless of server/user timezone

```typescript
// Before (WRONG - uses local time)
const hours = new Date().getHours(); // Could be any timezone!

// After (CORRECT - uses IST)
const istTime = getISTDate();
const hours = istTime.getHours(); // Always IST
```

### Attendance Tracking

Date comparisons now use IST:

```typescript
// Start of day in IST
const startOfDay = getISTStartOfDay(date);
startOfDay.setHours(0, 0, 0, 0);

// End of day in IST
const endOfDay = getISTEndOfDay(date);
endOfDay.setHours(23, 59, 59, 999);
```

## Usage Examples

### Check if date is today (in IST)
```typescript
import { isTodayIST } from '../utils/timezone';

if (isTodayIST(someDate)) {
  console.log('This is today in IST!');
}
```

### Format dates in IST
```typescript
import { formatISTDate, formatISTDateTime } from '../utils/timezone';

const date = new Date();
console.log(formatISTDate(date)); // "03/01/2026"
console.log(formatISTDateTime(date)); // "03/01/2026, 10:30:45 AM"
```

### Get current IST time
```typescript
import { getISTHour, getISTMinute } from '../utils/timezone';

const hour = getISTHour(); // 0-23 in IST
const minute = getISTMinute(); // 0-59 in IST
```

## Testing Timezone Handling

### Test from Different Timezones

1. **Change your system timezone** to test:
   - US Pacific Time (PST/PDT): UTC-8/-7
   - US Eastern Time (EST/EDT): UTC-5/-4
   - London (GMT/BST): UTC+0/+1
   - Tokyo (JST): UTC+9

2. **Verify**:
   - Attendance reports still sent at 10:00 AM IST
   - Date displays show IST time
   - "Today" is consistent across users

### Browser Console Test

```javascript
// Test current IST time
const istDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
console.log('Current IST time:', istDate);

// Test if scheduler would trigger
const ist = new Date(istDate);
console.log('IST Hour:', ist.getHours()); // Should match IST hour
console.log('Would trigger at 10 AM IST:', ist.getHours() === 10);
```

## Deployment Considerations

### Firebase Functions (If Used)

Firebase Functions run in UTC by default. Our IST utilities handle this automatically:

```typescript
// In Firebase Function
exports.scheduledFunction = functions.pubsub
  .schedule('0 10 * * *') // This would be UTC!
  .timeZone('Asia/Kolkata') // Set timezone here
  .onRun(async (context) => {
    // Now runs at 10 AM IST
  });
```

### Client-Side (React App)

The React app uses browser time but converts to IST:
- ✅ All date comparisons use IST utilities
- ✅ Scheduler converts browser time to IST
- ✅ UI displays can show IST or local (as needed)

### Server-Side (Node.js)

If running Node.js servers:
- Set `TZ=Asia/Kolkata` environment variable
- Or use timezone utilities for consistency

## Impact on Features

### ✅ Attendance System
- Reports sent at 10:00 AM IST daily
- Date filtering uses IST boundaries
- Consistent across all users

### ✅ Goal/Reflection Deadlines
- All deadlines in IST
- "Today's" goals same for everyone
- No timezone confusion

### ✅ Review System
- Weekly review deadline consistent
- Monday 9 PM IST for all users
- Reminders sent based on IST

### ✅ Leave Management
- Leave dates in IST
- Start/end dates consistent
- No overlap issues

## Common Pitfalls Avoided

❌ **Don't** use `new Date().getHours()` directly
✅ **Do** use `getISTHour()` instead

❌ **Don't** compare dates without timezone normalization
✅ **Do** use IST utilities for comparisons

❌ **Don't** assume server timezone matches user timezone
✅ **Do** explicitly convert to IST

## Troubleshooting

### Reports not sending at expected time?

Check:
1. Is scheduler using `getISTDate()`?
2. Is comparison using IST hour (`REPORT_HOUR_IST`)?
3. Check logs: "Scheduler check (IST): HH:MM"

### Dates showing wrong day?

Check:
1. Are you using `getISTDate()` for the date?
2. Is UI formatting using IST timezone?
3. Use `toISTDateString()` for consistent formatting

### Attendance not recording for correct day?

Check:
1. Date boundaries use `getISTStartOfDay()` / `getISTEndOfDay()`
2. Firestore queries use IST dates
3. Timestamp comparisons normalize to IST

## Future Enhancements

Potential improvements:
- [ ] Multi-timezone support for international campuses
- [ ] User preference for display timezone
- [ ] Timezone indicator in UI
- [ ] Admin timezone configuration
- [ ] Automatic timezone detection with IST override

---

**Last Updated**: January 3, 2026  
**Version**: 1.0.0  
**Standard Timezone**: Asia/Kolkata (IST, UTC+5:30)
