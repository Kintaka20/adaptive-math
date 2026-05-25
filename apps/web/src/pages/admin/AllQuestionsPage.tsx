import { useState, useEffect } from 'react'
import LatexRenderer from '../../components/LatexRenderer'
import { questionApi, adminApi } from '../../lib/api'
import { Link } from 'react-router-dom'

interface QuestionOption {
    id: string
    label: string
    text: string
    isCorrect: boolean
}

interface Question {
    id: string
    text: string
    difficulty: string
    explanation?: string
    rating: number
    usageCount: number
    isSystem: boolean
    grade?: string
    chapterId?: string
    createdBy?: { user: { name: string } } | null
    options?: QuestionOption[]
}

interface Chapter {
    id: string
    name: string
    grade: string
}

const grades = ['Semua Kelas', 'X', 'XI', 'XII']
const difficulties = [
    { value: 'all', label: 'Semua Kesulitan' },
    { value: 'EASY', label: '🟢 Easy' },
    { value: 'MEDIUM', label: '🟡 Medium' },
    { value: 'HARD', label: '🔴 Hard' },
]

type TabType = 'all' | 'system' | 'teacher'

export default function AllQuestionsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChapterId, setSelectedChapterId] = useState('all')
    const [selectedGrade, setSelectedGrade] = useState('Semua Kelas')
    const [selectedDifficulty, setSelectedDifficulty] = useState('all')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [questions, setQuestions] = useState<Question[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null)
    const [loadingPreview, setLoadingPreview] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [qsRes, chapsRes] = await Promise.all([
                questionApi.list(),
                adminApi.chapters(),
            ])
            const qs = Array.isArray(qsRes) ? qsRes : []
            const chaps = Array.isArray(chapsRes) ? chapsRes : [] as Chapter[]
            setQuestions(qs as Question[])
            setChapters(chaps)
        } catch (err) {
            console.error('Failed to load questions', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await questionApi.delete(deleteTarget.id)
            await fetchData()
            setDeleteTarget(null)
        } catch (err) {
            console.error('Failed to delete question', err)
            alert('Gagal menghapus soal')
        } finally {
            setIsDeleting(false)
        }
    }

    const handlePreview = async (q: Question) => {
        setLoadingPreview(true)
        setPreviewQuestion(q)
        try {
            const detail = await questionApi.get(q.id)
            if (detail) setPreviewQuestion(detail as Question)
        } catch (err) {
            console.error('Failed to load question detail', err)
        } finally {
            setLoadingPreview(false)
        }
    }

    const filteredQuestions = questions.filter(q => {
        if (activeTab === 'system' && !q.isSystem) return false
        if (activeTab === 'teacher' && q.isSystem) return false
        if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (selectedChapterId !== 'all' && q.chapterId !== selectedChapterId) return false
        if (selectedGrade !== 'Semua Kelas' && q.grade !== selectedGrade) return false
        if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false
        return true
    })

    const systemCount = questions.filter(q => q.isSystem).length
    const teacherCount = questions.filter(q => !q.isSystem).length

    const getDifficultyBadge = (d: string) => {
        switch (d) {
            case 'EASY': return <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">🟢 Easy</span>
            case 'MEDIUM': return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">🟡 Medium</span>
            case 'HARD': return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium rounded-full">🔴 Hard</span>
            default: return null
        }
    }

    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'}`}>★</span>
            ))}
        </div>
    )

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Bank Soal</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">quiz</span>
                        Bank Soal (Admin)
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Kelola semua soal dari sistem dan guru</p>
                </div>
                <Link to="/admin/master-data/questions/create"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/30">
                    <span className="material-symbols-outlined">add</span>Tambah Soal Sistem
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {[
                    { key: 'all', label: 'Semua Soal', icon: 'inventory_2', count: questions.length, countClass: 'bg-slate-100 dark:bg-slate-700' },
                    { key: 'system', label: 'Soal Sistem', icon: 'verified', count: systemCount, countClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                    { key: 'teacher', label: 'Soal Guru', icon: 'person', count: teacherCount, countClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
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
                        <input type="text" placeholder="Cari soal..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/50" />
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
                    <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none">
                        {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
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

            <p className="text-sm text-slate-500">Menampilkan <span className="font-medium text-slate-900 dark:text-white">{filteredQuestions.length}</span> soal</p>

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
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Kelas</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Bab</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Soal</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Kesulitan</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Rating</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Sumber</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredQuestions.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Tidak ada soal ditemukan</td></tr>
                                ) : filteredQuestions.map(q => (
                                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">
                                                Kelas {q.grade || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {chapters.find(c => c.id === q.chapterId)?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-sm text-slate-900 dark:text-white">
                                                <LatexRenderer content={q.text.length > 60 ? q.text.substring(0, 60) + '...' : q.text} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getDifficultyBadge(q.difficulty)}</td>
                                        <td className="px-6 py-4"><StarRating rating={q.rating} /></td>
                                        <td className="px-6 py-4">
                                            {q.isSystem ? (
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">🏛️ Sistem</span>
                                            ) : (
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{(q.createdBy as any)?.user?.name || 'Guru'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handlePreview(q)}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-500" title="Preview">
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                </button>
                                                <Link to={`/admin/master-data/questions/${q.id}/edit`}
                                                    className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-500" title="Edit">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </Link>
                                                <button onClick={() => setDeleteTarget(q)}
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
                    {filteredQuestions.map(q => (
                        <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">Kelas {q.grade || '-'}</span>
                                    {getDifficultyBadge(q.difficulty)}
                                </div>
                            </div>
                            {q.chapterId && <div className="mb-2"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400">{chapters.find(c => c.id === q.chapterId)?.name || '-'}</span></div>}
                            <div className="text-slate-900 dark:text-white mb-4 min-h-[60px] text-sm">
                                <LatexRenderer content={q.text.length > 80 ? q.text.substring(0, 80) + '...' : q.text} />
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                                <StarRating rating={q.rating} />
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handlePreview(q)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-500" title="Preview">
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                    </button>
                                    <Link to={`/admin/master-data/questions/${q.id}/edit`} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-500" title="Edit">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </Link>
                                    <button onClick={() => setDeleteTarget(q)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500" title="Hapus">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPreviewQuestion(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">quiz</span>
                                Detail Soal
                            </h3>
                            <button onClick={() => setPreviewQuestion(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">Kelas {previewQuestion.grade || '-'}</span>
                            {getDifficultyBadge(previewQuestion.difficulty)}
                            {previewQuestion.isSystem ? (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">🏛️ Sistem</span>
                            ) : (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-medium rounded-full">👤 Guru</span>
                            )}
                        </div>

                        {/* Question Text */}
                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 mb-2">SOAL</p>
                            <div className="text-slate-900 dark:text-white">
                                <LatexRenderer content={previewQuestion.text} />
                            </div>
                        </div>

                        {/* Options */}
                        {loadingPreview ? (
                            <div className="flex items-center justify-center py-8">
                                <span className="size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : previewQuestion.options && previewQuestion.options.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-medium text-slate-500">PILIHAN JAWABAN</p>
                                {previewQuestion.options.map((opt) => (
                                    <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                                        opt.isCorrect
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                    }`}>
                                        <span className={`flex-shrink-0 size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                            opt.isCorrect
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                        }`}>{opt.label}</span>
                                        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                                            <LatexRenderer content={opt.text} />
                                        </div>
                                        {opt.isCorrect && <span className="material-symbols-outlined text-emerald-500 text-sm flex-shrink-0">check_circle</span>}
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {/* Explanation */}
                        {previewQuestion.explanation && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">💡 PEMBAHASAN</p>
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                    <LatexRenderer content={previewQuestion.explanation} />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <Link to={`/admin/master-data/questions/${previewQuestion.id}/edit`}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit Soal
                            </Link>
                            <button onClick={() => setPreviewQuestion(null)}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                                Tutup
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Soal?</h3>
                            <p className="text-slate-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan.</p>
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
