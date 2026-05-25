import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { monitoringApi } from '../../lib/api'

interface StruggleStudent {
    id: string
    name: string
    email?: string
    avatar?: string
    grade?: string
    avgScore: number
    totalAttempts: number
    lastActivity?: string
    struggleReason?: string
}

type FilterType = 'all' | 'critical' | 'warning'

export default function StrugglePage() {
    const [filter, setFilter] = useState<FilterType>('all')
    const [search, setSearch] = useState('')
    const [students, setStudents] = useState<StruggleStudent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        monitoringApi.struggle()
            .then(res => setStudents(Array.isArray(res) ? res as StruggleStudent[] : []))
            .catch(err => console.error('Failed to load struggle students', err))
            .finally(() => setIsLoading(false))
    }, [])

    const getStatus = (s: StruggleStudent): 'critical' | 'warning' => {
        if (s.avgScore < 50) return 'critical'
        return 'warning'
    }

    const filteredStudents = students.filter(s => {
        const status = getStatus(s)
        if (filter !== 'all' && status !== filter) return false
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const criticalCount = students.filter(s => getStatus(s) === 'critical').length
    const warningCount = students.filter(s => getStatus(s) === 'warning').length

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/guru/monitoring" className="hover:text-primary">Monitoring</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Siswa Kesulitan</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">warning</span>
                        Siswa yang Membutuhkan Bantuan
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Pantau dan bantu siswa yang mengalami kesulitan</p>
                </div>
            </div>

            {/* Alert Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100">🔴 Kritis</p>
                            <p className="text-3xl font-black">{isLoading ? '...' : criticalCount}</p>
                        </div>
                        <span className="text-4xl">🚨</span>
                    </div>
                    <p className="text-sm text-red-100 mt-2">Skor Rata-rata &lt; 50</p>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100">🟡 Perhatian</p>
                            <p className="text-3xl font-black">{isLoading ? '...' : warningCount}</p>
                        </div>
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <p className="text-sm text-amber-100 mt-2">Skor Rata-rata 50 - 59</p>
                </div>
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-300">Total Siswa</p>
                            <p className="text-3xl font-black">{isLoading ? '...' : students.length}</p>
                        </div>
                        <span className="text-4xl">👥</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-2">Membutuhkan bantuan</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                    {([
                        { key: 'all', label: 'Semua' },
                        { key: 'critical', label: '🔴 Kritis' },
                        { key: 'warning', label: '🟡 Perhatian' },
                    ] as { key: FilterType; label: string }[]).map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === f.key
                                ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <input type="text" placeholder="Cari siswa..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-1 max-w-xs outline-none" />
            </div>

            {/* Student Cards */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">sentiment_satisfied</span>
                    <p className="text-slate-500">{students.length === 0 ? 'Tidak ada siswa yang kesulitan saat ini' : 'Tidak ada siswa ditemukan'}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filteredStudents.map(student => {
                        const status = getStatus(student)
                        return (
                            <div key={student.id}
                                className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 ${status === 'critical'
                                    ? 'border-red-300 dark:border-red-800' : 'border-amber-300 dark:border-amber-800'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`size-14 rounded-xl flex items-center justify-center text-2xl font-black text-white ${status === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{student.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status === 'critical'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                                {status === 'critical' ? '🔴 Kritis' : '🟡 Perhatian'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">
                                            {student.grade ? `Kelas ${student.grade}` : 'Siswa Aktif'}
                                        </p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-slate-400">priority_high</span>
                                                <span className="text-slate-600 dark:text-slate-400">Percobaan Kuis:</span>
                                                <span className="font-medium text-red-500">{student.totalAttempts}x percobaan</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-slate-400">assessment</span>
                                                <span className="text-slate-600 dark:text-slate-400">Skor Rata-rata:</span>
                                                <span className="font-medium text-red-500">{student.avgScore}/100</span>
                                            </div>
                                            {student.struggleReason && (
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-slate-400">info</span>
                                                    <span className="text-slate-500 text-xs">{student.struggleReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <Link to={`/guru/monitoring/siswa/${student.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500">lightbulb</span>
                    <div>
                        <p className="font-medium text-blue-700 dark:text-blue-400">Tips Membantu Siswa</p>
                        <ul className="text-sm text-blue-600 dark:text-blue-300 mt-1 space-y-1">
                            <li>• Periksa riwayat chat AI untuk memahami kesulitan spesifik siswa</li>
                            <li>• Berikan materi remedial yang fokus pada topik yang lemah</li>
                            <li>• Jadwalkan sesi konsultasi jika diperlukan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
