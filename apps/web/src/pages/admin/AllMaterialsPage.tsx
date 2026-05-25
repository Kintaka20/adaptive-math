import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { materialApi, adminApi } from '../../lib/api'

interface Material {
    id: string
    title: string
    duration?: string
    order: number
    status: string
    isSystem: boolean
    chapter?: { id: string; name: string; grade: string }
    createdBy?: { user: { name: string } } | null
}

interface Chapter {
    id: string
    name: string
    grade: string
}

const grades = ['Semua Kelas', 'X', 'XI', 'XII']
const statuses = [
    { value: 'all', label: 'Semua Status' },
    { value: 'PUBLISHED', label: '🟢 Published' },
    { value: 'DRAFT', label: '🟡 Draft' },
]

type TabType = 'all' | 'system' | 'teacher'

export default function AllMaterialsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChapterId, setSelectedChapterId] = useState('all')
    const [selectedGrade, setSelectedGrade] = useState('Semua Kelas')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [materials, setMaterials] = useState<Material[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<Material | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [matsRes, chapsRes] = await Promise.all([
                materialApi.list(),
                adminApi.chapters(),
            ])
            const mats = Array.isArray(matsRes) ? matsRes : []
            const chaps = Array.isArray(chapsRes) ? chapsRes : [] as Chapter[]
            setMaterials(mats as Material[])
            setChapters(chaps)
        } catch (err) {
            console.error('Failed to load materials', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await materialApi.delete(deleteTarget.id)
            await fetchData()
            setDeleteTarget(null)
        } catch (err) {
            console.error('Failed to delete material', err)
            alert('Gagal menghapus materi')
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredMaterials = materials.filter(m => {
        if (activeTab === 'system' && !m.isSystem) return false
        if (activeTab === 'teacher' && m.isSystem) return false
        if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (selectedChapterId !== 'all' && m.chapter?.id !== selectedChapterId) return false
        if (selectedGrade !== 'Semua Kelas' && m.chapter?.grade !== selectedGrade) return false
        if (selectedStatus !== 'all' && m.status !== selectedStatus) return false
        return true
    })

    const getStatusBadge = (status: string) =>
        status === 'PUBLISHED'
            ? <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">🟢 Published</span>
            : <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">🟡 Draft</span>

    const systemCount = materials.filter(m => m.isSystem).length
    const teacherCount = materials.filter(m => !m.isSystem).length

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Bank Materi</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">article</span>
                        Bank Materi (Admin)
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Kelola semua materi dari sistem dan guru</p>
                </div>
                <Link to="/admin/master-data/materials/create"
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30">
                    <span className="material-symbols-outlined">add</span>Tambah Materi Sistem
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {[
                    { key: 'all', label: 'Semua Materi', icon: 'inventory_2', count: materials.length, countClass: 'bg-slate-100 dark:bg-slate-700' },
                    { key: 'system', label: 'Materi Sistem', icon: 'verified', count: systemCount, countClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                    { key: 'teacher', label: 'Materi Guru', icon: 'person', count: teacherCount, countClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as TabType)}
                        className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tab.countClass}`}>{tab.count}</span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input type="text" placeholder="Cari materi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-purple-500/50" />
                    </div>
                    <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none">
                        {grades.map(g => <option key={g} value={g}>{g === 'Semua Kelas' ? g : `Kelas ${g}`}</option>)}
                    </select>
                    <select value={selectedChapterId} onChange={e => setSelectedChapterId(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none">
                        <option value="all">Semua Bab</option>
                        {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none">
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">view_list</span>
                        </button>
                        <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">grid_view</span>
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-500">Menampilkan <span className="font-medium text-slate-900 dark:text-white">{filteredMaterials.length}</span> materi</p>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Judul</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Kelas</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Bab</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Durasi</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Sumber</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredMaterials.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Tidak ada materi ditemukan</td></tr>
                                ) : filteredMaterials.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{m.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">
                                                Kelas {m.chapter?.grade || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{m.chapter?.name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{m.duration || '-'}</td>
                                        <td className="px-6 py-4">{getStatusBadge(m.status)}</td>
                                        <td className="px-6 py-4">
                                            {m.isSystem ? (
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">🏛️ Sistem</span>
                                            ) : (
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{(m.createdBy as any)?.user?.name || 'Guru'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/admin/master-data/chapters/${m.chapter?.id}/material/${m.id}`}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-primary" title="Edit">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </Link>
                                                <button onClick={() => setDeleteTarget(m)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500" title="Hapus">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials.map(m => (
                        <div key={m.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">Kelas {m.chapter?.grade}</span>
                                    {getStatusBadge(m.status)}
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{m.title}</h3>
                            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                                <span>{m.chapter?.name}</span>
                                {m.duration && <span>⏱️ {m.duration}</span>}
                            </div>
                            <div className="flex gap-2 mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <Link to={`/admin/master-data/chapters/${m.chapter?.id}/material/${m.id}`}
                                    className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-sm">edit</span>Edit
                                </Link>
                                <button onClick={() => setDeleteTarget(m)}
                                    className="py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-500 rounded-xl">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Materi?</h3>
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
