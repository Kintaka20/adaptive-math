import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { questionApi, adminApi } from '../../lib/api'
import LatexRenderer from '../../components/LatexRenderer'

interface AnswerOption {
    id: string
    text: string
}

interface Chapter {
    id: string
    name: string
    grade: string
}

const grades = ['X', 'XI', 'XII']

export default function EditSoalPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        chapterId: '',
        grade: '',
        difficulty: 'MEDIUM',
        question: '',
        explanation: '',
    })

    const [answers, setAnswers] = useState<AnswerOption[]>([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
    ])
    const [correctAnswer, setCorrectAnswer] = useState<string>('A')
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const loadData = async () => {
            try {
                const [question, chaptersData] = await Promise.all([
                    questionApi.get(id!),
                    adminApi.chapters(),
                ])

                const q = question as any
                setFormData({
                    chapterId: q.chapterId || '',
                    grade: q.grade || '',
                    difficulty: q.difficulty || 'MEDIUM',
                    question: q.text || '',
                    explanation: q.explanation || '',
                })

                if (q.options && Array.isArray(q.options)) {
                    const loadedAnswers = ['A', 'B', 'C', 'D', 'E'].map(label => {
                        const opt = q.options.find((o: any) => o.label === label)
                        return { id: label, text: opt?.text || '' }
                    })
                    setAnswers(loadedAnswers)

                    const correct = q.options.find((o: any) => o.isCorrect)
                    if (correct) setCorrectAnswer(correct.label)
                }

                setChapters(Array.isArray(chaptersData) ? chaptersData as Chapter[] : [])
            } catch (err) {
                setError('Gagal memuat data soal.')
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [id])

    const filteredChapters = formData.grade
        ? chapters.filter(c => c.grade === formData.grade)
        : chapters

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('question-textarea') as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = formData.question.substring(0, start) + latex + formData.question.substring(end)
            setFormData(prev => ({ ...prev, question: newText }))
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + latex.length, start + latex.length)
            }, 0)
        }
    }

    const latexButtons = [
        { label: 'Σ', value: '$\\\\sum_{}^{}$' },
        { label: '√', value: '$\\\\sqrt{}$' },
        { label: '∫', value: '$\\\\int_{}^{}$' },
        { label: 'π', value: '$\\\\pi$' },
        { label: 'frac', value: '$\\\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
    ]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.chapterId) newErrors.chapter = 'Pilih bab'
        if (!formData.question || formData.question.length < 10) newErrors.question = 'Soal minimal 10 karakter'
        const filledAnswers = answers.filter(a => a.text.trim())
        if (filledAnswers.length < 2) newErrors.answers = 'Minimal 2 pilihan jawaban'
        const correctOpt = answers.find(a => a.id === correctAnswer)
        if (!correctOpt?.text.trim()) newErrors.correctAnswer = 'Pilih jawaban yang benar'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setIsSaving(true)
        try {
            const options = answers
                .filter(a => a.text.trim())
                .map(a => ({
                    label: a.id,
                    text: a.text,
                    isCorrect: a.id === correctAnswer,
                }))

            await questionApi.update(id!, {
                text: formData.question,
                difficulty: formData.difficulty,
                explanation: formData.explanation || undefined,
                chapterId: formData.chapterId || undefined,
                grade: formData.grade || undefined,
                options,
            })

            navigate('/guru/bank-soal')
        } catch {
            alert('Gagal menyimpan perubahan. Silakan coba lagi.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-48" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-64" />
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="h-60 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                <p className="text-red-500 text-lg font-medium">{error}</p>
                <Link to="/guru/bank-soal" className="mt-4 inline-block text-primary hover:underline">
                    ← Kembali ke Bank Soal
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <Link to="/guru/bank-soal" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Kembali ke Bank Soal
                </Link>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">edit</span>
                    Edit Soal
                </h1>
            </div>

            {/* Info Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Informasi Soal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">🎓 Kelas</label>
                        <select value={formData.grade} onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value, chapterId: '' }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-amber-500 outline-none">
                            <option value="">-- Pilih Kelas --</option>
                            {grades.map(g => <option key={g} value={g}>Kelas {g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">📚 Bab *</label>
                        <select value={formData.chapterId} onChange={(e) => setFormData(prev => ({ ...prev, chapterId: e.target.value }))}
                            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.chapter ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 focus:border-amber-500 outline-none`}>
                            <option value="">-- Pilih Bab --</option>
                            {filteredChapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                        </select>
                        {errors.chapter && <p className="text-red-500 text-sm mt-1">{errors.chapter}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">⚡ Kesulitan *</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'EASY', label: '🟢 Easy' },
                                { value: 'MEDIUM', label: '🟡 Medium' },
                                { value: 'HARD', label: '🔴 Hard' },
                            ].map(d => (
                                <button key={d.value} type="button" onClick={() => setFormData(prev => ({ ...prev, difficulty: d.value }))}
                                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.difficulty === d.value
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                        : 'border-slate-200 dark:border-slate-700'
                                        }`}>
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Konten Soal
                </h2>

                <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex gap-1 flex-wrap">
                        {latexButtons.map(btn => (
                            <button key={btn.label} type="button" onClick={() => insertLatex(btn.value)}
                                className="px-2 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-mono">
                                {btn.label}
                            </button>
                        ))}
                    </div>
                    <div className="w-px bg-slate-300 dark:bg-slate-600" />
                    <button type="button" onClick={() => setShowPreview(!showPreview)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showPreview ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {showPreview ? '👁️ Preview ON' : '👁️ Preview'}
                    </button>
                </div>

                <textarea id="question-textarea" value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Tulis soal dengan LaTeX..."
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border-2 font-mono ${errors.question ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:border-amber-500 outline-none`} />
                {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}

                {showPreview && formData.question && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Preview:</p>
                        <LatexRenderer content={formData.question} />
                    </div>
                )}
            </div>

            {/* Answer Options */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">task_alt</span>
                    Pilihan Jawaban
                </h2>
                <div className="space-y-3">
                    {answers.map((answer, index) => (
                        <div key={answer.id} className="flex items-center gap-3">
                            <button type="button" onClick={() => setCorrectAnswer(answer.id)}
                                className={`size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${correctAnswer === answer.id
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                    }`}>
                                {correctAnswer === answer.id && <span className="material-symbols-outlined text-sm">check</span>}
                            </button>
                            <span className="font-bold text-slate-500 w-6">{answer.id}.</span>
                            <input type="text" value={answer.text}
                                onChange={(e) => {
                                    const newAnswers = [...answers]
                                    newAnswers[index].text = e.target.value
                                    setAnswers(newAnswers)
                                }}
                                placeholder={`Jawaban ${answer.id}...`}
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 outline-none" />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">💡 Klik lingkaran untuk menandai jawaban yang benar</p>
                {errors.answers && <p className="text-red-500 text-sm mt-1">{errors.answers}</p>}
                {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>}
            </div>

            {/* Explanation */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">lightbulb</span>
                    Pembahasan (Opsional)
                </h2>
                <textarea value={formData.explanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Penjelasan jawaban yang benar..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 outline-none" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm sticky bottom-4">
                <Link to="/guru/bank-soal" className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900">
                    Batal
                </Link>
                <button type="button" onClick={handleSubmit} disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
