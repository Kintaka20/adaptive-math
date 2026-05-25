import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { questionApi, adminApi } from '../../lib/api'

interface AnswerOption {
    id: string
    label: string
    text: string
    isCorrect: boolean
}

interface Chapter {
    id: string
    name: string
    grade: string
}

const grades = ['X', 'XI', 'XII']

export default function AdminEditSoalPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [loading, setLoading] = useState(true)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [saveSuccess, setSaveSuccess] = useState(false)

    const [formData, setFormData] = useState({
        chapterId: '',
        grade: '',
        difficulty: 'MEDIUM',
        question: '',
        explanation: '',
    })

    const [answers, setAnswers] = useState<AnswerOption[]>([
        { id: '', label: 'A', text: '', isCorrect: false },
        { id: '', label: 'B', text: '', isCorrect: false },
        { id: '', label: 'C', text: '', isCorrect: false },
        { id: '', label: 'D', text: '', isCorrect: false },
        { id: '', label: 'E', text: '', isCorrect: false },
    ])
    const [correctAnswer, setCorrectAnswer] = useState<string>('A')

    useEffect(() => {
        const loadData = async () => {
            try {
                const [questionData, chaptersData] = await Promise.all([
                    questionApi.get(id!),
                    adminApi.chapters(),
                ])

                const q = questionData as any
                const chaps = Array.isArray(chaptersData) ? chaptersData : []
                setChapters(chaps as Chapter[])

                setFormData({
                    chapterId: q.chapterId || '',
                    grade: q.grade || '',
                    difficulty: q.difficulty || 'MEDIUM',
                    question: q.text || '',
                    explanation: q.explanation || '',
                })

                if (q.options && q.options.length > 0) {
                    const opts = q.options.map((o: any) => ({
                        id: o.id,
                        label: o.label,
                        text: o.text,
                        isCorrect: o.isCorrect,
                    }))
                    setAnswers(opts)
                    const correct = opts.find((o: any) => o.isCorrect)
                    if (correct) setCorrectAnswer(correct.label)
                }
            } catch (err) {
                console.error('Failed to load question:', err)
            } finally {
                setLoading(false)
            }
        }

        if (id) loadData()
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

    const handleSubmit = async (publish = false) => {
        if (!formData.question.trim()) {
            alert('Soal tidak boleh kosong')
            return
        }

        setIsSubmitting(true)
        try {
            const optionsPayload = answers.map(ans => ({
                label: ans.label,
                text: ans.text,
                isCorrect: ans.label === correctAnswer,
            }))

            await questionApi.update(id!, {
                text: formData.question,
                difficulty: formData.difficulty,
                explanation: formData.explanation,
                chapterId: formData.chapterId || undefined,
                grade: formData.grade || undefined,
                options: optionsPayload,
            })

            setSaveSuccess(true)
            setTimeout(() => {
                setSaveSuccess(false)
                if (publish) navigate('/admin/master-data/questions')
            }, 1500)
        } catch (err) {
            console.error('Failed to update question:', err)
            alert('Gagal menyimpan perubahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <span className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin inline-block mb-3" />
                    <p className="text-slate-500">Memuat soal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data/questions" className="hover:text-primary">Bank Soal</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Edit Soal</span>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">edit</span>
                            Edit Soal
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">Edit soal dan pilihan jawaban</p>
                    </div>
                    {saveSuccess && (
                        <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Tersimpan!
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Info Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">info</span>
                        Informasi Soal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelas *</label>
                            <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value, chapterId: '' })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <option value="">Pilih Kelas</option>
                                {grades.map(g => <option key={g} value={g}>Kelas {g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bab *</label>
                            <select value={formData.chapterId} onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <option value="">Pilih Bab</option>
                                {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kesulitan *</label>
                            <div className="flex gap-2">
                                {[{ value: 'EASY', label: '🟢 Easy' }, { value: 'MEDIUM', label: '🟡 Medium' }, { value: 'HARD', label: '🔴 Hard' }].map(d => (
                                    <button key={d.value} type="button" onClick={() => setFormData({ ...formData, difficulty: d.value })}
                                        className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium ${formData.difficulty === d.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">edit_note</span>
                            Soal
                        </h2>
                        <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showPreview ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            {showPreview ? '✏️ Editor' : '👁️ Preview'}
                        </button>
                    </div>

                    {!showPreview ? (
                        <>
                            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                {latexButtons.map(btn => (
                                    <button key={btn.label} type="button" onClick={() => insertLatex(btn.value)} className="px-2 py-1.5 rounded-lg hover:bg-amber-100 text-amber-700 text-sm font-mono">{btn.label}</button>
                                ))}
                            </div>
                            <textarea id="question-textarea" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="Tulis soal dengan LaTeX..." rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm" />
                        </>
                    ) : (
                        <div className="min-h-[150px] p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            {formData.question ? <LatexRenderer content={formData.question} /> : <p className="text-slate-400 text-center">Belum ada soal</p>}
                        </div>
                    )}
                </div>

                {/* Answers */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">task_alt</span>
                        Pilihan Jawaban
                    </h2>
                    <div className="space-y-3">
                        {answers.map((answer, index) => (
                            <div key={answer.label} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${correctAnswer === answer.label ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700'}`}>
                                <button type="button" onClick={() => setCorrectAnswer(answer.label)}
                                    className={`size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${correctAnswer === answer.label ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'}`}>
                                    {correctAnswer === answer.label && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                                <span className="font-bold text-slate-500 w-6">{answer.label}.</span>
                                <input type="text" value={answer.text}
                                    onChange={(e) => { const newAnswers = [...answers]; newAnswers[index] = { ...newAnswers[index], text: e.target.value }; setAnswers(newAnswers) }}
                                    placeholder={`Jawaban ${answer.label}...`}
                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                                {correctAnswer === answer.label && (
                                    <span className="text-emerald-500 text-xs font-medium">✓ Benar</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                        Pembahasan
                    </h2>
                    <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder="Penjelasan jawaban yang benar..." rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm" />
                    {formData.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-600 mb-2">Preview Pembahasan:</p>
                            <LatexRenderer content={formData.explanation} />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 sticky bottom-4">
                    <Link to="/admin/master-data/questions" className="px-4 py-2 text-slate-600 hover:text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Kembali
                    </Link>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => handleSubmit(false)} disabled={isSubmitting}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <span className="size-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">save</span>}
                            Simpan
                        </button>
                        <button type="button" onClick={() => handleSubmit(true)} disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">check_circle</span>}
                            Simpan & Kembali
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
