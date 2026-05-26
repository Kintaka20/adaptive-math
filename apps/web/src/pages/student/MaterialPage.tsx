import { useState, useRef, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { materialApi, chatApi } from '../../lib/api'

interface Material {
    id: string
    title: string
    content: string
    videoUrl?: string
    pdfUrl?: string
    xpReward?: number
    duration?: string
    description?: string
    chapter?: { id: string; name: string }
}

interface ChatMessage {
    id: number
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function MaterialPage() {
    const { lessonId } = useParams()

    const [material, setMaterial] = useState<Material | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCompleted, setIsCompleted] = useState(false)
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [isMarkingDone, setIsMarkingDone] = useState(false)

    const [chatSessionId, setChatSessionId] = useState<string | null>(null)
    const [showAiPanel, setShowAiPanel] = useState(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!lessonId) return
        materialApi.get(lessonId)
            .then(m => {
                setMaterial(m as Material)
                setChatMessages([{
                    id: 1, role: 'assistant',
                    content: `Hai! 👋 Saya AI Tutor siap membantu kamu memahami **${(m as Material).title}**.\n\nAda yang mau ditanyakan?`,
                    timestamp: new Date(),
                }])
            })
            .catch(err => console.error('Failed to load material', err))
            .finally(() => setIsLoading(false))
    }, [lessonId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return
        const userMsg: ChatMessage = { id: Date.now(), role: 'user', content: chatInput, timestamp: new Date() }
        setChatMessages(prev => [...prev, userMsg])
        const inputText = chatInput
        setChatInput('')
        setIsTyping(true)

        try {
            let sessionId = chatSessionId
            if (!sessionId) {
                const session = await chatApi.createSession({ title: material?.title, chapterId: material?.chapter?.id })
                sessionId = session.id
                setChatSessionId(sessionId)
            }
            const result = await chatApi.sendMessage(sessionId!, inputText)
            setChatMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: result.aiMessage.content,
                timestamp: new Date(),
            }])
        } catch (err) {
            setChatMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Coba lagi ya!',
                timestamp: new Date(),
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleComplete = () => setShowCompleteModal(true)

    const handleConfirmComplete = async () => {
        if (!lessonId) return
        setIsMarkingDone(true)
        try {
            await materialApi.updateProgress(lessonId, { progress: 100, timeSpent: 10, isCompleted: true })
            setIsCompleted(true)
            setShowCompleteModal(false)
        } catch (err) {
            console.error('Failed to mark complete', err)
        } finally {
            setIsMarkingDone(false)
        }
    }

    const handleDownloadPDF = () => {
        if (!material) return
        
        if (material.pdfUrl) {
            window.open(material.pdfUrl, '_blank')
            return
        }

        const content = `${material.title}\n\n${material.content || ''}`
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${material.title.replace(/\s+/g, '_')}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    if (!material) return (
        <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">menu_book</span>
            <p className="text-slate-500">Materi tidak ditemukan</p>
            <Link to="/siswa/belajar" className="text-primary hover:underline mt-4 inline-block">← Kembali ke Jalur Belajar</Link>
        </div>
    )

    return (
        <div className="flex gap-6 pb-20 lg:pb-0">
            {/* Main Content */}
            <div className={`flex-1 space-y-6 max-w-4xl ${showAiPanel ? 'lg:mr-96' : ''}`}>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                    <Link to="/siswa/belajar" className="hover:text-primary">Jalur Belajar</Link>
                    <span>/</span>
                    {material.chapter && <><span>{material.chapter.name}</span><span>/</span></>}
                    <span className="text-slate-900 dark:text-white font-medium">{material.title}</span>
                </nav>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-3xl">menu_book</span>
                        <div>
                            {material.chapter && <p className="text-white/70 text-sm">{material.chapter.name}</p>}
                            <h1 className="text-2xl lg:text-3xl font-black">{material.title}</h1>
                        </div>
                    </div>
                    {material.description && <p className="text-white/80 mt-2">{material.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-4">
                        {material.duration && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {material.duration}
                            </div>
                        )}
                        {material.xpReward && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">star</span>
                                +{material.xpReward} XP
                            </div>
                        )}
                        <button onClick={handleDownloadPDF}
                            className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 hover:bg-white/30 transition-colors">
                            <span className="material-symbols-outlined text-sm">{material.pdfUrl ? 'description' : 'download'}</span>
                            {material.pdfUrl ? 'Buka Lampiran Dokumen' : 'Download Text'}
                        </button>
                    </div>
                </div>

                {/* Media Utama (Video / Image) */}
                {material.videoUrl && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {material.videoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || material.videoUrl.includes('/image/upload/') ? (
                            <img src={material.videoUrl} alt={material.title} className="w-full h-auto object-cover max-h-[500px]" />
                        ) : (
                            <div className="aspect-video bg-slate-900">
                                <iframe src={material.videoUrl} className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen />
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">article</span>
                            Materi Pembelajaran
                        </h2>
                        <button onClick={handleDownloadPDF}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined text-sm">{material.pdfUrl ? 'open_in_new' : 'picture_as_pdf'}</span>
                            {material.pdfUrl ? 'Buka Lampiran' : 'Export TXT'}
                        </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                        <LatexRenderer content={material.content || '_Konten belum tersedia_'} />
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between flex-wrap gap-4">
                    <Link to="/siswa/belajar"
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Jalur Belajar
                    </Link>

                    {!isCompleted ? (
                        <button onClick={handleComplete}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                            <span className="material-symbols-outlined">check_circle</span>
                            Selesai & Lanjutkan
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-500 font-bold">
                            <span className="material-symbols-outlined">check_circle</span>
                            Selesai! {material.xpReward ? `+${material.xpReward} XP` : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Tutor Toggle */}
            <button onClick={() => setShowAiPanel(!showAiPanel)}
                className={`fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 size-14 rounded-full shadow-xl flex items-center justify-center transition-all ${showAiPanel
                    ? 'bg-slate-600 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse'}`}>
                <span className="material-symbols-outlined text-2xl">{showAiPanel ? 'close' : 'smart_toy'}</span>
            </button>

            {/* AI Tutor Panel */}
            {showAiPanel && (
                <div className="fixed top-16 right-0 bottom-0 w-full lg:w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 z-30 flex flex-col shadow-xl">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white flex items-center gap-3">
                        <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">AI Tutor</h3>
                            <p className="text-xs text-white/80">Bantuan untuk: {material.title}</p>
                        </div>
                        <button onClick={() => setShowAiPanel(false)} className="lg:hidden p-2 hover:bg-white/20 rounded-xl">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-primary text-white'}`}>
                                    {msg.role === 'assistant'
                                        ? <span className="material-symbols-outlined text-sm">smart_toy</span>
                                        : <span className="text-xs font-bold">A</span>}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-slate-100 dark:bg-slate-700 rounded-bl-md'}`}>
                                    {msg.role === 'user'
                                        ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        : <LatexRenderer content={msg.content} className="text-sm" />
                                    }
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-2">
                                <div className="size-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md p-3">
                                    <div className="flex gap-1">
                                        <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2">
                            <input type="text" value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Tanya tentang materi ini..."
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none" />
                            <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-xl disabled:opacity-50">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompleteModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
                        <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-5xl">🎉</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Selesaikan Materi?</h3>
                        <p className="text-slate-500 mb-6">
                            Kamu akan mendapat <span className="font-bold text-primary">+{material.xpReward || 25} XP</span> dan melanjutkan ke konten berikutnya.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCompleteModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                                Batal
                            </button>
                            <button onClick={handleConfirmComplete} disabled={isMarkingDone}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                {isMarkingDone ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                Ya, Selesai!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
