import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chatApi } from '../../lib/api'

interface ChatMessage {
    id: string
    role: 'USER' | 'ASSISTANT'
    content: string
    createdAt: string
}

interface ChatSession {
    id: string
    title?: string
    createdAt: string
    updatedAt: string
    messages?: ChatMessage[]
    chapter?: { name: string }
    _count?: { messages: number }
}

export default function ChatHistoryPage() {
    const { id } = useParams<{ id: string }>()
    const [session, setSession] = useState<ChatSession | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return
        chatApi.getSession(id)
            .then(s => setSession(s as ChatSession))
            .catch(err => {
                console.error('Failed to load chat session', err)
                setError('Gagal memuat riwayat chat')
            })
            .finally(() => setIsLoading(false))
    }, [id])

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    if (error || !session) return (
        <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">forum</span>
            <p className="text-slate-500">{error || 'Sesi chat tidak ditemukan'}</p>
            <Link to="/siswa/ai-tutor" className="text-primary hover:underline mt-4 inline-block">← Kembali ke AI Tutor</Link>
        </div>
    )

    const messages = session.messages || []
    const msgCount = session._count?.messages ?? messages.length
    const startTime = new Date(session.createdAt)
    const endTime = new Date(session.updatedAt)
    const durationMs = endTime.getTime() - startTime.getTime()
    const durationMin = Math.max(1, Math.round(durationMs / 60000))

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/siswa/ai-tutor" className="hover:text-primary">AI Tutor</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Riwayat Chat</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">forum</span>
                    {session.title || 'Sesi Chat'}
                </h1>
                {session.chapter?.name && (
                    <p className="text-slate-600 dark:text-slate-400">
                        Bab: {session.chapter.name} • {startTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Durasi</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{durationMin} menit</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Pesan</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{msgCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Waktu</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white">Riwayat Percakapan</h2>
                </div>
                <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Tidak ada pesan dalam sesi ini</p>
                    ) : messages.map(message => (
                        <div key={message.id} className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${message.role === 'USER'
                                ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-medium ${message.role === 'USER' ? 'text-white/90' : 'text-slate-500'}`}>
                                        {message.role === 'USER' ? '👤 Kamu' : '🤖 AI Tutor'}
                                    </span>
                                    <span className={`text-xs ${message.role === 'USER' ? 'text-white/70' : 'text-slate-400'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-sm whitespace-pre-wrap ${message.role === 'USER' ? 'text-white/90' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/siswa/ai-tutor"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">smart_toy</span>
                    Chat Baru
                </Link>
                <Link to="/siswa/belajar"
                    className="flex-1 border border-slate-200 dark:border-slate-700 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali ke Materi
                </Link>
            </div>
        </div>
    )
}
