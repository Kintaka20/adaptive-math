import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/api'

interface ApiLog {
    id: string
    method: string
    path: string
    statusCode: number
    duration: number
    userId?: string
    userAgent?: string
    ip?: string
    createdAt: string
}

export default function ApiLogsPage() {
    const [logs, setLogs] = useState<ApiLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all')
    const [searchEndpoint, setSearchEndpoint] = useState('')
    const [limit, setLimit] = useState(50)

    useEffect(() => {
        loadLogs()
    }, [limit])

    const loadLogs = async () => {
        setIsLoading(true)
        try {
            const data = await adminApi.apiLogs(limit)
            setLogs(Array.isArray(data) ? data as ApiLog[] : [])
        } catch (err) {
            console.error('Failed to load API logs:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        if (filter === 'success' && log.statusCode >= 400) return false
        if (filter === 'error' && log.statusCode < 400) return false
        if (searchEndpoint && !log.path.includes(searchEndpoint)) return false
        return true
    })

    // Compute stats from real data
    const totalRequests = logs.length
    const errorCount = logs.filter(l => l.statusCode >= 400).length
    const successRate = totalRequests > 0 ? ((totalRequests - errorCount) / totalRequests * 100).toFixed(1) : '0'
    const avgLatency = totalRequests > 0 ? Math.round(logs.reduce((sum, l) => sum + l.duration, 0) / totalRequests) : 0

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
        if (status >= 400 && status < 500) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
        return 'bg-red-100 dark:bg-red-900/30 text-red-600'
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/admin" className="hover:text-primary">Dashboard</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">API Logs</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">monitoring</span>
                        System & API Logs
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Monitor kesehatan API dan penggunaan sistem</p>
                </div>
                <button onClick={loadLogs} disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Requests</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalRequests}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Success Rate</p>
                    <p className="text-2xl font-black text-emerald-500">{successRate}%</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Avg Latency</p>
                    <p className="text-2xl font-black text-blue-500">{avgLatency}ms</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Errors</p>
                    <p className="text-2xl font-black text-red-500">{errorCount}</p>
                </div>
            </div>

            {/* Info Banner */}
            {logs.length === 0 && !isLoading && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-500">info</span>
                        <div>
                            <p className="font-medium text-blue-700 dark:text-blue-400">Belum Ada Log API</p>
                            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                Log API akan tercatat secara otomatis saat sistem digunakan. Pastikan middleware logging sudah aktif di backend.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                    {(['all', 'success', 'error'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {f === 'all' ? 'Semua' : f === 'success' ? '✓ Sukses' : '✗ Error'}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Filter endpoint..."
                    value={searchEndpoint}
                    onChange={(e) => setSearchEndpoint(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-1 max-w-xs"
                />
                <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value={25}>25 logs</option>
                    <option value={50}>50 logs</option>
                    <option value={100}>100 logs</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                        <p className="text-slate-500">Memuat log...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Waktu</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Endpoint</th>
                                    <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Latency</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Tidak ada log yang cocok dengan filter.
                                        </td>
                                    </tr>
                                ) : filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(log.createdAt).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                {log.method} {log.path}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(log.statusCode)}`}>
                                                {log.statusCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            <span className={log.duration > 2000 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}>
                                                {log.duration}ms
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {log.ip || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} logs</p>
                </div>
            </div>
        </div>
    )
}
