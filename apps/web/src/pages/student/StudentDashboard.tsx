import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { studentApi, classApi, ApiError } from '../../lib/api'
import { StudentDashboard as DashboardData } from '../../lib/types'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentDashboard() {
    const { user } = useAuth()
    const [dashboard, setDashboard] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showJoinClass, setShowJoinClass] = useState(false)
    const [classCode, setClassCode] = useState('')
    const [isJoining, setIsJoining] = useState(false)
    const [joinMsg, setJoinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        studentApi.dashboard()
            .then(data => setDashboard(data))
            .catch(err => console.error('Dashboard fetch error:', err))
            .finally(() => setIsLoading(false))
    }, [])

    const progressPercent = dashboard ? Math.min((dashboard.stats.totalXP / ((dashboard.stats.currentLevel) * 1000)) * 100, 100) : 0

    const handleJoinClass = async () => {
        if (!classCode.trim() || classCode.length !== 6) return
        setIsJoining(true)
        setJoinMsg(null)
        try {
            await classApi.join(classCode.toUpperCase())
            setJoinMsg({ type: 'success', text: `Berhasil bergabung dengan kode: ${classCode.toUpperCase()}` })
            setClassCode('')
            studentApi.dashboard().then(data => setDashboard(data)).catch(console.error)
            setTimeout(() => { setShowJoinClass(false); setJoinMsg(null) }, 2000)
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Gagal bergabung kelas'
            setJoinMsg({ type: 'error', text: msg })
        } finally {
            setIsJoining(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    ))}
                </div>
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            </div>
        )
    }

    const stats = dashboard?.stats ?? { totalXP: 0, currentLevel: 1, streakDays: 0, rank: 0, completedMaterials: 0, avgScore: 0 }
    const recentAttempts = dashboard?.recentAttempts ?? []
    const recentBadges = dashboard?.recentBadges ?? []

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-3xl font-black mb-2">
                        Selamat Datang, {user?.name?.split(' ')[0] ?? 'Siswa'}! 👋
                    </h1>
                    <p className="text-white/80 mb-4">
                        Lanjutkan perjalanan belajarmu hari ini!
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <p className="text-xs text-white/70">Streak</p>
                            <p className="font-bold">{stats.streakDays} hari</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <span className="text-2xl">⭐</span>
                            <div>
                                <p className="text-xs text-white/70">XP</p>
                            <p className="font-bold">{stats.totalXP.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <p className="text-xs text-white/70">Ranking</p>
                            <p className="font-bold">#{stats.rank}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrolled Classes Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">school</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Kelas Saat Ini</p>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {(dashboard as any)?.enrolledClasses?.length > 0
                                    ? `${(dashboard as any).enrolledClasses.length} Kelas Tergabung`
                                    : 'Belum Tergabung ke Kelas'}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowJoinClass(!showJoinClass)}
                        className="px-4 py-2 border-2 border-primary text-primary font-medium rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">{showJoinClass ? 'close' : 'add'}</span>
                        {showJoinClass ? 'Tutup' : 'Gabung Kelas Baru'}
                    </button>
                </div>

                {/* Enrolled Class Cards */}
                {(dashboard as any)?.enrolledClasses?.length > 0 && (
                    <div className="space-y-4 mb-3">
                        {/* Active Classes */}
                        <div className="space-y-2">
                            {(dashboard as any).enrolledClasses.filter((cls: any) => !cls.isFinished).map((cls: any) => (
                                <div key={cls.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl relative overflow-hidden group">
                                    <div className="size-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {cls.grade}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white truncate">{cls.name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                            <span>👨‍🏫 {cls.teacherName}</span>
                                            <span>•</span>
                                            <span>👥 {cls.totalStudents} siswa</span>
                                            <span>•</span>
                                            <span>📚 {cls.totalChapters} bab</span>
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                                        <span className="font-mono text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hidden sm:inline-block">
                                            {cls.joinCode}
                                        </span>
                                        <Link
                                            to={`/siswa/belajar?classId=${cls.id}`}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                                        >
                                            Mulai
                                            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Finished Classes */}
                        {(dashboard as any).enrolledClasses.filter((cls: any) => cls.isFinished).length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">task_alt</span>
                                    Kelas yang Sudah Selesai
                                </h4>
                                <div className="space-y-2">
                                    {(dashboard as any).enrolledClasses.filter((cls: any) => cls.isFinished).map((cls: any) => (
                                        <div key={cls.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                            <div className="size-10 bg-slate-300 dark:bg-slate-600 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                                                {cls.grade}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{cls.name}</p>
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">SELESAI</span>
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                                    <span>👨‍🏫 {cls.teacherName}</span>
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <Link
                                                    to={`/siswa/belajar?classId=${cls.id}`}
                                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                                                >
                                                    Lihat Materi
                                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Join Class Form */}
                {showJoinClass && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Masukkan kode kelas dari guru untuk bergabung ke kelas baru
                        </p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                placeholder="Masukkan kode 6 karakter"
                                maxLength={6}
                                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase tracking-widest font-mono focus:border-primary outline-none"
                            />
                            <button
                                onClick={handleJoinClass}
                                disabled={isJoining || classCode.length !== 6}
                                className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-50 flex items-center gap-2"
                            >
                                {isJoining ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">login</span>
                                )}
                                Gabung
                            </button>
                        </div>
                        {joinMsg && (
                            <p className={`mt-2 text-sm font-medium ${joinMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {joinMsg.text}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Learning Progress */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Chapter Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">menu_book</span>
                                Sedang Dipelajari
                            </h2>
                            {/* Remove static current chapter section for now or use placeholders until full backend returns it */}
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Lanjutkan Belajarmu
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 dark:text-slate-400">Rata-rata Skor</span>
                                        <span className="font-bold text-primary">{stats.avgScore}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.avgScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/siswa/belajar"
                                className="flex-1 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary-dark hover:to-indigo-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                            >
                                <span className="material-symbols-outlined">play_arrow</span>
                                Lanjutkan Belajar
                            </Link>
                            <Link
                                to="/siswa/ai-tutor"
                                className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors"
                            >
                                <span className="material-symbols-outlined">smart_toy</span>
                                AI Tutor
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Quiz Alert could be parsed from learning path in the future */}

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Aktivitas Terakhir
                        </h2>

                        <div className="space-y-3">
                            {recentAttempts.length === 0 ? (
                                <p className="text-sm text-slate-500">Belum ada aktivitas kuis.</p>
                            ) : (
                                recentAttempts.map((activity, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                            <span className="material-symbols-outlined">quiz</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{activity.quiz.title}</p>
                                            <p className="text-sm text-slate-500">
                                                Skor: {activity.score} • {activity.isPassed ? 'Lulus' : 'Belum Lulus'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400 flex-shrink-0">
                                            {new Date(activity.submittedAt).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats & Achievements */}
                <div className="space-y-6">
                    {/* Level Progress */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">military_tech</span>
                            Level Kamu
                        </h2>

                        <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center size-20 bg-gradient-to-r from-primary to-indigo-500 rounded-full mb-3">
                                <span className="text-3xl font-black text-white">{stats.currentLevel}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {stats.totalXP.toLocaleString()} / {(stats.currentLevel * 1000).toLocaleString()} XP
                            </p>
                        </div>

                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-2">
                            {(stats.currentLevel * 1000) - stats.totalXP} XP lagi ke Level {stats.currentLevel + 1}
                        </p>
                    </div>

                    {/* Overall Progress */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">trending_up</span>
                            Progres Keseluruhan
                        </h2>

                        <div className="flex items-center justify-center mb-4">
                            <div className="relative size-32">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        className="text-slate-200 dark:text-slate-700"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(stats.completedMaterials / Math.max(stats.completedMaterials, 10)) * 352} 352`}
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6467F2" />
                                            <stop offset="100%" stopColor="#818CF8" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.completedMaterials}</p>
                                        <p className="text-xs text-slate-500">Materi Selesai</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">emoji_events</span>
                            Pencapaian
                        </h2>

                        <div className="grid grid-cols-3 gap-3">
                            {recentBadges.length === 0 ? (
                                <p className="col-span-3 text-sm text-slate-500 text-center">Belum ada pencapaian.</p>
                            ) : (
                                recentBadges.map((badgeItem) => (
                                    <div
                                        key={badgeItem.id}
                                        className="p-3 rounded-xl text-center transition-all bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
                                        title={badgeItem.name}
                                    >
                                        <span className="text-2xl">{badgeItem.icon}</span>
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 truncate">{badgeItem.name}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
