# Phase 3: Academic Associate Admin UI

## Overview
Build the administrative interface for assigning students to Academic Associates (AAs). This phase establishes the foundation for the rolling queue system by:
1. Creating student-to-AA assignment mappings
2. Allowing admins to group students by house and phase
3. Storing assignments persistently in Firestore
4. Displaying assignment status and management options

**Estimated Time**: 2-3 hours  
**Status**: ⏳ READY TO START

## Context

### What is an Academic Associate?
Academic Associates are mentors who work with multiple students (unlike regular mentors who typically work with individual students). They:
- Handle group mentoring sessions
- Work with students from their assigned house/phase
- Participate in the rolling queue system
- Manage higher volume of students

### Current System State
After Phase 2 (UI Unification), we have:
- ✅ Unified booking form used by all entry points
- ✅ Auto-mentor selection from userData.mentor_id
- ✅ Calendar showing sessions with clickable details
- ✅ SessionDetailsModal for viewing session information

### Why Phase 3?
Phase 3 establishes the **assignment infrastructure** needed for Phase 4 (Rolling Queue). Without defined AA-student assignments, the queue system won't know which students belong to which queue.

## Requirements Breakdown

### 1. **Data Model**

#### Academic Associate Grouping
```typescript
interface AcademicAssociateAssignment {
  id: string;
  academic_associate_id: string;
  student_ids: string[];
  campus: string;
  house?: string;
  phase?: string;
  created_at: Date;
  updated_at: Date;
  created_by: string; // Admin who created it
  notes?: string;
}
```

#### Student to AA Mapping
```typescript
interface StudentAAMapping {
  student_id: string;
  academic_associate_id: string;
  campus: string;
  house?: string;
  phase?: string;
  assigned_at: Date;
  assigned_by: string;
}
```

### 2. **Admin UI Components**

#### Location
`src/components/Admin/CampusScheduleAdmin.tsx` → Add new section

#### Features
1. **Assignment Dashboard**
   - Display all current AA assignments
   - Show student count per AA
   - Filter by campus, house, phase
   - Search functionality

2. **Add/Edit Assignment Form**
   - Select Academic Associate
   - Multi-select students (by house + phase)
   - Filter students intelligently:
     - By campus (always)
     - By house (optional)
     - By phase (optional)
   - Bulk operations (add multiple students)

3. **Assignment Management**
   - View students assigned to each AA
   - Remove students from assignment
   - Reassign students to different AA
   - Edit assignment notes

4. **Validation**
   - Prevent duplicate assignments
   - Ensure AA-student relationships are consistent
   - Warn if removing students from queue

### 3. **Service Layer**

#### AcademicAssociateService (new service)

Methods to implement:
```typescript
class AcademicAssociateService {
  // Create assignment
  static async createAssignment(assignment: Omit<AcademicAssociateAssignment, 'id' | 'created_at' | 'updated_at'>): Promise<string>
  
  // Get assignments
  static async getAssignments(filters?: { campus?: string; house?: string; phase?: string }): Promise<AcademicAssociateAssignment[]>
  
  // Get AA's students
  static async getAssignedStudents(academicAssociateId: string): Promise<StudentAAMapping[]>
  
  // Get student's AA (if any)
  static async getStudentAcademicAssociate(studentId: string): Promise<AcademicAssociateAssignment | null>
  
  // Add student to AA
  static async addStudentToAssignment(studentId: string, academicAssociateId: string): Promise<void>
  
  // Remove student from AA
  static async removeStudentFromAssignment(studentId: string, academicAssociateId: string): Promise<void>
  
  // Update assignment
  static async updateAssignment(id: string, updates: Partial<AcademicAssociateAssignment>): Promise<void>
  
  // Delete assignment
  static async deleteAssignment(id: string): Promise<void>
}
```

### 4. **UI Flow**

#### Admin Workflow

```
Admin Panel → Campus Schedule Tab
    ↓
NEW: Academic Associates Section
    ├─ View Assignments (table)
    │  ├─ AA Name | Students Count | House | Phase | Actions
    │  └─ Edit/Delete buttons
    ├─ Add New Assignment (button)
    │  ├─ Select AA (dropdown)
    │  ├─ Filter by campus (auto-selected)
    │  ├─ Filter by house (optional checkbox)
    │  ├─ Filter by phase (optional checkbox)
    │  ├─ Student list (shows matching students)
    │  ├─ Multi-select students
    │  └─ Save button
    └─ Bulk Management
       ├─ Reassign student
       ├─ Remove student
       └─ View queue status
```

#### Data Flow

```
Admin selects:
  - Academic Associate
  - Campus (from context)
  - House (optional)
  - Phase (optional)
    ↓
Fetch filtered students from Firestore
    ↓
Display student list with checkboxes
    ↓
Admin selects students + clicks Save
    ↓
Create StudentAAMapping for each (student_id, aa_id)
Create/Update AcademicAssociateAssignment
    ↓
Store in Firestore
    ↓
Show success message
```

## Implementation Plan

### Step 1: Create Data Models
- [ ] Add TypeScript interfaces to `src/types/index.ts`
- [ ] Document StudentAAMapping structure
- [ ] Document AcademicAssociateAssignment structure

### Step 2: Create AcademicAssociateService
- [ ] Create `src/services/academicAssociateService.ts`
- [ ] Implement all CRUD operations
- [ ] Add Firestore collection: `academic_associate_assignments`
- [ ] Add Firestore subcollection: `assignments/{id}/student_mappings`
- [ ] Error handling and validation
- [ ] Add logging for debugging

### Step 3: Extend CampusScheduleAdmin
- [ ] Add new tab or section for "Academic Associates"
- [ ] Create AssignmentList component
- [ ] Create AssignmentForm component
- [ ] Create StudentSelector component
- [ ] Add state management for assignments

### Step 4: Build UI Components

#### AssignmentDashboard
```tsx
interface AssignmentDashboardProps {
  campus: string;
}

- Displays all assignments for campus
- Table view: AA | Student Count | House | Phase | Actions
- Pagination for large lists
- Refresh button
- Export/Import options (future)
```

#### AssignmentForm
```tsx
interface AssignmentFormProps {
  onSave: (assignment: AcademicAssociateAssignment) => void;
  campus: string;
  editMode?: boolean;
  existingAssignment?: AcademicAssociateAssignment;
}

- AA selector dropdown
- House checkbox filter
- Phase checkbox filter
- Student multi-select
- Save/Cancel buttons
- Validation feedback
```

#### StudentSelector
```tsx
interface StudentSelectorProps {
  campus: string;
  house?: string;
  phase?: string;
  onSelect: (studentIds: string[]) => void;
  excludeIds?: string[]; // Already assigned students
}

- Fetches filtered students
- Checkboxes for selection
- Shows student name, ID, house, phase
- Select all / Clear all buttons
- Loading state
```

### Step 5: Firestore Setup
- [ ] Create collection: `academic_associate_assignments`
- [ ] Document structure:
```
academic_associate_assignments/
  {assignmentId}/
    - academic_associate_id: string
    - student_ids: string[]
    - campus: string
    - house: string
    - phase: string
    - created_at: Timestamp
    - updated_at: Timestamp
    - created_by: string
    - notes: string
    - student_mappings/
      {mappingId}/
        - student_id: string
        - assigned_at: Timestamp
```

### Step 6: Integration Points
- [ ] Update CampusScheduleAdmin.tsx
- [ ] Add new route/tab for Academic Associates
- [ ] Integrate with existing navigation
- [ ] Add permission checks (admin only)

### Step 7: Testing
- [ ] Create assignment ✅
- [ ] View assignments ✅
- [ ] Update assignment ✅
- [ ] Delete assignment ✅
- [ ] Add student to AA ✅
- [ ] Remove student from AA ✅
- [ ] Bulk operations ✅
- [ ] Filter by house/phase ✅
- [ ] Error handling ✅
- [ ] Permission validation ✅

## Success Criteria

✅ **Data Storage**
- Academic Associate assignments stored in Firestore
- Student-AA mappings retrievable
- Persistence across sessions

✅ **Admin UI**
- Assignments visible in dashboard
- Can create new assignments
- Can edit/delete assignments
- Can manage student membership

✅ **Filtering**
- Filter by campus (auto)
- Filter by house (optional)
- Filter by phase (optional)
- Students filtered before display

✅ **User Experience**
- Clear, intuitive form
- Success/error feedback
- Loading states
- Bulk operations support

✅ **Integration**
- Accessible from admin panel
- Permission controls
- No conflicts with existing code
- Clean API for Phase 4

## Acceptance Checklist

- [ ] AcademicAssociateService created and tested
- [ ] Firestore collections created and indexed
- [ ] CampusScheduleAdmin extended with AA section
- [ ] AssignmentDashboard displays all assignments
- [ ] AssignmentForm can create/edit assignments
- [ ] StudentSelector filters by house/phase
- [ ] Assignments persist in Firestore
- [ ] Admin can view all AA-student relationships
- [ ] Error messages clear and helpful
- [ ] No TypeScript errors or warnings
- [ ] Build succeeds: `npm run build`
- [ ] All features tested manually

## Next Phase Connection

After Phase 3 completes:
- Phase 4 (Rolling Queue) can use `AcademicAssociateService` to:
  - Get all students for an AA
  - Track last paired timestamp
  - Auto-assign students from queue
  - Load balance across AAs

## Estimated Effort

| Component | Time |
|-----------|------|
| Data Models | 30 min |
| Service Layer | 45 min |
| UI Components | 60 min |
| Firestore Integration | 30 min |
| Testing & Refinement | 30 min |
| **Total** | **3 hours** |

---

**Ready to start?** → Begin with Step 1 (Create Data Models)  
**Questions?** → Review `00_START_HERE_ROLLING_QUEUE.md` for context  
**Previous Work** → See `PHASE_2_UI_UNIFICATION.md` for UI patterns  
