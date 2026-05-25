import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { studentApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface RankEntry {
    rank: number
    id: string
    name: string
    grade?: string
    classroom?: { name: string }
    school?: { name: string }
    totalXP: number
    currentLevel: number
    streakDays: number
    isCurrentUser?: boolean
}

const getRankBadge = (rank: number) => {
    switch (rank) {
        case 1: return <span className="text-3xl">🥇</span>
        case 2: return <span className="text-3xl">🥈</span>
        case 3: return <span className="text-3xl">🥉</span>
        default: return <span className="text-lg font-bold text-slate-400">#{rank}</span>
    }
}

export default function RankingPage() {
    const { user } = useAuth()
    const [rankings, setRankings] = useState<RankEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'class' | 'school' | 'global'>('global')

    useEffect(() => {
        studentApi.ranking(20)
            .then(res => {
                const data = (Array.isArray(res) ? res : []) as RankEntry[]
                const withCurrentUser = data.map((r, idx) => ({
                    ...r,
                    rank: idx + 1,
                    isCurrentUser: r.id === user?.id,
                }))
                setRankings(withCurrentUser)
            })
            .catch(err => console.error('Failed to load rankings', err))
            .finally(() => setIsLoading(false))
    }, [user])

    const currentUser = rankings.find(r => r.isCurrentUser)
    const prevUser = currentUser && currentUser.rank > 1 ? rankings[currentUser.rank - 2] : null

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-3xl font-black mb-2 flex items-center gap-3">
                        <span className="text-4xl">🏆</span>
                        Papan Peringkat
                    </h1>
                    <p className="text-white/80">Bersaing dengan teman-teman sekelasmu!</p>
                </div>
            </div>

            {/* Current User Position */}
            {currentUser && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-primary shadow-lg shadow-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="size-14 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">Kamu</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                {currentUser.classroom?.name || `Kelas ${currentUser.grade || '-'}`}
                                {currentUser.school?.name ? ` • ${currentUser.school.name}` : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-primary">#{currentUser.rank}</p>
                            <p className="text-sm text-slate-500">{currentUser.totalXP.toLocaleString()} XP</p>
                        </div>
                    </div>

                    {prevUser && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Mengejar #{currentUser.rank - 1}</span>
                                <span className="font-medium text-primary">
                                    {(prevUser.totalXP - currentUser.totalXP).toLocaleString()} XP lagi
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                                    style={{ width: `${Math.min((currentUser.totalXP / Math.max(prevUser.totalXP, 1)) * 100, 100)}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            {currentUser && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-3xl">🔥</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentUser.streakDays}</p>
                        <p className="text-sm text-slate-500">Hari Berturut</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-3xl">⭐</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentUser.totalXP.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Total XP</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-3xl">📊</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">Lvl {currentUser.currentLevel}</p>
                        <p className="text-sm text-slate-500">Tingkat</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-3xl">🏅</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">#{currentUser.rank}</p>
                        <p className="text-sm text-slate-500">Peringkat</p>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2">
                <div className="flex flex-wrap gap-2">
                    {(['global', 'class', 'school'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${activeTab === tab
                                ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            {tab === 'global' ? 'Semua' : tab === 'class' ? 'Kelas Saya' : 'Sekolah Saya'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">leaderboard</span>
                        Top Siswa
                    </h2>
                    <span className="text-sm text-slate-500">{rankings.length} siswa</span>
                </div>

                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
                    </div>
                ) : rankings.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2">leaderboard</span>
                        <p>Belum ada data peringkat</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {rankings.map((entry, index) => (
                            <div key={entry.id}
                                className={`flex items-center gap-4 p-4 transition-colors ${entry.isCurrentUser
                                    ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                                    ${index < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10' : ''}`}>
                                {/* Rank */}
                                <div className="w-12 flex justify-center">
                                    {getRankBadge(index + 1)}
                                </div>

                                {/* Avatar */}
                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-primary to-indigo-500'}`}>
                                    {entry.name.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium truncate ${entry.isCurrentUser ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                            {entry.name}
                                        </p>
                                        {entry.isCurrentUser && (
                                            <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded flex-shrink-0">Kamu</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">
                                        {entry.classroom?.name || `Kelas ${entry.grade || '-'}`}
                                        {entry.school?.name ? ` • ${entry.school.name}` : ''}
                                    </p>
                                </div>

                                {/* Streak */}
                                <div className="hidden sm:flex items-center gap-1 text-orange-500">
                                    <span>🔥</span>
                                    <span className="font-medium">{entry.streakDays}</span>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white">{entry.totalXP.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400">XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Motivation */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
                <span className="text-4xl mb-3 block">💪</span>
                <h3 className="text-xl font-bold mb-2">Terus Semangat!</h3>
                <p className="text-white/80">Selesaikan lebih banyak quiz dan kumpulkan XP untuk naik peringkat!</p>
                <Link to="/siswa/belajar"
                    className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-2 rounded-xl mt-4 hover:bg-white/90 transition-colors">
                    <span className="material-symbols-outlined">play_arrow</span>
                    Mulai Belajar
                </Link>
            </div>
        </div>
    )
}
