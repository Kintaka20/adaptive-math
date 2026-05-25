import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { auditApi } from '../../lib/api'
import LatexRenderer from '../../components/LatexRenderer'

interface ChatMsg {
    id: string
    role: 'USER' | 'ASSISTANT' | 'SYSTEM'
    content: string
    createdAt: string
}

interface AuditDetail {
    id: string
    status: string
    feedback?: string
    createdAt: string
    auditedAt?: string
    messageId: string
    message: {
        id: string
        role: string
        content: string
        createdAt: string
        session: {
            id: string
            title?: string
            createdAt: string
            messages: ChatMsg[]
            student: {
                id: string
                user: { name: string; email?: string }
            }
        }
    }
}

type ReviewStatus = 'ACCURATE' | 'NEEDS_IMPROVEMENT' | 'INCORRECT'

export default function AuditDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [audit, setAudit] = useState<AuditDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [feedback, setFeedback] = useState('')
    const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [savedSuccess, setSavedSuccess] = useState(false)

    useEffect(() => {
        if (!id) return
        setIsLoading(true)
        auditApi.get(id)
            .then(res => {
                const data = res as AuditDetail
                setAudit(data)
                setFeedback(data.feedback || '')
                if (data.status !== 'PENDING') {
                    setReviewStatus(data.status as ReviewStatus)
                }
            })
            .catch(err => {
                console.error('Failed to load audit detail', err)
                setError('Gagal memuat detail audit')
            })
            .finally(() => setIsLoading(false))
    }, [id])

    const handleSaveReview = async () => {
        if (!id || !reviewStatus) return
        setIsSaving(true)
        try {
            await auditApi.review(id, {
                status: reviewStatus,
                feedback: feedback.trim() || undefined,
            })
            setSavedSuccess(true)
            setTimeout(() => navigate('/guru/audit'), 1500)
        } catch (err) {
            console.error('Failed to save review', err)
            alert('Gagal menyimpan review')
        } finally {
            setIsSaving(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-sm font-medium rounded-full">⏳ Menunggu Review</span>
            case 'ACCURATE': return <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-sm font-medium rounded-full">✅ Akurat</span>
            case 'NEEDS_IMPROVEMENT': return <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm font-medium rounded-full">📝 Perlu Perbaikan</span>
            case 'INCORRECT': return <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 text-sm font-medium rounded-full">❌ Tidak Akurat</span>
            default: return <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 text-sm font-medium rounded-full">{status}</span>
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500">Memuat detail audit...</p>
            </div>
        )
    }

    if (error || !audit) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="material-symbols-outlined text-5xl text-slate-300">error_outline</span>
                <p className="text-slate-500">{error || 'Audit tidak ditemukan'}</p>
                <Link to="/guru/audit" className="text-primary font-medium hover:underline">← Kembali ke Audit</Link>
            </div>
        )
    }

    const session = audit.message?.session
    const messages = session?.messages || []
    const studentName = session?.student?.user?.name || 'Siswa'
    const sessionTitle = session?.title || 'Sesi Chat AI'
    const auditedMessageId = audit.messageId
    const currentStatus = reviewStatus ? reviewStatus : audit.status

    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        catch { return d }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Success Banner */}
            {savedSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">Review berhasil disimpan! Mengalihkan...</p>
                </div>
            )}

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/guru/audit" className="hover:text-primary">Audit Chat AI</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Detail</span>
                </div>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">fact_check</span>
                            Audit: {sessionTitle}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            {studentName} • {formatDate(audit.createdAt)}
                        </p>
                    </div>
                    {getStatusBadge(currentStatus)}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Siswa</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{studentName}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Pesan</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{messages.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Topik</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{sessionTitle}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Tanggal</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatDate(session?.createdAt || audit.createdAt)}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chat Messages */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">forum</span>
                            Riwayat Percakapan
                        </h2>
                        <p className="text-sm text-slate-500">Pesan yang di-audit ditandai dengan border ungu</p>
                    </div>

                    <div className="p-4 max-h-[600px] overflow-y-auto space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 block text-slate-300">chat_bubble_outline</span>
                                <p>Tidak ada pesan dalam sesi ini</p>
                            </div>
                        ) : messages.map((msg) => {
                            const isUser = msg.role === 'USER'
                            const isAuditedMsg = msg.id === auditedMessageId
                            return (
                                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl ${isAuditedMsg
                                        ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : isUser
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-slate-700'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold ${isUser ? (isAuditedMsg ? 'text-primary' : 'text-white/80') : (isAuditedMsg ? 'text-purple-600' : 'text-slate-500')}`}>
                                                {isUser ? '👤 Siswa' : '🤖 AI Tutor'}
                                            </span>
                                            <span className={`text-xs ${isUser ? (isAuditedMsg ? 'text-slate-400' : 'text-white/60') : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isAuditedMsg && (
                                                <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                                                    🎯 Pesan yang diaudit
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-sm ${isUser ? (isAuditedMsg ? 'text-slate-800 dark:text-slate-200' : 'text-white/90') : 'text-slate-700 dark:text-slate-300'}`}>
                                            <LatexRenderer content={msg.content} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Review Panel */}
                <div className="space-y-4">
                    {/* Audited Message Preview */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">mark_chat_read</span>
                            Pesan AI yang Diaudit
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3">
                            <div className="text-sm text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto">
                                <LatexRenderer content={audit.message?.content || '-'} />
                            </div>
                        </div>
                    </div>

                    {/* Review Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">rate_review</span>
                            Penilaian
                        </h3>

                        <div className="space-y-2 mb-4">
                            {([
                                { value: 'ACCURATE' as ReviewStatus, label: '✅ Akurat', desc: 'Respons AI benar dan sesuai', color: 'emerald' },
                                { value: 'NEEDS_IMPROVEMENT' as ReviewStatus, label: '📝 Perlu Perbaikan', desc: 'Benar tapi bisa lebih baik', color: 'amber' },
                                { value: 'INCORRECT' as ReviewStatus, label: '❌ Tidak Akurat', desc: 'Respons mengandung kesalahan', color: 'red' },
                            ]).map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setReviewStatus(option.value)}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${reviewStatus === option.value
                                        ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{option.label}</p>
                                    <p className="text-xs text-slate-500">{option.desc}</p>
                                </button>
                            ))}
                        </div>

                        {/* Feedback */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Catatan / Koreksi (Opsional)
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tulis catatan koreksi atau perbaikan untuk respons AI ini..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        {/* Save */}
                        <button
                            onClick={handleSaveReview}
                            disabled={!reviewStatus || isSaving || savedSuccess}
                            className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-purple-500/25"
                        >
                            {isSaving ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : savedSuccess ? (
                                <>
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Tersimpan!
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Simpan Review
                                </>
                            )}
                        </button>
                    </div>

                    {/* Previous Feedback */}
                    {audit.feedback && audit.status !== 'PENDING' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-sm">history</span>
                                Review Sebelumnya
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{audit.feedback}</p>
                            {audit.auditedAt && (
                                <p className="text-xs text-blue-500 mt-2">Direview pada {formatDate(audit.auditedAt)}</p>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                            <div>
                                <p className="font-medium text-amber-700 dark:text-amber-400 text-sm">Tips Audit</p>
                                <ul className="text-xs text-amber-600 dark:text-amber-300 mt-1 space-y-1">
                                    <li>• Periksa kebenaran rumus matematika</li>
                                    <li>• Pastikan penjelasan sesuai kurikulum</li>
                                    <li>• Cek apakah bahasa mudah dipahami siswa</li>
                                    <li>• Beri koreksi jika ada kesalahan konsep</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between">
                <Link
                    to="/guru/audit"
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Kembali ke Daftar
                </Link>
            </div>
        </div>
    )
}
