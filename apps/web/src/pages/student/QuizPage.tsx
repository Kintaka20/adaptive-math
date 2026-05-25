import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { quizApi } from '../../lib/api'

interface QuizQuestion {
    id: string
    text: string
    options: { id: string; text: string }[]
    correctAnswer?: string
    questionId?: string
    question?: {
        id: string
        text: string
        options?: { label: string; text: string }[]
    }
}

interface Quiz {
    id: string
    title: string
    timeLimit?: number
    questions?: QuizQuestion[]
    chapter?: { name: string }
}

interface AttemptResult {
    id: string
    score: number
    isPassed: boolean
    correctCount?: number
    wrongCount?: number
    emptyCount?: number
}

export default function QuizPage() {
    const { id: quizId } = useParams<{ id: string }>()

    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState<AttemptResult | null>(null)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
    const [startedAt] = useState<number>(Date.now())

    useEffect(() => {
        if (!quizId) return
        quizApi.get(quizId)
            .then(async (q) => {
                const rawQuiz = q as any
                const normalizedQuestions: QuizQuestion[] = (rawQuiz.questions || []).map((qq: any) => {
                    if (qq.question) {
                        return {
                            id: qq.question.id || qq.questionId,
                            text: qq.question.text,
                            options: (qq.question.options || []).map((o: any) => ({
                                id: o.label || o.id,
                                text: o.text,
                            })),
                        }
                    }
                    return {
                        id: qq.id,
                        text: qq.text,
                        options: (qq.options || []).map((o: any) => ({
                            id: o.label || o.id,
                            text: o.text,
                        })),
                    }
                })

                const quiz: Quiz = {
                    id: rawQuiz.id,
                    title: rawQuiz.title,
                    timeLimit: rawQuiz.timeLimit,
                    chapter: rawQuiz.chapter,
                    questions: normalizedQuestions,
                }
                setQuiz(quiz)
                setTimeLeft((quiz.timeLimit || 15) * 60)
                try {
                    const attempt = await quizApi.start(quizId)
                    setAttemptId((attempt as any).id)
                } catch (e: any) {
                    const status = e?.response?.status || e?.status
                    const msg = e?.response?.data?.message || e?.message || ''
                    if (status === 403 || msg.includes('sudah')) {
                        setError(msg || 'Kamu tidak bisa mengerjakan kuis ini lagi. Silakan kerjakan kuis remedial.')
                        return
                    }
                    console.warn('Could not start attempt', e)
                }
            })
            .catch(err => {
                console.error('Failed to load quiz', err)
                setError('Gagal memuat kuis')
            })
            .finally(() => setIsLoading(false))
    }, [quizId])

    useEffect(() => {
        if (!quiz || showResult || timeLeft <= 0) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0 }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [quiz, showResult])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60), s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleAnswer = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    }

    const handleSubmit = async () => {
        if (!quizId || isSubmitting) return
        setIsSubmitting(true)
        setShowConfirmSubmit(false)
        const questions = quiz?.questions || []
        const timeSpent = Math.round((Date.now() - startedAt) / 1000)

        try {
            if (attemptId) {
                const answersPayload = questions.map(q => ({
                    questionId: q.id,
                    selectedOption: answers[q.id] || '',
                    timeSpent: 0,
                }))
                const res = await quizApi.submit(quizId, { timeSpent, answers: answersPayload })
                setResult(res as AttemptResult)
            } else {
                let correct = 0
                questions.forEach(q => { if (answers[q.id] === q.correctAnswer) correct++ })
                const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
                setResult({ id: 'local', score, isPassed: score >= 70, correctCount: correct })
            }
        } catch (err) {
            console.error('Submit failed', err)
            let correct = 0
            questions.forEach(q => { if (answers[q.id] === q.correctAnswer) correct++ })
            const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
            setResult({ id: 'local', score, isPassed: score >= 70, correctCount: correct })
        } finally {
            setShowResult(true)
            setIsSubmitting(false)
        }
    }

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="size-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    if (error || !quiz) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">quiz</span>
                <p className="text-slate-500">{error || 'Kuis tidak ditemukan'}</p>
                <Link to="/siswa/belajar" className="text-primary hover:underline mt-4 inline-block">← Kembali</Link>
            </div>
        </div>
    )

    const questions = quiz.questions || []
    const question = questions[currentQuestion]
    const answeredCount = Object.keys(answers).length
    const unanswered = questions.filter(q => !answers[q.id])

    if (showResult && result) {
        const isPassing = result.isPassed || result.score >= 70
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <div className={`size-32 mx-auto rounded-full flex items-center justify-center mb-6 ${isPassing ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <span className="text-6xl">{isPassing ? '🎉' : '💪'}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        {isPassing ? 'Selamat!' : 'Terus Semangat!'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Kamu telah menyelesaikan {quiz.title}</p>
                    <div className={`text-7xl font-black mb-4 ${isPassing ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {result.score}%
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-emerald-500">{result.correctCount ?? '-'}</p>
                                <p className="text-xs text-slate-500">Benar</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-500">{result.wrongCount ?? '-'}</p>
                                <p className="text-xs text-slate-500">Salah</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-400">{unanswered.length}</p>
                                <p className="text-xs text-slate-500">Kosong</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link to="/siswa/belajar"
                            className="bg-gradient-to-r from-primary to-indigo-500 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">arrow_forward</span>
                            Lanjutkan Belajar
                        </Link>
                        <Link to="/siswa" className="text-slate-600 dark:text-slate-400 font-medium">
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (questions.length === 0) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">quiz</span>
                <p className="text-slate-500">Kuis ini belum memiliki soal</p>
                <Link to="/siswa/belajar" className="text-primary hover:underline mt-4 inline-block">← Kembali</Link>
            </div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
                    <p className="text-sm text-slate-500">{questions.length} Soal</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse' :
                    timeLeft < 300 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    <span className="material-symbols-outlined">timer</span>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Progres: {answeredCount}/{questions.length}</span>
                    <span className="text-sm text-slate-500">Soal {currentQuestion + 1} dari {questions.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => (
                        <button key={q.id} onClick={() => setCurrentQuestion(idx)}
                            className={`size-10 rounded-lg font-medium text-sm transition-all ${idx === currentQuestion ? 'bg-primary text-white' :
                                answers[q.id] ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question */}
            {question && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                            Soal {currentQuestion + 1}
                        </span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none mb-6">
                        <div className="text-lg text-slate-900 dark:text-white">
                            <LatexRenderer content={question.text} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(question.options || []).map(option => (
                            <button key={option.id} onClick={() => handleAnswer(question.id, option.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${answers[question.id] === option.id
                                    ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <div className={`size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold ${answers[question.id] === option.id
                                    ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500'}`}>
                                    {option.id}
                                </div>
                                <span className={`font-medium ${answers[question.id] === option.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                    <LatexRenderer content={option.text} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Sebelumnya
                </button>

                {currentQuestion === questions.length - 1 ? (
                    <button onClick={() => setShowConfirmSubmit(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                        <span className="material-symbols-outlined">check_circle</span>
                        Selesai & Kirim
                    </button>
                ) : (
                    <button onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90">
                        Selanjutnya
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                )}
            </div>

            {/* Confirm Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmSubmit(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">Kirim Jawaban?</h3>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-600 dark:text-slate-400">Terjawab</span>
                                <span className="font-bold text-emerald-600">{answeredCount} soal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Belum dijawab</span>
                                <span className="font-bold text-amber-600">{unanswered.length} soal</span>
                            </div>
                        </div>
                        {unanswered.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    ⚠️ Masih ada {unanswered.length} soal yang belum dijawab!
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                                Kembali
                            </button>
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSubmitting ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim...</> : 'Ya, Kirim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
