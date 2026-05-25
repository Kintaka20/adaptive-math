import { useState, useRef, useEffect } from 'react'
import LatexRenderer from '../../components/LatexRenderer'
import { chatApi, studentApi } from '../../lib/api'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface ChapterOption {
    id: string
    name: string
    status: 'completed' | 'in_progress' | 'locked'
}

interface ChatSessionItem {
    id: string
    title: string
    updatedAt: string
    chapter?: { name: string }
    _count?: { messages: number }
    messages?: { content: string; createdAt: string }[]
}

export default function AITutorPage() {
    const [showTopicSelector, setShowTopicSelector] = useState(true)
    const [chapters, setChapters] = useState<ChapterOption[]>([])
    const [chatHistory, setChatHistory] = useState<ChatSessionItem[]>([])
    const [isLoadingTopics, setIsLoadingTopics] = useState(true)

    const [chatMode, setChatMode] = useState<'chat' | 'evaluate'>('chat')
    const [evalQuestion, setEvalQuestion] = useState('')
    const [evalSteps, setEvalSteps] = useState<string[]>([''])

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        const el = messagesEndRef.current
        if (el?.parentElement) {
            el.parentElement.scrollTop = el.parentElement.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        loadTopicData()
    }, [])

    const loadTopicData = async () => {
        setIsLoadingTopics(true)
        try {
            const pathData = await studentApi.learningPath() as any[]
            const chapterList: ChapterOption[] = pathData.map((item: any) => {
                const materials = item.materials || []
                const quizzes = item.quizzes || []
                const allDone = [...materials.map((m: any) => m.isCompleted), ...quizzes.map((q: any) => q.isPassed)]
                const completed = allDone.filter(Boolean).length
                const total = allDone.length
                let status: ChapterOption['status'] = 'locked'
                if (item.chapter.isLocked) status = 'locked'
                else if (total > 0 && completed === total) status = 'completed'
                else status = 'in_progress'

                return { id: item.chapter.id, name: item.chapter.name, status }
            })
            setChapters(chapterList)

            const sessions = await chatApi.sessions() as ChatSessionItem[]
            setChatHistory(sessions)
        } catch (err) {
            console.error('Failed to load topic data:', err)
        } finally {
            setIsLoadingTopics(false)
        }
    }

    const startNewChat = async (topic: string, chapterId?: string) => {
        setSelectedTopic(topic)
        setShowTopicSelector(false)
        setMessages([{
            id: 'greeting',
            role: 'assistant',
            content: `Halo! 👋 Saya AI Tutor yang siap membantumu belajar **${topic}**.\n\nKamu bisa bertanya tentang:\n- Konsep dasar dan teori\n- Cara menyelesaikan soal\n- Rumus dan penerapannya\n\nMau mulai dari mana? 🤔`,
            timestamp: new Date(),
        }])

        try {
            const session = await chatApi.createSession({ title: topic, chapterId })
            setSessionId(session.id)
        } catch (err) {
            console.error('Failed to create chat session:', err)
        }
    }

    const resumeChat = async (session: ChatSessionItem) => {
        setSelectedTopic(session.title || session.chapter?.name || 'Chat')
        setShowTopicSelector(false)
        setSessionId(session.id)

        try {
            const fullSession = await chatApi.getSession(session.id) as any
            const existingMessages: Message[] = (fullSession.messages || []).map((m: any) => ({
                id: m.id,
                role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
                content: m.content,
                timestamp: new Date(m.createdAt),
            }))
            setMessages(existingMessages.length > 0 ? existingMessages : [{
                id: 'greeting',
                role: 'assistant',
                content: `Sesi sebelumnya dimuat. Silakan lanjutkan bertanya! 🤓`,
                timestamp: new Date(),
            }])
        } catch (err) {
            console.error('Failed to load session:', err)
            setMessages([{
                id: 'error',
                role: 'assistant',
                content: 'Gagal memuat sesi sebelumnya. Mari mulai percakapan baru! 🔄',
                timestamp: new Date(),
            }])
        }
    }

    const handleSend = async (text?: string) => {
        const messageText = text || inputValue.trim()
        if (!messageText || isTyping) return

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        try {
            let currentSessionId = sessionId
            if (!currentSessionId) {
                const session = await chatApi.createSession({ title: selectedTopic || 'Chat' })
                currentSessionId = session.id
                setSessionId(currentSessionId)
            }

            const result = await chatApi.sendMessage(currentSessionId!, messageText)
            const assistantMessage: Message = {
                id: result.aiMessage.id || `ai-${Date.now()}`,
                role: 'assistant',
                content: result.aiMessage.content,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (err) {
            console.error('Failed to send message:', err)
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat menghubungi AI. Coba kirim ulang pertanyaanmu ya! 😅',
                timestamp: new Date(),
            }])
        } finally {
            setIsTyping(false)
            if (chatMode === 'chat') inputRef.current?.focus()
        }
    }

    const handleSendEval = async () => {
        if (!evalQuestion.trim() || evalSteps.filter(s => s.trim()).length === 0 || isTyping) return

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: `**Minta Evaluasi Langkah Penyelesaian:**\n\n**Soal:**\n${evalQuestion}\n\n**Langkah-langkah:**\n${evalSteps.filter(s => s.trim()).map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMessage])
        setIsTyping(true)

        try {
            let currentSessionId = sessionId
            if (!currentSessionId) {
                const session = await chatApi.createSession({ title: selectedTopic || 'Evaluasi Langkah' })
                currentSessionId = session.id
                setSessionId(currentSessionId)
            }

            const result = await chatApi.evaluateSteps(currentSessionId!, evalQuestion, evalSteps.filter(s => s.trim()))
            const assistantMessage: Message = {
                id: result.aiMessage.id || `ai-${Date.now()}`,
                role: 'assistant',
                content: result.aiMessage.content,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMessage])
            
            setEvalQuestion('')
            setEvalSteps([''])
            setChatMode('chat')
        } catch (err) {
            console.error('Failed to send eval:', err)
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat menghubungi AI. Coba kirim ulang ya! 😅',
                timestamp: new Date(),
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleBackToTopics = () => {
        setShowTopicSelector(true)
        setSessionId(null)
        setMessages([])
        setSelectedTopic(null)
        loadTopicData() // Refresh history
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins}m lalu`
        if (diffHours < 24) return `${diffHours}j lalu`
        if (diffDays < 7) return `${diffDays}h lalu`
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    const getSuggestions = (): string[] => {
        if (!selectedTopic) return []
        const topic = selectedTopic.toLowerCase()
        if (topic.includes('trigonometri')) return ['Bagaimana cara menghitung sin 30°?', 'Jelaskan identitas trigonometri', 'Apa itu aturan cosinus?']
        if (topic.includes('integral')) return ['Bagaimana cara menghitung integral tak tentu?', 'Jelaskan integral substitusi', 'Apa perbedaan integral tentu dan tak tentu?']
        if (topic.includes('turunan')) return ['Bagaimana cara menghitung turunan?', 'Apa itu aturan rantai?', 'Jelaskan turunan fungsi trigonometri']
        if (topic.includes('limit')) return ['Bagaimana cara menyelesaikan limit x→0?', 'Apa itu limit tak hingga?', 'Jelaskan aturan L\'Hopital']
        if (topic.includes('dimensi')) return ['Bagaimana menghitung jarak titik ke bidang?', 'Jelaskan sudut antara dua garis', 'Apa itu diagonal ruang?']
        return ['Jelaskan konsep dasar dari topik ini', 'Berikan contoh soal dan pembahasannya', 'Apa rumus-rumus penting yang perlu saya hafal?']
    }

    if (showTopicSelector) {
        return (
            <div className="space-y-6 pb-20 lg:pb-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">smart_toy</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">AI Tutor</h1>
                            <p className="opacity-90">Asisten belajar matematika personalmu</p>
                        </div>
                    </div>
                    <p className="text-white/80">
                        Pilih topik yang ingin kamu pelajari, atau lanjutkan percakapan sebelumnya.
                    </p>
                </div>

                {isLoadingTopics ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Topic Selection */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">topic</span>
                                Pilih Topik Pembelajaran
                            </h2>

                            {chapters.length === 0 ? (
                                <p className="text-center text-slate-500 py-4">Belum ada bab yang tersedia. Gabung ke kelas terlebih dahulu.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {chapters.filter(c => c.status !== 'locked').map(chapter => (
                                        <button
                                            key={chapter.id}
                                            onClick={() => startNewChat(chapter.name, chapter.id)}
                                            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                                        >
                                            <div className={`size-10 rounded-full flex items-center justify-center ${chapter.status === 'completed'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                : 'bg-primary/10'
                                                }`}>
                                                <span className={`material-symbols-outlined ${chapter.status === 'completed' ? 'text-emerald-600' : 'text-primary'}`}>
                                                    {chapter.status === 'completed' ? 'check_circle' : 'menu_book'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-white">{chapter.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {chapter.status === 'completed' ? 'Sudah selesai' : 'Sedang dipelajari'}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* General Chat Option */}
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => startNewChat('Matematika Umum')}
                                    className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    <span className="material-symbols-outlined">chat</span>
                                    Tanya Bebas (Semua Topik)
                                </button>
                            </div>
                        </div>

                        {/* Chat History */}
                        {chatHistory.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">history</span>
                                    Riwayat Percakapan
                                </h2>
                                <div className="space-y-2">
                                    {chatHistory.slice(0, 10).map(session => {
                                        const lastMsg = session.messages?.[0]?.content || ''
                                        const preview = lastMsg.slice(0, 60) + (lastMsg.length > 60 ? '...' : '')
                                        return (
                                            <button
                                                key={session.id}
                                                onClick={() => resumeChat(session)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                            >
                                                <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-purple-500 text-sm">forum</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                        {session.title || session.chapter?.name || 'Sesi Chat'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">{preview || 'Belum ada pesan'}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-xs text-slate-400">{formatTime(session.updatedAt)}</p>
                                                    {session._count?.messages ? (
                                                        <p className="text-xs text-slate-400">{session._count.messages} pesan</p>
                                                    ) : null}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    const suggestions = getSuggestions()

    return (
        <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-4 flex items-center gap-4">
                <button
                    onClick={handleBackToTopics}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                </button>
                <div className="size-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-2xl">smart_toy</span>
                </div>
                <div className="flex-1">
                    <h1 className="font-bold text-slate-900 dark:text-white">AI Tutor</h1>
                    <p className="text-sm text-slate-500">
                        Topik: <span className="text-primary font-medium">{selectedTopic}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-emerald-600">Online</span>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl mx-4 mb-2">
                <button
                    onClick={() => setChatMode('chat')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${chatMode === 'chat' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Chat Bebas
                </button>
                <button
                    onClick={() => setChatMode('evaluate')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${chatMode === 'evaluate' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Evaluasi Langkah
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 mx-4 mb-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'assistant'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-primary text-white'
                                }`}>
                                {message.role === 'assistant'
                                    ? <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    : <span className="text-sm font-bold">A</span>
                                }
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user'
                                ? 'bg-primary text-white rounded-br-md'
                                : 'bg-slate-100 dark:bg-slate-700 rounded-bl-md'
                                }`}>
                                {message.role === 'user' ? (
                                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <LatexRenderer content={message.content} />
                                )}
                                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                                    {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="size-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-sm">smart_toy</span>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md p-4">
                                <div className="flex gap-1">
                                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions (show only at start) */}
                {messages.length === 1 && suggestions.length > 0 && (
                    <div className="px-4 pb-2">
                        <p className="text-xs text-slate-400 mb-2">💡 Pertanyaan yang sering ditanyakan:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {chatMode === 'chat' ? (
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ketik pertanyaanmu di sini..."
                                    rows={1}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim() || isTyping}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                value={evalQuestion}
                                onChange={(e) => setEvalQuestion(e.target.value)}
                                placeholder="Masukkan soal matematika..."
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {evalSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="flex-shrink-0 text-slate-500 dark:text-slate-400 py-2 text-sm font-medium">
                                            {idx + 1}.
                                        </span>
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => {
                                                const newSteps = [...evalSteps]
                                                newSteps[idx] = e.target.value
                                                setEvalSteps(newSteps)
                                            }}
                                            placeholder={`Langkah operasional ke-${idx + 1}`}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                                        />
                                        {evalSteps.length > 1 && (
                                            <button
                                                onClick={() => setEvalSteps(evalSteps.filter((_, i) => i !== idx))}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={() => setEvalSteps([...evalSteps, ''])}
                                    className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Tambah Langkah
                                </button>
                                <button
                                    onClick={handleSendEval}
                                    disabled={!evalQuestion.trim() || evalSteps.filter(s => s.trim()).length === 0 || isTyping}
                                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                                >
                                    Kirim Evaluasi
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2 text-center">
                        AI Tutor didukung oleh teknologi AI. Selalu verifikasi informasi penting.
                    </p>
                </div>
            </div>
        </div>
    )
}
