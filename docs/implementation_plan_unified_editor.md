# Implementation Plan: Unified Content Editor System

## Objective
Create a unified, consistent content editor experience across all Material/Quiz pages in Admin and Teacher sections.

---

## Issues to Fix

### 1. TambahSoalPage File Input Bug
- **Problem**: Image upload area missing `relative` positioning, causing file input to cover entire page
- **Fix**: Add `relative` class to upload container

### 2. Admin Bank Buttons Not Working
- **Problem**: "Tambah Soal Sistem" and "Tambah Materi Sistem" buttons link to non-existent pages
- **Fix**: Create new pages or link to existing editor pages

### 3. Teacher BankMateriPage Edit Not Working
- **Problem**: Edit links not functional
- **Fix**: Create or link to proper edit page

### 4. Missing LaTeX Preview
- **Problem**: TambahMateriPage needs live LaTeX preview
- **Fix**: Add LatexRenderer preview pane

---

## New Features

### Unified Editor Features (for all content types):
1. ✅ Publish button
2. ✅ Save as Draft button
3. ✅ Video URL input
4. ✅ File/Document upload
5. ✅ Image upload
6. ✅ LaTeX content with live preview
7. ✅ LatexRenderer for preview

---

## Proposed Changes

### 1. Fix TambahSoalPage Image Upload
**File**: `pages/teacher/TambahSoalPage.tsx`
- Add `relative` class to upload container

---

### 2. Create Unified ContentEditorPage
**Route**: `/guru/kelas/:id/content/create`
**Purpose**: Full-page content creation (replaces popup in KelasDetailPage)

**Features**:
- Type selector (Material/Quiz)
- Material form:
  - Title, Chapter, Duration
  - Markdown + LaTeX editor with preview
  - Video URL input
  - File upload
  - Save Draft / Publish

- Quiz form:
  - Title, Chapter, Difficulty
  - Questions editor (reuse from TambahSoalPage)
  - Save Draft / Publish

---

### 3. Update TambahMateriPage (Teacher)
**File**: `pages/teacher/TambahMateriPage.tsx`
- Add video URL input
- Add file/document upload
- Add live LaTeX preview using LatexRenderer
- Improve form layout

---

### 4. Create Admin TambahSoalPage
**Route**: `/admin/master-data/questions/create`
**Purpose**: Admin adds "System Questions"
- Reuse TambahSoalPage structure but for admin

---

### 5. Create Admin TambahMateriPage
**Route**: `/admin/master-data/materials/create`
**Purpose**: Admin adds "System Materials"
- Reuse TambahMateriPage structure but for admin

---

### 6. Update KelasDetailPage
**File**: `pages/teacher/KelasDetailPage.tsx`
- Replace popup modal with link to `/guru/kelas/:id/content/create`
- Pass chapterId in route

---

## File Changes Summary

| Action | File |
|--------|------|
| FIX | `TambahSoalPage.tsx` - Add `relative` to upload container |
| UPDATE | `TambahMateriPage.tsx` - Add video, file, LaTeX preview |
| CREATE | `ContentEditorPage.tsx` - Unified editor for teacher |
| CREATE | `AdminTambahSoalPage.tsx` - System question editor |
| CREATE | `AdminTambahMateriPage.tsx` - System material editor |
| UPDATE | `KelasDetailPage.tsx` - Link to full page editor |
| UPDATE | `App.tsx` - Add new routes |

---

## Route Updates

| Route | Page | Purpose |
|-------|------|---------|
| `/guru/kelas/:id/content/create` | ContentEditorPage | Create material/quiz |
| `/admin/master-data/questions/create` | AdminTambahSoalPage | Create system question |
| `/admin/master-data/materials/create` | AdminTambahMateriPage | Create system material |

---

## Implementation Order

1. [x] Fix TambahSoalPage file input bug
2. [x] Update TambahMateriPage with video/file/preview
3. [x] Create ContentEditorPage for teacher
4. [x] Create AdminTambahSoalPage
5. [x] Create AdminTambahMateriPage  
6. [x] Update KelasDetailPage to use full page editor
7. [x] Update App.tsx routes
8. [x] Update implementation plans

---

## Verification
- [x] TypeScript: `npx tsc --noEmit` ✅ PASS
- [x] All routes working
- [x] File upload working
- [x] LaTeX preview working
- [x] Save Draft / Publish working
