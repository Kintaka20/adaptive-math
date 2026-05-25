import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { classApi } from '../../lib/api'

interface ClassItem {
    id: string
    name: string
    joinCode: string
    grade: string
    description?: string
    createdAt: string
    isFinished?: boolean
    _count?: { students: number; enrollments: number }
}

const CLASS_COLORS = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-purple-500 to-purple-600',
    'from-rose-500 to-rose-600',
    'from-amber-500 to-amber-600',
    'from-cyan-500 to-cyan-600',
]

export default function KelasPage() {
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null)
    const [finishTarget, setFinishTarget] = useState<ClassItem | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isFinishing, setIsFinishing] = useState(false)

    const loadClasses = () => {
        setIsLoading(true)
        classApi.list()
            .then(res => setClasses(Array.isArray(res) ? res as ClassItem[] : []))
            .catch(err => console.error('Failed to load classes', err))
            .finally(() => setIsLoading(false))
    }

    useEffect(() => { loadClasses() }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await classApi.delete(deleteTarget.id)
            setDeleteTarget(null)
            loadClasses()
        } catch (err) {
            console.error('Failed to delete class', err)
            alert('Gagal menghapus kelas')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleFinish = async () => {
        if (!finishTarget) return
        setIsFinishing(true)
        try {
            await classApi.update(finishTarget.id, { isFinished: true })
            setFinishTarget(null)
            loadClasses()
        } catch (err) {
            console.error('Failed to finish class', err)
            alert('Gagal menyelesaikan kelas')
        } finally {
            setIsFinishing(false)
        }
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">school</span>
                        Manajemen Kelas
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Kelola kelas dan siswa Anda</p>
                </div>
                <Link to="/guru/kelas/create"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/30">
                    <span className="material-symbols-outlined">add</span>
                    Buat Kelas Baru
                </Link>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls, i) => (
                        <div key={cls.id} className={`group bg-white dark:bg-slate-800 rounded-2xl border ${cls.isFinished ? 'border-slate-300 dark:border-slate-600 opacity-80' : 'border-slate-200 dark:border-slate-700'} overflow-hidden hover:shadow-xl transition-all`}>
                            {/* Color Header */}
                            <div className={`h-3 bg-gradient-to-r ${cls.isFinished ? 'from-slate-400 to-slate-500' : CLASS_COLORS[i % CLASS_COLORS.length]}`} />
                            <Link to={`/guru/kelas/${cls.id}`} className="block p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                {cls.name}
                                            </h3>
                                            {cls.isFinished && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">SELESAI</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">Kelas {cls.grade}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 font-mono mb-4">Kode: <span className="font-bold text-slate-700 dark:text-slate-300">{cls.joinCode}</span></p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Jumlah Siswa</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{cls._count?.enrollments ?? cls._count?.students ?? 0}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        Dibuat: {formatDate(cls.createdAt)}
                                    </p>
                                </div>
                            </Link>
                            {/* Actions */}
                            <div className="px-6 pb-4 flex justify-end gap-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigator.clipboard.writeText(cls.joinCode)
                                        setCopiedId(cls.id)
                                        setTimeout(() => setCopiedId(null), 2000)
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${copiedId === cls.id ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'}`}
                                    title={copiedId === cls.id ? "Tersalin!" : "Salin kode"}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copiedId === cls.id ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                                {!cls.isFinished && (
                                    <button
                                        onClick={() => setFinishTarget(cls)}
                                        className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-500 transition-colors"
                                        title="Selesaikan Kelas"
                                    >
                                        <span className="material-symbols-outlined text-sm">task_alt</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteTarget(cls)}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Hapus Kelas"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Class Card */}
                    <Link to="/guru/kelas/create"
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 flex flex-col items-center justify-center gap-4 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all min-h-[200px]">
                        <div className="size-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-slate-400">add</span>
                        </div>
                        <p className="text-slate-500 font-medium">Buat Kelas Baru</p>
                    </Link>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && classes.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-600">school</span>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Kelas</h3>
                        <p className="text-slate-500 text-sm">Buat kelas pertama Anda untuk mulai mengajar</p>
                    </div>
                    <Link to="/guru/kelas/create"
                        className="bg-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span>
                        Buat Kelas Pertama
                    </Link>
                </div>
            )}

            {/* Finish Confirmation Modal */}
            {finishTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !isFinishing && setFinishTarget(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500">task_alt</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Selesaikan Kelas?</h3>
                                <p className="text-sm text-slate-500">Tandai kelas ini telah berakhir</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Kelas <strong>&quot;{finishTarget.name}&quot;</strong> akan ditandai selesai. Siswa tetap bisa melihat materi untuk dipelajari kembali, namun kelas ini tidak lagi menjadi kelas utama mereka.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFinishTarget(null)}
                                disabled={isFinishing}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={isFinishing}
                                className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isFinishing ? (
                                    <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">task_alt</span>Selesaikan</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setDeleteTarget(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-500">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hapus Kelas?</h3>
                                <p className="text-sm text-slate-500">Tindakan ini tidak bisa dibatalkan</p>
                            </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700 dark:text-red-400">
                                Kelas <strong>&quot;{deleteTarget.name}&quot;</strong> akan dihapus beserta semua data enrollment siswa.
                                Bab dan konten master tidak akan terpengaruh.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menghapus...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">delete</span>Hapus Kelas</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
