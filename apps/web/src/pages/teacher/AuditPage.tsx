import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auditApi } from '../../lib/api'

interface AuditLog {
    id: string
    status: string
    createdAt: string
    auditedAt?: string
    feedback?: string
    message?: {
        id: string
        role: string
        content: string
        createdAt: string
        session?: {
            id: string
            title?: string
            _count?: { messages: number }
            student?: {
                user?: { name: string }
                classroom?: { name: string }
            }
        }
    }
}

type ChatStatus = 'all' | 'PENDING' | 'ACCURATE' | 'NEEDS_IMPROVEMENT' | 'INCORRECT'

export default function AuditPage() {
    const [selectedStatus, setSelectedStatus] = useState<ChatStatus>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        auditApi.list()
            .then(res => setLogs(Array.isArray(res) ? res as AuditLog[] : []))
            .catch(err => console.error('Failed to load audit logs', err))
            .finally(() => setIsLoading(false))
    }, [])

    const filtered = logs.filter(l => {
        if (selectedStatus !== 'all' && l.status !== selectedStatus) return false
        const name = l.message?.session?.student?.user?.name?.toLowerCase() || ''
        const topic = l.message?.session?.title?.toLowerCase() || ''
        const content = l.message?.content?.toLowerCase() || ''
        if (searchQuery && !name.includes(searchQuery.toLowerCase()) && !topic.includes(searchQuery.toLowerCase()) && !content.includes(searchQuery.toLowerCase())) return false
        return true
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">⏳ Perlu Review</span>
            case 'ACCURATE': return <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">✅ Akurat</span>
            case 'NEEDS_IMPROVEMENT': return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">📝 Perlu Perbaikan</span>
            case 'INCORRECT': return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium rounded-full">❌ Tidak Akurat</span>
            default: return <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 text-xs font-medium rounded-full">{status}</span>
        }
    }

    const counts = {
        all: logs.length,
        PENDING: logs.filter(l => l.status === 'PENDING').length,
        ACCURATE: logs.filter(l => l.status === 'ACCURATE').length,
        NEEDS_IMPROVEMENT: logs.filter(l => l.status === 'NEEDS_IMPROVEMENT').length,
        INCORRECT: logs.filter(l => l.status === 'INCORRECT').length,
    }

    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
        catch { return d }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">fact_check</span>
                    Audit Chat AI
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Review dan validasi respons AI Tutor untuk siswa Anda</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { key: 'all' as ChatStatus, label: 'Total', icon: 'chat', bg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
                    { key: 'PENDING' as ChatStatus, label: 'Pending', icon: 'pending', bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-500' },
                    { key: 'ACCURATE' as ChatStatus, label: 'Akurat', icon: 'check_circle', bg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' },
                    { key: 'NEEDS_IMPROVEMENT' as ChatStatus, label: 'Perbaikan', icon: 'edit_note', bg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
                    { key: 'INCORRECT' as ChatStatus, label: 'Salah', icon: 'cancel', bg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-500' },
                ].map(stat => (
                    <button key={stat.key} onClick={() => setSelectedStatus(stat.key)}
                        className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 transition-all text-left ${selectedStatus === stat.key
                            ? 'border-purple-500 shadow-lg shadow-purple-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`size-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {isLoading ? '...' : counts[stat.key]}
                                </p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" placeholder="Cari berdasarkan nama siswa, topik, atau konten pesan..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
            </div>

            {/* Chat List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">search_off</span>
                        <p className="text-slate-500 font-medium">{logs.length === 0 ? 'Belum ada log audit chat AI' : 'Tidak ada chat yang sesuai filter'}</p>
                        <p className="text-sm text-slate-400 mt-1">Log audit otomatis dibuat saat AI Tutor membalas siswa</p>
                    </div>
                ) : filtered.map((log) => {
                    const studentName = log.message?.session?.student?.user?.name || 'Siswa'
                    const sessionTitle = log.message?.session?.title || 'Chat AI'
                    const msgPreview = log.message?.content?.substring(0, 120) || ''
                    const msgCount = log.message?.session?._count?.messages

                    return (
                        <Link key={log.id} to={`/guru/audit/${log.id}`}
                            className={`block bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all hover:shadow-lg group ${log.status === 'PENDING'
                                ? 'border-amber-200 dark:border-amber-800 hover:border-amber-300'
                                : log.status === 'INCORRECT'
                                    ? 'border-red-200 dark:border-red-800 hover:border-red-300'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}>
                            <div className="flex items-start gap-4">
                                <div className="size-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">
                                    {studentName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="font-bold text-slate-900 dark:text-white">{studentName}</p>
                                        {getStatusBadge(log.status)}
                                    </div>
                                    <p className="font-medium text-primary mb-1 text-sm">{sessionTitle}</p>
                                    {msgPreview && (
                                        <p className="text-sm text-slate-500 truncate mb-2">{msgPreview}...</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        {msgCount && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">chat</span> {msgCount} pesan</span>}
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span> {formatDate(log.createdAt)}</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
