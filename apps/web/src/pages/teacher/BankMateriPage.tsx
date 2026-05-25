import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { materialApi } from '../../lib/api'
import { Material } from '../../lib/types'
import LatexRenderer from '../../components/LatexRenderer'

const chapters = ['Semua Bab', 'Trigonometri', 'Turunan', 'Integral', 'Aljabar', 'Limit']
const grades = ['Semua Kelas', 'X', 'XI', 'XII']

type TabType = 'all' | 'mine'

export default function BankMateriPage() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChapter, setSelectedChapter] = useState('Semua Bab')
    const [selectedGrade, setSelectedGrade] = useState('Semua Kelas')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

    useEffect(() => {
        setIsLoading(true)
        materialApi.list()
            .then(data => setMaterials(data))
            .catch(err => console.error('Error fetching materials:', err))
            .finally(() => setIsLoading(false))
    }, [])

    const baseMaterials = activeTab === 'mine'
        ? materials.filter(m => !m.isSystem)
        : materials

    const filteredMaterials = baseMaterials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesChapter = selectedChapter === 'Semua Bab' || (m.chapter?.name === selectedChapter)
        const matchesGrade = selectedGrade === 'Semua Kelas' || (m.chapter?.grade === selectedGrade)
        return matchesSearch && matchesChapter && matchesGrade
    })

    const myMaterialsCount = materials.filter(m => !m.isSystem).length

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'published':
                return <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">🟢 Published</span>
            case 'draft':
                return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">🟡 Draft</span>
            default:
                return null
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">article</span>
                        Bank Materi
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Kelola materi untuk pembelajaran di kelas</p>
                </div>
                <Link
                    to="/guru/bank-materi/create"
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30"
                >
                    <span className="material-symbols-outlined">add</span>
                    Tambah Materi
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'all'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        Semua Materi
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                            {materials.length}
                        </span>
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'mine'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        Materi Saya
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-xs font-medium">
                            {myMaterialsCount}
                        </span>
                    </span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Cari materi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    {/* Grade Filter */}
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                        {grades.map(grade => (
                            <option key={grade} value={grade}>{grade === 'Semua Kelas' ? grade : `Kelas ${grade}`}</option>
                        ))}
                    </select>

                    {/* Chapter Filter */}
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                        {chapters.map(chapter => (
                            <option key={chapter} value={chapter}>{chapter}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                        >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">view_list</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                        >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">grid_view</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-slate-500">
                Menampilkan <span className="font-medium text-slate-900 dark:text-white">{filteredMaterials.length}</span> materi
            </p>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">#ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Judul</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Kelas</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Bab</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Durasi</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Rating</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Pembuat</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredMaterials.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                            {isLoading ? 'Memuat materi...' : 'Belum ada materi ditemukan.'}
                                        </td>
                                    </tr>
                                ) : filteredMaterials.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">#{m.id.substring(m.id.length - 4).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{m.title}</p>
                                                {m.status === 'DRAFT' && getStatusBadge(m.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">
                                                Kelas {m.chapter?.grade || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                                                {m.chapter?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{m.duration || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                {/* API doesn't return material usage/rating today, fallback */}
                                                <span className="text-sm">★ -</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {m.isSystem ? (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">
                                                        🏛️ Sistem
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            Dimiliki
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedMaterial(m)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                                                    title="Preview"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                </button>
                                                {/* No real edit yet unless owned, assume true for now */}
                                                {!m.isSystem && (
                                                    <>
                                                        <Link
                                                            to={`/guru/bank-materi/${m.id}/edit`}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-primary"
                                                            title="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </Link>
                                                        <button
                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                                                            title="Hapus"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials.map((m) => (
                        <div key={m.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">
                                        Kelas {m.chapter?.grade || '-'}
                                    </span>
                                    {m.status === 'DRAFT' && getStatusBadge(m.status)}
                                </div>
                                <span className="text-xs text-slate-400">#{m.id.substring(m.id.length - 4).toUpperCase()}</span>
                            </div>

                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 flex-1">{m.title}</h3>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                                    {m.chapter?.name || 'Uncategorized'}
                                </span>
                                {m.duration && <span className="text-xs text-slate-500">⏱️ {m.duration}</span>}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                                <div className="flex items-center gap-2">
                                    {m.isSystem ? (
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">
                                            🏛️ Sistem
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-500">
                                            Dimiliki
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setSelectedMaterial(m)}
                                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    Lihat
                                </button>
                                {!m.isSystem && (
                                    <Link
                                        to={`/guru/bank-materi/${m.id}/edit`}
                                        className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedMaterial(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedMaterial.title}</h3>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">
                                Kelas {selectedMaterial.chapter?.grade || '-'}
                            </span>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                                {selectedMaterial.chapter?.name || '-'}
                            </span>
                            {selectedMaterial.duration && <span className="text-xs text-slate-500">⏱️ {selectedMaterial.duration}</span>}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4 mt-6">
                            <div className="text-slate-600 dark:text-slate-300 text-sm">
                                <LatexRenderer content={selectedMaterial.content || '*Belum ada konten.*'} />
                            </div>
                        </div>
                        
                        {selectedMaterial.videoUrl && (
                            <div className="mt-4 p-4 mb-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 cursor-pointer hover:underline">
                                    <a href={selectedMaterial.videoUrl} target="_blank" rel="noopener noreferrer">Gunakan Video ({selectedMaterial.videoUrl})</a>
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 mt-6">
                            <div className="flex items-center gap-2">
                                {selectedMaterial.isSystem ? (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">
                                        🏛️ Sistem
                                    </span>
                                ) : (
                                    <span className="text-sm text-slate-500">
                                        Dimiliki
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedMaterial(null)}
                            className="w-full mt-4 py-2.5 bg-primary text-white font-bold rounded-xl"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
