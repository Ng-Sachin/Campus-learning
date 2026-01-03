# Timezone Bugs Found - Critical Issues

## Overview
After analyzing the codebase for timezone-related bugs similar to the attendance scheduler issue, I found **5 critical bugs** that need to be fixed to ensure consistent behavior across all users.

---

## 🔴 Bug #1: Leave Scheduler - Midnight Check Uses Local Timezone

**Location:** [src/services/leaveScheduler.ts](src/services/leaveScheduler.ts#L57-L73)

**Problem:**
```typescript
private static scheduleMidnightCheck() {
  const now = new Date();
  const tonight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Next day
    0, 0, 0 // Midnight
  );
  const msUntilMidnight = tonight.getTime() - now.getTime();
}
```

**Impact:**
- Leave activations/expirations happen at different times for different users
- A user in UTC+5:30 will trigger leave checks at 12:00 AM IST
- A user in UTC-8 will trigger at 12:00 AM PST (which is 1:30 PM IST!)
- Leaves should activate/expire at the same IST midnight for all users

**Example:**
- Student A (Mumbai, IST): Leave expires at 12:00 AM IST ✓
- Student B (USA, PST): Leave expires at 12:00 AM PST = 1:30 PM IST ✗

**Severity:** HIGH - Causes inconsistent leave management across different timezones

---

## 🔴 Bug #2: Review Date Utils - Week Start Calculation Uses Local Timezone

**Location:** [src/utils/reviewDateUtils.ts](src/utils/reviewDateUtils.ts#L12-L25)

**Problem:**
```typescript
export const getCurrentWeekStart = (): Date => {
  const now = new Date();  // ⚠️ Uses local timezone
  const dayOfWeek = now.getDay(); // Sunday=0, Monday=1, etc.
  
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  return weekStart;
};
```

**Impact:**
- Review deadlines calculated differently for users in different timezones
- On Sunday 11:00 PM PST (Monday 12:30 PM IST), a PST user sees "due today" (Monday)
- But it's already Monday in IST, so they should see "overdue"
- Reviews may be submitted to wrong week

**Example Scenario:**
```
Current Time: Sunday 11:30 PM PST = Monday 12:00 PM IST

User in PST: Thinks it's Sunday, submits for "current week" (Sunday)
User in IST: Knows it's Monday, submits for "current week" (Monday)
Result: Same review submitted to different weeks!
```

**Severity:** CRITICAL - Breaks review deadline enforcement

---

## 🔴 Bug #3: Goal Setting - Today's Goal Uses Local Timezone

**Location:** [src/components/Student/GoalSetting.tsx](src/components/Student/GoalSetting.tsx#L175-L193)

**Problem:**
```typescript
// Get today's goal - look for goals created today
const today = new Date();  // ⚠️ Uses local timezone
const startOfDay = new Date(today);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(today);
endOfDay.setHours(23, 59, 59, 999);

const todaysGoals = await FirestoreService.getWhere<DailyGoal>(
  COLLECTIONS.DAILY_GOALS,
  'student_id',
  '==',
  userData.id
);

// Filter for today's goals
const goalData = todaysGoals.find(goal => {
  const goalDate = goal.created_at instanceof Date ? goal.created_at : new Date(goal.created_at);
  return goalDate >= startOfDay && goalDate <= endOfDay;
}) || null;
```

**Impact:**
- "Today's goal" is different for different users
- At 11:30 PM PST (12:00 PM IST next day):
  - PST user: Still seeing today's goal (correct for their timezone)
  - IST user: Should see next day's goal (it's past midnight IST)
- Daily goals should be based on IST calendar day

**Example:**
```
Current: Sunday 11:00 PM PST = Monday 11:30 AM IST

PST User: Sees Sunday's goal
IST User: Sees Monday's goal (correct)

But goal approval/attendance should be consistent based on IST date!
```

**Severity:** HIGH - Affects attendance tracking accuracy

---

## 🔴 Bug #4: Calendar View - Event Comparison Uses Local Timezone

**Location:** [src/components/PairProgramming/CalendarView.tsx](src/components/PairProgramming/CalendarView.tsx#L73-L77)

**Problem:**
```typescript
const getEventsForDate = (date: Date) => {
  return events.filter(event => {
    if (!event.start_date) return false;
    const eventDate = new Date(event.start_date);
    return eventDate.toDateString() === date.toDateString();  // ⚠️ Local timezone
  });
};
```

**Impact:**
- Pair programming sessions scheduled for "Monday 2:00 PM IST" appear on:
  - Monday for IST users ✓
  - Sunday for PST users ✗ (because Monday 2:00 PM IST = Sunday 11:30 PM PST)
- Events appear on wrong calendar days for non-IST users

**Severity:** MEDIUM - Calendar display confusion but doesn't affect actual session timing

---

## 🔴 Bug #5: Attendance Stats - Date Filtering Uses Local Timezone

**Location:** [src/services/attendanceTrackingService.ts](src/services/attendanceTrackingService.ts#L49-L60)

**Problem:**
```typescript
static async getDailyStats(date: Date, campus?: string): Promise<DailyAttendanceStats> {
  // Get all active students
  const activeStudents = await this.getActiveStudents(campus);
  
  // Get approved goals for the date  ⚠️ Date is in local timezone
  const approvedGoals = await this.getApprovedGoalsForDate(
    activeStudents.map(s => s.id), 
    date  // This date needs to be IST
  );
}
```

**Impact:**
- Admin viewing attendance stats at 11:00 PM PST sees:
  - "Today's attendance" for PST Sunday
  - But IST users already moved to Monday
- Attendance reports for "same day" show different data for different admins
- Discord attendance reports sent to different timezones show inconsistent data

**Severity:** HIGH - Affects attendance reporting accuracy

---

## Solution: Use IST Timezone Consistently

All date/time operations should use the existing `src/utils/timezone.ts` utilities:

### Available Functions:
```typescript
import { 
  getISTDate,           // Get current date in IST
  getISTStartOfDay,     // Get start of IST day (00:00:00)
  getISTEndOfDay,       // Get end of IST day (23:59:59.999)
  formatISTDate,        // Format as YYYY-MM-DD in IST
  isTodayIST,          // Check if date is today in IST
  getISTHour,          // Get current hour in IST
  toISTDateString      // Convert any date to IST date string
} from '../utils/timezone';
```

---

## Recommended Fixes

### Fix #1: Leave Scheduler
```typescript
// BEFORE
private static scheduleMidnightCheck() {
  const now = new Date();
  const tonight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  );
  const msUntilMidnight = tonight.getTime() - now.getTime();
}

// AFTER
import { getISTDate, getISTStartOfDay } from '../utils/timezone';

private static scheduleMidnightCheck() {
  const nowIST = getISTDate();
  const tomorrowIST = new Date(nowIST);
  tomorrowIST.setDate(tomorrowIST.getDate() + 1);
  const midnightIST = getISTStartOfDay(tomorrowIST);
  const msUntilMidnight = midnightIST.getTime() - nowIST.getTime();
}
```

### Fix #2: Review Date Utils
```typescript
// BEFORE
export const getCurrentWeekStart = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // ...
};

// AFTER
import { getISTDate, getISTStartOfDay } from '../utils/timezone';

export const getCurrentWeekStart = (): Date => {
  const nowIST = getISTDate();
  const dayOfWeek = nowIST.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  
  const weekStart = new Date(nowIST);
  weekStart.setDate(nowIST.getDate() - daysSinceMonday);
  return getISTStartOfDay(weekStart);
};
```

### Fix #3: Goal Setting
```typescript
// BEFORE
const today = new Date();
const startOfDay = new Date(today);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(today);
endOfDay.setHours(23, 59, 59, 999);

// AFTER
import { getISTStartOfDay, getISTEndOfDay } from '../utils/timezone';

const startOfDay = getISTStartOfDay();
const endOfDay = getISTEndOfDay();
```

### Fix #4: Calendar View
```typescript
// BEFORE
const getEventsForDate = (date: Date) => {
  return events.filter(event => {
    if (!event.start_date) return false;
    const eventDate = new Date(event.start_date);
    return eventDate.toDateString() === date.toDateString();
  });
};

// AFTER
import { toISTDateString } from '../utils/timezone';

const getEventsForDate = (date: Date) => {
  return events.filter(event => {
    if (!event.start_date) return false;
    const eventDate = new Date(event.start_date);
    return toISTDateString(eventDate) === toISTDateString(date);
  });
};
```

### Fix #5: Attendance Stats
```typescript
// BEFORE
static async getDailyStats(date: Date, campus?: string): Promise<DailyAttendanceStats> {
  const approvedGoals = await this.getApprovedGoalsForDate(
    activeStudents.map(s => s.id), 
    date
  );
}

// AFTER
import { getISTStartOfDay, getISTEndOfDay } from '../utils/timezone';

static async getDailyStats(date: Date, campus?: string): Promise<DailyAttendanceStats> {
  // Ensure date is treated as IST
  const istDate = getISTStartOfDay(date);
  
  const approvedGoals = await this.getApprovedGoalsForDate(
    activeStudents.map(s => s.id), 
    istDate
  );
}
```

---

## Testing Checklist

After fixes, test with different system timezones:

- [ ] Set system to IST (UTC+5:30) - Test all features
- [ ] Set system to PST (UTC-8) - Test all features
- [ ] Set system to UTC - Test all features
- [ ] Verify leave activations happen at same IST time
- [ ] Verify review deadlines consistent across timezones
- [ ] Verify daily goals use IST calendar day
- [ ] Verify calendar events show on correct IST day
- [ ] Verify attendance stats match IST date

---

## Priority

1. **CRITICAL (Fix Immediately):** Bug #2 (Review Date Utils)
2. **HIGH (Fix Before Next Leave):** Bug #1 (Leave Scheduler), Bug #3 (Goal Setting), Bug #5 (Attendance Stats)
3. **MEDIUM (Fix Before Next Sprint):** Bug #4 (Calendar View)

---

## Related Documentation

- [TIMEZONE_GUIDE.md](TIMEZONE_GUIDE.md) - Comprehensive timezone implementation guide
- [ATTENDANCE_TRACKING_GUIDE.md](ATTENDANCE_TRACKING_GUIDE.md) - Attendance system documentation
- [src/utils/timezone.ts](src/utils/timezone.ts) - Timezone utility functions
