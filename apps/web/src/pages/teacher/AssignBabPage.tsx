import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { classApi, adminApi } from '../../lib/api'

interface ChapterItem {
    id: string
    name: string
    grade: string
    status: string
    _count?: { materials: number; quizzes: number }
}

interface AssignedChapter {
    id: string
    name: string
    order: number
}

interface ClassInfo {
    id: string
    name: string
    grade: string
}

export default function AssignBabPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [availableChapters, setAvailableChapters] = useState<ChapterItem[]>([])
    const [assignedChapters, setAssignedChapters] = useState<AssignedChapter[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        const load = async () => {
            setIsLoading(true)
            try {
                const cls = await classApi.get(id) as ClassInfo
                setClassInfo(cls)
                const chapters = await adminApi.chapters(cls.grade) as ChapterItem[]
                setAvailableChapters(chapters.filter(c => c.status === 'PUBLISHED'))
            } catch (err) {
                console.error('Failed to load data', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id])

    const assignedIds = assignedChapters.map(c => c.id)
    const unassigned = availableChapters.filter(c => !assignedIds.includes(c.id))

    const handleToggle = (chapterId: string) => {
        setSelectedIds(prev =>
            prev.includes(chapterId) ? prev.filter(x => x !== chapterId) : [...prev, chapterId]
        )
    }

    const handleAssign = () => {
        const newAssigned = selectedIds.map((cid, i) => {
            const ch = availableChapters.find(c => c.id === cid)!
            return { id: cid, name: ch.name, order: assignedChapters.length + i + 1 }
        })
        setAssignedChapters(prev => [...prev, ...newAssigned])
        setSelectedIds([])
    }

    const handleRemove = (chapterId: string) => {
        setAssignedChapters(prev => prev.filter(c => c.id !== chapterId)
            .map((c, i) => ({ ...c, order: i + 1 })))
    }

    const moveChapter = (index: number, direction: 'up' | 'down') => {
        const arr = [...assignedChapters]
        const target = direction === 'up' ? index - 1 : index + 1
        if (target < 0 || target >= arr.length) return
        ;[arr[index], arr[target]] = [arr[target], arr[index]]
        setAssignedChapters(arr.map((c, i) => ({ ...c, order: i + 1 })))
    }

    const handleSave = async () => {
        if (!id) return
        setIsSaving(true)
        try {
            await classApi.assignChapters(id, assignedIds)
            navigate(`/guru/kelas/${id}`)
        } catch (err) {
            console.error('Failed to save', err)
            alert('Gagal menyimpan. Silakan coba lagi.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/guru/kelas" className="hover:text-primary">Manajemen Kelas</Link>
                    <span>/</span>
                    <Link to={`/guru/kelas/${id}`} className="hover:text-primary">{classInfo?.name || 'Kelas'}</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Assign Bab</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">library_add</span>
                    Assign Bab ke {classInfo?.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Tarik template bab dari Master Data ke kelas ini</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Available */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">inventory</span>
                            Template Tersedia (dari Admin)
                        </h2>
                        <p className="text-sm text-slate-500">Kelas {classInfo?.grade}</p>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                        {unassigned.length > 0 ? unassigned.map(chapter => (
                            <label key={chapter.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedIds.includes(chapter.id)
                                    ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}>
                                <input type="checkbox" checked={selectedIds.includes(chapter.id)}
                                    onChange={() => handleToggle(chapter.id)} className="size-5 rounded border-slate-300" />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">{chapter.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {(chapter._count?.materials || 0) + (chapter._count?.quizzes || 0)} konten
                                    </p>
                                </div>
                            </label>
                        )) : (
                            <div className="text-center py-8 text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                                <p>{availableChapters.length === 0 ? 'Tidak ada bab tersedia untuk kelas ini' : 'Semua bab sudah di-assign'}</p>
                            </div>
                        )}
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={handleAssign}
                                className="w-full bg-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                Assign {selectedIds.length} Bab
                            </button>
                        </div>
                    )}
                </div>

                {/* Assigned */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-900/20">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                            Bab di Kelas Ini
                        </h2>
                        <p className="text-sm text-slate-500">{assignedChapters.length} bab aktif</p>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                        {assignedChapters.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
                                <p>Belum ada bab yang di-assign</p>
                            </div>
                        ) : assignedChapters.map((chapter, index) => (
                            <div key={chapter.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <button onClick={() => moveChapter(index, 'up')} disabled={index === 0}
                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-30">
                                            <span className="material-symbols-outlined text-xs">expand_less</span>
                                        </button>
                                        <button onClick={() => moveChapter(index, 'down')} disabled={index === assignedChapters.length - 1}
                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-30">
                                            <span className="material-symbols-outlined text-xs">expand_more</span>
                                        </button>
                                    </div>
                                    <span className="size-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                        {chapter.order}
                                    </span>
                                    <p className="flex-1 font-medium text-slate-900 dark:text-white">{chapter.name}</p>
                                    <button onClick={() => handleRemove(chapter.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Hapus dari kelas">
                                        <span className="material-symbols-outlined text-sm text-red-500">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Link to={`/guru/kelas/${id}`} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                    Batal
                </Link>
                <button onClick={handleSave} disabled={isSaving || assignedChapters.length === 0}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? (
                        <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                    ) : (
                        <><span className="material-symbols-outlined text-sm">save</span>Simpan Perubahan</>
                    )}
                </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500">info</span>
                    <div>
                        <p className="font-medium text-blue-700 dark:text-blue-400">Tentang Assign Bab</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            Bab yang di-assign akan muncul di Learning Path siswa. Konten materi otomatis mengikuti template dari Admin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
