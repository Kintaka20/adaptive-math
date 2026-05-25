import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { classApi, monitoringApi, auditApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface ClassItem {
    id: string
    name: string
    joinCode: string
    grade: string
    _count?: { students: number }
}

interface StruggleStudent {
    id: string
    name: string
    className?: string
    failedAttempts?: number
    lastActivity?: string
}

interface AuditLog {
    id: string
    student?: { user?: { name: string } }
    chapter?: { name: string }
    status: string
    createdAt: string
    _count?: { messages: number }
}

const CLASS_COLORS = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-purple-500 to-purple-600',
    'from-rose-500 to-rose-600',
    'from-amber-500 to-amber-600',
]

export default function TeacherDashboard() {
    const { user } = useAuth()
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [struggles, setStruggles] = useState<StruggleStudent[]>([])
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0, pendingReviews: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                const [classesRes, struggleRes, auditRes] = await Promise.all([
                    classApi.list(),
                    monitoringApi.struggle(),
                    auditApi.list('PENDING'),
                ])
                const cls = Array.isArray(classesRes) ? classesRes as ClassItem[] : []
                const str = Array.isArray(struggleRes) ? struggleRes as StruggleStudent[] : []
                const aud = Array.isArray(auditRes) ? auditRes as AuditLog[] : []

                setClasses(cls)
                setStruggles(str.slice(0, 3))
                setAuditLogs(aud.slice(0, 3))

                const totalStudents = cls.reduce((sum, c) => sum + (c._count?.students || 0), 0)
                setStats({
                    totalStudents,
                    totalClasses: cls.length,
                    pendingReviews: aud.length,
                })
            } catch (err) {
                console.error('Failed to load dashboard', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const firstName = user?.name?.split(' ')[0] || 'Guru'

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-3xl font-black mb-2">
                        Selamat Datang, {firstName}! 👩‍🏫
                    </h1>
                    <p className="text-white/80 mb-4">Monitor progres siswa dan kelola kelas Anda</p>
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-2xl">group</span>
                            <div>
                                <p className="text-xs text-white/70">Total Siswa</p>
                                <p className="font-bold text-xl">{isLoading ? '...' : stats.totalStudents}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-2xl">class</span>
                            <div>
                                <p className="text-xs text-white/70">Kelas</p>
                                <p className="font-bold text-xl">{isLoading ? '...' : stats.totalClasses}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-2xl">fact_check</span>
                            <div>
                                <p className="text-xs text-white/70">Audit Pending</p>
                                <p className="font-bold text-xl">{isLoading ? '...' : stats.pendingReviews}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Struggle Alerts */}
            {struggles.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-red-500">warning</span>
                        <h2 className="font-bold text-red-700 dark:text-red-400">Siswa Perlu Perhatian</h2>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{struggles.length}</span>
                    </div>
                    <div className="space-y-2">
                        {struggles.map((s) => (
                            <div key={s.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-red-600">{s.name?.charAt(0) || '?'}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{s.name}</p>
                                        <p className="text-sm text-slate-500">{s.className || 'Perlu perhatian'}</p>
                                    </div>
                                </div>
                                <Link to={`/guru/monitoring/siswa/${s.id}`} className="text-primary font-medium text-sm hover:underline">
                                    Lihat Detail
                                </Link>
                            </div>
                        ))}
                    </div>
                    <Link to="/guru/monitoring/struggle" className="flex items-center gap-1 text-red-600 text-sm font-medium mt-3 hover:underline">
                        Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Classes */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">class</span>
                                Kelas Saya
                            </h2>
                            <Link to="/guru/kelas" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <span className="material-symbols-outlined text-4xl text-slate-300">class</span>
                                <p className="text-slate-500 text-sm">Belum ada kelas. Buat kelas pertama Anda!</p>
                                <Link to="/guru/kelas/create" className="text-primary text-sm font-medium hover:underline">+ Buat Kelas</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {classes.slice(0, 3).map((cls, i) => (
                                    <Link key={cls.id} to={`/guru/kelas/${cls.id}`}
                                        className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                                        <div className={`w-full h-2 rounded-full bg-gradient-to-r ${CLASS_COLORS[i % CLASS_COLORS.length]} mb-3`} />
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{cls.name}</h3>
                                        <p className="text-xs text-slate-500 mb-3 font-mono">Kode: {cls.joinCode}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">
                                                <span className="font-medium">{cls._count?.students || 0}</span> siswa
                                            </span>
                                            <span className="text-xs text-slate-400">Kelas {cls.grade}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aksi Cepat</h2>
                        <div className="space-y-2">
                            <Link to="/guru/kelas/create"
                                className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                                <span className="font-medium">Buat Kelas Baru</span>
                            </Link>
                            <Link to="/guru/bank-soal/create"
                                className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                                <span className="font-medium">Tambah Soal Baru</span>
                            </Link>
                            <Link to="/guru/audit"
                                className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors">
                                <span className="material-symbols-outlined">fact_check</span>
                                <span className="font-medium">Audit Chat AI</span>
                                {stats.pendingReviews > 0 && (
                                    <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {stats.pendingReviews}
                                    </span>
                                )}
                            </Link>
                            <Link to="/guru/monitoring/struggle"
                                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                                <span className="material-symbols-outlined">warning</span>
                                <span className="font-medium">Siswa Kesulitan</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Audit Logs */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">smart_toy</span>
                                Chat AI Terbaru
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">Belum ada log chat AI</p>
                            ) : auditLogs.map((log) => (
                                <Link key={log.id} to={`/guru/audit/${log.id}`}
                                    className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                                                {(log as any).student?.user?.name || 'Siswa'}
                                            </p>
                                            <p className="text-xs text-slate-500">{(log as any).chapter?.name || 'Chat AI'}</p>
                                        </div>
                                        {log.status === 'PENDING' && (
                                            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                                                Review
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link to="/guru/audit" className="flex items-center justify-center gap-1 text-primary text-sm font-medium mt-4 hover:underline">
                            Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
