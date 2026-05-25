# Implementation Plan: Bank Materi & Bank Soal Redesign

## Objective
1. Redesign admin AllMaterialsPage & AllQuestionsPage to match teacher BankSoalPage style
2. Admin tabs: "Semua", "Soal Sistem", "Soal Guru"
3. Add Bank Materi page for teacher (similar to Bank Soal)
4. Update all implementation plans

---

## Changes Overview

### 1. Admin AllQuestionsPage (Bank Soal Admin)
**Route**: `/admin/master-data/questions`

**Features**:
- Tabs: Semua Soal | Soal Sistem | Soal Guru
- Filters: Search, Bab, Kesulitan, View toggle (table/grid)
- Table columns: ID, Bab, Soal, Kesulitan, Rating, Pembuat, Aksi
- Grid view with cards
- "Tambah Soal" button → soal masuk ke "Soal Sistem"
- Star rating based on usage
- Action: Edit (link to QuizEditorPage or dedicated edit page)

**Tab Logic**:
```typescript
type TabType = 'all' | 'system' | 'teacher'
// 'all' = semua soal
// 'system' = source === 'system' (created by admin)
// 'teacher' = source === 'teacher' (created by guru)
```

---

### 2. Admin AllMaterialsPage (Bank Materi Admin)
**Route**: `/admin/master-data/materials`

**Features**:
- Tabs: Semua Materi | Materi Sistem | Materi Guru
- Filters: Search, Kelas, Status, View toggle
- Table columns: ID, Judul, Bab, Kelas, Durasi, Status, Pembuat, Aksi
- Grid view with cards
- "Tambah Materi" button → materi masuk ke "Materi Sistem"
- Action: Edit (link to MaterialEditorPage)

---

### 3. Teacher BankMateriPage (NEW)
**Route**: `/guru/bank-materi`

**Features**:
- Tabs: Semua Materi | Materi Saya
- Filters: Search, Kelas, Bab
- Table/Grid view
- Star rating based on usage
- "Tambah Materi" button (optional, if teachers can add materials)
- Action: View, Edit (if owned by teacher)

---

### 4. Teacher TambahMateriPage (NEW)
**Route**: `/guru/bank-materi/create`
- Form to add new material (similar to TambahSoalPage)

---

## Files to Create/Modify

### Create New Files:
| File | Description |
|------|-------------|
| `pages/teacher/BankMateriPage.tsx` | Bank materi for teacher |
| `pages/teacher/TambahMateriPage.tsx` | Add material form |

### Modify Existing Files:
| File | Changes |
|------|---------|
| `pages/admin/AllQuestionsPage.tsx` | Full redesign with tabs, BankSoalPage style |
| `pages/admin/AllMaterialsPage.tsx` | Full redesign with tabs, BankSoalPage style |
| `App.tsx` | Add routes for teacher bank materi |
| `components/layouts/DashboardLayout.tsx` | Add sidebar menu for bank materi (guru) |

---

## Implementation Steps

- [ ] **Step 1**: Redesign `AllQuestionsPage.tsx` (Admin Bank Soal)
  - Add tabs: Semua | Sistem | Guru
  - Add filters, table/grid view, star rating
  - Add "Tambah Soal" button

- [ ] **Step 2**: Redesign `AllMaterialsPage.tsx` (Admin Bank Materi)
  - Add tabs: Semua | Sistem | Guru
  - Add filters, table/grid view
  - Add "Tambah Materi" button

- [ ] **Step 3**: Create `BankMateriPage.tsx` (Teacher)
  - Similar to BankSoalPage but for materials
  - Tabs: Semua | Materi Saya

- [ ] **Step 4**: Create `TambahMateriPage.tsx` (Teacher)
  - Form to add material

- [ ] **Step 5**: Update App.tsx routes

- [ ] **Step 6**: Update DashboardLayout sidebar

- [ ] **Step 7**: Update all implementation plans:
  - `implementation_plan.md` (main)
  - `implementation_plan_admin.md`
  - `implementation_plan_guru.md`
  - `task.md`

---

## Verification
- [ ] TypeScript check: `npx tsc --noEmit`
- [ ] All routes working
- [ ] Tabs filter correctly
- [ ] UI matches BankSoalPage style
