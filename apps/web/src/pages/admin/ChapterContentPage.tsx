import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { materialApi, quizApi, adminApi } from '../../lib/api'

interface ChapterInfo {
    id: string
    name: string
    grade: string
    status: string
}

interface ContentItem {
    id: string
    type: 'material' | 'quiz'
    title: string
    duration?: string
    order: number
    status: string
}

export default function ChapterContentPage() {
    const { id } = useParams<{ id: string }>()
    const [chapter, setChapter] = useState<ChapterInfo | null>(null)
    const [materials, setMaterials] = useState<ContentItem[]>([])
    const [quizzes, setQuizzes] = useState<ContentItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addType, setAddType] = useState<'material' | 'quiz'>('material')
    const [addTitle, setAddTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [chaptersRes, materialsRes, quizzesRes] = await Promise.all([
                adminApi.chapters(),
                materialApi.list({ chapterId: id }),
                quizApi.list({ chapterId: id }),
            ])
            const chaptersData = Array.isArray(chaptersRes) ? chaptersRes : []
            const found = chaptersData.find((c: any) => c.id === id)
            setChapter(found || null)

            const mats = (Array.isArray(materialsRes) ? materialsRes : []).map((m: any) => ({
                id: m.id, type: 'material' as const, title: m.title, duration: m.duration, order: m.order, status: m.status
            }))
            const qzs = (Array.isArray(quizzesRes) ? quizzesRes : []).map((q: any) => ({
                id: q.id, type: 'quiz' as const, title: q.title, order: q.order, status: q.status
            }))
            setMaterials(mats)
            setQuizzes(qzs)
        } catch (err) {
            console.error('Failed to load chapter content', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    const allContents = [...materials, ...quizzes].sort((a, b) => a.order - b.order)

    const handleAdd = async () => {
        if (!addTitle || !id) return
        setIsSaving(true)
        try {
            if (addType === 'material') {
                await materialApi.create({ title: addTitle, content: `# ${addTitle}\n\nIsi materi di sini.`, chapterId: id, order: materials.length + 1, status: 'DRAFT', isSystem: true })
            } else {
                await quizApi.create({ title: addTitle, chapterId: id, order: quizzes.length + 1, status: 'DRAFT', isSystem: true })
            }
            await fetchData()
            setShowAddModal(false)
            setAddTitle('')
        } catch (err) {
            console.error('Failed to add content', err)
            alert('Gagal menambahkan konten')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            if (deleteTarget.type === 'material') {
                await materialApi.delete(deleteTarget.id)
            } else {
                await quizApi.delete(deleteTarget.id)
            }
            await fetchData()
            setDeleteTarget(null)
        } catch (err) {
            console.error('Failed to delete content', err)
            alert('Gagal menghapus konten')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Breadcrumb & Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                    <span>/</span>
                    <Link to="/admin/master-data/curriculum" className="hover:text-primary">Kurikulum</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">{chapter?.name || 'Loading...'}</span>
                </div>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">folder_special</span>
                            Master Konten: {chapter?.name || '...'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Kelas {chapter?.grade} • Atur struktur pembelajaran standar
                        </p>
                    </div>
                    {chapter && (
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${chapter.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                            {chapter.status === 'PUBLISHED' ? '🟢 Published' : '🟡 Draft'}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Konten</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '...' : allContents.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">📖 Materi</p>
                    <p className="text-2xl font-black text-blue-500">{isLoading ? '...' : materials.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">📝 Kuis</p>
                    <p className="text-2xl font-black text-amber-500">{isLoading ? '...' : quizzes.length}</p>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-4">
                    <h2 className="font-bold text-slate-900 dark:text-white">Struktur Pembelajaran Standar</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Tambah Konten
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-20">No</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-24">Tipe</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Judul</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Info</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <p className="text-slate-500">Memuat konten...</p>
                                    </div>
                                </td></tr>
                            ) : allContents.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">folder_open</span>
                                        <p className="text-slate-500">Belum ada konten di bab ini</p>
                                        <button onClick={() => setShowAddModal(true)} className="text-primary font-medium text-sm hover:underline">+ Tambah Konten Pertama</button>
                                    </div>
                                </td></tr>
                            ) : allContents.map((content) => (
                                <tr key={content.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="size-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                            {content.order}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {content.type === 'material' ? (
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-500">📖 Materi</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-500">📝 Kuis</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900 dark:text-white">{content.title}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {content.type === 'material' ? (content.duration || '-') : 'Kuis'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${content.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                            {content.status === 'PUBLISHED' ? '🟢 Published' : '🟡 Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <Link
                                                to={content.type === 'quiz'
                                                    ? `/admin/master-data/chapters/${id}/quiz/${content.id}`
                                                    : `/admin/master-data/chapters/${id}/material/${content.id}`
                                                }
                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Edit Konten"
                                            >
                                                <span className="material-symbols-outlined text-sm text-blue-500">edit_document</span>
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget(content)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isSaving && setShowAddModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tambah Konten Baru</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe Konten</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['material', 'quiz'] as const).map(type => (
                                        <button key={type} onClick={() => setAddType(type)}
                                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${addType === type ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                            <span>{type === 'material' ? '📖 Materi' : '📝 Kuis'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul *</label>
                                <input type="text" value={addTitle} onChange={e => setAddTitle(e.target.value)}
                                    placeholder={addType === 'material' ? 'Contoh: Pengenalan Sin, Cos, Tan' : 'Contoh: Latihan Soal Bab 1'}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} disabled={isSaving}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium disabled:opacity-50">Batal</button>
                            <button onClick={handleAdd} disabled={!addTitle || isSaving}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSaving ? <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Tambah'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center">
                            <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Konten?</h3>
                            <p className="text-slate-500 text-sm mb-6">Hapus <strong>"{deleteTarget.title}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium disabled:opacity-50">Batal</button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center">
                                    {isDeleting ? <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
