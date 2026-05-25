import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { monitoringApi } from '../../lib/api'
import { StudentSummary, MonitoringOverview } from '../../lib/types'

export default function MonitoringPage() {
    const [overview, setOverview] = useState<MonitoringOverview | null>(null)
    const [students, setStudents] = useState<StudentSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isStudentsLoading, setIsStudentsLoading] = useState(true)

    const [selectedClass, setSelectedClass] = useState('Semua Kelas')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'progress' | 'avgScore'>('name')
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)

    useEffect(() => {
        setIsLoading(true)
        monitoringApi.overview()
            .then(data => setOverview(data))
            .catch(err => console.error('Fetch monitoring overview failed', err))
            .finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        setIsStudentsLoading(true)
        let classId: string | undefined = undefined
        if (selectedClass !== 'Semua Kelas' && overview) {
            classId = overview.classes.find(c => c.name === selectedClass)?.id
        }
        monitoringApi.students(classId)
            .then(data => setStudents(data))
            .catch(err => console.error('Fetch students failed', err))
            .finally(() => setIsStudentsLoading(false))
    }, [selectedClass, overview])

    const classOptions = useMemo(() => {
        if (!overview) return ['Semua Kelas']
        return ['Semua Kelas', ...overview.classes.map(c => c.name)]
    }, [overview])

    const [showExportModal, setShowExportModal] = useState(false)
    const [exportOptions, setExportOptions] = useState({
        kelasX: true,
        kelasXI: true,
        kelasXII: true,
        includeRanking: true,
        includeProgress: true,
        includeScores: true,
        includeStruggling: true,
    })
    const [exportFormat, setExportFormat] = useState<'xlsx' | 'pdf' | 'csv'>('xlsx')
    const [isExporting, setIsExporting] = useState(false)

    const filteredStudents = students
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'progress') return (b.completedMaterials || 0) - (a.completedMaterials || 0)
            return b.avgScore - a.avgScore
        })

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    const avgClassProgress = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.avgScore || 0), 0) / students.length)
        : 0
    const strugglingStudentsCount = overview?.strugglingCount || students.filter(s => s.status === 'struggling').length

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <span className="text-emerald-500">↗</span>
            case 'down': return <span className="text-red-500">↘</span>
            default: return <span className="text-slate-400">→</span>
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-emerald-500'
        if (progress >= 60) return 'bg-amber-500'
        return 'bg-red-500'
    }

    const handleExport = () => {
        setIsExporting(true)
        try {
            const dataToExport = filteredStudents.map((s, index) => ({
                'No': index + 1,
                'Nama Siswa': s.name,
                'Email': s.email,
                'Kelas': s.grade ? `Kelas ${s.grade}` : 'Aktif',
                'Status': s.status === 'struggling' ? 'Kesulitan' : s.status === 'average' ? 'Rata-rata' : 'Baik',
                'Materi Selesai': s.completedMaterials,
                'Rata-rata Skor': s.avgScore,
                'Total Percobaan Kuis': s.totalAttempts,
                'Streak (Hari)': s.streakDays
            }))

            const ws = XLSX.utils.json_to_sheet(dataToExport)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Laporan Monitoring")
            XLSX.writeFile(wb, `Laporan_Monitoring_${selectedClass.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
        } catch (error) {
            console.error('Export failed', error)
            alert('Gagal mengekspor laporan')
        } finally {
            setIsExporting(false)
            setShowExportModal(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">monitoring</span>
                        Monitoring Siswa
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Pantau progres dan performa siswa</p>
                </div>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export Laporan
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500">group</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{overview?.totalStudents || 0}</p>
                            <p className="text-xs text-slate-500">Total Siswa</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {avgClassProgress}%
                            </p>
                            <p className="text-xs text-slate-500">Rata-rata Progres</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500">grade</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {overview?.avgScore || 0}
                            </p>
                            <p className="text-xs text-slate-500">Rata-rata Skor</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500">warning</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {strugglingStudentsCount}
                            </p>
                            <p className="text-xs text-slate-500">Perlu Perhatian</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Cari nama siswa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                </div>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                    <option value="name">Urutkan: Nama</option>
                    <option value="progress">Urutkan: Progres</option>
                    <option value="avgScore">Urutkan: Skor</option>
                </select>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isStudentsLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-48 animate-pulse" />
                    ))
                ) : filteredStudents.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        Belum ada data siswa untuk ditampilkan.
                    </div>
                ) : filteredStudents.map((student) => (
                    <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${student.status === 'struggling'
                            ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                            : 'border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-12 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                {student.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                                <p className="text-sm text-slate-500">Kelas {student.grade}</p>
                            </div>
                            {getTrendIcon(student.status === 'struggling' ? 'down' : 'up')}
                        </div>

                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Materi Selesai</span>
                                    <span className="font-medium">{student.completedMaterials}</span>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${getProgressColor((student.completedMaterials / 10) * 100)}`} style={{ width: `${Math.min((student.completedMaterials / 10) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Rata-rata Skor</span>
                                <span className="font-bold text-primary">{student.avgScore}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Streak</span>
                                <span className="font-medium">🔥 {student.streakDays} hari</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                            <p className="text-xs text-slate-400">Total Attempts: {student.totalAttempts}</p>
                            <Link to={`/guru/monitoring/siswa/${student.id}`} className="text-xs font-bold text-primary hover:underline">
                                Lihat Detail →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedStudent(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Detail Siswa</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-16 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h4>
                                    <p className="text-slate-500">Kelas {selectedStudent.grade}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-black text-primary">{selectedStudent.completedMaterials}</p>
                                    <p className="text-sm text-slate-500">Materi Selesai</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-black text-emerald-500">{selectedStudent.avgScore}</p>
                                    <p className="text-sm text-slate-500">Rata-rata Skor</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to={`/guru/monitoring/siswa/${selectedStudent.id}`}
                                    className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-center"
                                >
                                    Lihat Detail Lengkap
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">download</span>
                                Export Laporan Monitoring
                            </h3>
                            <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Class Level Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Pilih Tingkat Kelas
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ key: 'kelasX', label: 'Kelas X' }, { key: 'kelasXI', label: 'Kelas XI' }, { key: 'kelasXII', label: 'Kelas XII' }].map(item => (
                                        <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions[item.key as keyof typeof exportOptions] as boolean}
                                                onChange={(e) => setExportOptions({ ...exportOptions, [item.key]: e.target.checked })}
                                                className="size-4 rounded text-emerald-500"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                                        </label>
                                    ))}
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.kelasX && exportOptions.kelasXI && exportOptions.kelasXII}
                                            onChange={(e) => setExportOptions({ ...exportOptions, kelasX: e.target.checked, kelasXI: e.target.checked, kelasXII: e.target.checked })}
                                            className="size-4 rounded text-emerald-500"
                                        />
                                        <span className="text-slate-700 dark:text-slate-300">Semua Kelas</span>
                                    </label>
                                </div>
                            </div>

                            {/* Data Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Data yang Diekspor
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { key: 'includeRanking', label: 'Ranking Siswa', icon: 'leaderboard' },
                                        { key: 'includeProgress', label: 'Progress Belajar', icon: 'trending_up' },
                                        { key: 'includeScores', label: 'Nilai Kuis & Post-Test', icon: 'grade' },
                                        { key: 'includeStruggling', label: 'Daftar Siswa Kesulitan', icon: 'warning' },
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions[item.key as keyof typeof exportOptions] as boolean}
                                                onChange={(e) => setExportOptions({ ...exportOptions, [item.key]: e.target.checked })}
                                                className="size-4 rounded text-emerald-500"
                                            />
                                            <span className="material-symbols-outlined text-slate-400 text-sm">{item.icon}</span>
                                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Format Export
                                </label>
                                <div className="flex gap-3">
                                    {['xlsx', 'pdf', 'csv'].map(format => (
                                        <button
                                            key={format}
                                            onClick={() => setExportFormat(format as typeof exportFormat)}
                                            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm border-2 transition-colors ${exportFormat === format
                                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
                                                }`}
                                        >
                                            {format.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Info */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Preview: {filteredStudents.length} siswa akan diekspor
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Mengekspor...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Export Laporan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
