import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/api'

interface Chapter {
    id: string
    name: string
    description?: string
    grade: string
    order: number
    status: string
    _count?: { materials: number; quizzes: number }
}

type GradeLevel = 'X' | 'XI' | 'XII'

export default function CurriculumPage() {
    const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('X')
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [form, setForm] = useState({ name: '', description: '', status: 'DRAFT' })

    const grades: GradeLevel[] = ['X', 'XI', 'XII']

    const fetchChapters = async (grade: GradeLevel) => {
        setIsLoading(true)
        try {
            const res = await adminApi.chapters(grade)
            const data = Array.isArray(res) ? res : []
            setChapters(Array.isArray(data) ? data.filter((c: Chapter) => c.grade === grade) : [])
        } catch (error) {
            console.error('Failed to fetch chapters', error)
            setChapters([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchChapters(selectedGrade)
    }, [selectedGrade])

    const openAddModal = () => {
        setEditingChapter(null)
        setForm({ name: '', description: '', status: 'DRAFT' })
        setShowAddModal(true)
    }

    const openEditModal = (chapter: Chapter) => {
        setEditingChapter(chapter)
        setForm({ name: chapter.name, description: chapter.description || '', status: chapter.status })
        setShowAddModal(true)
    }

    const handleSave = async () => {
        if (!form.name) return
        setIsSaving(true)
        try {
            if (editingChapter) {
                await adminApi.updateChapter(editingChapter.id, {
                    name: form.name,
                    description: form.description,
                    status: form.status,
                })
            } else {
                await adminApi.createChapter({
                    name: form.name,
                    description: form.description,
                    grade: selectedGrade,
                    order: chapters.length + 1,
                    status: form.status,
                })
            }
            await fetchChapters(selectedGrade)
            setShowAddModal(false)
        } catch (err) {
            console.error('Failed to save chapter', err)
            alert('Gagal menyimpan bab')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await adminApi.deleteChapter(deleteTarget.id)
            await fetchChapters(selectedGrade)
            setDeleteTarget(null)
        } catch (err) {
            console.error('Failed to delete chapter', err)
            alert('Gagal menghapus bab')
        } finally {
            setIsDeleting(false)
        }
    }

    const publishedCount = chapters.filter(c => c.status === 'PUBLISHED').length
    const draftCount = chapters.filter(c => c.status === 'DRAFT').length
    const totalContent = chapters.reduce((acc, c) => acc + (c._count?.materials || 0) + (c._count?.quizzes || 0), 0)

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Kurikulum</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">school</span>
                        Master Kurikulum
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Template bab standar per tingkat kelas</p>
                </div>
            </div>

            {/* Grade Tabs */}
            <div className="flex gap-2">
                {grades.map(grade => (
                    <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedGrade === grade
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary'
                            }`}
                    >
                        Kelas {grade}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Bab</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '...' : chapters.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Published</p>
                    <p className="text-2xl font-black text-emerald-500">{isLoading ? '...' : publishedCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Draft</p>
                    <p className="text-2xl font-black text-amber-500">{isLoading ? '...' : draftCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Konten</p>
                    <p className="text-2xl font-black text-primary">{isLoading ? '...' : totalContent}</p>
                </div>
            </div>

            {/* Chapter List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white">
                        Daftar Bab Standar Kelas {selectedGrade}
                    </h2>
                    <button
                        onClick={openAddModal}
                        className="bg-primary text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Tambah Bab
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-20">Urutan</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Nama Bab</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Materi</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Kuis</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-slate-500">Memuat data kurikulum...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : chapters.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-slate-300">menu_book</span>
                                            <p className="text-slate-500">Belum ada bab untuk Kelas {selectedGrade}</p>
                                            <button onClick={openAddModal} className="text-primary font-medium text-sm hover:underline">
                                                + Tambah Bab Pertama
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                chapters.map((chapter) => (
                                    <tr key={chapter.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 group transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="size-8 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                                                {chapter.order}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/master-data/chapters/${chapter.id}/content`}
                                                className="font-medium text-slate-900 dark:text-white hover:text-primary transition-colors"
                                            >
                                                {chapter.name}
                                            </Link>
                                            {chapter.description && (
                                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{chapter.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {chapter._count?.materials ?? 0} Materi
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {chapter._count?.quizzes ?? 0} Kuis
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${chapter.status === 'PUBLISHED'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                                : chapter.status === 'ARCHIVED'
                                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                            }`}>
                                                {chapter.status === 'PUBLISHED' ? '🟢 Published' : chapter.status === 'ARCHIVED' ? '🔘 Archived' : '🟡 Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/master-data/chapters/${chapter.id}/content`}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Kelola Konten"
                                                >
                                                    <span className="material-symbols-outlined text-sm text-primary">folder_open</span>
                                                </Link>
                                                <button
                                                    onClick={() => openEditModal(chapter)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Edit Bab"
                                                >
                                                    <span className="material-symbols-outlined text-sm text-slate-500">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(chapter)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Hapus Bab"
                                                >
                                                    <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500">info</span>
                    <div>
                        <p className="font-medium text-blue-700 dark:text-blue-400">Tentang Master Kurikulum</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            Bab yang Anda atur di sini akan menjadi <strong>template standar</strong> yang bisa ditarik oleh Guru ke kelas masing-masing.
                            Urutan yang Anda tentukan akan menjadi urutan default saat Guru melakukan assign bab.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Chapter Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isSaving && setShowAddModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingChapter ? 'Edit Bab' : `Tambah Bab Baru — Kelas ${selectedGrade}`}
                            </h3>
                            <button onClick={() => !isSaving && setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Bab *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Contoh: Integral Tak Tentu"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deskripsi</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Deskripsi singkat tentang bab ini..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                                >
                                    <option value="DRAFT">🟡 Draft</option>
                                    <option value="PUBLISHED">🟢 Published</option>
                                    <option value="ARCHIVED">🔘 Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setShowAddModal(false)}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.name}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-sm">save</span>
                                )}
                                {editingChapter ? 'Simpan Perubahan' : 'Tambah Bab'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Bab</h3>
                            <p className="text-slate-500 text-sm mb-2">
                                Anda akan menghapus bab <strong className="text-slate-700 dark:text-slate-300">"{deleteTarget.name}"</strong>.
                            </p>
                            <p className="text-red-500 text-sm mb-6">
                                Semua materi dan soal di dalam bab ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
