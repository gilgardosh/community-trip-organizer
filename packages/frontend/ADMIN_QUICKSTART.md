# Admin Components Quick Reference

## 🎯 Component Overview

### UserRoleManagement

```
┌─────────────────────────────────────────┐
│  ניהול תפקידי משתמשים                   │
├─────────────────────────────────────────┤
│  🔍 Search: [חיפוש לפי שם או אימייל...] │
│  📋 Filter: [כל התפקידים ▼]              │
├─────────────────────────────────────────┤
│  👤 משתמש ראשון    | משפחה  | [שנה תפקיד]│
│  👤 מנהל טיול      | מנהל   | [שנה תפקיד]│
│  👤 סופר אדמין     | אדמין  | [שנה תפקיד]│
└─────────────────────────────────────────┘
```

### FamilyApprovalWorkflow

```
┌─────────────────────────────────────────┐
│  אישור משפחות              [3 ממתינות]  │
├─────────────────────────────────────────┤
│  ☑ משפחת כהן    | 4 חברים | [אשר] [דחה]│
│  ☐ משפחת לוי    | 3 חברים | [אשר] [דחה]│
│  ☐ משפחת מזרחי  | 5 חברים | [אשר] [דחה]│
├─────────────────────────────────────────┤
│  [✓ אשר 1 נבחרות]                       │
└─────────────────────────────────────────┘
```

### TripAdminAssignment

```
┌─────────────────────────────────────────┐
│  מנהלי טיול: טיול לגליל                │
│                      [+ שייך מנהלים]     │
├─────────────────────────────────────────┤
│  👤 דוד כהן                         [×] │
│  👤 שרה לוי                         [×] │
└─────────────────────────────────────────┘
```

### ActivityLogsViewer

```
┌─────────────────────────────────────────┐
│  לוג פעילות מערכת                       │
├─────────────────────────────────────────┤
│  🔍 [חיפוש...] [סוג ▼] [פעולה ▼]      │
├─────────────────────────────────────────┤
│  📅 01/01/24 | דוד | יצירה | טיול      │
│  📅 02/01/24 | שרה | אישור | משפחה     │
│  📅 03/01/24 | מנהל | עדכון | ציוד     │
└─────────────────────────────────────────┘
```

### SystemReporting

```
┌─────────────────────────────────────────┐
│  📊 סקירה כללית                         │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ משפחות   │ │ משתמשים  │ │ טיולים  ││
│  │   50     │ │   150    │ │   20    ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  📈 גידול משפחות:                       │
│  ינואר  ████████░░ 5                    │
│  פברואר ████░░░░░░ 3                    │
└─────────────────────────────────────────┘
```

### DataExport

```
┌─────────────────────────────────────────┐
│  ייצוא נתונים                           │
├─────────────────────────────────────────┤
│  סוג נתונים: [כל הנתונים ▼]            │
│  פורמט:      [JSON] [CSV]              │
├─────────────────────────────────────────┤
│  💾 [⬇ ייצא נתונים]                    │
├─────────────────────────────────────────┤
│  ⚠️ הנתונים כוללים מידע רגיש           │
└─────────────────────────────────────────┘
```

### FamilyDeactivationControls

```
┌─────────────────────────────────────────┐
│  בקרות משפחה: משפחת כהן                │
├─────────────────────────────────────────┤
│  סטטוס:   [פעיל]                       │
│  אישור:   [מאושר]                      │
├─────────────────────────────────────────┤
│  [השבת משפחה]                           │
│  ─────────────────────                  │
│  ⚠️ אזור מסוכן                         │
│  [🗑️ מחק משפחה לצמיתות]               │
└─────────────────────────────────────────┘
```

## 🎨 Color Coding

- 🟢 **Green/Primary**: Active, Approved, Success
- 🔴 **Red/Destructive**: Deactivated, Delete, Reject
- 🟡 **Yellow/Warning**: Pending, Warning Messages
- 🔵 **Blue/Secondary**: Trip Admins, Info
- ⚪ **Gray/Muted**: Disabled, Inactive

## 📱 Responsive Breakpoints

```
Mobile:  < 640px  - Single column, stacked
Tablet:  640-1024 - Two columns, adjusted spacing
Desktop: > 1024px - Full layout, all features
```

## ⌨️ Keyboard Shortcuts (Future)

```
Ctrl + K    - Search users/families
Ctrl + E    - Export data
Ctrl + L    - View logs
Esc         - Close dialogs
Enter       - Confirm actions
```

## 🎭 Component States

### Loading

```
┌─────────────────────────────────────────┐
│        ⏳ טוען נתונים...                │
└─────────────────────────────────────────┘
```

### Empty

```
┌─────────────────────────────────────────┐
│         📭                              │
│      לא נמצאו נתונים                   │
└─────────────────────────────────────────┘
```

### Error

```
┌─────────────────────────────────────────┐
│         ❌                              │
│      שגיאה בטעינת נתונים               │
│      [נסה שוב]                         │
└─────────────────────────────────────────┘
```

## 🔔 Notification Types

### Success

```
┌─────────────────────────┐
│ ✅ הצלחה               │
│ הפעולה בוצעה בהצלחה    │
└─────────────────────────┘
```

### Error

```
┌─────────────────────────┐
│ ❌ שגיאה               │
│ הפעולה נכשלה           │
└─────────────────────────┘
```

### Warning

```
┌─────────────────────────┐
│ ⚠️ אזהרה               │
│ פעולה זו בלתי הפיכה    │
└─────────────────────────┘
```

## 🎯 User Flow Examples

### Approve a Family

```
1. Navigate to "משפחות" tab
2. Review family details
3. Click [אשר]
4. Confirm in dialog
5. ✅ Success notification
6. Family moves to active list
```

### Change User Role

```
1. Navigate to "משתמשים" tab
2. Search for user
3. Click [שנה תפקיד]
4. Select new role
5. Click [עדכן תפקיד]
6. ✅ Success notification
```

### Export Data

```
1. Navigate to "ייצוא" tab
2. Select data type
3. Select format (JSON/CSV)
4. Click [ייצא נתונים]
5. File downloads automatically
6. ✅ Success notification
```

## 🔐 Permission Matrix

| Action             | SUPER_ADMIN | TRIP_ADMIN | FAMILY |
| ------------------ | ----------- | ---------- | ------ |
| View Users         | ✅          | ❌         | ❌     |
| Update Roles       | ✅          | ❌         | ❌     |
| Approve Families   | ✅          | ❌         | ❌     |
| Assign Trip Admins | ✅          | ❌         | ❌     |
| View Logs          | ✅          | ❌         | ❌     |
| Export Data        | ✅          | ❌         | ❌     |
| View Reports       | ✅          | ✅         | ❌     |
| Delete Families    | ✅          | ❌         | ❌     |

## 📚 Component Props Reference

### TripAdminAssignment

```typescript
interface Props {
  trip: Trip; // Trip object
  onUpdate: () => void; // Callback after update
}
```

### FamilyDeactivationControls

```typescript
interface Props {
  family: Family; // Family object
  onUpdate: () => void; // Callback after update
}
```

## 🎨 Theme Support

All components support:

- ☀️ Light mode
- 🌙 Dark mode
- 🎨 Custom theme colors
- 📏 Responsive spacing
- 🔤 Hebrew fonts (Rubik, Heebo)

---

**Quick Access:** `/super-admin/enhanced`

**Documentation:** `components/admin/README.md`

**Tests:** `__tests__/admin/`
