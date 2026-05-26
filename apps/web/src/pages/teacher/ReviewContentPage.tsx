import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { materialApi, quizApi } from '../../lib/api'
import LatexRenderer from '../../components/LatexRenderer'

type ContentData = {
    id: string
    type: 'material' | 'quiz'
    title: string
    chapter: string
    chapterId: string
    status: string
    lastUpdated: string
    author: string
    duration?: string
    description?: string
    content?: string
    videoUrl?: string
    questionCount?: number
    questions?: any[]
}

export default function ReviewContentPage() {
    const { chapterId, contentId } = useParams()
    const [content, setContent] = useState<ContentData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'preview' | 'comments'>('preview')
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState('')

    useEffect(() => {
        if (!contentId) return
        loadContent()
    }, [contentId])

    const loadContent = async () => {
        setIsLoading(true)
        setError('')
        try {
            try {
                const mat = await materialApi.get(contentId!)
                const m = mat as any
                setContent({
                    id: m.id,
                    type: 'material',
                    title: m.title,
                    chapter: m.chapter?.name || 'Bab',
                    chapterId: m.chapterId,
                    status: m.status?.toLowerCase() || 'draft',
                    lastUpdated: m.updatedAt || m.createdAt || '-',
                    author: m.createdBy?.user?.name || 'Sistem',
                    duration: m.duration || '-',
                    description: m.description,
                    content: m.content || '',
                    videoUrl: m.videoUrl,
                })
                setEditedContent(m.content || '')
                return
            } catch {
            }

            try {
                const quiz = await quizApi.get(contentId!)
                const q = quiz as any
                setContent({
                    id: q.id,
                    type: 'quiz',
                    title: q.title,
                    chapter: q.chapter?.name || 'Bab',
                    chapterId: q.chapterId,
                    status: q.status?.toLowerCase() || 'draft',
                    lastUpdated: q.updatedAt || q.createdAt || '-',
                    author: q.createdBy?.user?.name || 'Sistem',
                    description: q.description,
                    questionCount: q._count?.questions || q.questions?.length || 0,
                    questions: q.questions?.map((qq: any) => ({
                        id: qq.question?.id || qq.id,
                        order: qq.order,
                        text: qq.question?.text || qq.text || '',
                        options: (qq.question?.options || qq.options || []).map((o: any) => ({
                            id: o.id,
                            label: o.label,
                            text: o.text,
                            isCorrect: o.isCorrect,
                        })),
                        explanation: qq.question?.explanation || qq.explanation || '',
                        difficulty: qq.question?.difficulty || qq.difficulty || 'MEDIUM',
                        author: qq.question?.createdBy?.user?.name || 'Sistem',
                    })) || [],
                })
                return
            } catch {
            }

            setError('Konten tidak ditemukan. ID mungkin tidak valid.')
        } catch (err) {
            console.error('Failed to load content', err)
            setError('Gagal memuat konten.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!content) return
        try {
            if (content.type === 'material') {
                await materialApi.update(content.id, { content: editedContent })
            }
            setIsEditing(false)
            loadContent()
        } catch (err) {
            console.error('Failed to save', err)
            alert('Gagal menyimpan perubahan')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return { text: '✓ Published', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' }
            case 'draft': return { text: '📝 Draft', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' }
            case 'review': return { text: '👀 Review', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' }
            default: return { text: status, color: 'bg-slate-100 text-slate-600' }
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500">Memuat konten...</p>
            </div>
        )
    }

    if (error || !content) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="material-symbols-outlined text-5xl text-slate-300">error_outline</span>
                <p className="text-slate-500">{error || 'Konten tidak ditemukan'}</p>
                <Link to={`/guru/kelas/${chapterId}`} className="text-primary font-medium hover:underline">
                    ← Kembali ke Kelas
                </Link>
            </div>
        )
    }

    const badge = getStatusBadge(content.status)
    const isMaterial = content.type === 'material'
    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
        catch { return d }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/guru/kelas" className="hover:text-primary">Manajemen Kelas</Link>
                    <span>/</span>
                    <Link to={`/guru/kelas/${chapterId}`} className="hover:text-primary">{content.chapter}</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">{content.title}</span>
                </div>

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className={`material-symbols-outlined ${isMaterial ? 'text-blue-500' : 'text-amber-500'}`}>
                                    {isMaterial ? 'menu_book' : 'quiz'}
                                </span>
                                {content.title}
                            </h1>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                {badge.text}
                            </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            {isMaterial ? `Durasi: ${content.duration}` : `${content.questionCount} soal`}
                            {' • '}Terakhir diubah: {formatDate(content.lastUpdated)} oleh {content.author}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {isMaterial && (
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${isEditing
                                    ? 'bg-emerald-500 text-white'
                                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{isEditing ? 'save' : 'edit'}</span>
                                {isEditing ? 'Simpan' : 'Edit'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 ${activeTab === 'preview'
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Preview
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 ${activeTab === 'comments'
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">comment</span>
                    Komentar
                </button>
            </div>

            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    {isMaterial ? 'Konten Materi' : 'Daftar Soal'}
                                </h2>
                            </div>

                            {isMaterial ? (
                                <div className="p-6">
                                    {isEditing ? (
                                        <div>
                                            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                                                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">edit_note</span>
                                                    Mode Edit - Edit konten markdown di bawah ini
                                                </p>
                                            </div>
                                            <textarea
                                                value={editedContent}
                                                onChange={(e) => setEditedContent(e.target.value)}
                                                className="w-full h-96 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                                            />
                                        </div>
                                    ) : (
                                        <LatexRenderer content={content.content || '*Belum ada konten.*'} />
                                    )}

                                    {content.videoUrl && !isEditing && (
                                        <div className="mt-6">
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-red-500">
                                                    {content.videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? 'image' : 'play_circle'}
                                                </span>
                                                {content.videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? 'Gambar Materi' : 'Video Pembelajaran'}
                                            </h3>
                                            {content.videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? (
                                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex justify-center bg-slate-50 dark:bg-slate-900">
                                                    <img src={content.videoUrl} alt="Materi Media" className="max-w-full max-h-[500px] object-contain" />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                        <div className="text-center text-white">
                                                            <span className="material-symbols-outlined text-5xl mb-2">play_circle</span>
                                                            <p className="text-sm text-slate-400">{content.videoUrl}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {content.questions && content.questions.length > 0 ? (
                                        content.questions.map((question: any, index: number) => (
                                            <div key={question.id} className="p-4 rounded-xl border-transparent bg-slate-50 dark:bg-slate-700/50 border-2">
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900 dark:text-white mb-3">
                                                        {index + 1}. <LatexRenderer content={question.text} />
                                                    </div>
                                                    <div className="space-y-2 mb-3">
                                                        {question.options.map((option: any, optIndex: number) => (
                                                            <div
                                                                key={option.id || optIndex}
                                                                className={`flex items-center gap-3 p-2.5 rounded-lg ${option.isCorrect
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700'
                                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                                                    }`}
                                                            >
                                                                <span className="size-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-medium">
                                                                    {option.label || String.fromCharCode(65 + optIndex)}
                                                                </span>
                                                                <span className={option.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : ''}>
                                                                    <LatexRenderer content={option.text} />
                                                                </span>
                                                                {option.isCorrect && (
                                                                    <span className="ml-auto text-emerald-500 material-symbols-outlined text-sm">check_circle</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {question.explanation && (
                                                        <div className="text-sm text-slate-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mb-2">
                                                            <span className="font-medium text-blue-600">Penjelasan:</span> <LatexRenderer content={question.explanation} />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${question.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-600' :
                                                            question.difficulty === 'HARD' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                            }`}>
                                                            {question.difficulty === 'EASY' ? 'Mudah' : question.difficulty === 'HARD' ? 'Sulit' : 'Sedang'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>Oleh: {question.author}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">quiz</span>
                                            <p className="text-slate-500">Belum ada soal dalam kuis ini.</p>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => window.alert('Fitur Kelola Soal (Bank/Manual) akan segera hadir!')}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-500 font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                                        >
                                            <span className="material-symbols-outlined">add_circle</span>
                                            Kelola & Tambah Soal Kuis
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Informasi</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tipe</span>
                                    <span className="font-medium">{isMaterial ? '📖 Materi' : '📝 Kuis'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Bab</span>
                                    <span className="font-medium">{content.chapter}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.text}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Pembuat</span>
                                    <span className="font-medium">{content.author}</span>
                                </div>
                                {isMaterial && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Durasi</span>
                                        <span className="font-medium">{content.duration}</span>
                                    </div>
                                )}
                                {!isMaterial && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Jumlah Soal</span>
                                        <span className="font-medium">{content.questionCount}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                                <div>
                                    <p className="font-medium text-amber-700 dark:text-amber-400 text-sm">Tips Review</p>
                                    <ul className="text-xs text-amber-600 dark:text-amber-300 mt-1 space-y-1">
                                        <li>• Periksa kebenaran materi/jawaban</li>
                                        <li>• Pastikan bahasa mudah dipahami</li>
                                        <li>• Tambahkan komentar jika ada perbaikan</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-slate-900 dark:text-white">Komentar & Feedback</h2>
                    </div>
                    <div className="p-6 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 block text-slate-300">chat_bubble_outline</span>
                        <p>Fitur komentar akan segera hadir.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
