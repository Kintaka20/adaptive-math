# Implementation Plan: Enhanced Content Editor Features ✅ COMPLETED

## Objective
Enhance content editors with quiz import from Bank Soal, fix edit buttons, add LaTeX toolbar to edit pages, and create unified Admin content editor.

---

## Changes Completed

### 1. ContentEditorPage - Quiz Import ✅
**File**: [ContentEditorPage.tsx](file:///d:/project-ta/apps/web/src/pages/teacher/ContentEditorPage.tsx)

**Features Added**:
- Quiz source selector: "Buat Manual" / "Ambil dari Bank Soal"
- Bank Soal modal with search and filter (chapter, difficulty)
- Question selection checkboxes
- Import selected questions to quiz

---

### 2. KelasDetailPage - Edit Button Fix ✅
**File**: [KelasDetailPage.tsx](file:///d:/project-ta/apps/web/src/pages/teacher/KelasDetailPage.tsx)

**Change**: Combined edit + preview into single `edit_document` button that navigates to review page

---

### 3. Admin Content Editor ✅
**File**: [AdminContentEditorPage.tsx](file:///d:/project-ta/apps/web/src/pages/admin/AdminContentEditorPage.tsx)
**Route**: `/admin/master-data/content/create`

**Features**:
- Material/Quiz type selector
- Quiz import from Bank Soal (same as teacher)
- Grade + Chapter selectors
- Full LaTeX toolbar

---

### 4. LaTeX Toolbar for Edit Pages ✅
**Files Updated**:
- [MaterialEditorPage.tsx](file:///d:/project-ta/apps/web/src/pages/admin/MaterialEditorPage.tsx)
- [QuizEditorPage.tsx](file:///d:/project-ta/apps/web/src/pages/admin/QuizEditorPage.tsx)

**Toolbar buttons**: `[Σ] [√] [∫] [π] [frac] [x²] [xₙ] [≤] [≥] [∞]`

---

## Implementation Order

1. [x] Add quiz import option to ContentEditorPage
2. [x] Fix KelasDetailPage edit button
3. [x] Add LaTeX toolbar to MaterialEditorPage
4. [x] Add LaTeX toolbar to QuizEditorPage
5. [x] Create AdminContentEditorPage with unified form
6. [x] Update routes in App.tsx

---

## Verification ✅
- [x] TypeScript: `npx tsc --noEmit` - PASS
- [x] Quiz import works
- [x] Edit button navigates correctly
- [x] LaTeX toolbar inserts correctly
