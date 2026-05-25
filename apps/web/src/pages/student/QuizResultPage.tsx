import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { quizApi } from '../../lib/api'

interface QuestionResult {
    id: string
    text?: string
    question?: string
    topic?: string
    options?: { id: string; text: string }[]
    correctOptionId?: string
    selectedOptionId?: string
    isCorrect: boolean
    explanation?: string
}

interface AttemptDetail {
    id: string
    score: number
    isPassed: boolean
    timeSpent?: number
    submittedAt?: string
    correctCount?: number
    wrongCount?: number
    quiz?: { id: string; title: string; chapter?: { name: string } }
    class?: { kkm?: number }
    answers?: QuestionResult[]
    xpEarned?: number
    xpBreakdown?: { baseXP: number; timeBonus: number; perfectBonus: number; totalXP: number }
}

interface RemedialData {
    originalQuiz: { id: string; title: string; passingScore: number }
    lastScore: number
    wrongCount: number
    remedialQuiz: { id: string; title: string; totalQuestions: number; isPassed: boolean } | null
    recommendedMaterials: { id: string; title: string; duration?: string; isCompleted: boolean }[]
}

export default function QuizResultPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [attempt, setAttempt] = useState<AttemptDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showConfetti, setShowConfetti] = useState(false)
    const [showSolutions, setShowSolutions] = useState(false)
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
    const [remedialData, setRemedialData] = useState<RemedialData | null>(null)

    useEffect(() => {
        if (!id) return
        quizApi.getResult(id)
            .then(res => {
                const data = res as AttemptDetail
                setAttempt(data)
                if (data.isPassed) {
                    setShowConfetti(true)
                    setTimeout(() => setShowConfetti(false), 3000)
                } else if (data.quiz?.id) {
                    quizApi.getRemedial(data.quiz.id)
                        .then((rRes: any) => {
                            if (rRes) setRemedialData(rRes as RemedialData)
                        })
                        .catch(err => console.error('Failed to load remedial:', err))
                }
            })
            .catch(err => {
                console.error('Failed to load quiz result', err)
                setError('Gagal memuat hasil kuis')
            })
            .finally(() => setIsLoading(false))
    }, [id])

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="size-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    if (error || !attempt) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">assignment</span>
                <p className="text-slate-500">{error || 'Hasil kuis tidak ditemukan'}</p>
                <Link to="/siswa/belajar" className="text-primary hover:underline mt-4 inline-block">← Kembali</Link>
            </div>
        </div>
    )

    const kkm = attempt.class?.kkm ?? 70
    const xpEarned = attempt.xpBreakdown?.totalXP ?? attempt.xpEarned ?? (attempt.isPassed ? 100 : 50)
    const timeTaken = attempt.timeSpent
        ? `${Math.floor(attempt.timeSpent / 60).toString().padStart(2, '0')}:${(attempt.timeSpent % 60).toString().padStart(2, '0')}`
        : '-'
    const questions: QuestionResult[] = attempt.answers || []
    const incorrectQuestions = questions.filter(q => !q.isCorrect)

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Confetti */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(40)].map((_, i) => (
                        <div key={i} className="absolute animate-bounce"
                            style={{ left: `${Math.random() * 100}%`, top: `-20px`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s` }}>
                            {['🎉', '🎊', '⭐', '✨'][Math.floor(Math.random() * 4)]}
                        </div>
                    ))}
                </div>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link to="/siswa/belajar" className="hover:text-primary">Jalur Belajar</Link>
                {attempt.quiz?.chapter?.name && <><span>/</span><span>{attempt.quiz.chapter.name}</span></>}
                <span>/</span>
                <span className="text-slate-900 dark:text-white">{attempt.quiz?.title || 'Hasil Kuis'}</span>
            </div>

            {/* Score Card */}
            <div className={`rounded-2xl p-6 text-center ${attempt.isPassed
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                <h1 className="text-xl font-bold text-white/90 mb-2">🎯 {attempt.quiz?.title}</h1>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block mb-4">
                    <p className="text-6xl font-black text-white">{attempt.score}</p>
                    <p className="text-white/80">dari 100</p>
                </div>
                <div className="max-w-md mx-auto mb-4">
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${attempt.score}%` }} />
                    </div>
                </div>
                <div className="flex justify-center gap-6 text-white">
                    <div>
                        <span className="text-2xl font-bold">✅ {attempt.correctCount ?? questions.filter(q => q.isCorrect).length}</span>
                        <p className="text-sm text-white/80">Benar</p>
                    </div>
                    <div>
                        <span className="text-2xl font-bold">❌ {attempt.wrongCount ?? incorrectQuestions.length}</span>
                        <p className="text-sm text-white/80">Salah</p>
                    </div>
                    <div>
                        <span className="text-2xl font-bold">⏱️ {timeTaken}</span>
                        <p className="text-sm text-white/80">Waktu</p>
                    </div>
                </div>
            </div>

            {/* Path Determination */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">route</span>
                    📊 Penentuan Jalur Belajar
                </h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <p className="text-sm text-slate-500 mb-1">KKM Bab Ini</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{kkm}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <p className="text-sm text-slate-500 mb-1">Skor Anda</p>
                        <p className={`text-2xl font-black ${attempt.isPassed ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {attempt.score} {attempt.isPassed ? '✅' : '⚠️'}
                        </p>
                    </div>
                </div>

                <div className={`rounded-xl p-4 ${attempt.isPassed
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`size-12 rounded-xl flex items-center justify-center ${attempt.isPassed ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                            <span className="text-2xl">{attempt.isPassed ? '🟢' : '🔴'}</span>
                        </div>
                        <div>
                            <p className={`font-bold text-lg ${attempt.isPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                JALUR {attempt.isPassed ? 'REGULER' : 'REMEDIAL'}
                            </p>
                            <p className={`text-sm ${attempt.isPassed ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}>
                                {attempt.isPassed ? 'Selamat! Anda lulus dan bisa lanjut ke bab berikutnya.' : 'Anda perlu mengulang materi sebelum melanjutkan.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* XP Earned */}
                <div className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⭐</span>
                        <div>
                            <p className="font-bold text-white">XP Diperoleh</p>
                            <p className="text-white/80 text-sm">Dari kuis ini</p>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">+{xpEarned}</p>
                </div>
            </div>

            {/* Review Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">menu_book</span>
                        📖 Pembahasan Lengkap
                    </h2>
                    {questions.length > 0 && (
                        <button onClick={() => setShowSolutions(!showSolutions)}
                            className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">{showSolutions ? 'visibility_off' : 'visibility'}</span>
                            {showSolutions ? 'Sembunyikan' : 'Tampilkan Semua'}
                        </button>
                    )}
                </div>

                {questions.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">Detail jawaban tidak tersedia</p>
                ) : (
                    <>
                        {/* Quick Summary */}
                        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                            {questions.map((q, i) => (
                                <button key={q.id}
                                    onClick={() => { setShowSolutions(true); setExpandedQuestion(expandedQuestion === q.id ? null : q.id) }}
                                    className={`flex-shrink-0 size-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${q.isCorrect
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200'
                                    } ${expandedQuestion === q.id ? 'ring-2 ring-primary scale-110' : ''}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Solutions */}
                        {showSolutions && (
                            <div className="space-y-4">
                                {questions.map((q, index) => {
                                    const qText = q.text || q.question || `Soal ${index + 1}`
                                    return (
                                        <div key={q.id} className={`rounded-xl border overflow-hidden ${q.isCorrect
                                            ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}>
                                            <button onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                                className={`w-full p-4 flex items-center gap-4 text-left ${q.isCorrect
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                                <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${q.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {q.isCorrect ? '✓' : '✗'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        Soal {index + 1}{q.topic ? `: ${q.topic}` : ''}
                                                    </p>
                                                    <div className="text-sm text-slate-500 truncate"><LatexRenderer content={qText} /></div>
                                                </div>
                                                <span className={`material-symbols-outlined transition-transform ${expandedQuestion === q.id ? 'rotate-180' : ''}`}>expand_more</span>
                                            </button>

                                            {expandedQuestion === q.id && (
                                                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                    <div className="mb-4">
                                                        <LatexRenderer content={qText} />
                                                    </div>
                                                    {/* Options */}
                                                    {q.options && q.options.length > 0 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                            {q.options.map(opt => {
                                                                const isCorrect = opt.id === q.correctOptionId
                                                                const isSelected = opt.id === q.selectedOptionId && !isCorrect
                                                                return (
                                                                    <div key={opt.id}
                                                                        className={`p-3 rounded-xl flex items-center gap-3 ${isCorrect
                                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
                                                                            : isSelected ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                                                                                : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                                                        <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-emerald-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                                                                            {opt.id}
                                                                        </span>
                                                                        <span className={`${isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-medium' : isSelected ? 'text-red-700 dark:text-red-300 line-through' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                            <LatexRenderer content={opt.text} />
                                                                        </span>
                                                                        {isCorrect && <span className="ml-auto text-emerald-500 text-sm">✓ Benar</span>}
                                                                        {isSelected && <span className="ml-auto text-red-500 text-sm">Jawaban Anda</span>}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                    {q.explanation && (
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                                            <p className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                                <span className="material-symbols-outlined">lightbulb</span>
                                                                Pembahasan:
                                                            </p>
                                                            <LatexRenderer content={q.explanation} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Incorrect topics shortcut */}
                        {!showSolutions && incorrectQuestions.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="font-medium text-red-700 dark:text-red-400 mb-2">
                                    ❌ {incorrectQuestions.length} soal yang perlu dipelajari ulang:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {incorrectQuestions.map((q, i) => (
                                        <button key={q.id}
                                            onClick={() => { setShowSolutions(true); setExpandedQuestion(q.id) }}
                                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors">
                                            {q.topic || `Soal ${i + 1}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Remedial Section - Only when failed */}
            {!attempt.isPassed && remedialData && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-300 dark:border-amber-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 rounded-xl bg-amber-500 flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">Paket Remedial Otomatis</h2>
                            <p className="text-sm text-amber-700 dark:text-amber-400">Disesuaikan dengan kelemahanmu</p>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 mb-4">
                        <p className="text-amber-800 dark:text-amber-300 mb-2 font-medium">
                            📊 Kamu menjawab salah <span className="font-bold text-red-600">{remedialData.wrongCount} soal</span>.
                            Skor: <span className="font-bold">{Math.round(remedialData.lastScore)}</span> dari KKM <span className="font-bold">{remedialData.originalQuiz.passingScore}</span>.
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            Kami sudah menyiapkan kuis remedial dengan soal yang lebih mudah untuk membangun pemahamanmu.
                        </p>
                    </div>

                    {remedialData.recommendedMaterials.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">
                                📖 Pelajari Ulang Materi Ini:
                            </h3>
                            <div className="space-y-2">
                                {remedialData.recommendedMaterials.map(m => (
                                    <Link
                                        key={m.id}
                                        to={`/siswa/belajar/lesson/${m.id}`}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            m.isCompleted
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                                                : 'bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 hover:border-amber-400'
                                        }`}
                                    >
                                        <div className={`size-8 rounded-full flex items-center justify-center ${
                                            m.isCompleted ? 'bg-emerald-500 text-white' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600'
                                        }`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {m.isCompleted ? 'check' : 'menu_book'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">{m.title}</p>
                                            {m.duration && <p className="text-xs text-slate-500">{m.duration}</p>}
                                        </div>
                                        {m.isCompleted
                                            ? <span className="text-xs text-emerald-600 font-medium">✅ Selesai</span>
                                            : <span className="text-xs text-amber-600 font-bold">⚠️ Perlu Review</span>
                                        }
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {remedialData.remedialQuiz && !remedialData.remedialQuiz.isPassed && (
                        <Link
                            to={`/siswa/quiz/${remedialData.remedialQuiz.id}`}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:scale-[1.02]"
                        >
                            <span className="material-symbols-outlined">quiz</span>
                            Kerjakan Kuis Remedial ({remedialData.remedialQuiz.totalQuestions} soal)
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    )}
                    {remedialData.remedialQuiz?.isPassed && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-4 text-center">
                            <span className="text-2xl">🎉</span>
                            <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-1">Remedial Sudah Lulus!</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-300">Kamu bisa melanjutkan ke bab berikutnya.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/siswa/ai-tutor')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">smart_toy</span>
                    Tanya AI Tutor
                </button>
                <button onClick={() => navigate('/siswa/belajar')}
                    className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                    {attempt.isPassed ? 'Lanjut ke Bab Berikutnya' : 'Kembali ke Jalur Belajar'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}
