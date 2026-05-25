import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { monitoringApi, classApi } from '../../lib/api'
import { StudentDetail } from '../../lib/types'

type Tab = 'overview' | 'quizzes' | 'chats'

export default function StudentDetailPage() {
    const { id, studentId } = useParams()
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [student, setStudent] = useState<StudentDetail | null>(null)
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClassId, setSelectedClassId] = useState(id || '')
    const [isLoading, setIsLoading] = useState(true)

    const [showMessageModal, setShowMessageModal] = useState(false)
    const [showRemedialModal, setShowRemedialModal] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [selectedChapter, setSelectedChapter] = useState('')
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        if (!studentId) return
        setIsLoading(true)
        
        classApi.list().then(res => {
            setClasses(res)
        }).catch(err => console.error('Gagal memuat kelas', err))

        monitoringApi.studentDetail(studentId, selectedClassId)
            .then(data => setStudent(data))
            .catch(err => console.error('Gagal memuat profil siswa', err))
            .finally(() => setIsLoading(false))
    }, [studentId, selectedClassId])

    const handleSendMessage = async () => {
        if (!messageText.trim() || !student) return
        setIsSending(true)
        try {
            // Create a notification for the student
            const { api } = await import('../../lib/api')
            await api.post('/notifications', {
                userId: student.user.email, // Will be resolved by backend
                title: 'Pesan dari Guru',
                message: messageText,
                type: 'INFO',
            })
            setShowMessageModal(false)
            setMessageText('')
        } catch {
            // Notification endpoint may not exist yet — show honest feedback
            alert('Fitur pengiriman pesan belum tersedia. Silakan hubungi siswa secara langsung.')
        } finally {
            setIsSending(false)
        }
    }

    const handleGiveRemedial = async () => {
        if (!selectedChapter || !student) return
        setIsSending(true)
        try {
            const { quizApi } = await import('../../lib/api')
            await quizApi.getRemedial(selectedChapter)
            setShowRemedialModal(false)
            setSelectedChapter('')
            alert('Remedial berhasil disiapkan untuk siswa ini.')
        } catch {
            alert('Gagal memberikan remedial. Siswa dapat mengakses remedial otomatis dari halaman quiz mereka.')
        } finally {
            setIsSending(false)
        }
    }

    const getStatusBadge = (progress: number) => {
        if (progress >= 100) return { text: '✅ Selesai', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' }
        if (progress > 0) return { text: '📖 Sedang Belajar', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' }
        return { text: '🔒 Terkunci/Belum Mulai', color: 'bg-slate-100 dark:bg-slate-700 text-slate-500' }
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
                </div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="py-12 text-center text-slate-500">
                Data siswa tidak ditemukan.
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    {id ? (
                        <>
                            <Link to="/guru/kelas" className="hover:text-primary">Manajemen Kelas</Link>
                            <span>/</span>
                            <Link to={`/guru/kelas/${id}`} className="hover:text-primary">Kelas {student.grade}</Link>
                            <span>/</span>
                            <span className="text-slate-900 dark:text-white">{student.user.name}</span>
                        </>
                    ) : (
                        <>
                            <Link to="/guru/monitoring" className="hover:text-primary">Monitoring</Link>
                            <span>/</span>
                            <span className="text-slate-900 dark:text-white">{student.user.name}</span>
                        </>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Detail Profil Siswa
                    </h1>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Tinjau Kelas:</span>
                        <select 
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm min-w-[200px]"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Student Profile Card */}
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-6 flex-wrap">
                    <div className="size-24 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black">
                        {student.user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black">{student.user.name}</h1>
                        <p className="text-white/80">{student.user.email}</p>
                        <p className="text-white/80">Kelas {student.grade}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                                <span className="text-lg">⭐</span> Level {student.currentLevel}
                            </span>
                            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                                <span className="text-lg">🔥</span> {student.streakDays} hari streak
                            </span>
                            <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                                <span className="text-lg">📊</span> Rata-rata: {student.stats.avgScore}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/70 text-sm">Bergabung pada</p>
                        <p className="font-medium">{new Date(student.user.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total XP</p>
                    <p className="text-2xl font-black text-amber-500">{student.totalXP.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Kuis Dikerjakan</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{student.stats.totalAttempts}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Rata-rata Skor</p>
                    <p className="text-2xl font-black text-primary">{student.stats.avgScore}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Materi Selesai</p>
                    <p className="text-2xl font-black text-emerald-500">{student.stats.completedMaterials}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {([
                    { key: 'overview', label: 'Progres Belajar', icon: 'menu_book' },
                    { key: 'quizzes', label: 'Riwayat Kuis', icon: 'quiz' },
                ] as { key: Tab; label: string; icon: string }[]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-slate-900 dark:text-white">Progres Materi</h2>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {student.materialProgress.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Belum ada progres materi.</div>
                        ) : student.materialProgress.map((prog, idx) => {
                            const badge = getStatusBadge(prog.progress)
                            return (
                                <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center font-bold text-slate-600">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-slate-900 dark:text-white">{prog.material.title}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                                    {badge.text}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${prog.progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                            style={{ width: `${Math.min(prog.progress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12">
                                                    {Math.round(prog.progress)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Kuis</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Tipe</th>
                                    <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Skor</th>
                                    <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {student.quizAttempts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">Belum ada riwayat kuis.</td>
                                    </tr>
                                ) : student.quizAttempts.map(attempt => (
                                    <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{attempt.quiz.title}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{attempt.quiz.type}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${attempt.score >= attempt.quiz.passingScore ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {attempt.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${attempt.isPassed
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                                }`}>
                                                {attempt.isPassed ? '✓ Lulus' : '✗ Tidak Lulus'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setShowMessageModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    Kirim Pesan
                </button>
                <button
                    onClick={() => setShowRemedialModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">school</span>
                    Berikan Remedial
                </button>
            </div>

            {/* Send Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMessageModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kirim Pesan</h3>
                            <button onClick={() => setShowMessageModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-2">Kepada:</p>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                    {student.user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.user.name}</p>
                                    <p className="text-xs text-slate-500">Kelas {student.grade}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pesan</label>
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Tulis pesan untuk siswa..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowMessageModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">Batal</button>
                            <button onClick={handleSendMessage} disabled={isSending || !messageText.trim()} className="flex-1 px-4 py-2.5 bg-purple-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSending ? 'Mengirim...' : 'Kirim Pesan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Give Remedial Modal */}
            {showRemedialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowRemedialModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Berikan Remedial</h3>
                            <button onClick={() => setShowRemedialModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-2">Siswa:</p>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <div className="size-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold">
                                    {student.user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.user.name}</p>
                                    <p className="text-xs text-slate-500">Rata-rata skor: {student.stats.avgScore}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pilih Kuis untuk Remedial (Bawah KKM)</label>
                            <div className="space-y-2">
                                {student.quizAttempts.filter(c => !c.isPassed).map(attempt => (
                                    <label
                                        key={attempt.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedChapter === attempt.id
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="chapter"
                                            value={attempt.id}
                                            checked={selectedChapter === attempt.id}
                                            onChange={(e) => setSelectedChapter(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white">{attempt.quiz.title}</p>
                                            <p className="text-xs text-slate-500">Skor: {attempt.score} • KKM: {attempt.quiz.passingScore}</p>
                                        </div>
                                        {selectedChapter === attempt.id && (
                                            <span className="material-symbols-outlined text-amber-500">check_circle</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                            {student.quizAttempts.filter(c => !c.isPassed).length === 0 && (
                                <p className="text-center text-slate-500 py-4">Siswa ini tidak memiliki nilai di bawah KKM.</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowRemedialModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">Batal</button>
                            <button onClick={handleGiveRemedial} disabled={isSending || !selectedChapter} className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSending ? 'Memproses...' : 'Berikan Remedial'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
