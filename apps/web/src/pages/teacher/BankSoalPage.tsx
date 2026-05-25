import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { questionApi, adminApi } from '../../lib/api'
import { Question } from '../../lib/types'
import LatexRenderer from '../../components/LatexRenderer'

const difficulties = [
    { value: 'all', label: 'Semua Kesulitan' },
    { value: 'easy', label: '🟢 Easy' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'hard', label: '🔴 Hard' },
]

type TabType = 'all' | 'mine'

export default function BankSoalPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChapter, setSelectedChapter] = useState('Semua Bab')
    const [selectedDifficulty, setSelectedDifficulty] = useState('all')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

    const [chapters, setChapters] = useState<{id: string; name: string}[]>([])

    useEffect(() => {
        setIsLoading(true)
        Promise.all([
            questionApi.list(),
            adminApi.chapters()
        ])
            .then(([qsData, chapsData]) => {
                setQuestions(qsData as any)
                setChapters(chapsData as any)
            })
            .catch((err) => console.error('Fetch error:', err))
            .finally(() => setIsLoading(false))
    }, [])

    const baseQuestions = activeTab === 'mine'
        ? questions.filter(q => !q.isSystem)
        : questions

    const filteredQuestions = baseQuestions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
        const matchesChapter = selectedChapter === 'Semua Bab' || q.chapterId === selectedChapter
        return matchesSearch && matchesDifficulty && matchesChapter
    })

    const myQuestionsCount = questions.filter(q => !q.isSystem).length

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">🟢 Easy</span>
            case 'medium':
                return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">🟡 Medium</span>
            case 'hard':
                return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium rounded-full">🔴 Hard</span>
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
                        <span className="material-symbols-outlined text-amber-500">quiz</span>
                        Bank Soal
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Kelola soal untuk kuis dan pembelajaran</p>
                </div>
                <Link
                    to="/guru/bank-soal/create"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/30"
                >
                    <span className="material-symbols-outlined">add</span>
                    Tambah Soal
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
                        Semua Soal
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                            {questions.length}
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
                        Soal Saya
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full text-xs font-medium">
                            {myQuestionsCount}
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
                            placeholder="Cari soal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>

                    {/* Chapter Filter */}
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        <option value="Semua Bab">Semua Bab</option>
                        {chapters.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                        ))}
                    </select>

                    {/* Difficulty Filter */}
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        {difficulties.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
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
                Menampilkan <span className="font-medium text-slate-900 dark:text-white">{filteredQuestions.length}</span> soal
            </p>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">#ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Bab</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Soal</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Kesulitan</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Rating</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Pembuat</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                            {isLoading ? 'Memuat Soal...' : 'Belum ada soal ditemukan.'}
                                        </td>
                                    </tr>
                                ) : filteredQuestions.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">#{q.id.substring(q.id.length - 4).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                                                {chapters.find(c => c.id === q.chapterId)?.name || q.chapterId || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-sm text-slate-900 dark:text-white truncate"><LatexRenderer content={q.text.length > 80 ? q.text.substring(0, 80) + '...' : q.text} /></div>
                                        </td>
                                        <td className="px-6 py-4">{getDifficultyBadge(q.difficulty.toLowerCase())}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-amber-400">★</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{q.rating || 0}</span>
                                                <span className="text-xs text-slate-400 ml-1">({q.usageCount})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {q.isSystem ? (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">
                                                        🏛️ Sistem
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Dimiliki</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedQuestion(q)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                </button>
                                                {!q.isSystem && (
                                                    <>
                                                        <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit Soal">
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Hapus">
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
                    {filteredQuestions.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-400">#{String(q.id).padStart(3, '0')}</span>
                                {getDifficultyBadge(q.difficulty)}
                            </div>
                            <div className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2"><LatexRenderer content={q.text.length > 100 ? q.text.substring(0, 100) + '...' : q.text} /></div>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 mb-3">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            className={`text-sm ${star <= (q.rating || 0) ? 'text-amber-400' : 'text-slate-300'}`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400">({q.usageCount} kuis)</span>
                            </div>

                            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedQuestion(q)} className="text-slate-500 hover:text-slate-700 text-sm">Lihat</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {selectedQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedQuestion(null)}></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                Detail Soal
                            </h3>
                            <button onClick={() => setSelectedQuestion(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {selectedQuestion.chapterId && <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">{chapters.find(c => c.id === selectedQuestion.chapterId)?.name || selectedQuestion.chapterId}</span>}
                                {getDifficultyBadge(selectedQuestion.difficulty.toLowerCase())}
                                {selectedQuestion.isSystem && <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified</span> System</span>}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 overflow-x-auto">
                                <div className="text-slate-900 dark:text-white font-medium"><LatexRenderer content={selectedQuestion.text} /></div>
                            </div>
                            
                            <div className="space-y-3">
                                <p className="font-medium text-slate-700 dark:text-slate-300">Pilihan Jawaban:</p>
                                <div className="space-y-2">
                                    {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                                        selectedQuestion.options.map((opt, idx) => (
                                            <div key={opt.id || idx} className={`flex items-start gap-3 p-3 rounded-xl border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                                <div className={`mt-0.5 size-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <div className={`flex-1 overflow-x-auto ${opt.isCorrect ? 'text-emerald-900 dark:text-emerald-100 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    <LatexRenderer content={opt.text} />
                                                </div>
                                                {opt.isCorrect && <span className="material-symbols-outlined text-emerald-500 ml-auto">check_circle</span>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Pilihan jawaban tidak tersedia.</p>
                                    )}
                                </div>
                            </div>

                            {selectedQuestion.explanation && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 mt-6">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                                        Pembahasan
                                    </h4>
                                    <div className="text-blue-900 dark:text-blue-100 text-sm">
                                        <LatexRenderer content={selectedQuestion.explanation} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button onClick={() => setSelectedQuestion(null)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
